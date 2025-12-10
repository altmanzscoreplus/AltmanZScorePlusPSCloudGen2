import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import EyeIcon from '@untitled-ui/icons-react/build/esm/Eye';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import type { NextPage } from 'next';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { customersApi } from 'src/api/customers';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { paths } from 'src/paths';
import { ClientListTable } from 'src/sections/dashboard/datadevice/device-resource-table';
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
  const [analyzerreload, setanalyzerreload] = useState(0);
  const [state, setState] = useState<CustomersStoreState>({
    customers: [],
    customersCount: 0,
  });
  const [analyzerRentalsData, setAnalyzerRentalsData] = useState([])
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

  const handleAnalyzersGet = useCallback(async () => {
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
        graphqlOperation(queries.listAnalyzers,variables)
      );
      console.log(response,"analyzer response")
      if (isMounted()) {
        setanalyzerreload(0);
        const sortedOptions = response.data.listAnalyzers.items.slice().sort((a, b) => {
          return a?.ps_analyzer_id?.localeCompare(b?.ps_analyzer_id);
        });
        setState({
          customers:sortedOptions,
          customersCount: sortedOptions.length,
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

  const handleAnalyzerRentalsGet = useCallback(async () => {
    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];

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
        graphqlOperation(queries.listAnalyzerRentals,variables)
      );
      // console.log(response,"analyzer rental response")
      if (isMounted()) {
        setanalyzerreload(0);
        const sortedOptions = response.data.listAnalyzerRentals.items.slice().sort((a, b) => {
          return a?.ps_analyzer_id?.localeCompare(b?.ps_analyzer_id);
        });
        setAnalyzerRentalsData(sortedOptions);
        // setState({
        //   customers:sortedOptions,
        //   customersCount: sortedOptions.length,
        // });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleAnalyzerRentalsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState, analyzerreload]
  );

  return {
    ...state,
    setanalyzerreload,
    handleAnalyzersGet,
    analyzerRentalsData
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
          py: 0,
          pr: 0,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Data Devices Resources</Typography>
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
                  Add Data Device
                </Button> */}
                <Button
                  component={RouterLink}
                  // href={paths.dashboard.gatewaycontrol.create}
                  href = {paths.dashboard.networktopology.index}
                  startIcon={
                    <SvgIcon>
                      <EyeIcon />
                    </SvgIcon>
                  }
                  variant="outlined"
                >
                  See Topology
                </Button>
              </Stack>
            </Stack>
            <Card>
              <ClientListTable
                count={customersStore.customersCount}
                items={customersStore.customers}
                analyzerRentalsData={customersStore.analyzerRentalsData}
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
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
