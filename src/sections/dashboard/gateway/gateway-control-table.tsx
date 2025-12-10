import { Chip, Divider, Grid, Modal, OutlinedInput, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AlarmClockIcon from '@untitled-ui/icons-react/build/esm/AlarmClock';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useEffect, useState, type ChangeEvent, type FC, type MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import * as mutations from '../../../graphql/mutations';
import moment from 'moment';

interface GatewayTableProps {
  count?: number;
  items?: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  handleFiltersChange: (filters: any | null) => void;
  handleGatewayCreate: () => void;
  setgatewayreload: any;
  handleInputChange: (input: any | null) => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  s_id: any;
  m_id: any;
  entered: any;
  rowsPerPage?: number;
  selected?: string[];
  filters?: any;
  handleOpen1: any;
  handleClose1: any;
  open1: any;
  setsize: any;
  setSelecteddata: any;
  setgatewayid: any;
  updateunallocation: any;
  logedinusergroup: any;
  // gatewayserialvalue:any
  // setGatewayserialvalue:any
  // gatewaymodelvalue:any
  // setGatewaymodelvalue:any
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

export const GatewayTable: FC<GatewayTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    handleFiltersChange,
    handleGatewayCreate,
    handleInputChange,
    handleClose1,
    setgatewayreload,
    setSelecteddata,
    updateunallocation,
    setgatewayid,
    setsize,
    entered,
    filters,
    s_id,
    m_id,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
    handleOpen1,
    open1,
    logedinusergroup,
    // gatewayserialvalue,
    // setGatewayserialvalue,
    // gatewaymodelvalue,
    // setGatewaymodelvalue
  } = props;
  console.log(items,"items")
  console.log(logedinusergroup,"user group");
  const router = useRouter();

  // useEffect(() => {
  //   if (m_id && s_id) {
  //     handleFiltersChange({ model: { contains: m_id } });
  //     handleInputChange({ model: m_id });
  //     handleFiltersChange({ serial_number: { contains: s_id } });
  //     handleInputChange({ serial_number: s_id });
  //   }
  // }, [m_id, s_id, handleFiltersChange, handleInputChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (m_id) {
        handleFiltersChange({ model: { contains: m_id } });
        handleInputChange({ model: m_id });
        handleFiltersChange({ serial_number: { contains: s_id } });
        handleInputChange({ serial_number: s_id });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [m_id, s_id, handleFiltersChange, handleInputChange]);

  const [selectedGateway, setSelectedGateway] = useState('');
  console.log(selectedGateway, 'ooooo');
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const removeGateway = async (selectedGateway: any) => {
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteGateway', {
        body: {
          gatewayId: selectedGateway?.id,
        },
      });

      await API.del('powersightrestapi', `/IoTShadow/deleteShadow`, { body: {
        shadowName: selectedGateway?.ps_gateway_id,
      }} );

      toast.success('Gateway removed successfully');
      setgatewayreload(1);

      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing Gateway: ' + error.message);
      throw error;
    }
  };

  const [gatewayserial, setGatewayserial] = useState('');
  const [isCustomer, setIsCustomer] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [clientId, setClientId] = useState();

  const handleSerialChange = (e: any) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setGatewayserial(onlyNumbers);
    handleFiltersChange({ serial_number: { contains: onlyNumbers } });
    handleInputChange({ serial_number: onlyNumbers });
    // setGatewayserialvalue(onlyNumbers)
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        console.log(currentUser, "current user");
        const customerId = currentUser.attributes?.['custom:customerId'];
        const clientId = currentUser.attributes?.['custom:clientId'];
        setClientId(clientId);

        if (customerId) {
          setIsCustomer(true);
        }

        if (clientId) {
          setIsClient(true);
        }
        
      } catch (error) {
        console.error("Error fetching current user: ", error);
      }
    };

    fetchCurrentUser();
  }, []);


  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ backgroundColor: '#fff' }}>
                <OutlinedInput
                  defaultValue={m_id}
                  fullWidth
                  // value={gatewaymodelvalue}
                  // inputProps={{ ref: queryRef }}

                  placeholder="Enter Model"
                  onChange={(e) => {
                    // setGatewaymodelvalue(e.target.value)
                    handleFiltersChange({ model: { contains: e.target.value } });
                    handleInputChange({ model: e.target.value });
                  }}
                />
              </TableCell>
              <TableCell style={{ backgroundColor: '#fff' }}>
                <OutlinedInput
                  defaultValue={s_id}
                  fullWidth
                  value={gatewayserial}
                  // inputProps={{ ref: queryRef }}
                  placeholder="Enter Serial#"
                  inputProps={{ maxLength: 6 }}
                  // onChange={(e) => {
                  //   handleFiltersChange({ serial_number: { contains: e.target.value } });
                  //   handleInputChange({ serial_number: e.target.value });
                  // }}
                  onChange={handleSerialChange}
                />
              </TableCell>
              { !isClient && (
              <TableCell style={{ backgroundColor: '#fff' }}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  // inputProps={{ ref: queryRef }}
                  placeholder="Enter Customer"
                />
              </TableCell>
              )}
              { isClient && (
              <TableCell style={{ backgroundColor: '#fff' }}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  // inputProps={{ ref: queryRef }}
                  placeholder="Enter Client"
                />
              </TableCell>
              )}
              <TableCell
                colSpan={2}
                style={{ backgroundColor: '#fff' }}
              >
                {items?.length == 0 && entered.model && entered.serial_number && (
                  <>
                  {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                  <Button
                    // component={RouterLink}
                    // href={paths.dashboard.gatewaycontrol.create}
                    startIcon={
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={() => handleGatewayCreate()}
                  >
                    Create
                  </Button>
                  )}
                  </>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell width={`15%`}>Model-serial#</TableCell>
              { !isClient && (
              <TableCell width={`25%`}>Customer Name</TableCell>)}
              { isClient && (
              <TableCell width={`25%`}>Client Name</TableCell>)}
              <TableCell
                width={`15%`}
                align="center"
              >
                Status
              </TableCell>
              <TableCell>
                {!isClient && (
                <>
                  Actions
                </>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((customer: any) => {

            if (!customer.model  || !customer.serial_number ) {
              return null;
}
              const isSelected = selected.includes(customer.id);
              const isTerminationDateEmpty = customer?.gateway_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );
              // console.log(isTerminationDateEmpty[0],"isTerminationDateEmpty")
              const filteredByClientId = customer?.gateway_rental?.items.filter(
                (gat: any) => gat.client_id == clientId
              );
                 console.log(filteredByClientId[0]?.client,"client idddd") 
              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                >
                  <TableCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      window.localStorage.setItem('previouspageName', 'Gateway Control');
                      window.localStorage.setItem('previouspageUrl','/dashboard/gatewaycontrol')
                      router.push(`/dashboard/gatewaycontrol/information/?id=${customer?.id}`);
                    }}
                  >
                    <Stack
                      direction="column"
                      alignItems="start"
                      spacing={1}
                    >
                      <div>{customer.ps_gateway_id}</div>
                    </Stack>
                  </TableCell>
                  {isTerminationDateEmpty.length > 0 && (
                    <>
                      <TableCell align="center"
                      style={{ cursor: 'pointer' }}
                      >
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1}
                        >
                          <div>
                          { !isClient && (
                            <Link
                              color="inherit"
                              onClick={() =>
                                router.push(`/dashboard/customercontrol/edit/?id=${isTerminationDateEmpty[0].customer?.id}`)
                              }
                              variant="subtitle2"
                            >
                              {isTerminationDateEmpty.length > 0 && (
                                <>{isTerminationDateEmpty[0].customer?.name}</>
                              )}
                            </Link>
                            )}
                            { isClient && (
                            <Link
                              color="inherit"
                              onClick={() =>
                                router.push(`/dashboard/clientcontrol/edit/?id=${filteredByClientId[0].client?.id}`)
                              }
                              variant="subtitle2"
                            >
                              {filteredByClientId.length > 0 && (
                                <>{filteredByClientId[0].client?.name}</>
                              )}
                            </Link>
                            )}
                          </div>
                        </Stack>
                      </TableCell>
                    </>
                  )}
                  {!isTerminationDateEmpty.length > 0 && (
                    <>
                      <TableCell align="center">
                        <Stack
                          alignItems="center"
                          direction="row"
                          spacing={1}
                        >
                          <div>
                            <Link
                              color="inherit"
                              // component={RouterLink}
                              // href={paths.dashboard.gatewaycontrol.details}
                              variant="subtitle2"
                            >
                              {'-'}
                            </Link>
                          </div>
                        </Stack>
                      </TableCell>
                    </>
                  )}
                  <TableCell align="center">
                    {customer?.active_inactive_status ? (
                      <Chip
                        label={customer?.active_inactive_status}
                        color={customer?.active_inactive_status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell>
                  {/* { !isClient && ( */}
                  {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin") && (
                    <>
                    {(customer?.customer_id != null && customer?.customer_id != '0000-0000-0000-0000-0000-0000-0000-0000') && (
                      <Button
                        onClick={() => {
                          setSelecteddata(customer);
                          handleOpen1();
                        }}
                        startIcon={
                          <SvgIcon>
                            <AlarmClockIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                        disabled={customer?.assigned_unassigned_status =="Assigned" }
                      >
                        Unallocate
                      </Button>
                    )}
                    {(customer?.customer_id == null || customer?.customer_id == '0000-0000-0000-0000-0000-0000-0000-0000') && (
                      <Button
                        startIcon={
                          <SvgIcon>
                            <AlarmClockIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        onClick={() => {
                          setsize(true), setgatewayid(customer?.id);
                          // setGatewayserialvalue(customer?.serial_number)
                          // setGatewaymodelvalue(customer?.model)
                          handleFiltersChange({
                            serial_number: { contains: customer?.serial_number },
                          });
                          handleFiltersChange({ model: { contains: customer?.model } });
                          // router.push(`/dashboard/gatewaycontrol/allocation/?id=${customer?.id}`)
                        }}
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                        disabled={customer?.active_inactive_status =="Inactive" }
                      >
                        Allocate
                      </Button>
                    )}                    
                    {'  '}
                    <Button
                      startIcon={
                        <SvgIcon>
                          <DeleteIcon />
                        </SvgIcon>
                      }
                      color="error"
                      variant="outlined"
                      disabled={customer?.customer_id != null && customer?.customer_id != '0000-0000-0000-0000-0000-0000-0000-0000'}
                      style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                      onClick={() => {
                        setSelectedGateway(customer);
                        setOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                    </>
                  )}{' '}
                  {!isClient && (
                    <Button
                      startIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                      color="success"
                      variant="outlined"
                      onClick={() => {
                        window.localStorage.setItem('previouspageName', 'Gateway Control');
                        window.localStorage.setItem('previouspageUrl','/dashboard/gatewaycontrol')
                        router.push(`/dashboard/gatewaycontrol/information/?id=${customer?.id}`);
                      }}
                      style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                    >
                      Edit
                    </Button>
                  )}
                  </TableCell>
                  
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Are You Sure?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure want to Remove this Gateway
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 4 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                removeGateway(selectedGateway);

                setOpen(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setOpen(false);
              }}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Confirmation?
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2 }}
          >
            Are you sure you want to unallocate?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleClose1}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateunallocation()}
              color="primary"
              sx={{ ml: 1 }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

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

GatewayTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  handleFiltersChange: PropTypes.func,
  handleInputChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
