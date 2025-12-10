import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Check from '@untitled-ui/icons-react/build/esm/Check';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import {
  useState,
  type ChangeEvent,
  type FC,
  type MouseEvent,
  useEffect,
  useCallback,
} from 'react';
import toast from 'react-hot-toast';
import { Typography, TextField, Grid } from '@mui/material';
import { API, graphqlOperation } from 'aws-amplify';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface AnalyzerAllocationTablecustomerProps {
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
  setSelecteddata?: any;
  rowsPerPage?: number;
  companyValue?: any;
  analyzerid?: any;
  setkeyreflect?: any;
  setsize?: any;
  selected?: string[];
  clear?: any;
  setGatewayserialvalue: any;
  setGatewaymodelvalue: any;
  handleFiltersChange: (filters: any | null) => void;
}

export const AnalyzerAllocationTablecustomer: FC<AnalyzerAllocationTablecustomerProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setButtonsubmit,
    setSelecteddata,
    buttonsubmit,
    onSelectOne,
    selecteddata,
    companyValue,
    setGatewayserialvalue,
    setGatewaymodelvalue,
    handleFiltersChange,
    page = 0,
    analyzerid,
    setkeyreflect,
    clear,
    setsize,

    rowsPerPage = 0,
    selected = [],
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  // const today = new Date().toISOString().split('T')[0];
  const [value, setValue] = useState('');
  const [enddate, setEnddate] = useState('');
  const [analyzerdetail, setanalyzerdetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const updateallocation = async (id: any) => {
    setIsSubmitting(true)
    try {
      // Update Gateway
      console.log(analyzerdetail, 'gatewaydetailsssssssssssssssssssssssss');

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: id, id: analyzerid,allocated_unallocated_status:'Allocated', communication_status: "Archive" },
        })
      );

      // // Update Customer
      const updategatewayrentalResponse = await API.graphql(
        graphqlOperation(mutations.createAnalyzerRental, {
          input: {
            customer_id: id,
            analyzer_id: analyzerid,
            access_end_date: value,
            end_date:enddate,
            site: analyzerdetail.site_location ? analyzerdetail.site_location : null,
            room: analyzerdetail.room_location ? analyzerdetail.room_location : null,
          },
        })
      );

      // If both mutations succeed
      if (updateGatewayResponse && updategatewayrentalResponse) {
        setsize(false);
        // setGatewayserialvalue('');
        // setGatewaymodelvalue('');
        handleFiltersChange({ serial_number: { contains: '' } });
        handleFiltersChange({ model: { contains: '' } });
        clear();
        toast.success('Updated Successfully!');
        setIsSubmitting(false)
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

  const getgateways = useCallback(async () => {
    if (analyzerid) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: analyzerid,
          })
        );
        console.log(assets.data.getAnalyzer, '66clearassetttttttttttttttttttttttttttttt');
        setanalyzerdetail(assets.data.getAnalyzer);
        // setcustomername(
        //   assets.data.getGateway.gateway_rental.items.filter((gat: any) => !gat.termination_date)[0]
        //     .customer?.name
        // );
      } catch (err) {
        console.error(err);
      }
    }
  }, [analyzerid]);

  useEffect(() => {
    getgateways();
  }, [analyzerid]);

  const updateunallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: null, id: selecteddata?.id,allocated_unallocated_status:"Unallocated" , communication_status: "Not_Detected", client_id: null},
        })
      );

      // const updateCustomer = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { customer_id: id, gateway_id: null },
      //   })
      // );
      const updategatewayrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            customer_id: null,
            client_id: null
          },
        })
      );
      if (updateGatewayResponse && updategatewayrentalResponse) {
        router.back();
        clear();
        toast.success('Updated Successfully1!');
        setSelecteddata('');
        // setkeyreflect('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
  };

  const [selectedid, setSelectedid] = useState('');

  return (
    <Box
      sx={{ position: 'relative' }}
      className="scroolcustomer"
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
            Allocate
          </Button>
          {/* <Button
            color="inherit"
            size="small"
          >
            Edit
          </Button> */}
        </Stack>
      )}
      {buttonsubmit && (
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            xs={5.5}
            sx={{ ml: 2 }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: 15, fontWeight: '500', color: 'customColors.color_98', mb: 1 }}
            >
              Access End Date
            </Typography>
            <>
              <TextField
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                }}
                size="small"
                value={value}
                onChange={handleChange}
                sx={{ mb: 3 }}
                fullWidth
              />
            </>
          </Grid>
          <Grid
            item
            xs={5.5}
           
          >
            <Typography
              variant="body2"
              sx={{ fontSize: 15, fontWeight: '500', color: 'customColors.color_98', mb: 1 }}
            >
               End Date
            </Typography>
            <>
              <TextField
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                }}
                size="small"
                value={enddate}
                onChange={handleChangeEndDate}
                sx={{ mb: 3 }}
                fullWidth
              />
            </>
          </Grid>
        </Grid>
      )}
      <Scrollbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>

              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {items?.items?.map((customer) => { */}

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
                const totalSpent = numeral(customer.totalSpent).format(
                  `${customer.currency}0,0.00`
                );

                const isTerminationDateEmpty = customer?.analyzer_rental?.items.filter(
                  (gat: any) => !gat.termination_date
                );

                console.log(selecteddata, 'k8888888888888888888888888888888888888888');
                // const nocustomername = ;
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
                            <div>{customer.name ? customer.name : '-'}</div>
                          </Stack>
                        </TableCell>
                        {isTerminationDateEmpty?.length > 0 && (
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
                                  : updateallocation(
                                      selecteddata?.analyzer_rental?.items?.customer?.name
                                        ? null
                                        : customer.id
                                    )
                              }
                              disabled={!value || !enddate ||isSubmitting}

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

                        {isTerminationDateEmpty?.length === 0 && (
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
                                updateallocation(
                                  selecteddata?.analyzer_rental?.items.customer?.name
                                    ? null
                                    : customer.id
                                )
                              }
                              disabled={!value || !enddate ||isSubmitting}
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
                              {customer.name ? customer.name : '-'}
                            </div>
                          </Stack>
                        </TableCell>

                        {isTerminationDateEmpty?.length > 0 && (
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
                              {companyValue ? 'UnAllocate' : 'Allocate'}
                            </Button>
                          </TableCell>
                        )}

                        {isTerminationDateEmpty?.length === 0 && (
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
                              Allocate
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </Scrollbar>
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

AnalyzerAllocationTablecustomer.propTypes = {
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
