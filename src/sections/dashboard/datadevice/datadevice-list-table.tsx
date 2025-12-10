import type { ChangeEvent, FC, MouseEvent } from 'react';
import { useEffect, useState,  } from 'react';
import { Chip, Divider, Grid, Modal, } from '@mui/material';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Avatar from '@mui/material/Avatar';
import AlarmClockIcon from '@untitled-ui/icons-react/build/esm/AlarmClock';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import toast from 'react-hot-toast';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Analyzer } from 'src/types/analyzer';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { InputAdornment, OutlinedInput } from '@mui/material';

interface ClientListTableProps {
  count?: number;
  items?: any;
  entered: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (analyzerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  handleFiltersChange: (filters: any | null) => void;
  handleDeviceCreate: () => void;
  handleInputChange: (input: any | null) => void;
  onSelectOne?: (analyzerId: string) => void;
  page?: number;
  handleUnAssign:any;
  rowsPerPage?: number;
  selected?: string[];
  setanalyzerreload: any;
  setsize: any;
  setanalyzerid:any;
  setSelecteddata: any;
  handleOpen1: any;
  handleClose1: any;
  open1: any;
  updateunallocation: any;
  setside:any;
  isSubmitting:any;
  handleOpen2: any;
  handleClose2: any;
  open2: any;
  logedinusergroup: any;
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

export const ClientListTable: FC<ClientListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    handleFiltersChange,
    handleDeviceCreate,
    handleInputChange,
    setanalyzerreload,
    setsize,
    isSubmitting,
    setanalyzerid,
    setSelecteddata,
    updateunallocation,
    setside,
    handleOpen1,
    handleClose1,
    handleUnAssign,
    open1,
    onSelectAll,
    onSelectOne,
    handleOpen2,
    handleClose2,
    open2,
    entered,
    page = 0,
    rowsPerPage = 0,
    selected = [],
    logedinusergroup,
  } = props;
  console.log(items,"items")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const [selectedAnalyzer, setSelectedAnalyzer] = useState<any>();
  // console.log(selectedAnalyzer,"selected analysersss")
  const [analyzerserial, setAnalyzerserial] = useState('');
  const [psGatewayIdWhiteList, setPsGatewayIdWhiteList] = useState<any>('');
  console.log(psGatewayIdWhiteList,"white list id")
  const [open, setOpen] = useState(false);
  

  const handleClose = () => {
    setOpen(false);
  };

