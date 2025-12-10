import { useState, type ChangeEvent, type FC, type MouseEvent, useEffect } from 'react';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import AlarmClockIcon from '@untitled-ui/icons-react/build/esm/AlarmClock';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import moment from 'moment';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import  Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
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
import toast from 'react-hot-toast';

import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { API, graphqlOperation } from 'aws-amplify';
import * as mutations from '../../../graphql/mutations';

interface DeviceAssignTableProps {
  count?: number;
  items?: Customer[];
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  setButtonsubmit?: any;
  buttonsubmit?: any;
  page?: number;
  selecteddata?: any;
  rowsPerPage?: number;
  selected?: string[];
  companyValue?: any;
  setSelecteddata:any
}

export const DeviceAssignTable: FC<DeviceAssignTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    companyValue,
    setButtonsubmit,
    setSelecteddata,
    buttonsubmit,
    onSelectOne,
    selecteddata,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const [enddate, setEnddate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [value, setValue] = useState('');
  const [selectedid, setSelectedid] = useState('');
  // const [psAnalyzerId, setPsAnalyzerId] = useState('');
  // const [psGatewayId, setPsGatewayId] = useState('');

  useEffect(() => {
    if(buttonsubmit){
    const today = new Date();
    today.setDate(today.getDate() + 30); // Add 30 days
    const defaultValue = today.toISOString().substr(0, 10); // Format: YYYY-MM-DD
    setValue(defaultValue);
    setEnddate(defaultValue)}
  }, [buttonsubmit]);

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };


  const handleChangeEndDate = (event: any) => {
    setEnddate(event.target.value);
  };

  const handleAssign = async () => {
    setIsSubmitting(true)
    try {
      // Update Gateway
     

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {  id: selecteddata.id,assigned_unassigned_status:'Assigned',gateway_id: selectedid, communication_status: "Communicating" },
        })
      );
      // setPsAnalyzerId(updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id)
      const psAnalyzerId = updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: {  id: selectedid,assigned_unassigned_status:'Assigned', communication_status: "Communicating" },
        })
      );
      // setPsGatewayId(updateGatewayResponse.data.updateGateway.ps_gateway_id)
      const psGatewayId = updateGatewayResponse.data.updateGateway.ps_gateway_id

      // // Update Customer
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            gateway_id: selectedid,
          },
        })
      );

      // If both mutations succeed
      if (updateAnalyzerResponse && updateGatewayResponse && updateanalyzerrentalResponse) {
        await API.post('powersightrestapi', `/IoTShadow/AddToWhitelist`, { body: {
          shadowName: psGatewayId,
          deviceName: psAnalyzerId,
        }} );
        setSelecteddata('');
        toast.success('Assigned Successfully!');
        setIsSubmitting(false)
        router.back()
        // setkeyreflect('');
        // setSelecteddata('');
      } else {
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
      setIsSubmitting(false)
    }
  };

  const updateallocation = async (id: any) => {
    setIsSubmitting(true)
    try {
      // Update Gateway
      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: id, id: selecteddata?.id,allocated_unallocated_status:"Allocated", communication_status: "Archive" },
        })
      );

      // Update Customer
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.createAnalyzerRental, {
          input: {
            customer_id: id,
            analyzer_id: selecteddata?.id,
            access_end_date: value,
            end_date:enddate,
            site: selecteddata.site_location ? selecteddata.site_location : null,
            room: selecteddata.room_location ? selecteddata.room_location : null,
          },
        })
      );

      // If both mutations succeed
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        router.back();
        toast.success('Updated Successfully!');
        setIsSubmitting(false)
        setSelecteddata('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
      setIsSubmitting(false)
    }
  };
  const updateunallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: null, id: selecteddata?.id,allocated_unallocated_status:"Unallocated" , communication_status: "Not_Detected", client_id: null},
        })
      );

      // const updateCustomer = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { customer_id: id, gateway_id: null },
      //   })
      // );
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            customer_id: null,
            client_id: null
          },
        })
      );
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        router.back();
        toast.success('Updated Successfully!');
        setSelecteddata('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
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
            variant="contained"
          >
            Assign
          </Button>
         
        </Stack>
      )}
      
      <Scrollbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gateways</TableCell>

              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.items
            ?.filter((customer) => {
              if (
                !companyValue &&
                customer?.analyzer_rental?.items?.some((item) => !item.termination_date === null)
              ) {
                return false;
              }

              return true;
            })
            .map((customer) => {
              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              const isTerminationDateEmpty = customer?.analyzer_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );

              return (
                <React.Fragment key={customer.id}>
                {buttonsubmit && customer.id === selectedid && (
                  <TableRow
                    hover
                    selected={isSelected}
                  >
                    <TableCell>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        <div>{customer.ps_gateway_id ? customer.ps_gateway_id : '-'}</div>
                      </Stack>
                    </TableCell>
                    {isTerminationDateEmpty.length > 0 && (
                      <TableCell align="right">
                        <Button
                          startIcon={
                            <SvgIcon>
                              <DeleteIcon />
                            </SvgIcon>
                          }
                          onClick={() => {
                            setButtonsubmit(false);
                          }}
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{ marginBottom: 1 }}
                          disabled={isSubmitting}
                        >
                          Restore
                        </Button>{' '}
                        <Button
                          size="small"
                          startIcon={
                            <SvgIcon>
                              <Edit02Icon />
                            </SvgIcon>
                          }
                          color="success"
                          variant="outlined"
                          sx={{ marginBottom: 1 }}
                          onClick={() =>
                            companyValue
                              ? updateunallocation(
                                  selecteddata?.analyzer_rental?.items?.customer?.name
                                    ? null
                                    : customer.id
                                )
                              : handleAssign()
                          }
                          disabled={isSubmitting}

                          // onClick={() =>
                          //   updateunallocation(
                          //     selecteddata?.gateway_rental?.items?.customer?.name
                          //       ? null
                          //       : customer.id
                          //   )
                          // }
                        >
                          Accept
                        </Button>
                      </TableCell>
                    )}

                    {isTerminationDateEmpty.length === 0 && (
                      <TableCell align="right">
                        <Button
                          startIcon={
                            <SvgIcon>
                              <DeleteIcon />
                            </SvgIcon>
                          }
                          onClick={() => {
                            setButtonsubmit(false);
                          }}
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{ marginBottom: 1 }}
                          disabled={isSubmitting}
                        >
                          Restore
                        </Button>{' '}
                        <Button
                          size="small"
                          startIcon={
                            <SvgIcon>
                              <Edit02Icon />
                            </SvgIcon>
                          }
                          color="success"
                          variant="outlined"
                          sx={{ marginBottom: 1 }}
                          onClick={() =>
                            handleAssign()
                            
                          }
                          disabled={isSubmitting}
                        >
                          Accept
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )}

                {!buttonsubmit && (
                  <TableRow
                    hover
                    selected={isSelected}
                    key={customer.id}
                  >
                    <TableCell>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        <div
                          onClick={() => {
                            setButtonsubmit(true);
                            setSelectedid(customer.id);
                          }}
                        >
                          {customer.ps_gateway_id ? customer.ps_gateway_id : '-'}
                        </div>
                      </Stack>
                    </TableCell>

                    {isTerminationDateEmpty.length > 0 && (
                      <TableCell align="right">
                        <Button
                          onClick={() => {
                            setButtonsubmit(true);
                            setSelectedid(customer.id);
                          }}
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{ marginBottom: 1 }}
                        >
                          {companyValue ? 'UnAssign' : 'Assign'}
                        </Button>
                      </TableCell>
                    )}

                    {isTerminationDateEmpty.length === 0 && (
                      <TableCell align="right">
                        <Button
                          onClick={() => {
                            setButtonsubmit(true);
                            setSelectedid(customer.id);
                          }}
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{ marginBottom: 1 }}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </React.Fragment>
                
                // <TableRow
                //   hover
                //   key={customer.id}
                //   selected={isSelected}
                // >
                //   <TableCell>
                //     <Stack
                //       alignItems="center"
                //       direction="row"
                //       spacing={1}
                //     >
                //       <div>
                //         <Link
                //           color="inherit"
                //           component={RouterLink}
                //           href={paths.dashboard.gatewaycontrol.details}
                //           variant="subtitle2"
                //         >
                //           {customer.gateway_id ? customer.gateway_id : '-'}
                //         </Link>
                //       </div>
                //     </Stack>
                //   </TableCell>z

                //   <TableCell align="right">
                //     {!buttonsubmit && (
                //       <Button
                //         onClick={() => setButtonsubmit(true)}
                //         color="success"
                //         variant="outlined"
                //         size="small"
                //         sx={{ marginBottom: 1 }}
                //       >
                //         {selecteddata?.customer?.company ? 'UnAllocate' : 'Allocate'}
                //       </Button>
                //     )}
                //     {buttonsubmit && (
                //       <>
                //         <Button
                //           startIcon={
                //             <SvgIcon>
                //               <DeleteIcon />
                //             </SvgIcon>
                //           }
                //           color="error"
                //           variant="outlined"
                //           size="small"
                //           sx={{ marginBottom: 1 }}
                //         >
                //           Restore
                //         </Button>{' '}
                //         <Button
                //           size="small"
                //           startIcon={
                //             <SvgIcon>
                //               <Edit02Icon />
                //             </SvgIcon>
                //           }
                //           color="success"
                //           variant="outlined"
                //           onClick={() =>
                //             updateallocation(
                //               selecteddata?.customer?.company ? null : customer.id,
                //               customer
                //             )
                //           }
                //           // onClick={() => router.push('/dashboard/gatewaycontrol/information')}
                //         >
                //           Accept
                //         </Button>
                //       </>
                //     )}
                //   </TableCell>
                // </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      {items?.items?.length == 0 && (
      <Typography
        gutterBottom
        variant="subtitle2"
        style={{ marginTop: 80, marginBottom: 40, textAlign: 'center' }}
      >
        No Gateway found
      </Typography>)}
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

DeviceAssignTable.propTypes = {
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
