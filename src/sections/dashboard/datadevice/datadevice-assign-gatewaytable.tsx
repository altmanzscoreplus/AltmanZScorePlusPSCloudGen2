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

interface DeviceAssignGatewayTableProps {
  count?: number;
  items?: Customer[];
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  setButtonsubmit1?: any;
  buttonsubmit1?: any;
  page?: number;
  selecteddata?: any;
  setSelecteddata?: any;
  rowsPerPage?: number;
  companyValue?: any;
  setkeyreflect?: any;
  setside?: any;
  selected?: string[];
  clear?: any;
  setGatewayserialvalue: any;
  setGatewaymodelvalue: any;
  handleFiltersChange: (filters: any | null) => void;
}

export const DeviceAssignGatewayTable: FC<DeviceAssignGatewayTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setButtonsubmit1,
    setSelecteddata,
    buttonsubmit1,
    onSelectOne,
    selecteddata,
    companyValue,
    setGatewayserialvalue,
    setGatewaymodelvalue,
    handleFiltersChange,
    page = 0,
    setkeyreflect,
    clear,
    setside,

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
  const [psAnalyzerId, setPsAnalyzerId] = useState('');
  // const [psGatewayId, setPsGatewayId] = useState('');
  // console.log(psGatewayId, psAnalyzerId, "ps ids")

  const handleAssign = async (id: any) => {
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
        console.log(psGatewayId, psAnalyzerId, "PS IDSS")
        await API.post('powersightrestapi', `/IoTShadow/AddToWhitelist`, { body: {
          shadowName: psGatewayId,
          deviceName: psAnalyzerId,
        }} );
        setside(false);
        // setGatewayserialvalue('');
        // setGatewaymodelvalue('');
        handleFiltersChange({ serial_number: { contains: '' } });
        handleFiltersChange({ model: { contains: '' } });
        clear();
        toast.success('Assigned Successfully!');
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
    if (selecteddata.id) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: selecteddata.id,
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
  }, [selecteddata.id]);

  useEffect(() => {
    getgateways();
  }, [selecteddata.id]);

 

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
            Assign
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gateways</TableCell>

              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {items?.items?.map((customer) => {
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
                    {buttonsubmit1 && customer.id === selectedid && (
                      <TableRow
                        hover
                        selected={isSelected}
                        
                      >
                        <TableCell>
                          <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            <div>{customer.ps_gateway_id ? customer.ps_gateway_id : '-'}</div>
                          </Stack>
                        </TableCell>
                          <TableCell align="right">
                            <Button
                              startIcon={
                                <SvgIcon>
                                  <DeleteIcon />
                                </SvgIcon>
                              }
                              onClick={() => {
                                setButtonsubmit1(false);
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
                                handleAssign(
                                  selecteddata?.analyzer_rental?.items.customer?.name
                                    ? null
                                    : customer.id
                                )
                              }
                              disabled={ isSubmitting}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        
                      </TableRow>
                    )}

                    {!buttonsubmit1 && (
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
                                setButtonsubmit1(true);
                                setSelectedid(customer.id);
                              }}
                            >
                              {customer.ps_gateway_id ? customer.ps_gateway_id : '-'}
                            </div>
                          </Stack>
                        </TableCell>
                          <TableCell align="right">
                            <Button
                              onClick={() => {
                                setButtonsubmit1(true);
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
                       
                      </TableRow>
                    )}
                  </React.Fragment>
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

DeviceAssignGatewayTable.propTypes = {
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