  const handleSerialChange = (e: any) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setAnalyzerserial(onlyNumbers);
    handleFiltersChange({ serial_number: { contains: onlyNumbers } });
    handleInputChange({ serial_number: onlyNumbers });
    // setGatewayserialvalue(onlyNumbers)
  };

  const removeAnalyzer = async (selectedAnalyzer: any) => {
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteAnalyzer', {
        body: {
          analyzerId: selectedAnalyzer?.id,
        },
      });

      await API.del('powersightrestapi', `/IoTShadow/deleteShadow`, { body: {
        shadowName: selectedAnalyzer?.ps_analyzer_id,
      }} );

      toast.success('Analyzer removed successfully');
      setanalyzerreload(1);

      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing Analyzer: ' + error.message);
      throw error;
    }
  };

  const [isClient, setIsClient] = useState(false);
  const [clientId, setClientId] = useState();
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        console.log(currentUser, "current user");
        const customerId = currentUser.attributes?.['custom:customerId'];
        const clientId = currentUser.attributes?.['custom:clientId'];
        setClientId(clientId);

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
                  defaultValue=""
                  fullWidth
                  // inputProps={{ ref: queryRef }}

                  placeholder="Enter Model"
                  onChange={(e) => {
                    handleFiltersChange({ model: { contains: e.target.value } });
                    handleInputChange({ model: e.target.value });
                  }}
                />
              </TableCell>
              <TableCell style={{ backgroundColor: '#fff' }}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  value={analyzerserial}
                  // inputProps={{ ref: queryRef }}
                  placeholder="Enter Serial#"
                  inputProps={{ maxLength: 5 }}
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
                    startIcon={
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={() => handleDeviceCreate()}
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
              <TableCell width={`35%`}>Client Name</TableCell>)}
              <TableCell
               width={`15%`}
               align="center"
              >Device Status</TableCell>
              <TableCell align="left">
              {!isClient && (
                <>
                  Actions
                </>
                )}
              </TableCell>
              <TableCell>
              {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin") && (
                <>
                  Control
                </>
                )}
              </TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.map((analyzer) => {

          if (!analyzer.model  || !analyzer.serial_number ) {
            return null;
          }
             const isSelected = selected.includes(analyzer.id);
             const isTerminationDateEmpty = analyzer?.analyzer_rental?.items.filter(
               (gat: any) => !gat.termination_date
             );
             console.log(isTerminationDateEmpty,"isTerminationDateEmpty")
             const filteredByClientId = analyzer?.analyzer_rental?.items.filter(
              (gat: any) => gat.client_id == clientId
            );
            console.log(filteredByClientId,"filteredByClientId")

              return (
                <TableRow
                  hover
                  key={analyzer.id}
                  selected={isSelected}
                >
                   <TableCell
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                       window.localStorage.setItem('previouspageName', 'Data Device Control');
                       window.localStorage.setItem('previouspageUrl','/dashboard/datadevicecontrol');
                      router.push(`/dashboard/datadevicecontrol/information/?id=${analyzer?.id}`);
                    }}
                  >
                    <Stack
                      direction="column"
                      alignItems="start"
                      spacing={1}
                    >
                      <div>{analyzer.ps_analyzer_id}</div>
                    </Stack>
                  </TableCell>{' '}
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
                                <>{isTerminationDateEmpty[0]?.customer?.name} </>
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
                    {analyzer?.active_inactive_status ? (
                      <Chip
                        label={analyzer?.active_inactive_status}
                        color={analyzer?.active_inactive_status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell>
                  {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                  <>
                    {(analyzer?.customer_id != null && analyzer?.customer_id != '0000-0000-0000-0000-0000-0000-0000-0000') && (
                      <Button
                        onClick={() => {
                          setSelecteddata(analyzer);
                          handleOpen1();
                        }}
                        startIcon={
                          <SvgIcon>
                            <AlarmClockIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                        disabled={analyzer?.assigned_unassigned_status =="Assigned" }
                      >
                        Unallocate
                      </Button>
                    )}                  
                    {(analyzer?.customer_id == null || analyzer?.customer_id == '0000-0000-0000-0000-0000-0000-0000-0000') && (
                      <Button
                        startIcon={
                          <SvgIcon>
                            <AlarmClockIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        onClick={() => {
                          setsize(true), setanalyzerid(analyzer?.id);
                          // setGatewayserialvalue(customer?.serial_number)
                          // setGatewaymodelvalue(customer?.model)
                          handleFiltersChange({
                            serial_number: { contains: analyzer?.serial_number },
                          });
                          handleFiltersChange({ model: { contains: analyzer?.model } });
                          // router.push(`/dashboard/gatewaycontrol/allocation/?id=${customer?.id}`)
                        }}
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                        disabled={analyzer?.active_inactive_status =="Inactive" }
                      >
                        Allocate
                      </Button>
                    )}
                  </>
                  )}
                    {'  '}
                  {!isClient && (
                    <Button
                      startIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                      color="success"
                      component="a"
                      onClick={() =>{
                        window.localStorage.setItem('previouspageName', 'Data Device Control');
                        window.localStorage.setItem('previouspageUrl','/dashboard/datadevicecontrol');
                        router.push(`/dashboard/datadevicecontrol/information/?id=${analyzer.id}`)
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {' '}
                  {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                  <>
                    <Button
                      startIcon={
                        <SvgIcon>
                          <DeleteIcon />
                        </SvgIcon>
                      }
                      color="error"
                      variant="outlined"
                      disabled={analyzer?.customer_id != null && analyzer?.customer_id != '0000-0000-0000-0000-0000-0000-0000-0000'}
                      onClick={() => {
                        setSelectedAnalyzer(analyzer);
                        setOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </>
                  )}
                  </TableCell>
                  
                  <TableCell>
                  {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin") && (
                  <>
                  {analyzer.assigned_unassigned_status=="Assigned" && (
                      <Button
                        onClick={() => {
                          setSelecteddata(analyzer);
                          setPsGatewayIdWhiteList(analyzer?.gateway?.ps_gateway_id);
                          handleOpen2();
                        }}
                        startIcon={
                          <SvgIcon>
                            <AssignmentTurnedInOutlinedIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                      >
                        Unassign
                      </Button>
                    )}
                    {(analyzer.allocated_unallocated_status =="Allocated" && analyzer.assigned_unassigned_status == "Unassigned")
                    ||(analyzer.allocated_unallocated_status =="Allocated" && analyzer.assigned_unassigned_status == null)
                     ? (
                      <Button
                        startIcon={
                          <SvgIcon>
                            <AssignmentTurnedInOutlinedIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        onClick={() => {
                          setside(true),  setSelecteddata(analyzer);
                          // setGatewayserialvalue(customer?.serial_number)
                          // setGatewaymodelvalue(customer?.model)
                          handleFiltersChange({
                            serial_number: { contains: analyzer?.serial_number },
                          });
                          handleFiltersChange({ model: { contains: analyzer?.model } });
                          // router.push(`/dashboard/gatewaycontrol/allocation/?id=${customer?.id}`)
                        }}
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                      >
                        Assign
                      </Button>
                    ):null}
                    </>
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
            Are you sure want to Remove this Analyzer
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 4 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                removeAnalyzer(selectedAnalyzer);

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

      <Modal
        open={open2}
        onClose={handleClose2}
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
            Are you sure you want to Unassign?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleClose2}
              color="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUnAssign(selectedAnalyzer?.id, psGatewayIdWhiteList)}
              color="primary"
              sx={{ ml: 1 }}
              disabled={isSubmitting}
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

ClientListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  handleFiltersChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
