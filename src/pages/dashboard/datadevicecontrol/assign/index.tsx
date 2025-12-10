import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Grid, InputAdornment, OutlinedInput } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import { API, graphqlOperation } from 'aws-amplify';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { DeviceAssignListTable } from 'src/sections/dashboard/datadevice/device-assign-list-table';
import { DeviceAssignTable } from 'src/sections/dashboard/datadevice/device-assign-table';
import type { Customer } from 'src/types/customer';
import * as queries from '../../../../graphql/queries';


interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

interface CustomersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface GatewaySearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

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
const useGatewaySearch = () => {
  const [state, setState] = useState<GatewaySearchState>({
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
  gateway: Customer[];
  customersCount: number;
}

interface GatewayStoreState {
  gateway: any;
  gatewayCount: number;
}

const useGatewayStore = (searchState: GatewaySearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<GatewayStoreState>({
    gateway: [],
    gatewayCount: 0,
  });

  const handleAnalyzersGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers, { filter: searchState.filters })
      );
      if (isMounted()) {
        setState({
          gateway: response.data.listAnalyzers,
          gatewayCount: response.data.listAnalyzers.length,
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
  };
};

const useCustomersStore = (searchState: CustomersSearchState) => {
  const isMounted = useMounted();
  const [previousTokens, setPreviousTokens] = useState<any>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [nextNextToken, setNextNextToken] = useState();
  const [count, setcount] = useState<any>('');
  const router = useRouter();
  const { id } = router.query;
  const [state, setState] = useState<CustomersStoreState>({
    gateway: [],
    customersCount: 0,
  });

  // const handleGatewayGet = useCallback(async () => {
  //   try {
  //     const response = await API.graphql(
  //       graphqlOperation(queries.listGateways, {
  //         filter: searchState.filters,
  //         limit: 1000,
  //       })
  //     );

  //     setState({
  //       gateway: response.data.listGateways,
  //       customercount: response.data.listGateways.items.length,
  //     });
  //     setcount(response.data.listGateways.length);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [searchState]);

  // useEffect(() => {
  //   console.log(searchState, 'searchStatesearchState');
  //   handleGatewayGet();
  // }, [searchState]);

  const next = () => {
    setPreviousTokens((prev) => [...prev, nextToken]);
    setNextToken(nextNextToken);
    setNextNextToken(null);
  };

  const prev = () => {
    setNextToken(previousTokens.pop());
    setPreviousTokens([...previousTokens]);
    setNextNextToken(null);
  };

  return {
    ...state,
    next,
    prev,
    previousTokens,
    nextNextToken,
    nextToken,
  };
};

const useCustomersIds = (customers: Customer[] = []) => {
  return useMemo(() => {
    return [];
    // return customers.map((customer) => customer.id);
  }, []);
};

const useGatewayIds = (gateway: any = []) => {
  return useMemo(() => {
    return [];
    // return analyzers.map((analyzer) => analyzer.id);
  }, []);
};
const Page: NextPage = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);
  const { gateway, customercount, nextToken, next, nextNextToken, prev, previousTokens } =
    customersStore; // Destructure from customersStore

  const gatewaySearch = useGatewaySearch();
  const gatewayStore = useGatewayStore(gatewaySearch.state);
  const gatewayIds = useGatewayIds(gatewayStore.gateway);
  const [selecteddata, setSelecteddata] = useState('');
  const [modelValue, setModelValue] = useState('');
  const [serialValue, setSerialValue] = useState('');
  const [gatewaylist, setgatewaylist] = useState('');
  const [companyValue, setCompanyValue] = useState('');
  const [buttonsubmit, setButtonsubmit] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setModelValue(selecteddata?.model);
    setSerialValue(selecteddata?.serial_number);

    if (selecteddata?.analyzer_rental?.items?.filter((gat) => !gat.termination_date).length > 0) {
      customersSearch.handleFiltersChange({
        ps_gateway_id: {
          contains: selecteddata.analyzer_rental?.items?.filter((gat) => !gat.termination_date)[0]
            .gateway?.ps_gateway_id,
        },
      });
      setCompanyValue(
        selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].gateway?.ps_gateway_id,
      );
    } else {
      setCompanyValue('');
      customersSearch.handleFiltersChange({
        ps_gateway_id: {
          contains: '',
        },
      });
    }
  }, [selecteddata]);

  const getanalyzer = useCallback(async () => {
    if (id) {
      try {
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: id,
          })
        );
        console.log(assets, '66clearassetttttttttttttttttttttttttttttt');

        setModelValue(assets.data.getAnalyzer?.model);
        setSerialValue(assets.data.getAnalyzer?.serial_number);
        if (assets.data?.analyzer_rental?.items.filter((gat) => !gat.termination_date).length > 0) {
          customersSearch.handleFiltersChange({
            ps_gateway_id: {
              contains: assets.data.analyzer_rental.items.filter((gat) => !gat.termination_date)[0]
                .gateway?.ps_gateway_id,
            },
          });
          setCompanyValue(
            assets.data.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].gateway
              ?.ps_gateway_id
          );
        } else {
          // setCompanyValue('');
          // customersSearch.handleFiltersChange({
          //   name: {
          //     contains: '',
          //   },
          // });
        }
        // setCompanyValue(assets.data.getGateway?.gateway_rental?.items?.customer?.name);
        // customersSearch.handleFiltersChange({
        //   name: { contains: assets.data.getGateway?.gateway_rental?.items?.customer?.name },
        // });

        gatewaySearch.handleFiltersChange({
          model: { contains: assets.data.getAnalyzer?.model },
        });
        gatewaySearch.handleFiltersChange({
          serial_number: { contains: assets.data.getAnalyzer?.serial_number },
        });
        gatewaySearch.handleFiltersChange({
          customer: { contains: assets.data.getAnalyzer?.analyzer_rental?.items?.customer?.name },
        });
        setSelecteddata(assets.data.getAnalyzer);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

  const handleGatewaylist = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listGateways, {
          filter:{
          // {customer_id: {eq: selecteddata.customer_id} ,
          ...(selecteddata 
            ? { customer_id: { eq: selecteddata.customer_id } } 
            : { customer_id: { eq: null } }
          ), 
          ...(selecteddata.data?.analyzer_rental?.items.filter((gat) => !gat.termination_date).length > 0 ? { id: { eq:selecteddata.gateway_id } } : {}),
          ...(companyValue ? {ps_gateway_id:{contains:companyValue}}:{})
        
        },
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setgatewaylist(response.data.listGateways);
    } catch (err) {
      console.error(err);
    }
  }, [selecteddata,companyValue]);

  useEffect(() => {
      handleGatewaylist()
  }, [selecteddata,companyValue]);

  const goBack = () => {
    setSelecteddata(null);
    router.back();
  };

  useEffect(() => {
    getanalyzer();
  }, [id]);

  useEffect(() => {
    if (!selecteddata) {
      setModelValue('');
      setSerialValue('');
      setCompanyValue('');
    }
  }, [selecteddata]);
  const handleClearInput = () => {
    setModelValue('');
    setSerialValue('');
    setCompanyValue('');
    setSelecteddata('');
    setButtonsubmit(false);
    gatewaySearch.handleFiltersChange({
      model: { contains: '' }, // Clear the filter
      serial_number: { contains: '' },
      customer: { contains: '' },
    });
  };
  usePageView();

  return (
    <>
      <Seo title="Dashboard: Analyzer List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1}>
            <Stack spacing={1}>
              <div>
                <Link
                  color="text.primary"
                  onClick={goBack}
                  sx={{
                    alignItems: 'center',
                    display: 'inline-flex',
                  }}
                  underline="hover"
                >
                  <SvgIcon sx={{ mr: 1 }}>
                    <ArrowLeftIcon />
                  </SvgIcon>
                  <Typography variant="subtitle2">Back</Typography>
                </Link>
              </div>
              <Stack
                alignItems="flex-start"
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                justifyContent="space-between"
                spacing={4}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Stack spacing={1}>
                    <Typography variant="h4">Analyzer Assignation</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Grid
              container
              spacing={3}
              sx={{ marginTop: 2 }}
            >
              {/* <Grid
                item
                xs={12}
                md={6}
              >
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    xs={12}
                    md={10}
                  >
                    <Typography
                      gutterBottom
                      variant="subtitle2"
                    >
                      Allocated To Customer
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Jones Futura
                    </Typography>
                  </Grid>

                  <Grid
                    xs={12}
                    md={2}
                  >
                    <Button
                      type="submit"
                      variant="outlined"
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Grid> */}
            </Grid>
          </Stack>

          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              md={7}
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
                        xs={6}
                      >
                        <OutlinedInput
                          value={modelValue}
                          fullWidth
                          // onChange={(e) => {
                          //   const { value } = e.target;
                          //   setModelValue(value);
                          //   gatewaySearch.handleFiltersChange({
                          //     model: { contains: value },
                          //   });
                          // }}
                          placeholder="Model"
                          // endAdornment={
                          //   modelValue && ( // Show clear icon only when there's input value
                          //     <InputAdornment position="end">
                          //       <IconButton
                          //         onClick={handleClearInput}
                          //         edge="end"
                          //       >
                          //         <ClearIcon />
                          //       </IconButton>
                          //     </InputAdornment>
                          //   )
                          // }
                        />

                        {/* <OutlinedInput
                          defaultValue={selecteddata?.model}
                          fullWidth
                          onChange={(e) => {
                            gatewaySearch.handleFiltersChange({
                              model: { contains: e.target.value },
                            });
                          }}
                          placeholder="Model"
                        /> */}
                      </Grid>
                      <Grid
                        item
                        xs={6}
                      >
                        <OutlinedInput
                          value={serialValue}
                          fullWidth
                          // onChange={(e) => {
                          //   const { value } = e.target;
                          //   setSerialValue(value);
                          //   gatewaySearch.handleFiltersChange({
                          //     serial_number: { contains: value },
                          //   });
                          // }}
                          placeholder="Serial"
                          // endAdornment={
                          //   modelValue && ( // Show clear icon only when there's input value
                          //     <InputAdornment position="end">
                          //       <IconButton
                          //         onClick={handleClearInput}
                          //         edge="end"
                          //       >
                          //         <ClearIcon />
                          //       </IconButton>
                          //     </InputAdornment>
                          //   )
                          // }
                        />
                      </Grid>
                  
                    </Grid>
                  </Stack>
                  <DeviceAssignListTable
                    count={gatewayStore.gatewayCount}
                    items={gatewayStore.gateway}
                    setSelecteddata={setSelecteddata}
                    selecteddata={selecteddata}
                  />
                </Card>
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={5}
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
                        <OutlinedInput
                          fullWidth
                          value={companyValue}
                          onChange={(e) => {
                            setCompanyValue(e.target.value)
                            // customersSearch.handleFiltersChange({
                            //   ps_gateway_id: { contains: e.target.value },
                            // });
                          }}
                          placeholder="Search By Gateway"
                          startAdornment={
                            <InputAdornment position="start">
                              <SvgIcon>
                                <SearchMdIcon />
                              </SvgIcon>
                            </InputAdornment>
                          }
                          // endAdornment={
                          //   modelValue && ( // Show clear icon only when there's input value
                          //     <InputAdornment position="end">
                          //       <IconButton
                          //         onClick={(e) => {
                          //           customersSearch.handleFiltersChange({
                          //             customer: { contains: '' },
                          //           });
                          //            // Clear the input value manually
                          //         }}
                          //         edge="end"
                          //       >
                          //         <ClearIcon />
                          //       </IconButton>
                          //     </InputAdornment>
                          //   )
                          // }
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                  <DeviceAssignTable
                    count={customersStore.customersCount}
                    items={gatewaylist}
                    companyValue={companyValue}
                    selecteddata={selecteddata}
                    setSelecteddata={setSelecteddata}
                    setButtonsubmit={setButtonsubmit}
                    buttonsubmit={buttonsubmit}
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
                 
                  <Stack
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
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
