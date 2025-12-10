import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { InputAdornment, Modal, OutlinedInput, TextField } from '@mui/material';
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
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { CustomerListTable } from 'src/sections/dashboard/customer/customer-list-table';
import type { Customer } from 'src/types/customer';
import * as queries from '../../../graphql/queries';
import { API, Auth, graphqlOperation } from 'aws-amplify';

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
console.log(state,"state")
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

interface ClientsStoreState {
  customer: Customer[];
  customercount: number;
}

const useCustomerStore = (searchState: CustomersSearchState) => {
  const isMounted = useMounted();
  const [previousTokens, setPreviousTokens] = useState([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [nextNextToken, setNextNextToken] = useState();
  const [count, setcount] = useState<any>('');
  const [deleterefresh, setdeleterefresh] = useState<any>('');

  

  const [state, setState] = useState<ClientsStoreState>({
    customer: [],
    customercount: 0,
  });

  const handleCustomerGet = useCallback(async () => {
    try {
      
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      let filters = searchState.filters
      if(customerId){
        filters ={ ...filters, id: { contains: customerId }}
      }
      const response = await API.graphql(
        graphqlOperation(queries.listCustomers, {
          filter: filters,
          limit: 1000,
          nextToken: nextToken ? nextToken : null,
        })
      );
      if (isMounted()) {
        setState({
          customer: response.data.listCustomers,
          customercount: response.data.listCustomers.items.length,
        });
        setcount(response.data.listCustomers.length);
        setNextNextToken(response.data.listCustomers.nextToken);
        setdeleterefresh('');
        // if (nextToken === undefined) {
        //   nextToken = null;
        // }
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted, nextToken, deleterefresh]);

  useEffect(
    () => {
      handleCustomerGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState, nextToken, deleterefresh]
  );

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
    setdeleterefresh,
  };
};

const useCustomersIds = (customers: Customer[] = []) => {
  return useMemo(() => {
    return customers?.map((customer) => customer?.id);
  }, []);
};

const Page: NextPage = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomerStore(customersSearch.state);
  console.log(customersStore,"....")
  const [logedinuser, setLogedinuser] = useState('');
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  

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

  const {
    customer,
    customercount,
    nextToken,
    next,
    setdeleterefresh,
    nextNextToken,
    prev,
    previousTokens,
  } = customersStore; // Destructure from customersStore

  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();

  useEffect( () => {
    if(logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer"){
      customersSearch.handleFiltersChange({
        id: { contains: logedinuser },
      });
    }
  },[logedinuser,logedinusergroup])


  usePageView();

  return (
    <>
      <Seo title="Dashboard: Client List" />
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
            >
              <Stack spacing={1}>
                <Typography variant="h4">Customer Control</Typography>
                {/* <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Upload01Icon />
                      </SvgIcon>
                    }
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Download01Icon />
                      </SvgIcon>
                    }
                  >
                    Export
                  </Button>
                </Stack> */}
              </Stack>
              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                { (logedinusergroup != "CustomerMaster" && logedinusergroup != "Customer") && (
                <Button
                  onClick={() => router.push('/dashboard/customercontrol/create')}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Create
                </Button>
                )}
              </Stack>
            </Stack>
            <Card>
              <Box
                component="form"
                // onSubmit={handleQueryChange}
                sx={{ flexGrow: 1, padding: 3 }}
              >
                <OutlinedInput
                  sx={{ height: 40 }}
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    const lowercaseValue = e.target.value.replace(/\s+/g, '').toLowerCase();
                    customersSearch.handleFiltersChange({
                      nameLowerCase: { contains: lowercaseValue },
                    });
                  }}
                  placeholder="Search customers"
                  startAdornment={
                    <InputAdornment position="start">
                      <SvgIcon>
                        <SearchMdIcon sx={{ height: 10 }} />
                      </SvgIcon>
                    </InputAdornment>
                  }
                />
              </Box>

              <CustomerListTable
                count={customersStore.customercount}
                items={customersStore.customer}
                setdeleterefresh={setdeleterefresh}
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
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
              >
                Create clients
              </Typography>
              <TextField
                size="small"
                autoFocus
                // value={value}
                // onBlur={onBlur}
                // onChange={onChange}
                // error={Boolean(errors.first_name)}
                placeholder="Customer Name"
              />
            </Box>
          </Modal>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
