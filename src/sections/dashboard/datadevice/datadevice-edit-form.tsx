import { useEffect, type FC, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import Typography from '@mui/material/Typography';
import { GatewayAssigned } from 'src/sections/dashboard/datadevice/gateway-assigned-table';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { wait } from 'src/utils/wait';
import { useMounted } from 'src/hooks/use-mounted';
import { customersApi } from 'src/api/customers';
import { useSelection } from 'src/hooks/use-selection';
import { Box, FormControl, InputLabel, MenuItem, Select,Modal } from '@mui/material';
import { API, graphqlOperation, Auth } from 'aws-amplify';

import { useRouter } from 'next/router';

import * as queries from '../../../graphql/queries';
import * as mutations from '../../../graphql/mutations';
import { DatePicker } from '@mui/x-date-pickers';
//import { DatePicker } from '@mui/lab';
import { Label } from '@mui/icons-material';
import moment from 'moment';


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




interface DataDeviceEditFormProps {
  customer: Customer;
  date: date;
  dateend: dateend;
  createdAtendDate: createdAtendDate;
}

interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

interface AnalyzersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface CustomersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
const useDataDeviceSearch = () => {
  const [state, setState] = useState<AnalyzersSearchState>({
    filters: {
      query: undefined,
      hasAcceptedMarketing: undefined,
      isProspect: undefined,
      isReturning: undefined,
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'updatedAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback(
    (sort: { sortBy: string; sortDir: 'asc' | 'desc' }): void => {
      setState((prevState) => ({
        ...prevState,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }));
    },
    []
  );

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const useCustomersSearch = () => {
  const [state, setState] = useState<CustomersSearchState>({
    filters: {
      query: undefined,
      hasAcceptedMarketing: undefined,
      isProspect: undefined,
      isReturning: undefined,
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'updatedAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback(
    (sort: { sortBy: string; sortDir: 'asc' | 'desc' }): void => {
      setState((prevState) => ({
        ...prevState,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }));
    },
    []
  );

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

interface CustomersStoreState {
  customers: Customer[];
  customersCount: number;
}
interface AnalyzersStoreState {
  analyzers: Analyzer[];
  analyzersCount: number;
}
const sortOptions: SortOption[] = [
  {
    label: 'Last update (newest)',
    value: 'updatedAt|desc',
  },
  {
    label: 'Last update (oldest)',
    value: 'updatedAt|asc',
  },
  {
    label: 'Total orders (highest)',
    value: 'totalOrders|desc',
  },
  {
    label: 'Total orders (lowest)',
    value: 'totalOrders|asc',
  },
];

const useAnalyzersStore = (searchState: AnalyzersSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<AnalyzersStoreState>({
    analyzers: [],
    analyzersCount: 0,
  });

  const handleAnalyzersGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers, { filter: searchState.filters })
      );
      if (isMounted()) {
        setState({
          analyzers: response.data.listAnalyzers,
          analyzersCount: response.data.listAnalyzers.length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleAnalyzersGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
    handleAnalyzersGet
  };
};

const useCustomersStore = (searchState: CustomersSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<CustomersStoreState>({
    customers: [],
    customersCount: 0,
  });

  const handleCustomersGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomers(searchState);

      if (isMounted()) {
        setState({
          customers: response.data,
          customersCount: response.count,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleCustomersGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
  };
};

const useCustomersIds = (customers: Customer[] = []) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, []);
};

const useAnalyzersIds = (analyzers: any = []) => {
  return useMemo(() => {
    // return analyzers.map((analyzer) => analyzer.id);
  }, []);
};

export const DataDeviceEditForm: FC<DataDeviceEditFormProps> = (props) => {
  const { customer, date, dateend, createdAtendDate, ...other } = props;
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);

  const analyzersSearch = useDataDeviceSearch();
  const analyzersStore = useAnalyzersStore(analyzersSearch.state);
  const analyzersIds = useAnalyzersIds(analyzersStore.analyzers);

  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);

  const router = useRouter();
  const pathnameParts = router.asPath.split('/');
  const { id } = router.query;
  const [gatewaydetail, setgatewaydetail] = useState();
  console.log(gatewaydetail," gateway ps id")
  const [analyzerlist, setAnalyzerlist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const [psGatewayIdWhiteList, setPsGatewayIdWhiteList] = useState('');
  console.log(psGatewayIdWhiteList, "ps gateway id")
  
  const getAnalyzer = useCallback(async () => {
    if (id) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: id,
          })
        );
        console.log(assets.data.getAnalyzer, '66clearassetttttttttttttttttttttttttttttt');
        setgatewaydetail(assets.data.getAnalyzer);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

  useEffect(() => {
    getAnalyzer();
  }, [id]);

  

  const formik = useFormik({
    initialValues: {
      fw_ver: gatewaydetail?.fw_ver || '',
      hw_ver: gatewaydetail?.hw_ver || '',
      options: gatewaydetail?.options || '',
      active_inactive_status: gatewaydetail?.active_inactive_status || 'Active',
      site_location: gatewaydetail?.site_location || '',
      room_location: gatewaydetail?.room_location || '',
      circuit:gatewaydetail?.circuit || '',
      serial_number: gatewaydetail?.serial_number || '',
      gps_location: gatewaydetail?.gps_location || '',
      model: gatewaydetail?.model || '',
      ps_analyzer_id: gatewaydetail?.ps_analyzer_id || '',
      calibration: gatewaydetail?.calibration || '',
      warranty: gatewaydetail?.warranty || '',
    },
    validationSchema: Yup.object({
      // Uncomment and adjust validations as needed
      // fw_ver: Yup.string().max(255).required('required'),
      // hw_ver: Yup.string().max(255).required('required'),
      // options: Yup.string().max(255).required('required'),
      // site_location: Yup.string().max(255).required('required'),
      // status: Yup.string().max(255).required('status is required'),
      // room_location: Yup.string().max(255).required('required'),
      // gps_location: Yup.string().max(255).required('required'),
      // model: Yup.string().max(255).required('required'),
    }),
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        console.log(values, 'Form submission values');

        const currentDateend = date ? moment(date).format('YYYY-MM-DD') : 'Invalid date';
        const currentDataeccessend = dateend
          ? moment(dateend).format('YYYY-MM-DD')
          : 'Invalid date';
        const endDate = createdAtendDate
          ? moment(createdAtendDate).format('YYYY-MM-DD')
          : 'Invalid date';

        const gatewayRentalItems = gatewaydetail?.analyzer_rental?.items || [];
        const activeRentalItem = gatewayRentalItems.find((gat) => !gat.termination_date);

        if (activeRentalItem) {
          const updateAnalyzerRentalResponse = await API.graphql(
            graphqlOperation(mutations.updateAnalyzerRental, {
              input: {
                id: activeRentalItem.id,
                access_end_date: currentDateend !== 'Invalid date' ? currentDateend : null,
                end_date: currentDataeccessend !== 'Invalid date' ? currentDataeccessend : endDate,
              },
            })
          );

          if (updateAnalyzerRentalResponse) {
            // router.back();
            // toast.success('Updated Successfully!');
          }
        }

        const updateAnalyzerResponse = await API.graphql(
          graphqlOperation(mutations.updateAnalyzer, {
            input: {
              id: id,
              hw_ver: values.hw_ver,
              fw_ver: values.fw_ver,
              options: values.options,
              active_inactive_status: values.active_inactive_status,
              site_location: values.site_location,
              room_location: values.room_location,
              circuit: values.circuit,
              calibration: values.calibration,
              warranty: values.warranty,
              // Uncomment and use if needed
              // ps_gateway_id: `${values.model}-${values.serial_number}`,
            },
          })
        );
        console.log(updateAnalyzerResponse,"input fields")

        if (updateAnalyzerResponse) {
          toast.success('Updated Successfully');
          const previousPageUrl = window.localStorage.getItem('previouspageUrl');     
          if (previousPageUrl === '/dashboard/datadevicecontrol') {
            router.push('/dashboard/datadevicecontrol');
          } else if (previousPageUrl === '/dashboard/networktopology') {
            router.push('/dashboard/networktopology'); 
          }
        }
      } catch (error) {
        console.error('Error updating gateway:', error);
        toast.error('Failed to update Analyzer.');
      }
    },
  });


  const handleAnalyzerslist = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers, {
          filter:{gateway_id: {eq: gatewaydetail.gateway_id}} ,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setAnalyzerlist(response.data.listAnalyzers);
      
    } catch (err) {
      console.error(err);
    }
  }, [gatewaydetail]);

  



  const handleUnAssignGateway = async () => {
    setIsSubmitting(true)
    try {
      const updateGateway=await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: {  id: gatewaydetail.gateway_id,assigned_unassigned_status:'Unassigned', communication_status: "Archive" },
        })
      );
      setPsGatewayIdWhiteList(updateGateway?.data?.updateGateway?.ps_gateway_id)

      if(updateGateway){
        toast.success('Gateway Updated Successfully!');
        setIsSubmitting(false)
        handleClose2()
        getAnalyzer();

      }
     
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
  if(analyzerlist?.items?.length ==0){
    handleUnAssignGateway()}else{
    setIsSubmitting(false)
    handleClose2()
    setIsSubmitting(false)
    getAnalyzer();
    }
}, [analyzerlist, psGatewayIdWhiteList]);


  const handleUnAssign = useCallback(async (psGatewayId) => {
    console.log(psGatewayId,"ps gateway id")
    setIsSubmitting(true)
    try {
      // Update Gateway
     

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {  id: gatewaydetail.id,assigned_unassigned_status:'Unassigned',gateway_id:null,communication_status: "Archive" },
        })
      );
      const psAnalyzerIdWhiteList = updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id
      // const gatewayRentalItems = gatewaydetail?.analyzer_rental?.items || [];
      //   const activeRentalItem = gatewayRentalItems.find((gat) => !gat.termination_date);

      
      // // Update Customer
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          
          input: {
            id: gatewaydetail.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            gateway_id: null,
          },
        })
      );

      handleAnalyzerslist()
      // If both mutations succeed
      if(updateAnalyzerResponse && updateanalyzerrentalResponse){
        await API.del('powersightrestapi', `/IoTShadow/RemoveFromWhitelist`, { body: {
          shadowName: psGatewayId,
          deviceName: psAnalyzerIdWhiteList,
        }} );
        toast.success('Updated Successfully!');}

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');      

    }
  },[gatewaydetail, psGatewayIdWhiteList]);

  useEffect(() => {
    const currentuser = Auth.currentAuthenticatedUser();
    const logedinuserdetail =   currentuser.then(result => {

      const customerId = result.attributes['custom:customerId'];
      // setLogedinuser(customerId)
      const clientId = result.attributes['custom:clientId'];
      // setUserClient(clientId)
      // console.log(customerId,'uuu');
      const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(group)
     

      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);

    const customerEditData = ['Customer', 'CustomerMaster'].includes(logedinusergroup);

    const handleCancel = () => {
      const previousPageUrl = window.localStorage.getItem('previouspageUrl');
      if (previousPageUrl === '/dashboard/datadevicecontrol') {
        router.push('/dashboard/datadevicecontrol');
      } else if (previousPageUrl === '/dashboard/networktopology') {
        router.push('/dashboard/networktopology');
      }
    }

  return (
    <form
      onSubmit={formik.handleSubmit}
      {...other}
    >
      <Card>
        <CardHeader title="" />
        <CardContent sx={{ pt: 0 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                xs={12}
                md={6}
              >
                <CardHeader
                  title=" "
                  sx={{ padding: 0, paddingBottom: 2 }}
                />
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.fw_ver && formik.errors.fw_ver)}
                    fullWidth
                    helperText={formik.touched.fw_ver && formik.errors.fw_ver}
                    label="Firmware Rev"
                    name="fw_ver"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.fw_ver}
                    InputProps={{
                      readOnly: true,
                    }} 
                  />
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.hw_ver && formik.errors.hw_ver)}
                    fullWidth
                    helperText={formik.touched.hw_ver && formik.errors.hw_ver}
                    label="Hardware Rev"
                    name="hw_ver"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.hw_ver}
                    InputProps={{
                      readOnly: true,
                    }} 
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.options && formik.errors.options)}
                    fullWidth
                    helperText={formik.touched.options && formik.errors.options}
                    label="Options"
                    name="options"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.options}
                    InputProps={{
                      readOnly: true,
                    }} 
                  />
                </FormControl>
                  {gatewaydetail?.allocated_unallocated_status == "Allocated" ? (
                    <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    fullWidth
                    label="Status"
                    name="active_inactive_status"
                    value={formik.values.active_inactive_status}
                    disabled={customerEditData}
                  />
                </FormControl>)
                  :
                 (<FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                  >
                  <InputLabel id="status-select-label">Device Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={formik.values.active_inactive_status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.active_inactive_status && formik.errors.active_inactive_status)}
                    fullWidth
                    label="Device Status"
                    name="active_inactive_status"
                    disabled={customerEditData}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
               </FormControl>)}
               <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.site_location && formik.errors.site_location)}
                    fullWidth
                    helperText={formik.touched.site_location && formik.errors.site_location}
                    label="Site Locaton"
                    name="site_location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.site_location}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.room_location && formik.errors.room_location)}
                    fullWidth
                    helperText={formik.touched.room_location && formik.errors.room_location}
                    label="Room Location"
                    name="room_location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.room_location}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.circuit && formik.errors.circuit)}
                    fullWidth
                    helperText={formik.touched.circuit && formik.errors.circuit}
                    label="Circuit"
                    name="circuit"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.circuit}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.calibration && formik.errors.calibration)}
                    fullWidth
                    helperText={formik.touched.calibration && formik.errors.calibration}
                    label="Calibration Date"
                    name="calibration"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.calibration}
                    // InputProps={{
                    //   readOnly: true,
                    // }}                    
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  <TextField
                    error={!!(formik.touched.warranty && formik.errors.warranty)}
                    fullWidth
                    helperText={formik.touched.warranty && formik.errors.warranty}
                    label="Warranty Date"
                    name="warranty"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.warranty}
                    // InputProps={{
                    //   readOnly: true,
                    // }}
                  />
                </FormControl>
              </Grid>
              <Grid
                xs={12}
                md={6}
              >
                {(logedinusergroup != "Client" && logedinusergroup != "ClientMaster") && (
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <CardHeader
                    title="Gateway Assigned"
                    sx={{ padding: 0, paddingBottom: 1 }}
                  />
                  {gatewaydetail?.assigned_unassigned_status=="Assigned" && (
                      <Button
                      variant="outlined"
                      // onClick={() =>
                      //   router.push(`/dashboard/datadevicecontrol/assign/?id=${id}`)
                      // }
                      onClick={handleOpen2}
                    >
                      Unassign
                    </Button>
                    )}
                    {(gatewaydetail?.allocated_unallocated_status =="Allocated" && gatewaydetail?.assigned_unassigned_status == "Unassigned")
                    ||(gatewaydetail?.allocated_unallocated_status =="Allocated" && gatewaydetail?.assigned_unassigned_status == null)
                     ? (
                      <Button
                    variant="outlined"
                    onClick={() =>
                      router.push(`/dashboard/datadevicecontrol/assign/?id=${id}`)
                    }
                  >
                    Assign
                  </Button>
                    ):null}
                 
                </Box>
                )}
                <GatewayAssigned
                  count={analyzersStore.analyzersCount}
                  gatewaydetail={gatewaydetail}
                  // handleFiltersChange={analyzersSearch.handleFiltersChange}
                  // count={customersStore.customersCount}
                  // items={customersStore.customers}
                  // onDeselectAll={customersSelection.handleDeselectAll}
                  // onDeselectOne={customersSelection.handleDeselectOne}
                  // onPageChange={customersSearch.handlePageChange}
                  // onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                  // onSelectAll={customersSelection.handleSelectAll}
                  // onSelectOne={customersSelection.handleSelectOne}
                  // page={customersSearch.state.page}
                  // rowsPerPage={'10'}
                  // selected={customersSelection.selected}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        {logedinusergroup != "Client" && logedinusergroup != "ClientMaster" && (
        <>
        <Divider />
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          flexWrap="wrap"
          spacing={3}
          sx={{ p: 3 }}
        >
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            variant="contained"
          >
            Accept
          </Button>
          <Button
            color="inherit"
            // component={RouterLink}
            onClick = {() => handleCancel()}
            disabled={formik.isSubmitting}
            // href={paths.dashboard.datadevicecontrol.index}
          >
            Cancel
          </Button>
          <Button
            disabled={formik.isSubmitting}
            variant="outlined"
          >
            Restore
          </Button>
        </Stack>
        </>
        )}
      </Card>
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
              onClick={() => handleUnAssign(gatewaydetail?.gateway?.ps_gateway_id)}
              color="primary"
              sx={{ ml: 1 }}
              disabled={isSubmitting}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </form>
    
  );
};

DataDeviceEditForm.propTypes = {
  // @ts-ignore
  customer: PropTypes.object.isRequired,
};
