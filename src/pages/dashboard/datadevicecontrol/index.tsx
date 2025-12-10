import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Flipbackward from '@untitled-ui/icons-react/build/esm/Flipbackward';
import { API, graphqlOperation,Auth } from 'aws-amplify';
import moment from 'moment';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { AnalyzerAllocationTablecustomer } from 'src/sections/dashboard/datadevice/datadevice-allocation-tablecustomer';
import { DeviceAssignGatewayTable } from 'src/sections/dashboard/datadevice/datadevice-assign-gatewaytable';
import { ClientListTable } from 'src/sections/dashboard/datadevice/datadevice-list-table';
import type { Analyzer } from 'src/types/analyzer';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';
import { SignalCellularNullRounded } from '@mui/icons-material';

interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
  model?: string;
  serial_number?: boolean;
  customer?: boolean;
}

interface AnalyzersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  input: Filters;
}

const useDataDeviceSearch = () => {
  const [state, setState] = useState<AnalyzersSearchState>({
    filters: {
      // query: undefined,
      // hasAcceptedMarketing: undefined,
      // isProspect: undefined,
      // isReturning: undefined,
      model: undefined,
      serial_number: undefined,
      // customer: undefined,
    },
    input: {
      model: undefined,
      serial_number: undefined,
      // customer: undefined,
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'updatedAt',
    sortDir: 'desc',
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const handleClearInputs = useCallback(() => {
    setState({
      filters: {},
      input: {
        model: null,
        serial_number: null,
        isReturning: undefined,
      },
      page: 0,
      rowsPerPage: 5,
      sortBy: 'updatedAt',
      sortDir: 'desc',
    });
    // Increment the refreshKey to force re-render
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters: { ...prevState.filters, ...filters },
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

  const handleInputChange = useCallback((input: Filters): void => {
    //console.log(filters, 'filters');
    setState((prevState) => ({
      ...prevState,
      input: { ...prevState.input, ...input },
    }));
  }, []);

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
    handleClearInputs,
    refreshKey,
    setRefreshKey,
    handlePageChange,
    handleRowsPerPageChange,
    handleInputChange,
    state,
  };
};

interface AnalyzersStoreState {
  analyzers: Analyzer[];
  analyzersCount: number;
}

const useAnalyzersStore = (searchState: AnalyzersSearchState) => {
  const isMounted = useMounted();
  const [analyzerreload, setanalyzerreload] = useState(0);
  

  const [state, setState] = useState<AnalyzersStoreState>({
    analyzers: [],
    analyzersCount: 0,
  });

  
  const handleDeviceCreate = useCallback(async (data) => {
    console.log(data,'66666')
    if(data.model && data.serial_number){
    const response = await API.graphql(
      graphqlOperation(mutations.createAnalyzer, {
        input: {
          ...data,
          ps_analyzer_id: `${data.model}-${data.serial_number}`,
          active_inactive_status: 'Active',
          assigned_unassigned_status: "Unassigned",
          allocated_unallocated_status: "Unallocated",
          communication_status: "Not_Detected",
        },
      })
    );

    if (response.data.createAnalyzer) {
      await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
        shadowName: `${data.model}-${data.serial_number}`,
      }} );
      handleAnalyzersGet();
    }

  }
  }, []);

  const handleAnalyzersGet = useCallback(async () => {
    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId = currentuser.attributes['custom:clientId']

      let filters = searchState.filters
      if(clientId) {
        filters = { ...filters, client_id: { eq: clientId}}
      }

      else if(customerId){
        filters ={ ...filters, customer_id: { eq: customerId }}
      }
      
      const variables = {
        filter: filters
      };

      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers,variables)
      );
      if (isMounted()) {
        setanalyzerreload(0);
        const sortedOptions = response.data.listAnalyzers.items.slice().sort((a, b) => {
          return a?.ps_analyzer_id?.localeCompare(b?.ps_analyzer_id);
        });
        setState({
          analyzers:sortedOptions,
          analyzersCount: sortedOptions.length,
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
    [searchState, analyzerreload]
  );

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleAnalyzersGet();
  //   }, 500); // Debounce time (adjust as needed)
  //   return () => clearTimeout(timer);
  // }, [searchState, handleAnalyzersGet]);

  return {
    ...state,
    handleDeviceCreate,
    setanalyzerreload,
    handleAnalyzersGet,
  };
};

const useAnalyzersIds = (analyzers: Analyzer[] = []) => {
  return useMemo(() => {
    return [];
    // return analyzers?.map((analyzer) => analyzer.id);
  }, []);
};

const Page: NextPage = () => {
  const analyzersSearch = useDataDeviceSearch();
  const analyzersStore = useAnalyzersStore(analyzersSearch.state);
  const { setanalyzerreload, handleAnalyzersGet } = analyzersStore;
  const analyzersIds = useAnalyzersIds(analyzersStore.analyzers);
  const analyzersSelection = useSelection<string>(analyzersIds);
  const router = useRouter();
  const [searchStateanalyzer, setsearchStateanalyzer] = useState(null);
  const [analyzerdata, setAnalyzerdata] = useState('');
  const [countanalyzer, setcountanalyzer] = useState('');
  const [size, setsize] = useState(false);
  const [side, setside] = useState(false);
  const [selecteddata, setSelecteddata] = useState('');
  console.log(selecteddata,"selected data")
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);
  const [analyzerid, setanalyzerid] = useState('');
  const [buttonsubmit, setButtonsubmit] = useState(false);
  const [buttonsubmit1, setButtonsubmit1] = useState(false);
  const [gatewaylist, setGatewaylist] = useState('');
  const [analyzerlist, setAnalyzerlist] = useState('');
  console.log(analyzerlist,'pppppppp')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyValue, setCompanyValue] = useState('');
  const [assigncheck, setassigncheck] = useState(false);
  const [logedinuser, setLogedinuser] = useState('');
  console.log(logedinuser,'ii')
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  console.log(logedinusergroup,'user group')
  const [datadevicedata, setdatadevicedata] = useState();
  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);
  const [psGatewayIdWhiteList, setPsGatewayIdWhiteList] = useState('');

  const handleCustomersGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listCustomers, {
          filter: searchStateanalyzer,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setAnalyzerdata(response.data.listCustomers);

      setcountanalyzer(response.data.listCustomers.items.length);
    } catch (err) {
      console.error(err);
    }
  }, [searchStateanalyzer]);

  const handleGatewaylist = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listGateways, {
          filter:{customer_id: {eq: selecteddata.customer_id}} ,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setGatewaylist(response.data.listGateways);
    } catch (err) {
      console.error(err);
    }
  }, [selecteddata]);

  const clear = useCallback(async () => {
    await analyzersSearch.handleClearInputs();
    handleCustomersGet();
    // Increment the refreshKey to force re-render
    analyzersSearch.setRefreshKey((prevKey) => prevKey + 1);
  }, [analyzersSearch, searchStateanalyzer]);

  useEffect(() => {
    handleCustomersGet();
  }, [searchStateanalyzer]);

  useEffect(() => {
    handleCustomersGet();
  }, []);

  const handleDeviceCreate = useCallback(async () => {
    try {
      //   const variables = {
      //     nextToken,
      //     limit,
      // filter: {email: {eq: auth.user.email}}
      //   }
      analyzersStore.handleDeviceCreate(analyzersSearch.state.input);
      clear();
    } catch (err) {
      console.error(err);
    }
  }, [analyzersSearch.state.filters]);

  useEffect(() => {
    handleAnalyzersGet();
    setButtonsubmit(false);
  }, [size]);

  useEffect(() => {
    if(side==true){
    handleGatewaylist();
    setButtonsubmit1(false);
  }
  }, [side]);


  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const customerId = result.attributes['custom:customerId'];
      setLogedinuser(customerId)
      console.log(customerId,'uuu');
      const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
        setLogedinusergroup(group)
      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);

  useEffect( () => {
    if(logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer"){
      analyzersSearch.handleFiltersChange({
        customer_id: { contains: logedinuser },
      });
    }
  },[logedinuser,logedinusergroup])

  const updateunallocation = useCallback(async () => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {
            customer_id: null,
            id: selecteddata?.id,
            allocated_unallocated_status: 'Unallocated',
            client_id: null,
            communication_status: "Not_Detected",
          },
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
            client_id: null,
            customer_id: null
          },
          
        })
      );
      console.log(updateanalyzerrentalResponse,"updateanalyzerrentalResponse")
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        setOpen1(false);
        toast.success('Updated Successfully!');
        setanalyzerreload('0');
      }
    } catch (error) {
      console.error(error);
      setOpen1(false);
      toast.error('Something went wrong!');
    }
  },[selecteddata]);

  const handleAnalyzerslist = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers, {
          filter:{gateway_id: {eq: selecteddata.gateway_id}} ,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setAnalyzerlist(response.data.listAnalyzers);
      
    } catch (err) {
      console.error(err);
    }
  }, [selecteddata]);

  



  const handleUnAssignGateway = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const updateGateway=await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: {  id: selecteddata.gateway_id,assigned_unassigned_status:'Unassigned', communication_status: "Archive" },
        })
      );
      setPsGatewayIdWhiteList(updateGateway.data.updateGateway.ps_gateway_id)

      if(updateGateway){
        setSelecteddata('');
        setanalyzerreload('0');
        setOpen2(false);
        toast.success('Gateway Updated Successfully!');
        setIsSubmitting(false)
      }
     
    } catch (error) {
      console.error(error);
    }
  },[selecteddata, psGatewayIdWhiteList]);
  
  useEffect(() => {
    if(analyzerlist?.items?.length ==0){
      handleUnAssignGateway()}else{
      setSelecteddata('');
      setanalyzerreload('0'); 
      setOpen2(false);
      setIsSubmitting(false)
    }
  }, [analyzerlist, psGatewayIdWhiteList]);


  const handleUnAssign = useCallback(async (id: any, psGatewayIdWhiteList: string) => {
    setIsSubmitting(true)
    try {
      // Update Gateway
     

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {  id: selecteddata.id,assigned_unassigned_status:'Unassigned',gateway_id:null , communication_status: "Archive"},
        })
      );
      const psAnalyzerIdWhiteList = updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id
      // const gatewayRentalItems = gatewaydetail?.analyzer_rental?.items || [];
      //   const activeRentalItem = gatewayRentalItems.find((gat) => !gat.termination_date);

      
      // // Update Customer
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          
          input: {
            id: selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            gateway_id: null,
          },
        })
      );

      handleAnalyzerslist()
      // If both mutations succeed
      if(updateAnalyzerResponse && updateanalyzerrentalResponse){
        await API.del('powersightrestapi', `/IoTShadow/RemoveFromWhitelist`, { body: {
          shadowName: psGatewayIdWhiteList,
          deviceName: psAnalyzerIdWhiteList,
        }} );
        toast.success('Updated Successfully!');}

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
      setIsSubmitting(false)
    }
  },[selecteddata, psGatewayIdWhiteList]);

  usePageView();

  return (
    <>
      <Seo title="Dashboard: analyzer List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 0,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Data Device Control</Typography>
              </Stack>
            </Stack>
            <Card>
              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  md={size || side ? 8 : 12}
                >
                  <ClientListTable
                    key={analyzersSearch.refreshKey}
                    count={analyzersStore.analyzersCount}
                    items={analyzersStore.analyzers}
                    entered={analyzersSearch.state.input}
                    setsize={setsize}
                    setside={setside}
                    handleFiltersChange={analyzersSearch.handleFiltersChange}
                    setanalyzerreload={setanalyzerreload}
                    setanalyzerid={setanalyzerid}
                    setSelecteddata={setSelecteddata}
                    handleClose1={handleClose1}
                    handleOpen1={handleOpen1}
                    open1={open1}
                    updateunallocation={updateunallocation}
                    // handleUnAssign={handleUnAssign}
                    handleUnAssign={(id) => handleUnAssign(id, selecteddata?.gateway?.ps_gateway_id)}
                    isSubmitting={isSubmitting}
                    handleOpen2={handleOpen2}
                    handleClose2={handleClose2}
                    open2={open2}
                    // count={analyzersStore.analyzersCount}
                    // items={datadevicedata}
                    // handleFiltersChange={customersSearch.handleFiltersChange}
                    // onDeselectAll={analyzersSelection.handleDeselectAll}
                    // onDeselectOne={analyzersSelection.handleDeselectOne}
                    // onPageChange={analyzersSearch.handlePageChange}
                    // onRowsPerPageChange={analyzersSearch.handleRowsPerPageChange}
                    // onSelectAll={analyzersSelection.handleSelectAll}
                    // onSelectOne={analyzersSelection.handleSelectOne}
                    // page={analyzersSearch.state.page}
                    // rowsPerPage={analyzersSearch.state.rowsPerPage}
                    // selected={analyzersSelection.selected}
                    handleInputChange={analyzersSearch.handleInputChange}
                    handleDeviceCreate={handleDeviceCreate}
                    logedinusergroup={logedinusergroup}
                  />
                </Grid>
                {size && (
                  <Grid
                    item
                    xs={12}
                    md={4}
                  >
                    <Stack spacing={4}>
                      <Card>
                        <Stack
                          alignItems="center"
                          direction="row"
                          flexWrap="wrap"
                          spacing={3}
                          sx={{ p: 3 }}
                        >
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              item
                              xs={12}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Flipbackward
                                  onClick={() => {
                                    setsize(false);
                                    clear();
                                    analyzersSearch.handleFiltersChange({});
                                  }}
                                />
                              </Stack>
                            </Grid>
                          </Grid>
                        </Stack>
                        <AnalyzerAllocationTablecustomer
                          count={''}
                          items={analyzerdata}
                          setsize={setsize}
                          clear={clear}
                          analyzerid={analyzerid}
                          companyValue={companyValue}
                          selecteddata={selecteddata}
                          setSelecteddata={setSelecteddata}
                          setButtonsubmit={setButtonsubmit}
                          buttonsubmit={buttonsubmit}
                          handleFiltersChange={analyzersSearch.handleFiltersChange}
                        />
                      </Card>
                    </Stack>
                  </Grid>
                )}
                {side && (
                  <Grid
                    item
                    xs={12}
                    md={4}
                  >
                    <Stack spacing={4}>
                      <Card>
                        <Stack
                          alignItems="center"
                          direction="row"
                          flexWrap="wrap"
                          spacing={3}
                          sx={{ p: 3 }}
                        >
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              item
                              xs={12}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Flipbackward
                                  onClick={() => {
                                    setside(false);
                                    clear();
                                    analyzersSearch.handleFiltersChange({});
                                  }}
                                />
                              </Stack>
                            </Grid>
                          </Grid>
                        </Stack>
                        <DeviceAssignGatewayTable
                          count={''}
                          items={gatewaylist}
                          setside={setside}
                          clear={clear}
                          companyValue={companyValue}
                          selecteddata={selecteddata}
                          setSelecteddata={setSelecteddata}
                          setButtonsubmit1={setButtonsubmit1}
                          buttonsubmit1={buttonsubmit1}
                          handleFiltersChange={analyzersSearch.handleFiltersChange}
                        />
                      </Card>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
