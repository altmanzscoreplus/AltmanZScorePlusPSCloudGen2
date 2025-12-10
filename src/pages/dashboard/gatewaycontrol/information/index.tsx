import { yupResolver } from '@hookform/resolvers/yup';
import Circle from '@mui/icons-material/Circle';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormHelperText,
  Grid,
  Modal,
  OutlinedInput,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import moment from 'moment';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { GatewayCreateForm } from 'src/sections/dashboard/gateway/gateway-create-form';
import { GatewayEditForm } from 'src/sections/dashboard/gateway/gateway-edit-form';
import type { Customer } from 'src/types/customer';
import * as Yup from 'yup';
import * as mutations from '../../../../graphql/mutations';
import * as queries from '../../../../graphql/queries';

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

const useCustomer = (): Customer | null => {
  const isMounted = useMounted();
  const [customer, setCustomer] = useState<Customer | null>(null);

  const handleCustomerGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomer();

      if (isMounted()) {
        setCustomer(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleCustomerGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return customer;
};

const Page: NextPage = () => {
  const customer = useCustomer();
  const router = useRouter();
  const { id, cus_id, prevPath } = router.query;

  const [date, setDate] = useState(moment().toDate());
  const [dateend, setDateend] = useState(moment().toDate());

  // const pathnameParts = router.asPath.split('/');
  // const id = pathnameParts[pathnameParts.length - 1];
  console.log(date, 'mmmmmmmmmmmmmmmmmmmmm');
  const [gatewaydetail, setgatewaydetail] = useState();
  const [customername, setcustomername] = useState();
  const [inputValue, setInputValue] = useState('');
  const [searchgateway, setsearchgateway] = useState('');
  const [gatewaylist, setgatewaylist] = useState('');
  const [gatewayid, setgatewayid] = useState('');

  const [selectedGateway, setSelectedGateway] = useState<any>();
  console.log(selectedGateway, 'ooooo');
  const [open, setOpen] = useState(false);
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // const [isCustomer, setIsCustomer] = useState(false);
  // const [isClient, setIsClient] = useState(false);

  // useEffect(() => {
  //   const fetchCurrentUser = async () => {
  //     try {
  //       const currentUser = await Auth.currentAuthenticatedUser();
  //       console.log(currentUser, "current user");
  //       const customerId = currentUser.attributes?.['custom:customerId'];
  //       const clientId = currentUser.attributes?.['custom:clientId'];

  //       if (customerId) {
  //         setIsCustomer(true);
  //       }

  //       if (clientId) {
  //         setIsClient(true);
  //       }

  //     } catch (error) {
  //       console.error("Error fetching current user: ", error);
  //     }
  //   };

  //   fetchCurrentUser();
  // }, []);

  useEffect(() => {
    const currentUser = Auth.currentAuthenticatedUser();
    const logedinuserdetail =   currentUser.then(result => {

    const customerId = result.attributes['custom:customerId'];
    // setLogedinuser(customerId)
    const clientId = result.attributes['custom:clientId'];
    // setUserClient(clientId)
    // console.log(customerId,'uuu');
    const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
    setLogedinusergroup(group)
     
    }).catch(error => {
      console.error('Error:', error);
    });
  }, [Auth]);

  const schema = Yup.object({
    model: Yup.string().required('Model is required'),
    serial_number: Yup.string()
    .required('Serial Number is required')
    .matches(/^\d+$/, 'Only digits are allowed')
    .length(6, 'Serial Number must be exactly 6 digits'),
  })

  const {
    reset,
    control,
    trigger,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

 

  const removeGateway = useCallback(async () => {
    console.log(selectedGateway,'selectedGateway')
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteGateway', {
        body: {
          gatewayId: id,
        },
      });

      await API.del('powersightrestapi', `/IoTShadow/deleteShadow`, { body: {
        shadowName: selectedGateway?.ps_gateway_id,
      }} );

      toast.success('Gateway removed successfully');
      router.push('/dashboard/gatewaycontrol');

      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing Gateway: ' + error.message);
      throw error;
    }
  },[selectedGateway]);

  const storedDatapage = window.localStorage.getItem('previouspageName');
  useEffect(() => {
    console.log(prevPath, 'kkkkkkkkkkkkkkkkkkkkkkkkk');
  }, [prevPath]);
  const listGateway = useCallback(async () => {
    try {
      const variables = {
        filter: { ps_gateway_id: { contains: searchgateway }},
      };
      const assets = await API.graphql(graphqlOperation(queries.listGateways, variables));
      // const sortedAssets = assets?.data?.listCustomers.sort((a, b) => a.name.localeCompare(b.name));
      // setcompanyname(sortedAssets);
      const sortedOptions = assets.data.listGateways.items
      .filter(item => item.model !== null && item.serial_number !== null)
      .sort((a, b) => {
        return a?.ps_gateway_id?.localeCompare(b?.ps_gateway_id);
      });
      setgatewaylist(sortedOptions);
    } catch (err) {
      console.error(err);
    }
  }, [searchgateway]);

  useEffect(() => {
    listGateway();
  }, [searchgateway]);

  const getgateways = useCallback(async () => {
    setLoading(true)
    if (id) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getGateway, {
            id: id,
          })
        );
        console.log(assets.data.getGateway, '66clearassetttttttttttttttttttttttttttttt');
        setgatewaydetail(assets.data.getGateway);
        setcustomername(
          assets.data.getGateway.gateway_rental.items.filter((gat: any) => !gat.termination_date)[0]
            .customer?.name
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    getgateways();
  }, [id]);

  // const goBack = () => {
  //   router.back();
  // };

  const goBack = () => {
    const storedPreviousPage = window.localStorage.getItem('previouspageUrl');
    if (storedPreviousPage) {
      router.push(storedPreviousPage);
    } else {
      router.back();
    }
};

  usePageView();

  const gatewayRentalItems = gatewaydetail?.gateway_rental?.items;

  const createdAtDate =
    gatewayRentalItems?.filter((item) => item.termination_date === null)[0]?.createdAt || '-';

  const createdAtendDate =
    gatewayRentalItems?.filter((item) => item.termination_date === null)[0]?.end_date || '-';

    const AccessEndDate =
    gatewayRentalItems?.filter((item) => item.termination_date === null)[0]?.access_end_date || '-';


  console.log(createdAtDate, 'mjjjjjjjjjjjjjjjjjj');

  const [gatewaymodel, setgatewaymodel] = useState('');
  const [gatewayserial, setgatewayserial] = useState('');

  const updateenddate = async () => {
    try {
      const currentDateend = date ? moment(date).format('YYYY-MM-DD') : 'Invalid date';
      const currentDataeccessend = dateend ? moment(dateend).format('YYYY-MM-DD') : 'Invalid date';
      const updategatewayrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateGatewayRental, {
          input: {
            id: gatewaydetail?.gateway_rental?.items.filter((gat) => !gat.termination_date)[0].id,
            access_end_date: currentDateend ? currentDateend : 'null',
            end_date: currentDataeccessend
              ? currentDataeccessend
              : moment(createdAtendDate).format('YYYY-MM-DD'),
          },
        })
      );
      if (updategatewayrentalResponse) {
        router.back();
        toast.success('Updated Successfully!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [open2, setOpen2] = useState(false);
  const [newGatewayId, setNewGatewayId] = useState('');

  useEffect(() => {
    setDateend(AccessEndDate);
  }, [gatewaydetail?.gateway_rental]);

  const handleDateChange = (value) => {
    setDate(value);

    // formik.setFieldValue('date', value);
  };

  const handleDateChangeend = (value) => {
    setDateend(value);
    // formik.setFieldValue('date', value);
  };

  useEffect(() => {
    if (gatewayid) {
      router.push(`/dashboard/gatewaycontrol/information/?id=${gatewayid}`);
       setcustomername('');
    }
  }, [gatewayid]);

  const handleCreateNew = () => {
    console.log('Create New option selected');
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
    setNewGatewayId('');
  };

  const handleGatewayCreate = useCallback(async (value:any) => {

    try {
      if(value.model && value.serial_number){
      const response = await API.graphql(
        graphqlOperation(mutations.createGateway, {
          input: {
            model: value.model,
            serial_number: value.serial_number,
            active_inactive_status: 'Active',
            assigned_unassigned_status: "Unassigned",
            allocated_unallocated_status: "Unallocated",
            communication_status: "Not_Detected",
            ps_gateway_id: `${value.model}-${value.serial_number}`,
          },
        })
      );

      if (response?.data?.createGateway) {
        
        await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
          shadowName: `${value.model}-${value.serial_number}`,
        }} );

        setOpen2(false);
        setcustomername('')
        listGateway()
        router.push(
          `/dashboard/gatewaycontrol/information/?id=${response?.data?.createGateway?.id}`
        );
      }
    }
    } catch (error) {
      console.error('Error creating gateway:', error);
      alert('Failed to create gateway');
    }
  }, [ router]);

  const onSubmit = (values: any) => {
    handleGatewayCreate(values)
  }

  const [selecteddata, setSelecteddata] = useState('');
  const [open3, setOpen3] = useState(false);
  const handleOpen3 = () => setOpen3(true);
  const handleClose3 = () => setOpen3(false);

  const updateunallocation = async () => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: { customer_id: null, id: gatewaydetail?.id,allocated_unallocated_status:"Unallocated", communication_status: "Not_Detected", client_id: null },
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
            id: gatewaydetail.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            customer_id: null,
            client_id: null
          },
        })
      );
      if (updateGatewayResponse && updategatewayrentalResponse) {
        setOpen3(false);
        getgateways();
        toast.success('Updated Successfully!');
        setcustomername('');
        // router.back();
      }
    } catch (error) {
      console.error(error);
      setOpen3(false);
      toast.error('Something went wrong!');
    }
  };

  const terminationDate =
    (gatewaydetail?.gateway_rental?.items || [])
      .filter((gat) => !gat.termination_date)
      .map((gat) => gat.customer?.createdAt)[0] || '-';

  console.log(terminationDate);

  const handleSerialChange = (e: any) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setgatewayserial(onlyNumbers);
  };

  if (!customer) {
    return null;
  }
  console.log(gatewaydetail, 'n333333333333333333333333333333333333333');

 
  const currentUser = Auth.currentAuthenticatedUser();
  console.log(currentUser, "current user");
  const clientId = currentUser.attributes?.['custom:clientId'];


  return (
    <>
      <Seo title="Dashboard: Customer Edit" />
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
                  <Typography variant="subtitle2">{storedDatapage}</Typography>
                </Link>
              </div>
              </Stack>
              {loading? (
                <Typography variant="h5" >Loading...</Typography>
              ) : (
              <>
              <Typography variant="h4">Gateway Information</Typography>
              <Stack
                alignItems="flex-start"
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                justifyContent="space-between"
                spacing={4}
              >
                {id ? (
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      item
                      xs={12}
                      md={12}
                    >
                      <Grid
                        container
                        spacing={3}
                      >
                        {/* First column */}
                        <Grid
                          item
                          xs={12}
                          md={4}
                        >
                          <Typography variant="subtitle2">Model Name & Serial:</Typography>
                          <Autocomplete
                            id="highlights-demo"
                            options={gatewaylist}
                            value={gatewaydetail?.ps_gateway_id ? gatewaydetail?.ps_gateway_id : ''}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') {
                                return option;
                              }
                              if (option.ps_gateway_id) {
                                return option.ps_gateway_id;
                              }
                              return option.id;
                            }}
                            onInputChange={(e, newInputValue) => {
                              setInputValue(newInputValue);
                            }}
                            onChange={(e, value) => {
                              if (value && value.inputValue) {
                                handleCreateNew();
                                const match = value.inputValue.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/i);
                                if (match) {
                                  const [_, model, serial_number] = match;
                                  setValue('model', model);
                                  setValue('serial_number', serial_number);
                                } else {
                                  setValue('model', value.inputValue);
                                  setValue('serial_number', value.inputValue);
                                }
                              } else {
                                console.log(value, 'idddddddddddddddddddddddddddds');
                                setgatewayid(value?.id);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                              />
                            )}
                            filterOptions={(options) => {
                              const filtered = options.filter((option) =>
                                option.ps_gateway_id
                                  .toLowerCase()
                                  .replace('-', '')
                                  .includes(inputValue.toLowerCase().replace('-', ''))
                              );

                              // Return "Create New" option if no match is found
                              if (filtered.length === 0 && inputValue !== '') {
                                return [
                                  {
                                    inputValue,
                                    ps_gateway_id: `Create New gateway`,
                                  },
                                ];
                              }

                              return filtered;
                            }}
                            filterSelectedOptions
                            renderOption={(props, option, { inputValue }) => {
                              if (option.inputValue) {
                                return (
                                  <li
                                    {...props}
                                    style={{ color: 'blue', fontWeight: 'bold' }}
                                  >
                                    {option.ps_gateway_id}
                                  </li>
                                );
                              }

                              const matches = match(option.ps_gateway_id, inputValue, {
                                insideWords: true,
                              });
                              const parts = parse(option.ps_gateway_id, matches);

                              return (
                                <li
                                  {...props}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    <div>
                                      {parts.map((part, index) => (
                                        <span
                                          key={index}
                                          style={{
                                            fontWeight: part.highlight ? 700 : 400,
                                          }}
                                        >
                                          {part.text}
                                        </span>
                                      ))}
                                      {option?.active_inactive_status === 'Inactive' && (
                                        <Circle
                                          fontSize="small"
                                          style={{
                                            color: 'grey',
                                            fontSize: '0.65rem',
                                            verticalAlign: 'middle',
                                            paddingLeft: 2,
                                            marginBottom: '12px',
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div></div>
                                  </div>
                                </li>
                              );
                            }}
                          />

                          {/* <Autocomplete
                            id="highlights-demo"
                            options={gatewaylist}
                            value={gatewaydetail?.ps_gateway_id ? gatewaydetail?.ps_gateway_id : ''}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') {
                                return option;
                              }
                              if (option.ps_gateway_id) {
                                return option.ps_gateway_id;
                              }

                              return option.id;
                            }}
                            onChange={(e, value) => {
                              console.log(value, 'idddddddddddddddddddddddddddds');
                              setgatewayid(value?.id);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                              />
                            )}
                            filterOptions={(options, { inputValue }) => {
                              // Custom filtering logic to include hyphen
                              return options.filter((option) =>
                                option.ps_gateway_id
                                  .toLowerCase()
                                  .replace('-', '')
                                  .includes(inputValue.toLowerCase().replace('-', ''))
                              );
                            }}
                            filterSelectedOptions
                            renderOption={(props, option, { inputValue }) => {
                              const matches = match(option.ps_gateway_id, inputValue, {
                                insideWords: true,
                              });
                              const parts = parse(option.ps_gateway_id, matches);

                              return (
                                <li
                                  {...props}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    <div>
                                      {parts.map((part, index) => (
                                        <span
                                          key={index}
                                          style={{
                                            fontWeight: part.highlight ? 700 : 400,
                                          }}
                                        >
                                          {part.text}
                                        </span>
                                      ))}
                                      {option?.status === 'Inactive' && (
                                        <Circle
                                          fontSize="small"
                                          style={{
                                            color: 'grey',
                                            fontSize: '0.65rem',
                                            verticalAlign: 'middle',
                                            paddingLeft: 2, // Adjust vertical alignment here
                                            marginBottom: '12px', // Add some margin bottom to fine-tune the position
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div></div>
                                  </div>
                                </li>
                              );
                            }}
                          /> */}
                        </Grid>

                        {customername && (
                          <Grid
                            xs={12}
                            md={3}
                            sx={{
                              marginTop: '45px',
                              paddingLeft: '20px',
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant="subtitle2"
                            >
                              Start Date:
                            </Typography>
                            <Typography
                              gutterBottom
                              variant="subtitle2"
                            >
                              {moment(createdAtDate).isValid()
                                ? moment(createdAtDate).format('YYYY-MM-DD')
                                : '-'}
                            </Typography>
                          </Grid>
                        )}
                        {/* {customername && (
                          <Grid
                            xs={12}
                            md={3}
                            sx={{
                              marginTop: '45px',
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant="subtitle2"
                            >
                              End Date:
                            </Typography>
                            <Typography
                              gutterBottom
                              variant="subtitle2"
                            >
                              {moment(createdAtendDate).isValid()
                                ? moment(createdAtendDate).format('YYYY-MM-DD')
                                : '-'}
                            </Typography>
                          </Grid>
                        )} */}
        {gatewaydetail?.customer_id == null &&
                       ( <Grid
                          xs={12}
                          md={2}
                          sx={{
                            marginTop: '20px',
                            paddingLeft: '20px',
                          }}
                        >
                          {/* { !clientId && ( */}
                          <Button
                            startIcon={
                              <SvgIcon>
                                <DeleteIcon />
                              </SvgIcon>
                            }
                            color="error"
                            variant="outlined"
                            style={{
                              padding: '2px 12px',
                              fontSize: '0.875rem',
                              minHeight: 'auto',
                              marginTop: '30px',
                            }}
                            onClick={() => {
                              setSelectedGateway(gatewaydetail);
                              setOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                          {/* )} */}
                        </Grid>)
                }
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Stack spacing={1}>
                    
                    <Typography variant="h4">Create Gateway </Typography>
                    
                  </Stack>
                )}
              </Stack>            

            
            {id && (
              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                  md={12}
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                    <>
                    <Grid
                      xs={12}
                      md={4}
                    >
                      <Typography
                        gutterBottom
                        variant="subtitle2"
                      >
                        {customername ? `Allocated To ${customername}` : 'Allocate To Customer'}
                      </Typography>
                      {!customername && (
                        <Button
                          type="submit"
                          variant="outlined"
                          onClick={() =>
                            router.push(`/dashboard/gatewaycontrol/allocation/?id=${id}`)
                          }
                          disabled={gatewaydetail?.active_inactive_status =="Inactive"}
                        >
                          {'Allocate'}
                        </Button>
                      )}
                      {customername && (
                        <Button
                          type="submit"
                          variant="outlined"
                          onClick={() => {
                            handleOpen3();
                          }}
                          disabled={gatewaydetail?.assigned_unassigned_status =="Assigned" }
                        >
                          {'Unallocate'}
                        </Button>
                      )}
                    </Grid>
                    <Grid
                      xs={12}
                      md={3}
                    >
                      {customername && (
                        <>
                          <Grid style={{ marginTop: '10px' }}>
                            <DatePicker
                              label="Access Ends"
                              value={
                                moment(AccessEndDate).toDate()
                                  ? moment(AccessEndDate).toDate()
                                  : date
                              }
                              onChange={handleDateChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!(formik.touched.date && formik.errors.date)}
                                  helperText={formik.touched.date && formik.errors.date}
                                  onBlur={formik.handleBlur}
                                  fullWidth
                                  sx={{ mb: 3 }}
                                />
                              )}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <Grid
                      xs={12}
                      md={3}
                    >
                      {customername && (
                        <>
                          <Grid style={{ marginTop: '10px', paddingLeft: '10px' }}>
                            {/* {dateend} */}
                            <DatePicker
                              label="End date"
                              value={
                                moment(createdAtendDate).toDate()
                                  ? moment(createdAtendDate).toDate()
                                  : dateend
                              }
                              onChange={handleDateChangeend}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!(formik.touched.date && formik.errors.date)}
                                  helperText={formik.touched.date && formik.errors.date}
                                  onBlur={formik.handleBlur}
                                  fullWidth
                                  sx={{ mb: 3 }}
                                />
                              )}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    </>
                    )}
                    <Grid
                      xs={12}
                      md={3}
                    >
                      {customername && ['Client', 'ClientMaster', 'Customer', 'CustomerMaster'].includes(logedinusergroup) && (
                        <>
                          <Grid style={{ marginTop: '10px' }}>
                          <div style={{ pointerEvents: 'none' }}>
                            <DatePicker
                              label="Access Ends"
                              value={
                                moment(AccessEndDate).toDate()
                                  ? moment(AccessEndDate).toDate()
                                  : date
                              }
                              // onChange={handleDateChange}
                              onChange={() => {}}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!(formik.touched.date && formik.errors.date)}
                                  helperText={formik.touched.date && formik.errors.date}
                                  onBlur={formik.handleBlur}
                                  fullWidth
                                  sx={{ mb: 3 }}
                                  InputProps={{
                                    ...params.InputProps,
                                    readOnly: true,
                                  }}
                                />
                              )}
                            />
                          </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <Grid
                      xs={12}
                      md={3}
                    >
                      {customername && ['Client', 'ClientMaster', 'Customer', 'CustomerMaster'].includes(logedinusergroup) && (
                        <>
                          <Grid style={{ marginTop: '10px', paddingLeft: '10px' }}>
                            {/* {dateend} */}
                            <div style={{ pointerEvents: 'none' }}>
                            <DatePicker
                              label="End date"
                              value={
                                moment(createdAtendDate).toDate()
                                  ? moment(createdAtendDate).toDate()
                                  : dateend
                              }
                              // onChange={handleDateChangeend}
                              onChange={() => {}}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!(formik.touched.date && formik.errors.date)}
                                  helperText={formik.touched.date && formik.errors.date}
                                  onBlur={formik.handleBlur}
                                  fullWidth
                                  sx={{ mb: 3 }}
                                  InputProps={{
                                    ...params.InputProps,
                                    readOnly: true,
                                  }}
                                />
                              )}
                            />
                            </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                    {/* </>
                    )} */}
                    {/*
                    <Grid
                      xs={12}
                      md={2}
                    >
                      <Grid
                        style={{
                          marginLeft: '20px',
                        }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          style={{
                            padding: '2px 12px',
                            fontSize: '0.875rem',
                            minHeight: '20px',
                            marginTop: '20px',
                          }}
                          onClick={() => updateenddate()}
                        >
                          Update
                        </Button>
                      </Grid>
                    </Grid> */}
                  </Grid>
                </Grid>
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
                    md={6}
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
                      Jones Futura zz
                    </Typography>
                    <Button
                      type="submit"
                      variant="outlined"
                    >
                      Reallocate
                    </Button>
                  </Grid>

                  <Grid
                    xs={12}
                    md={6}
                  ></Grid>
                </Grid>
              </Grid> */}
              </Grid>
            )}
            
            {id ? (
              <GatewayEditForm
                customer={gatewaydetail}
                date={date}
                dateend={dateend}
                createdAtendDate={createdAtendDate}
              />
            ) : (
              <GatewayCreateForm />
            )}
            </> )}
          </Stack>
        </Container>
        <Dialog
          open={open}
          disableEscapeKeyDown
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              handleClose();
            }
          }}
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
          >
            Are You Sure?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure want to Remove this Gateway
            </DialogContentText>
          </DialogContent>
          <Divider />
          <DialogActions className="dialog-actions-dense">
            <Grid sx={{ pb: 2, px: 4, mt: 4 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  removeGateway();

                  setOpen(false);
                }}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setOpen(false);
                }}
                sx={{ ml: 3 }}
              >
                No
              </Button>
            </Grid>
          </DialogActions>
        </Dialog>
        {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
        <Dialog
          open={open2}
          onClose={handleClose2}
        >
          <DialogTitle>Create New Gateway</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
          <Controller
            rules={{ required: true }}
            name='model'
            control={control}
            render={({ field: { value, onChange } }) => (
            <OutlinedInput
              fullWidth
              value={value}
              // inputProps={{ ref: queryRef }}

              placeholder="Enter Model"
              onChange={onChange}
            />
          )}
          />
          {errors.model && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors.model.message}</FormHelperText>
          )}
          <Controller
            rules={{ required: true }}
            name='serial_number'
            control={control}
            render={({ field: { value, onChange } }) => (
            <OutlinedInput
              // defaultValue={s_id}
              fullWidth
              value={value}
              // inputProps={{ ref: queryRef }}
              placeholder="Enter Serial#"
              sx={{ marginTop: '5px' }}
              inputProps={{ maxLength: 6 }}
              onChange={onChange}
            />
          )}
          />
          {errors.serial_number && (
            <FormHelperText sx={{ color: 'error.main' }}>{errors.serial_number.message}</FormHelperText>
          )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose2}
              color="primary"
            >
              Cancel
            </Button>
            <Button
             type="submit"
              color="primary"
            >
              Create
            </Button>
          </DialogActions>
          </form>
        </Dialog>
        )}
        <Modal
          open={open3}
          onClose={handleClose3}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Confirmation?
            </Typography>
            <Typography
              id="modal-modal-description"
              sx={{ mt: 2 }}
            >
              Are you sure you want to unallocate?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={handleClose3}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateunallocation()}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
