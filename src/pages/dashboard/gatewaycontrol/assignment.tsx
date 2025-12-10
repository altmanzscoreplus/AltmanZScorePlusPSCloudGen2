import { Grid, InputAdornment, OutlinedInput } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
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
import { GatewayAssignmentTable } from 'src/sections/dashboard/gateway/gateway-assignment-table';
import type { Customer } from 'src/types/customer';

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
                <Typography variant="h4">View Gateway Assignments</Typography>
              </Stack>
              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                <Button
                  component={RouterLink}
                  href={paths.dashboard.gatewaycontrol.create}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Create
                </Button>
              </Stack>
            </Stack>
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
                    sm={6}
                    md={4}
                  >
                    <OutlinedInput
                      defaultValue=""
                      fullWidth
                      // inputProps={{ ref: queryRef }}
                      placeholder="Search By Customer"
                      startAdornment={
                        <InputAdornment position="start">
                          <SvgIcon>
                            <SearchMdIcon />
                          </SvgIcon>
                        </InputAdornment>
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                  >
                    <OutlinedInput
                      defaultValue=""
                      fullWidth
                      // inputProps={{ ref: queryRef }}
                      placeholder="Search By Model"
                      startAdornment={
                        <InputAdornment position="start">
                          <SvgIcon>
                            <SearchMdIcon />
                          </SvgIcon>
                        </InputAdornment>
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                  >
                    <OutlinedInput
                      defaultValue=""
                      fullWidth
                      // inputProps={{ ref: queryRef }}
                      placeholder="Search By Serial Number"
                      startAdornment={
                        <InputAdornment position="start">
                          <SvgIcon>
                            <SearchMdIcon />
                          </SvgIcon>
                        </InputAdornment>
                      }
                    />
                  </Grid>
                </Grid>

                {/* <TextField
                  label="Sort By"
                  name="sort"
                  // onChange={handleSortChange}
                  select
                  SelectProps={{ native: true }}
                  // value={`${sortBy}|${sortDir}`}
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </TextField> */}
              </Stack>
              <GatewayAssignmentTable
                count={customersStore.customersCount}
                items={customersStore.customers}
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
