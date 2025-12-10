import { Divider, Grid, Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, type ChangeEvent, type FC, type MouseEvent } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface CustomerListTableProps {
  count?: number;
  items?: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  setdeleterefresh?: any;
  rowsPerPage?: number;
  selected?: string[];
}
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
export const CustomerListTable: FC<CustomerListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setdeleterefresh,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;
  // console.log(items,"items")
// console.log(selected,"selected")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const [open2, setOpen2] = useState<boolean>(false);
  const handleClose2 = () => setOpen2(false);
  const [open1, setOpen1] = useState<boolean>(false);
  const handleClose1 = () => setOpen1(false);
  const [open3, setOpen3] = useState<boolean>(false);
  const handleClose3 = () => setOpen3(false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [removecustomerid, setremovecustomerid] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  console.log(selectedCustomer,"selected customer")

  const [logedinuser, setLogedinuser] = useState('');
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const customerId = result.attributes['custom:customerId'];
      setLogedinuser(customerId)
      // console.log(customerId,'uuu');
      const customergroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(customergroup)
      }).catch(error => {
          console.error('Error:', error);
      });
  }, [Auth]);

  const removecustomer = async (customerid: any) => {
    setLoading(true);
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteCustomer', {
        body: {
          customerId: customerid,
        },
      });

      setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing customer: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
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
      const path    = selectedCustomer.access_status == "Enabled" ? '/disableUser' : '/enableUser';

      await API.graphql(
        graphqlOperation(mutations.updateCustomer, {
          input: {
            id: selectedCustomer?.id,
            access_status: selectedCustomer.access_status == "Enabled" ? "Disabled" : "Enabled",
          },
        })
      );

      const variables = {
        limit: 1000,
        filter: { customer_id: { eq: selectedCustomer?.id } },
      };

      const contactsList = await API.graphql(
        graphqlOperation(queries.listContacts,variables)
      );
      
      for (const contact of contactsList.data.listCustomers.items) {
        const myInit  = {
          body: {
            username: contact?.email,
          },
          headers: {
            'Content-Type' : 'application/json',
            Authorization: `${currentSession.getAccessToken().getJwtToken()}`
          }
        };
  
        const response = await API.post(apiName, path, myInit);
      }
      
      console.log('User disabled successfully:', response);
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  },[selectedCustomer]);

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
      filter: { customer_id: { eq: selectedCustomer?.id } },
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

    // return new Promise((resolve, reject) => {
    //   cognito.adminResetUserPassword(params, (err, data) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(data);
    //     }
    //   });
    // });
  },[selectedCustomer]);

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
            px: 1,
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
        <Table size="small">
          <TableHead style={{ height: '40px' }}>
            <TableRow>
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}>Customer Name</TableCell>
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}
              align="center"
              >Status</TableCell>
              <TableCell
                style={{ padding: '5px 16px', fontSize: '14px' }}
                align="left"
              >
                Actions
              </TableCell>
             
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}>
              {logedinusergroup !== "Customer" && logedinusergroup !== "CustomerMaster" && "Control"}
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
              .map((customer: any) => {
                const isSelected = selected.includes(customer.id);
                const location = `${customer.city}, ${customer.state}, ${customer.country}`;
                const totalSpent = numeral(customer.totalSpent).format(
                  `${customer.currency}0,0.00`
                );

                return (
                  <TableRow
                    sx={{ height: '10px  !important' }}
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
                          {/* <Link
                          color="inherit"
                          component={RouterLink}
                          href={paths.dashboard.customercontrol.details}
                          variant="subtitle2"
                        >
                          {customer.name}
                        </Link> */}
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              router.push(`/dashboard/customercontrol/edit/?id=${customer.id}`)
                            }
                            // onClick={() =>
                            //   router.push({
                            //     pathname: '/dashboard/networktopology',
                            //     query: { cus_id: customer.id },
                            //   })
                            // }
                          >
                            {/* Display customer name */}
                            {customer.name}

                            {/* Display customer ID with smaller size */}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              style={{ fontSize: 9 }} // Add some spacing between name and ID
                            >
                              {/* Display customer ID */}
                              {customer?.ps_customer_id}
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
                    <TableCell style={{ padding: '5px 16px' }}>
                      <Button
                        size="small"
                        startIcon={
                          <SvgIcon>
                            <Edit02Icon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        color="success"
                        component="a"
                        onClick={() =>
                          router.push(`/dashboard/customercontrol/edit/?id=${customer.id}`)
                        }
                      >
                        Edit
                      </Button>{' '}
                      {/* <Button
                      size="small"
                      onClick={() => {
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
                    </Button> */}
                    </TableCell>
                    
                    <TableCell style={{ padding: '5px 16px' }}>
                    {logedinusergroup !== "Customer" && logedinusergroup !== "CustomerMaster" && (
                      <>
                    {(customer.access_status == null || customer.access_status == "Enabled") && <Button
                        size="small"
                        onClick={() => {
                          setOpen1(true);
                          setSelectedCustomer(customer);
                          // disableUser()
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
                          setSelectedCustomer(customer);
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
                          setSelectedCustomer(customer);
                          //resetUserPassword(selectedCustomer?.name, selectedCustomer?.email, selectedCustomer?.phone);
                        }}
                        startIcon={
                          <SvgIcon>
                            <Key01Icon />
                          </SvgIcon>
                        }
                        variant="outlined"
                      >
                        Reset Password
                      </Button>{' '}
                      <Button
                        onClick={() => {
                          setOpen(true);
                          setremovecustomerid(customer.id);                          
                        }}
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={
                          <SvgIcon>
                            <DeleteIcon />
                          </SvgIcon>
                        }
                      >
                        Delete
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Are you sure you want to delete the Customer?
          </Typography>
          <Button
            variant="outlined"
            sx={{ marginTop: 3 }}
            onClick={() => {
              setOpen(false);
            }}
          >
            cancel
          </Button>
          <Button
            variant="contained"
            sx={{ marginTop: 3, marginLeft: 2 }}
            onClick={() => {
              removecustomer(removecustomerid);

              setOpen(false);
            }}
            disabled = {loading}
          >
            {/* Delete */}
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Box>
      </Modal>
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
            Are you sure you want to Deny Access
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
            Deleting this Customer will delete the Customer account and any Clients in the account.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
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
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Box>
  );
};

CustomerListTable.propTypes = {
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
