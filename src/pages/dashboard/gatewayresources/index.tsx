import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import type { NextPage } from 'next';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { ClientListTable } from 'src/sections/dashboard/gateway/gateway-resource-table';
import type { Customer } from 'src/types/customer';
import * as queries from '../../../graphql/queries';


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
  // data: Customer[];
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

const useCustomersStore = (searchState: CustomersSearchState) => {
  const isMounted = useMounted();
  const [gatewayreload, setgatewayreload] = useState(0);
  const [state, setState] = useState<CustomersStoreState>({
    customers: [],
    customersCount: 0,
    // data: [],
  });
  const [gatewayRentalsData, setGatewayRentalsData] = useState([]);
  const [previousTokens, setPreviousTokens] = useState([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [nextNextToken, setNextNextToken] = useState();
  const handleClientrGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listClients, {
          filter: searchState.filters,
          limit: 10,
          nextToken: nextToken ? nextToken : null,
        })
      );
      if (isMounted()) {
        setState({
          clients: response.data.listClients,
          clientcount: response.data.listClients.length,
        });
        setNextNextToken(response.data.listClients.nextToken);
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted, nextToken]);

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

  // useEffect(
  //   () => {
  //     handleCustomersGet();
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [searchState]
  // );

  const handleCustomersGet = useCallback(async () => {
    try {
     
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      let filters = searchState.filters
      if(customerId){
        filters ={ ...filters, customer_id: { eq: customerId }}
      }

       const variables = {
        filter: filters
      };

      const response = await API.graphql(
        graphqlOperation(queries.listGateways,variables)
      );
      console.log(response,"response")

      if (isMounted()) {
        setgatewayreload(0);
        const sortedOptions = response.data.listGateways.items.slice().sort((a, b) => {
          return a?.ps_gateway_id?.localeCompare(b?.ps_gateway_id);
        });
        setState({
          customers: sortedOptions,
          customersCount: sortedOptions.length,
          // data: sortedOptions,
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
    [searchState, gatewayreload]
  );

  const handleGatewayRentalsGet = useCallback(async () => {
    try {
     
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId = currentuser.attributes['custom:clientId'];

      let filters = searchState.filters
      if(customerId){
        filters ={ ...filters, customer_id: { eq: customerId }}
      }

      if(clientId){
        filters ={ ...filters, client_id: { eq: clientId }}
      }

       const variables = {
        filter: filters
      };

      const response = await API.graphql(
        graphqlOperation(queries.listGatewayRentals,variables)
      );
      console.log(response,"gateway rental response")
      if (isMounted()) {
        setgatewayreload(0);
        const sortedOptions = response.data.listGatewayRentals.items.slice().sort((a, b) => {
          return a?.ps_gateway_id?.localeCompare(b?.ps_gateway_id);
        });
        setGatewayRentalsData(sortedOptions);
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleGatewayRentalsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState,  gatewayreload]
  );

  return {
    ...state,
    previousTokens,
    nextToken,
    nextNextToken,
    gatewayRentalsData,
  };
};

const useCustomersIds = (customers: Customer[] = []) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, []);
};

const Page: NextPage = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Customer List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h5">Network Gateways</Typography>
              </Stack>
              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                {/* <Button
                  component={RouterLink}
                  href={paths.dashboard.gatewaycontrol.create}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Add Gateway
                </Button> */}
                {/* <Button
                  component={RouterLink}
                  href={paths.dashboard.gatewaycontrol.create}
                  startIcon={
                    <SvgIcon>
                      <EyeIcon />
                    </SvgIcon>
                  }
                  variant="outlined"
                >
                  See Topology
                </Button> */}
              </Stack>
            </Stack>
            <Card>
              <ClientListTable
                count={customersStore.customersCount}
                items={customersStore.customers}
                gatewayRentalsData={customersStore.gatewayRentalsData}
                onDeselectAll={customersSelection.handleDeselectAll}
                onDeselectOne={customersSelection.handleDeselectOne}
                onPageChange={customersSearch.handlePageChange}
                onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                onSelectAll={customersSelection.handleSelectAll}
                onSelectOne={customersSelection.handleSelectOne}
                page={customersSearch.state.page}
                rowsPerPage={customersSearch.state.rowsPerPage}
                selected={customersSelection.selected}
              />
            </Card>
            <Stack
              direction="row"
              justifyContent="flex-end"
            >
              {/* {previousTokens?.length != 0 && (
                <Button
                  style={{ backgroundColor: 'blue', color: 'white', marginBottom: 10 }}
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
                    backgroundColor: 'blue',
                    color: 'white',
                    marginBottom: 10,
                    marginRight: 16,
                    marginLeft: 10,
                  }}
                  onClick={next}
                >
                  <KeyboardArrowRightIcon
                    className="text_24_bt_l"
                    fontSize="medium"
                  />
                  Next
                </Button>
              )} */}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
