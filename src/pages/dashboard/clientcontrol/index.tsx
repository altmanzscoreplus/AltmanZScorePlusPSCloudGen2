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
import { API, Auth, graphqlOperation } from 'aws-amplify';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { ClientListTable } from 'src/sections/dashboard/client/client-list-table';
import type { Client } from 'src/types/customer';
import * as queries from '../../../graphql/queries';

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
  nameLowerCase?:any;
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

interface ClientSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

const useClientSearch = () => {
  const [state, setState] = useState<ClientSearchState>({
    filters: {
      nameLowerCase:undefined,
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

interface ClientsStoreState {
  clients: Client[];
  clientcount: number;
}

const useClientStore = (searchState: ClientSearchState) => {
  const isMounted = useMounted();
  const [previousTokens, setPreviousTokens] = useState([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [nextNextToken, setNextNextToken] = useState();
  const [state, setState] = useState<ClientsStoreState>({
    clients: [],
    clientcount: 0,
  });
  console.log(state,"state")

  const handleClientrGet = useCallback(async () => {
    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      console.log(currentuser,"current user")
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];
      const group = currentuser.signInUserSession.accessToken.payload['cognito:groups'][0]
      console.log(group,"user group")

      let filters = searchState.filters
      if(group == 'ClientMaster'){
        filters ={ ...filters, id: { contains: clientId }}
      
        const response = await API.graphql(
          graphqlOperation(queries.listClients, {
            filter: filters,
            limit: 1000,
            nextToken: nextToken ? nextToken : null,
          })
        );
        console.log(response,"client response")
        if (isMounted()) {
          setState({
            clients: response.data.listClients,
            clientcount: response.data.listClients.items.length,
          });
          setNextNextToken(response.data.listClients.nextToken);
        }
      }
      else if(group == 'CustomerMaster' || group == 'Customer'){
        filters ={ ...filters, customer_id: { eq: customerId }}
      

       const variables = {
        filter: filters
      };
      const response = await API.graphql(
        graphqlOperation(queries.listClients,variables )
      );
      console.log(response,"customer response")
      if (isMounted()) {
        setState({
          clients: response.data.listClients,
          clientcount: response.data.listClients.items.length,
        });
        setNextNextToken(response.data.listClients.nextToken);
      }
      }
      else if(group == 'AdminMaster' || group == 'Admin'){
      //   filters ={ ...filters, customer_id: { eq: customerId }}
      

       const variables = {
        filter: filters
      };
      const response = await API.graphql(
        graphqlOperation(queries.listClients,variables )
      );
      console.log(response,"admin response")
      if (isMounted()) {
        setState({
          clients: response.data.listClients,
          clientcount: response.data.listClients.items.length,
        });
        setNextNextToken(response.data.listClients.nextToken);
      }
      }
      
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted, nextToken]);

  // const listClient = useCallback(async () => {
  //   try {

  //     const currentuser = await Auth.currentAuthenticatedUser();
  //     console.log(currentuser,"current user")
  //     const clientId  = currentuser.attributes['custom:clientId'];

  //     let filters = searchState.filters
  //     if(clientId){
  //       filters ={ ...filters, id: { contains: clientId }}
  //     }
  //     const response = await API.graphql(
  //       graphqlOperation(queries.listClients, {
  //         filter: filters,
  //         limit: 1000,
  //         nextToken: nextToken ? nextToken : null,
  //       })
  //     );
  //     console.log(response,"response")
  //     if (isMounted()) {
  //       setState({
  //         clients: response.data.listClients,
  //         clientcount: response.data.listClients.items.length,
  //       });
  //       setNextNextToken(response.data.listClients.nextToken);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [searchState, isMounted, nextToken]);


  useEffect(
    () => {
      handleClientrGet();
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState, nextToken]
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
    nextToken,
    nextNextToken,
    handleClientrGet,
  };
};

const useClientsIds = (clients: Client[] = []) => {
  return useMemo(() => {
    if (!Array.isArray(clients)) {
      return [];
    }
    return clients.map((client) => client.id);
    
  }, [clients]);
};

const Page: NextPage = () => {
  const clientSearch = useClientSearch();
  const clientStore = useClientStore(clientSearch.state);
  const { clients, clientcount, nextNextToken, next, prev, handleClientrGet, previousTokens } =
    clientStore; // Destructure from customersStore

  const clientsIds = useClientsIds(clientStore.clients);
  const clientsSelection = useSelection<string>(clientsIds);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();

  const [logedinuser, setLogedinuser] = useState('');
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const clientId = result.attributes['custom:clientId'];
      setLogedinuser(clientId)
      // console.log(clientId,'uuu');
      const clientGroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(clientGroup)
      }).catch(error => {
          console.error('Error:', error);
      });
  }, [Auth]);

  usePageView();

  console.log(clientStore, 'clientStoreclientStoreclientStoreclientStoreclientStoreclientStore');
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
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Client Control</Typography>
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
                {(logedinusergroup != "ClientMaster" && logedinusergroup != "Client") && (
                <Button
                  onClick={() => router.push('/dashboard/clientcontrol/create')}
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
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    const lowercaseValue = e.target.value.replace(/\s+/g, '').toLowerCase();
                    clientSearch.handleFiltersChange({
                      nameLowerCase: { contains: lowercaseValue },
                    });
                  }}
                  placeholder="Search clients"
                  startAdornment={
                    <InputAdornment position="start">
                      <SvgIcon>
                        <SearchMdIcon />
                      </SvgIcon>
                    </InputAdornment>
                  }
                />
              </Box>
              <ClientListTable
                items={clientStore.clients}
                count={clientStore.clientcount}
                handleClientrGet={handleClientrGet}

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
