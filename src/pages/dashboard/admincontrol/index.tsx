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
import { API, Auth } from 'aws-amplify';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { AdminListTable } from 'src/sections/dashboard/admin/admin-list-table';
import type { Admin } from 'src/types/admin';

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

interface AdminSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

const useAdminSearch = () => {
  const [state, setState] = useState<AdminSearchState>({
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
      // filters,
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

interface ClientsStoreState {
  admin: Admin[];
  admincount: number;
}

const useAdminStore = (searchState: AdminSearchState) => {
  const isMounted = useMounted();
  const [previousTokens, setPreviousTokens] = useState([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [nextNextToken, setNextNextToken] = useState();
  const [count, setcount] = useState<any>('');
  const [deleterefresh, setdeleterefresh] = useState<any>('');
  const [state, setState] = useState<ClientsStoreState>({
    admin: [],
    admincount: 0,
  });
  console.log(state,"state...")
  const [admins, setAdmins] = useState();

  const handleAdminGet = useCallback(async () => {
    try {
      let token = await Auth.currentSession()
      const currentuser = await Auth.currentAuthenticatedUser();
      const adminId  = currentuser.attributes.sub;
      // console.log(adminId,"admin id")
      let filters = {...searchState.filters};
      if(adminId){
        filters ={ ...filters, id: { contains: adminId }}
        console.log(filters,"filters")
      }
      // let filterConditions = {};
      // if (filters.Username) {
      //   filterConditions = { ...filterConditions, Username: filters.Username };
      //   console.log(filterConditions,"filter condition")
      // }
      if (filters.query) {
        filters = { ...filters, Username: { contains: filters.query } };
      }
  
      const filterConditions = JSON.stringify(filters);
      console.log(filterConditions,"filter condition")

    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let options = { 
      queryStringParameters: {
      //  "limit": 10,
        "groupname": ["Admin"],
        "filter": filterConditions
      },
      headers: {
        'Content-Type' : 'application/json',
        Authorization: `${token.getAccessToken().getJwtToken()}`
      }
    }
    console.log(options,"options")
    const response = await API.get(apiName, path, options);
    console.log(response,"response")
    setAdmins(response.Users);
    // return response;
      if (isMounted()) {
        setState({
          admin: response.Users,
          admincount: response.Users.length,
        });
        setcount(response.Users.length);
        // setNextNextToken(response.Users.nextToken);
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
      handleAdminGet();
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

const useAdminIds = (admins: Admin[] = []) => {
  // console.log(admins,"admins")
  return useMemo(() => {
    return admins?.map((admin) => admin?.Username);
  }, []);
};

const Page: NextPage = () => {
  const adminSearch = useAdminSearch();
  const adminStore = useAdminStore(adminSearch.state);
  console.log('Search State:', adminSearch.state);
  console.log('Admin Store:', adminStore);

  const searchQuery = adminSearch.state.filters.Username;
  console.log(searchQuery,"serch query")

  // const filteredAdmins = adminStore.admin.filter(admin => {
  //   if (adminSearch.state.filters.Username) {
  //     const isMatch = admin.Username.includes(adminSearch.state.filters.Username);
  //     console.log(`Admin Username: ${admin.Username}, Matches Query: ${isMatch}`);
  //     return isMatch;
  //   }
  //   return true;
  // });
  
  // console.log(filteredAdmins,"admin filtered...")

  const {
    admin,
    admincount,
    nextToken,
    next,
    setdeleterefresh,
    nextNextToken,
    prev,
    previousTokens,
  } = adminStore; // Destructure from customersStore

  const adminIds = useAdminIds(adminStore.admins);
  const adminSelection = useSelection<string>(adminIds);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const router = useRouter();
  const currentuser = Auth.currentAuthenticatedUser();
  // console.log(currentuser,"current user")
  const [loggedInUser, setLoggedInUser] = useState();
  // console.log(loggedInUser,"id")
  const [loggedInUserGroup, setLoggedInUserGroup] = useState();
  console.log(loggedInUserGroup,"group")

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const adminId = result.attributes.sub;
      setLoggedInUser(adminId)
      // console.log(adminId,'uuu');
      const admingroup = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLoggedInUserGroup(admingroup)
      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);

  usePageView();
  

  return (
    <>
      <Seo title="Dashboard: Admin List" />
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
                <Typography variant="h4">Admin Control</Typography>
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
                {loggedInUserGroup === 'AdminMaster' && (
                <Button
                  onClick={() => router.push('/dashboard/admincontrol/create')}
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
                    adminSearch.handleFiltersChange({
                      Username: { contains: lowercaseValue },
                      // query: lowercaseValue,
                    });
                  }}
                  placeholder="Search admin"
                  startAdornment={
                    <InputAdornment position="start">
                      <SvgIcon>
                        <SearchMdIcon sx={{ height: 10 }} />
                      </SvgIcon>
                    </InputAdornment>
                  }
                />
              </Box>

              <AdminListTable
                count={adminStore.admincount}
                items={adminStore.admin}
                setdeleterefresh={setdeleterefresh}
                searchQuery={adminSearch.state.filters.Username}
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
                placeholder="Admin Name"
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
