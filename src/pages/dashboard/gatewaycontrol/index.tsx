import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Flipbackward from '@untitled-ui/icons-react/build/esm/Flipbackward'; // Ensure the correct import path

import { Grid } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { API, Auth, graphqlOperation } from 'aws-amplify';
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
import { GatewayAllocationTablecustomer } from 'src/sections/dashboard/gateway/gateway-allocation-tablecustomer';
import { GatewayTable } from 'src/sections/dashboard/gateway/gateway-control-table';
import type { Customer } from 'src/types/customer';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface Filters {
  model?: string;
  serial_number?: boolean;
  customer?: boolean;
  isReturning?: boolean;
}

interface CustomersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  input: Filters;
}

const useCustomersSearch = () => {
  const [state, setState] = useState<CustomersSearchState>({
    filters: {
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

  const handleFiltersChange = useCallback((filters: Filters): void => {
    //console.log(filters, 'filters');
    setState((prevState) => ({
      ...prevState,
      filters: { ...prevState.filters, ...filters },
    }));
  }, []);

  const handleInputChange = useCallback((input: Filters): void => {
    //console.log(filters, 'filters');
    setState((prevState) => ({
      ...prevState,
      input: { ...prevState.input, ...input },
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
    handleInputChange,
    handleClearInputs,
    refreshKey,
    setRefreshKey,
    state,
  };
};

interface CustomersStoreState {
  customers: Customer[];
  customersCount: number;
}

const useCustomersStore = (searchState: CustomersSearchState) => {
  const isMounted = useMounted();
  const [gatewayreload, setgatewayreload] = useState(0);
  
  
    

  const [state, setState] = useState<CustomersStoreState>({
    customers: [],
    customersCount: 0,
  });

  const handleGatewayCreate = useCallback(async (data: any) => {
    console.log(data,'66666')
    if(data.model && data.serial_number){
    const response = await API.graphql(
      graphqlOperation(mutations.createGateway, {
        input: { ...data, active_inactive_status: 'Active',
        assigned_unassigned_status: "Unassigned",
        allocated_unallocated_status: "Unallocated",
        communication_status: "Not_Detected",
        ps_gateway_id: `${data.model}-${data.serial_number}` },
      })
    );
    if (response?.data.createGateway) {
      await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
        shadowName: `${data.model}-${data.serial_number}`,
      }} );
      handleCustomersGet();
    }
  }
  }, []);

  const handleCustomersGet = useCallback(async () => {
    try {
     
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];
      console.log(clientId,"client id current user")

      let filters = searchState.filters

      if(clientId){
        filters ={ ...filters, client_id: { eq: clientId }}
      }
      else if(customerId){
        filters ={ ...filters, customer_id: { eq: customerId }}
      }

       const variables = {
        filter: filters
      };

      const response = await API.graphql(
        graphqlOperation(queries.listGateways,variables)
      );
      console.log(response)
      if (isMounted()) {
        setgatewayreload(0);
        const sortedOptions = response.data.listGateways.items.slice().sort((a, b) => {
          return a?.ps_gateway_id?.localeCompare(b?.ps_gateway_id);
        });
        setState({
          customers: sortedOptions,
          customersCount: sortedOptions.length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleCustomersGet();
      ( async () => {
        let listShadow = await API.get('powersightrestapi', `/IoTShadow/listNamedShadows` );
        console.log( listShadow,' listShadow ')
      })()
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState, gatewayreload]
  );

  return {
    ...state,
    handleGatewayCreate,
    setgatewayreload,
    handleCustomersGet,
  };
};

const useCustomersIds = (customers: Customer[] = []) => {
  return useMemo(() => {
    return [];
    //customers.map((customer) => customer.id);
  }, []);
};

const Page: NextPage = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);
  const [companyValue, setCompanyValue] = useState('');
  useEffect(() => {
    console.log(customersStore, 'l999999999999999999999999999999');
  }, [customersStore]);
  const { setgatewayreload, handleCustomersGet } = customersStore;
  const router = useRouter();
  const { s_id, m_id } = router.query;
  const [buttonsubmit, setButtonsubmit] = useState(false);

  const [selecteddata, setSelecteddata] = useState('');
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);
  const [countcustomer, setcountcustomer] = useState('');
  const [searchStatecustomer, setsearchStatecustomer] = useState(null);
  const [customerdata, setCustomerdata] = useState('');
  const [size, setsize] = useState(false);
  const [gatewayid, setgatewayid] = useState('');
  const [keyreflect, setkeyreflect] = useState('');
  const [logedinuser, setLogedinuser] = useState('');
  console.log(logedinuser,'ii')
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  console.log(logedinusergroup,'p')


  const handleCustomerGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listCustomers, {
          filter: searchStatecustomer,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setCustomerdata(response.data.listCustomers);

      setcountcustomer(response.data.listCustomers.items.length);
    } catch (err) {
      console.error(err);
    }
  }, [searchStatecustomer]);

  const clear = useCallback(async () => {
    await customersSearch.handleClearInputs();
    handleCustomerGet();
    // Increment the refreshKey to force re-render
    customersSearch.setRefreshKey((prevKey) => prevKey + 1);
  }, [customersSearch, searchStatecustomer]);

  useEffect(() => {
    console.log(searchStatecustomer, 'searchStatesearchState');
    handleCustomerGet();
  }, [searchStatecustomer]);

  useEffect(() => {
    handleCustomerGet();
  }, []);

  useEffect(() => {
    handleCustomersGet();
    setButtonsubmit(false);
  }, [size]);

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const customerId = result.attributes['custom:customerId'];
      setLogedinuser(customerId)
      console.log(customerId,'uuu');
      const customergroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
        setLogedinusergroup(customergroup)
      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);

  useEffect( () => {
    if(logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer"){
      customersSearch.handleFiltersChange({
        customer_id: { contains: logedinuser },
      });
    }
  },[logedinuser,logedinusergroup])
 

  // useEffect(() => {
  //   customersSearch.handleClearInputs();
  //   handleCustomerGet();

  //   customersSearch.setRefreshKey((prevKey) => prevKey + 1);
  // }, [keyreflect]);

  const updateunallocation = async () => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: { customer_id: null, id: selecteddata?.id,allocated_unallocated_status:"Unallocated", client_id: null, communication_status: "Not_Detected" },
        })
      );

      // const updateCustomer = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { customer_id: id, gateway_id: null },
      //   })
      // );
      const updategatewayrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateGatewayRental, {
          input: {
            id: selecteddata.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            customer_id: null,
            client_id: null
          },
        })
      );
      if (updateGatewayResponse && updategatewayrentalResponse) {
        setOpen1(false);
        setgatewayreload('0');
      }
    } catch (error) {
      console.error(error);
      setOpen1(false);
      toast.error('Something went wrong!');
    }
  };

  const handleGatewayCreate = useCallback(async () => {
    try {
      //   const variables = {
      //     nextToken,
      //     limit,
      // filter: {email: {eq: auth.user.email}}
      //   }
      customersStore.handleGatewayCreate(customersSearch.state.input);
      clear()
    } catch (err) {
      console.error(err);
    }
  }, [customersSearch.state.filters]);

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Customer List" />
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
              spacing={0}
            >
              <Stack spacing={1}>
                <Typography variant="h4"> Gateway Control</Typography>
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
                  md={size ? 8 : 12}
                >
                  <GatewayTable
                    key={customersSearch.refreshKey}
                    count={customersStore.customersCount}
                    items={customersStore.customers}
                    setsize={setsize}
                    setgatewayid={setgatewayid}                    
                    entered={customersSearch.state.input}
                    setSelecteddata={setSelecteddata}
                    updateunallocation={updateunallocation}
                    handleClose1={handleClose1}
                    handleOpen1={handleOpen1}
                    open1={open1}
                    handleFiltersChange={customersSearch.handleFiltersChange}
                    handleInputChange={customersSearch.handleInputChange}
                    handleGatewayCreate={handleGatewayCreate}
                    s_id={s_id}
                    m_id={m_id}
                    setgatewayreload={setgatewayreload}
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
                                    customersSearch.handleFiltersChange({});
                                  }}
                                />
                              </Stack>

                              {/* <OutlinedInput
                              fullWidth
                              value={searchStatecustomer ? }
                              onChange={(e) => {
                                setsearchStatecustomer({
                                  ...searchStatecustomer,
                                  input: e.target.value,
                                });
                              }}
                              placeholder="Search By Customer"
                              startAdornment={
                                <InputAdornment position="start">
                                  <SvgIcon>
                                    <SearchMdIcon />
                                  </SvgIcon>
                                </InputAdornment>
                              }

                            /> */}
                            </Grid>
                          </Grid>
                        </Stack>
                        <GatewayAllocationTablecustomer
                          // key={customersSearch.refreshKey}
                          // setkeyreflect={setkeyreflect}
                          count={''}
                          items={customerdata}
                          setsize={setsize}
                          clear={clear}
                          gatewayid={gatewayid}
                          companyValue={companyValue}
                          selecteddata={selecteddata}
                          setSelecteddata={setSelecteddata}
                          setButtonsubmit={setButtonsubmit}
                          buttonsubmit={buttonsubmit}
                          handleFiltersChange={customersSearch.handleFiltersChange}
                          // onDeselectAll={customersSelection.handleDeselectAll}
                          // onDeselectOne={customersSelection.handleDeselectOne}
                          // onPageChange={customersSearch.handlePageChange}
                          // onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                          // onSelectAll={customersSelection.handleSelectAll}
                          // onSelectOne={customersSelection.handleSelectOne}
                          // page={customersSearch.state.page}
                          // rowsPerPage={customersSearch.state.rowsPerPage}
                          // selected={customersSelection.selected}
                        />
                        {/* <Stack
                        direction="row"
                        justifyContent="flex-end"
                      >
                        {previousTokens?.length != 0 && (
                          <Button
                            style={{
                              marginBottom: 10,
                              marginRight: 16,
                              marginLeft: 10,
                              marginTop: 5,
                            }}
                            color="secondary"
                            variant="outlined"
                            size="small"
                            onClick={prev}
                          >
                            <KeyboardArrowLeftIcon
                              className="text_24_bt_r"
                              fontSize="medium"
                            />
                            Prev
                          </Button>
                        )}

                        {nextNextToken && (
                          <Button
                            style={{
                              marginBottom: 10,
                              marginRight: 16,

                              marginTop: 5,
                            }}
                            color="secondary"
                            variant="outlined"
                            size="small"
                            onClick={next}
                          >
                            <KeyboardArrowRightIcon
                              className="text_24_bt_l"
                              fontSize="medium"
                            />
                            Next
                          </Button>
                        )}
                      </Stack> */}
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
