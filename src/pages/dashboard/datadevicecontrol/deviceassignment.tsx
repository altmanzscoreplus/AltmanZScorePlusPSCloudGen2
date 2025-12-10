import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { API, graphqlOperation } from 'aws-amplify';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { ClientListTable } from 'src/sections/dashboard/datadevice/datadevice-assign-list-table';
import { ClientgatewayListTable } from 'src/sections/dashboard/gateway/gateway-assign-list-table';
import { Analyzer } from 'src/types/analyzer';
import * as queries from '../../../graphql/queries';

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

interface GatewaySearchState {
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

interface AnalyzersStoreState {
  analyzers: Analyzer[];
  analyzersCount: number;
}
interface GatewayStoreState {
  gateway: Analyzer[];
  gatewayCount: number;
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
  };
};

const useGatewayStore = (searchState: GatewaySearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<GatewayStoreState>({
    gateway: [],
    gatewayCount: 0,
  });

  const handleGatewayGet = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listGateways, { filter: searchState.filters })
      );
      if (isMounted()) {
        setState({
          gateway: response.data.listGateways,
          gatewayCount: response.data.listGateways.length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleGatewayGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
  };
};

const useAnalyzersIds = (analyzers: Analyzer[] = []) => {
  return useMemo(() => {
    // return analyzers.map((analyzer) => analyzer.id);
  }, []);
};

const useGatewayIds = (gateway: any = []) => {
  return useMemo(() => {
    // return analyzers.map((analyzer) => analyzer.id);
  }, []);
};
const Page: NextPage = () => {
  const analyzersSearch = useDataDeviceSearch();
  const analyzersStore = useAnalyzersStore(analyzersSearch.state);
  const analyzersIds = useAnalyzersIds(analyzersStore.analyzers);

  const gatewaySearch = useGatewaySearch();
  const gatewayStore = useGatewayStore(gatewaySearch.state);
  const gatewayIds = useGatewayIds(gatewayStore.gateway);
  const router = useRouter();

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Customer List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
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
                <Typography variant="h4">View Device Assignment</Typography>
              </Stack>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              spacing={3}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={8}
                >
                  <Card>
                    <ClientListTable
                      count={analyzersStore.analyzersCount}
                      items={analyzersStore.analyzers}
                      handleFiltersChange={analyzersSearch.handleFiltersChange}
                      // count={customersStore.customersCount}
                      // items={customersStore.customers}
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
                  </Card>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <Card>
                    <ClientgatewayListTable
                      count={gatewayStore.gatewayCount}
                      items={gatewayStore.gateway}
                      handleFiltersChange={gatewaySearch.handleFiltersChange}
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
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
