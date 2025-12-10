import { useEffect, useState, useCallback, type ChangeEvent, type FC, type MouseEvent } from 'react';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Divider, Grid, Modal } from '@mui/material';
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
import Chip from '@mui/material/Chip';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
import React from 'react';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface AdminListTableProps {
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
export const AdminListTable: FC<AdminListTableProps> = (props) => {
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
    searchQuery,
  } = props;
  // console.log(items,"items")
  // console.log(searchQuery,"search items")

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
  const [selectedUser, setSelectedUser] = useState(null);
  // console.log(selectedUser,"selected customer")
  const [users, setUsers] = useState([]);
  console.log(users,"users")
  const currentuser = Auth.currentAuthenticatedUser();
  console.log(currentuser,"current user")
  const [loggedInUser, setLoggedInUser] = useState();
  // console.log(loggedInUser,"id")
  const [loggedInUserGroup, setLoggedInUserGroup] = useState();
  // console.log(loggedInUserGroup,"group")

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const adminId = result.attributes.sub;
      setLoggedInUser(adminId)
      // console.log(adminId,'uuu');
      const admingroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLoggedInUserGroup(admingroup)
      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);

  const removecustomer = async (customerid: any) => {
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
    }
  };

  const listUserGroup = async () => {
    let token = await Auth.currentSession()

    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let options = { 
      queryStringParameters: {
      //  "limit": 10,
        "groupname": ["Admin"]
      },
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `${token.getAccessToken().getJwtToken()}`
      }
    }
    const response = await API.get(apiName, path, options);
    console.log(response,"response")
    setUsers(response.Users);
    return response;
  }

  useEffect( () => {
    listUserGroup();
  },[])

  const deleteUser = useCallback ( async () => {
    const cognito = new AWS.CognitoIdentityServiceProvider();

    const params = {
      UserPoolId: 'us-west-1_F0uiXhSAc',
      Username: selectedUser.Username,
      // DesiredDeliveryMediums: ['EMAIL'],
      // UserAttributes: UserAttributes,
    };
    try {
    await new Promise((resolve, reject) => {
      cognito.adminDeleteUser(params, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    // setUsers((prevUsers) => prevUsers.filter(user => user.Username !== selectedUser.Username));
    await listUserGroup();
  } catch (err) {
    console.error('Error deleting user:', err);
  }
  },[selectedUser]);

  const disableUser = useCallback ( async ( ) => {
    try {
      // Get the current authenticated user's session
      const currentSession = await Auth.currentSession();
      const idToken        = currentSession.getIdToken().getJwtToken();

      console.log(currentSession,'currentSession')
      const apiName = 'AdminQueries';
      const path    = selectedUser.Enabled == true ? '/disableUser' : '/enableUser';
      const myInit  = {
        body: {
          username: selectedUser.Username,
        },
        headers: {
          'Content-Type' : 'application/json',
          Authorization: `${currentSession.getAccessToken().getJwtToken()}`
        }
      };
  
      const response = await API.post(apiName, path, myInit);
      console.log('User disabled successfully:', response);

      setUsers((prevUsers) => 
        prevUsers.map((user) =>
          user.Username == selectedUser.Username ? { ...user, Enabled: !user.Enabled } : user
        )
      );

      setSelectedUser((prevUser) => ({
        ...prevUser,
        Enabled: !prevUser.Enabled,
      }));
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  },[selectedUser]);

  const resetUserPassword = useCallback(async () => {
   
    AWS.config.update({ region: 'us-west-1' });
    const cognito = new AWS.CognitoIdentityServiceProvider();

    // const params = {
    //   UserPoolId: 'us-west-1_F0uiXhSAc',
    //   Username: username,
    //   // DesiredDeliveryMediums: ['EMAIL'],
    //   // UserAttributes: UserAttributes,
    // };

    // const variables = {
    //   limit: 1000,
    //   filter: { customer_id: { eq: selectedCustomer?.id } },
    // };

    // const contactsList = await API.graphql(
    //   graphqlOperation(queries.listContacts,variables)
    // );

   
    // for (const contact of contactsList.data.listContacts.items) {
      const username = selectedUser.Username;
     
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
    // }

    // return new Promise((resolve, reject) => {
    //   cognito.adminResetUserPassword(params, (err, data) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(data);
    //     }
    //   });
    // });
  },[selectedUser]);

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
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}>Admin</TableCell>
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}
              align="center"
              >Status</TableCell>
              {loggedInUserGroup === 'AdminMaster' && (
              <TableCell
                style={{ padding: '5px 16px', fontSize: '14px' }}
                align="left"
              >
                Actions
              </TableCell>
              )}
              {loggedInUserGroup === 'AdminMaster' && (
              <TableCell style={{ padding: '5px 16px', fontSize: '14px' }}>Control</TableCell>
              )}
              {/* <TableCell>Orders</TableCell>
    <TableCell>Spent</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              ?.filter((user) => {
                // Check if searchQuery is present and filter by Username containing searchQuery
                return !searchQuery?.contains || user.Username.toLowerCase().includes(searchQuery?.contains.toLowerCase());
              })
              .sort((a, b) => {
                const nameA = a.Username ? a.Username.toLowerCase() : '';
                const nameB = b.Username ? b.Username.toLowerCase() : '';
                // Use localeCompare for case-insensitive alphabetical sorting
                return nameA.localeCompare(nameB);
              })
              .map((user: any) => {
                // const isSelected = selected.includes(customer.id);
                // const location = `${customer.city}, ${customer.state}, ${customer.country}`;
                // const totalSpent = numeral(customer.totalSpent).format(
                //   `${customer.currency}0,0.00`
                // );

                return (
                  <TableRow
                    sx={{ height: '10px  !important' }}
                    hover
                    key={user.Username}
                    // selected={isSelected}
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
                            // onClick={() =>
                            //   router.push(`/dashboard/customercontrol/edit/?id=${customer.id}`)
                            // }
                            // onClick={() =>
                            //   router.push({
                            //     pathname: '/dashboard/networktopology',
                            //     query: { cus_id: customer.id },
                            //   })
                            // }
                          >
                            {/* Display customer name */}
                            {user.Username}

                            {/* Display customer ID with smaller size */}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              style={{ fontSize: 9 }} // Add some spacing between name and ID
                            >
                              {/* Display customer ID */}
                              {/* {customer?.ps_customer_id} */}
                            </Typography>
                          </Typography>
                        </div>
                      </Stack>
                    </TableCell>{' '}
                    
                    <TableCell align="center">
                    {user?.UserStatus ? (
                      <Chip
                        label={user?.UserStatus}
                        color={user?.UserStatus === 'CONFIRMED' ? 'success' : 'default'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>{' '}
                  {loggedInUserGroup === 'AdminMaster' && (
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
                        // onClick={() =>
                        //   router.push(`/dashboard/admincontrol/edit/?id=${customer.id}`)
                        // }
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
                    )}
                    {loggedInUserGroup === 'AdminMaster' && (
                    <TableCell style={{ padding: '5px 16px' }}>
                    {(user.Enabled == true) && <Button
                        size="small"
                        onClick={() => {
                          setOpen1(true);
                          setSelectedUser(user);
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
                      {user.Enabled == false && <Button
                        size="small"
                        onClick={() => {
                          setOpen1(true);
                          setSelectedUser(user);
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
                          setSelectedUser(user);
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
                          setSelectedUser(user);
                          setOpen(true);
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
                    </TableCell>
                    )}
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
            Are you sure you want to delete the User?
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
              deleteUser();
              setOpen(false);
            }}
          >
            Delete
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

AdminListTable.propTypes = {
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
