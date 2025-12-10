import type { NextPage } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, subDays, subHours, subMinutes } from 'date-fns';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { useMounted } from 'src/hooks/use-mounted';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { EcommerceStats } from 'src/sections/dashboard/ecommerce/ecommerce-stats';
import Link from 'next/link'; // Import Link from Next.js
import { API, graphqlOperation,Auth } from 'aws-amplify';
import * as queries from './../../graphql/queries';
import { useAuth } from 'src/hooks/use-auth'


const now = new Date();

const Page: NextPage = () => {
  const settings = useSettings();
  const [customercount, setCustomercount] = useState<any>('');
  const [clientcount, setClientcount] = useState<any>('');
  const [gatewaycount, setGatewaycount] = useState<any>('');
  const [analyzercount, setAnalyzercount] = useState<any>('');
  const isMounted = useMounted();
  const auth = useAuth()
  console.log(auth,'ppp')
  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(group)
     

      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);


  const handleCustomerCount = useCallback(async () => {
    try {
      const variables = {
        limit: 1000,
        filter: { status: { eq: 'Active' } },
      };
      const response = await API.graphql(
        graphqlOperation(queries.listCustomers,variables)
      );
      if (isMounted()) {
        setCustomercount(response.data.listCustomers.items.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      if(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin")
        {
      handleCustomerCount()}
    },
    [isMounted,logedinusergroup]
  );

  const handleClientCount = useCallback(async () => {
    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      const variables = {
        limit: 1000,
        filter: { status: { eq: 'Active' } },
      };
      if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      }
      const response = await API.graphql(
        graphqlOperation(queries.listClients,variables)
      );
      if (isMounted()) {
        setClientcount(response.data.listClients.items.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      if(logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer"){
        handleClientCount();
      }
     
    },
    [isMounted,logedinusergroup]
  );

  const handleGatewayCount = useCallback(async () => {
    try {
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      const variables = {
        limit: 1000,
        filter: { active_inactive_status: { eq: 'Active' } },
      };
      if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      } 

      const response = await API.graphql(
        graphqlOperation(queries.listGateways,variables )
      );
      if (isMounted()) {
        setGatewaycount(response.data.listGateways.items.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleGatewayCount();
    },
    [isMounted]
  );

  const handleAnalyzerCount = useCallback(async () => {
    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      const variables = {
        limit: 1000,
        filter: { active_inactive_status: { eq: 'Active' } },
      };
      if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      } 
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers,variables)
      );
      if (isMounted()) {
        setAnalyzercount(response.data.listAnalyzers.items.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleAnalyzerCount();
    },
    [isMounted]
  );


  usePageView();

  return (
    <>
      <Seo title="Dashboard: Overview" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Grid
            container
            disableEqualOverflow
            rowSpacing={1} // Set rowSpacing to 0 to remove spacing between rows
            spacing={{
              xs: 3,
              lg: 4,
            }}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">Dashboard</Typography>
                </div>
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/streaming_data.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Live Measurements
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    <Link href="/dashboard/dataview">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View
                      </Button>
                    </Link>
                  </Box>
                </Stack>
                <Divider />
              </Card>              
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/network.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Network Status
                    </Typography>

                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>

                    <Link href="/dashboard/networktopology">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View
                      </Button>
                    </Link>
                  </Box>
                </Stack>
                <Divider />
              </Card>
              </Grid>
              <Grid
              xs={12}
              md={4}
            >
              <Stack
                spacing={{
                  xs: 3,
                  lg: 4,
                }}
              >
              <EcommerceStats
                cost={12}
                profit={6}
                sales={18}
              />
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/stored_data.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Stored Data
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h5"
                      sx={{ marginTop: 1, marginLeft: 4 }}
                    >
                      -
                    </Typography>
                    <Link href="dashboard/datamanagement/">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          }, 
                        }}
                      >
                        View
                      </Button>
                    </Link>                
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/powersights.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Power Analyzers
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                     {analyzercount}
                    </Typography>

                    <Link href="/dashboard/deviceresources">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View
                      </Button>
                    </Link>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/alarms.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Alarm History
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    <Button
												disabled
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View 
                      </Button>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 2,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/iconly-glass-chart.svg"
                      width={64}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Report Center
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    <Button
												disabled
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View 
                      </Button>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/network_resources.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Gateways
                    </Typography>

                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                     {gatewaycount}
                    </Typography>

                    <Link href="dashboard/gatewayresources/">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View
                      </Button>
                    </Link>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/settings.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Alarm Settings
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    <Button
												disabled
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View 
                      </Button>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 3,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/datascheduling.png"
                      width={64}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                      Data Scheduling
                    </Typography>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    <Link href="dashboard/datamanagement/">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View
                      </Button>
                    </Link>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/customers.png"
                      width={48}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ fontWeight: 'bold', color: 'black' }} // Make bold and black
                      // color="text.secondary"
                      variant="body1"
                    >
                    {(logedinusergroup === "AdminMaster" || logedinusergroup === "Admin") ? (
                      "Customers"
                    ) : (
                      "Clients"
                    )}
                    </Typography>
                    {(logedinusergroup == "ClientMaster" || logedinusergroup == "Client") &&
                    <>
                   <Typography
                      sx={{ marginTop: 1 }}
                      color="text.primary"
                      variant="h5"
                    >
                      -
                    </Typography>
                    </>
                    }
                    {(logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer") &&
                    <>
                   <Typography
                      sx={{ marginTop: 1, marginLeft: 2 }}
                      color="text.primary"
                      variant="h5"
                    >
                      {clientcount}
                    </Typography>
                    <Link href="/dashboard/clientcontrol">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View 
                      </Button>
                    </Link>
                    </>
                    }
                    {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin") &&
                    <>
                    <Typography
                      sx={{ marginTop: 1, marginLeft: 4 }}
                      color="text.primary"
                      variant="h5"
                    >
                      {customercount}
                    </Typography>
                    <Link href="/dashboard/customercontrol">
                      <Button
                        color="inherit"
                        endIcon={
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        }
                        size="small"
                        sx={{
                          backgroundColor: 'rgb(103, 101, 239)',    // Initial background color
                          color: 'white',             // Text color when not hovered
                          paddingTop: '2px',          // Reduces padding above the button
                          paddingBottom: '2px',       // Reduces padding below the button
                          marginTop: 0,               // Removes extra margin-top
                          marginBottom: 0,            // Removes extra margin-bottom
                          border: '1px solid transparent',  // Default border (transparent)
                          '&.Mui-disabled': {         // Specifically targets disabled state
                            backgroundColor: 'gray',
                            color: 'white',
                          },
                           '&:hover': {
                            backgroundColor: 'rgb(71, 55, 200)',         // White background on hover
                            color: 'white',        // text on hover
                            // border: '1px solid rgb(255, 24, 35)',  // border on hover
                          },
                        }}
                      >
                        View 
                      </Button>
                    </Link>
                    </>
                    }
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 2,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/support2.png"
                      width={68}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{ marginTop: 0 }}
                    color="text.primary"
                    variant="h6"
                  >
                    <a href="http://www.powersight.com/support">PowerSight Customer Support</a>
                  </Typography>
                </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
            <Card>
            </Card>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <Card>
                <Stack
                  alignItems="center"
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    px: 2,
                    py: 1,
                  }}
                >
                  <div>
                    <img
                      src="/assets/iconly/website.png"
                      width={80}
                    />
                  </div>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{ marginTop: 0 }}
                      color="text.primary"
                      variant="h6"
                    >
                      <a href="http://www.powersight.com">Visit PowerSight.com</a>
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
              </Card>
            </Grid>
            </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
