import { useState, useEffect, useCallback, type ChangeEvent, type FC, type MouseEvent } from 'react';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Divider, Grid } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Client } from 'src/types/client';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
import * as queries from '../../../graphql/queries';
import * as mutations from '../../../graphql/mutations';

interface ClientListTableProps {
  count?: number;
  items?: any;
  handleClientrGet;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  // setdeleterefresh?: any;
  rowsPerPage?: number;
  selected?: string[];
}

export const ClientListTable: FC<ClientListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    handleClientrGet,
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    // setdeleterefresh,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;
  // console.log(items,"items")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const [open2, setOpen2] = useState<boolean>(false);
  const handleClose2 = () => setOpen2(false);
  const [open3, setOpen3] = useState<boolean>(false);
  const handleClose3 = () => setOpen3(false);
  const [open1, setOpen1] = useState<boolean>(false);
  const handleClose1 = () => setOpen1(false);
  const [clientid, setclientid] = useState<any>('');
  const [removeclientid, setremoveclientid] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState(null);
  console.log(selectedClient,"selected client")

  const [logedinuser, setLogedinuser] = useState('');
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const clientId = result.attributes['custom:clientId'];
      setLogedinuser(clientId)
      // console.log(customerId,'uuu');
      const clientgroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(clientgroup)
      }).catch(error => {
          console.error('Error:', error);
      });
  }, [Auth]);

  const deleteclient = async () => {
    try {
      await API.graphql(graphqlOperation(mutations.deleteClient, { input: { id: clientid } })).then(
        async (response, error) => {
          if (error === undefined) {
            toast.success('Deleted Successfully!');
            handleClientrGet();
            handleClose2();
          }
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  };

  const removeclient = async (clientid: any) => {
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteCustomer', {
        body: {
          customerId: clientid,
        },
      });

      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing customer: ' + error.message);
      throw error;
    }
  };

  const listUserGroup = async () => {
    let token = await Auth.currentSession()

    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let options = { 
      queryStringParameters: {
       // "limit": 10,
        "groupname": ["Admin"]
      },
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `${token.getAccessToken().getJwtToken()}`
      }
    }
    const response = await API.get(apiName, path, options);
    return response;
  }

  useEffect( () => {
    listUserGroup();
  },[])

  const disableUser = useCallback ( async ( ) => {
    try {
      // Get the current authenticated user's session
      const currentSession = await Auth.currentSession();
      const idToken        = currentSession.getIdToken().getJwtToken();

      console.log(currentSession,'currentSession')
      const apiName = 'AdminQueries';
      const path    = selectedClient.access_status == "Enabled" ? '/disableUser' : '/enableUser';

      await API.graphql(
        graphqlOperation(mutations.updateClient, {
          input: {
            id: selectedClient?.id,
            access_status: selectedClient.access_status == "Enabled" ? "Disabled" : "Enabled",
          },
        })
      );

      const variables = {
        limit: 1000,
        filter: { client_id: { eq: selectedClient?.id } },
      };

      const contactsList = await API.graphql(
        graphqlOperation(queries.listContacts,variables)
      );
      // console.log(contactsList)
      for (const contact of contactsList.data.listContacts.items) {
        const myInit  = {
          body: {
            username: contact?.email,
          },
          headers: {
            'Content-Type' : 'application/json',
            Authorization: `${currentSession.getAccessToken().getJwtToken()}`
          }
        };
        // console.log(myInit,"....")
        const response = await API.post(apiName, path, myInit);        
        console.log('User disabled successfully:', response);
      }
      
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  },[selectedClient]);

  const resetUserPassword = useCallback(async () => {
   
    AWS.config.update({ region: 'us-west-1' });
    const cognito = new AWS.CognitoIdentityServiceProvider();

    // const params = {
    //   UserPoolId: 'us-west-1_F0uiXhSAc',
    //   Username: username,
    //   // DesiredDeliveryMediums: ['EMAIL'],
    //   // UserAttributes: UserAttributes,
    // };

    const variables = {
      limit: 1000,
      filter: { client_id: { eq: selectedClient?.id } },
    };

    const contactsList = await API.graphql(
      graphqlOperation(queries.listContacts,variables)
    );

   
    for (const contact of contactsList.data.listContacts.items) {
      const username = contact?.email
     
      const params = {
        UserPoolId: 'us-west-1_F0uiXhSAc',
        Username: username,
        
      };
      new Promise((resolve, reject) => {
        cognito.adminResetUserPassword(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

  },[selectedClient]);

  useEffect(() => {
    const configureAWS = async () => {
      try {
        const currentUserSession = await Auth.currentSession();
        const idToken = currentUserSession.getIdToken().getJwtToken();

        AWS.config.update({
          region: `us-west-1`,
          credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-west-1:1a42955b-5b4d-4846-a56f-bd96bee2702e',
            Logins: {
              [`cognito-idp.${`us-west-1`}.amazonaws.com/${`us-west-1_F0uiXhSAc`}`]: idToken,
            },
          }),
        });
      } catch (error) {
        console.error('Error configuring AWS:', error);
      }
    };

    configureAWS();
  }, []);

  return (
    <Box
      sx={{ position: 'relative' }}
      className="scroolcustomercontrol"
    >
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 2,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              alert('Delete');
              if (event.target.checked) {
                onSelectAll?.();
              } else {
                onDeselectAll?.();
              }
            }}
          />
          <Button
            color="inherit"
            size="small"
          >
            Delete
          </Button>
          {/* <Button
            color="inherit"
            size="small"
          >
            Edit
          </Button> */}
        </Stack>
      )}
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Client Name</TableCell>
               <TableCell align="center">Status</TableCell>
              <TableCell align="left">Actions</TableCell>
              <TableCell>
              {logedinusergroup !== "Client" && logedinusergroup !== "ClientMaster" && "Control"}
              </TableCell>
              {/* <TableCell>Orders</TableCell>
              <TableCell>Spent</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.items
            ?.sort((a, b) => {
              // Use localeCompare for case-insensitive alphabetical sorting
              return a.name.localeCompare(b.name);
            })
            .map((customer) => {

              const isSelected = selected.includes(customer.id);


              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                >
                  <TableCell style={{ padding: '5px 16px' }}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        {/* <Avatar
                        src={customer.avatar}
                        sx={{
                          height: 42,
                          width: 42,
                        }}
                      >
                        {getInitials(customer.name)}
                      </Avatar> */}
                        <div>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              router.push(`/dashboard/clientcontrol/edit/?id=${customer.id}`)
                            }
                          >
                            {customer.name}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              style={{ fontSize: 9 }} 
                            >
                              {customer?.ps_client_id}
                            </Typography>
                          </Typography>
                        </div>
                      </Stack>
                    </TableCell>{' '}
                    <TableCell align="center">
                    {customer?.status ? (
                      <Chip
                        label={customer?.status}
                        color={customer?.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>{' '}
                  <TableCell>
                    <Button
                      startIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                      color="success"
                      size="small"
                      component="a"
                      onClick={() =>
                        router.push(`/dashboard/clientcontrol/edit/?id=${customer.id}`)
                      }
                    >
                      Edit
                    </Button>{' '}
                    {logedinusergroup !== "Client" && logedinusergroup !== "ClientMaster" && (
                    <Button
                      size="small"
                      onClick={() => {
                        setclientid(customer.id);
                        setremoveclientid(customer.id);
                        setOpen2(true);
                      }}
                      startIcon={
                        <SvgIcon>
                          <DeleteIcon />
                        </SvgIcon>
                      }
                      color="error"
                      variant="outlined"
                    >
                      Delete
                    </Button>
                    )}
                  </TableCell>
                  <TableCell>
                  {logedinusergroup !== "Client" && logedinusergroup !== "ClientMaster" && (
                  <>
                  {(customer.access_status == null || customer.access_status == "Enabled") && <Button
                      size="small"
                      onClick={() => {
                        setOpen1(true);
                        setSelectedClient(customer);
                      }}
                      startIcon={
                        <SvgIcon>
                          <Lock01Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                    >
                      Deny Access
                      </Button>}
                      {customer.access_status == "Disabled" && <Button
                        size="small"
                        onClick={() => {
                          setOpen1(true);
                          setSelectedClient(customer);
                          // disableUser()
                        }}
                        startIcon={
                          <SvgIcon>
                            <Lock01Icon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        color="warning"
                      >
                        Enable Access
                    </Button>}{' '}
                    <Button
                      size="small"
                      onClick = {() => {
                        setOpen3(true);
                        setSelectedClient(customer);
                      }}
                      startIcon={
                        <SvgIcon>
                          <Key01Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                    >
                      Reset Password
                    </Button>
                    </>
                  )}
                  </TableCell>
                  {/* <TableCell>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.edit}
                    >
                      <SvgIcon>
                        <DeleteIcon />
                      </SvgIcon>
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.edit}
                    >
                      <SvgIcon>
                        <Edit02Icon />
                      </SvgIcon>
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.details}
                    >
                      <SvgIcon>
                        <ArrowRightIcon />
                      </SvgIcon>
                    </IconButton>
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <Dialog
        open={open1}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose1();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Deny Access.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                disableUser();
                setOpen1(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen1(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open2}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose2();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Deleting this Client will delete the Client account.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deleteclient();
                removeclient(removeclientid);
                setOpen2(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen2(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open3}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose3();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Reset Password
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                resetUserPassword();
                setOpen3(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen3(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      {/* <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Box>
  );
};

ClientListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
