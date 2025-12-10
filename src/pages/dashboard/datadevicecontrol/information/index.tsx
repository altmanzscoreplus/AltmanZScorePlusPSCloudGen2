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
import { DataDeviceEditForm } from 'src/sections/dashboard/datadevice/datadevice-edit-form';
import { GatewayCreateForm } from 'src/sections/dashboard/gateway/gateway-create-form';
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

  const [analyzerdetail, setanalyzerdetail] = useState();
  console.log(analyzerdetail,'ppppp')
  const [customername, setcustomername] = useState();
  const [inputValue, setInputValue] = useState('');
  const [searchanalyzer, setsearchanalyzer] = useState('');
  const [analyzerlist, setanalyzerlist] = useState('');
  const [analyzerid, setanalyzerid] = useState('');

  const [selectedAnalyzer, setSelectedAnalyzer] = useState<any>();
  const [open, setOpen] = useState(false);
  const [logedinusergroup, setLogedinusergroup] = useState('');
  // console.log(logedinusergroup," group name")
  const [loading, setLoading] = useState(false);

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
    .length(5, 'Serial Number must be exactly 5 digits'),
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

  const handleClose = () => {
    setOpen(false);
  };

 
  const removeAnalyzer = async () => {
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteAnalyzer', {
        body: {
          analyzerId: id,
        },
      });

      await API.del('powersightrestapi', `/IoTShadow/deleteShadow`, { body: {
        shadowName: selectedAnalyzer?.ps_analyzer_id,
      }} );

      toast.success('Analyzer removed successfully');
      router.back();
      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing Analyzer: ' + error.message);
      throw error;
    }
  };

  const storedDatapage = window.localStorage.getItem('previouspageName');
  
  useEffect(() => {
    console.log(prevPath, 'kkkkkkkkkkkkkkkkkkkkkkkkk');
  }, [prevPath]);

  const listAnalyzers = useCallback(async () => {
    try {
      const variables = {
        filter: { ps_analyzer_id: { contains: searchanalyzer } },
      };
      const assets = await API.graphql(graphqlOperation(queries.listAnalyzers, variables));
      // const sortedAssets = assets?.data?.listCustomers.sort((a, b) => a.name.localeCompare(b.name));
      // setcompanyname(sortedAssets);
      const sortedOptions = assets.data.listAnalyzers.items
      .filter(item => item.model !== null && item.serial_number !== null)
      .sort((a, b) => {
        return a?.ps_analyzer_id?.localeCompare(b?.ps_analyzer_id);
      });
      setanalyzerlist(sortedOptions);
    } catch (err) {
      console.error(err);
    }
  }, [searchanalyzer]);

  useEffect(() => {
    listAnalyzers();
  }, [searchanalyzer]);

  

  const getdatadevice = useCallback(async () => {
    setLoading(true)
    if (id) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: id,
          })
        ); //membership:{response.data.getMemberByEmail.items[0].membershipId}}.then((response, error) => {
        console.log(assets.data.getAnalyzer, '66clearassetttttttttttttttttttttttttttttt');
        //await API.graphql(graphqlOperation(queries.getMemberByEmail,variables));
        //alert('getMemberByEmail')
        setanalyzerdetail(assets.data.getAnalyzer);
        setcustomername(
          assets.data.getAnalyzer.analyzer_rental.items.filter((gat: any) => !gat.termination_date)[0]
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
    getdatadevice();
  }, [id]);

  // const goBack = () => {
  //   router.back();
  // };
  // const goBack = () => {
  //   const storedPreviousPage = window.localStorage.getItem('previouspage');
  //   if (storedPreviousPage) {
  //     router.push(storedPreviousPage);
      
  //   } else {
  //     // Otherwise, go back in the history
  //     router.back();
  //   }
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

  const analyzerRentalItems = analyzerdetail?.analyzer_rental?.items;

  const createdAtDate =
  analyzerRentalItems?.filter((item) => item.termination_date === null)[0]?.createdAt || '-';

  const createdAtendDate =
  analyzerRentalItems?.filter((item) => item.termination_date === null)[0]?.end_date || '-';

  const AccessEndDate =
  analyzerRentalItems?.filter((item) => item.termination_date === null)[0]?.access_end_date || '-';

  console.log(createdAtDate, 'mjjjjjjjjjjjjjjjjjj');

  const [analyzermodel, setanalyzermodel] = useState('');
  const [analyzerserial, setanalyzerserial] = useState('');

  const updateenddate = async () => {
    try {
      const currentDateend = date ? moment(date).format('YYYY-MM-DD') : 'Invalid date';
      const currentDataeccessend = dateend ? moment(dateend).format('YYYY-MM-DD') : 'Invalid date';
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: analyzerdetail?.analyzer_rental?.items.filter((gat) => !gat.termination_date)[0].id,
            access_end_date: currentDateend ? currentDateend : 'null',
            end_date: currentDataeccessend
              ? currentDataeccessend
              : moment(createdAtendDate).format('YYYY-MM-DD'),
          },
        })
      );
      if (updateanalyzerrentalResponse) {
        router.back();
        toast.success('Updated Successfully!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [open2, setOpen2] = useState(false);
  const [newAnalyzerId, setNewAnalyzerId] = useState('');

  useEffect(() => {
    setDateend(AccessEndDate);
  }, [analyzerdetail?.analyzer_rental]);

  const handleDateChange = (value) => {
    setDate(value);

    // formik.setFieldValue('date', value);
  };

  const handleDateChangeend = (value) => {
    setDateend(value);
    // formik.setFieldValue('date', value);
  };

  useEffect(() => {
    if (analyzerid) {
      router.push(`/dashboard/datadevicecontrol/information/?id=${analyzerid}`);
      setcustomername('');
    }
  }, [analyzerid]);

  const handleCreateNew = () => {
    console.log('Create New option selected');
    setOpen2(true);
  };

  const handleClose2 = () => {
    setOpen2(false);
    setNewAnalyzerId('');
  };

  const handleAnalyzerCreate = useCallback(async (value:any) => {
    // Validation checks
   

    try {
      if(value.model && value.serial_number){
      const response = await API.graphql(
        graphqlOperation(mutations.createAnalyzer, {
          input: {
            model: value.model,
            serial_number: value.serial_number,
            ps_analyzer_id: `${value.model}-${value.serial_number}`,
            active_inactive_status:"Active",
            assigned_unassigned_status: "Unassigned",
            allocated_unallocated_status: "Unallocated",
            communication_status: "Not_Detected",
          },
        })
      );

      if (response?.data?.createAnalyzer) {
        await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
          shadowName: `${value.model}-${value.serial_number}`,
        }} );
        setOpen2(false);
        setcustomername('')
        listAnalyzers()
        router.push(
          `/dashboard/datadevicecontrol/information/?id=${response?.data?.createAnalyzer?.id}`
        );
      }
    }
    } catch (error) {
      console.error('Error creating Analyzer:', error);
      alert('Failed to create Analyzer');
    }
  }, [ router]);

  const onSubmit = (values: any) => {
    handleAnalyzerCreate(values)
  }

  const [selecteddata, setSelecteddata] = useState('');
  const [open3, setOpen3] = useState(false);
  const handleOpen3 = () => setOpen3(true);
  const handleClose3 = () => setOpen3(false);

  const updateunallocation = async () => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: null, id: analyzerdetail?.id,allocated_unallocated_status:"Unallocated", communication_status: "Not_Detected", client_id: null },
        })
      );

      // const updateCustomer = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { customer_id: id, gateway_id: null },
      //   })
      // );
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: analyzerdetail.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            customer_id: null,
            client_id: null
          },
        })
      );
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        setOpen3(false);
        getdatadevice();
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
    (analyzerdetail?.analyzer_rental?.items || [])
      .filter((gat) => !gat.termination_date)
      .map((gat) => gat.customer?.createdAt)[0] || '-';

  console.log(terminationDate);

  const handleSerialChange = (e: any) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setanalyzerserial(onlyNumbers);
  };

  if (!customer) {
    return null;
  }
 

  return (
    <>
      <Seo title="Dashboard: Analyzer Edit" />
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
              <Typography variant="h4">Analyzer Information</Typography>
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
                            options={analyzerlist}
                            value={analyzerdetail?.ps_analyzer_id ? analyzerdetail?.ps_analyzer_id : ''}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') {
                                return option;
                              }
                              if (option.ps_analyzer_id) {
                                return option.ps_analyzer_id;
                              }
                              return option.id;
                            }}
                            onInputChange={(e, newInputValue) => {
                              setInputValue(newInputValue);
                            }}
                            onChange={(e, value) => {
                              if (value && value.inputValue) {
                                handleCreateNew()
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
                                setanalyzerid(value?.id);
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
                                option.ps_analyzer_id
                                  .toLowerCase()
                                  .replace('-', '')
                                  .includes(inputValue.toLowerCase().replace('-', ''))
                              );

                              // Return "Create New" option if no match is found
                              if (filtered.length === 0 && inputValue !== '') {
                                return [
                                  {
                                    inputValue,
                                    ps_analyzer_id: `Create New Analyzer`,
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
                                    {option.ps_analyzer_id}
                                  </li>
                                );
                              }

                              const matches = match(option.ps_analyzer_id, inputValue, {
                                insideWords: true,
                              });
                              const parts = parse(option.ps_analyzer_id, matches);

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
                       {analyzerdetail?.customer_id ==null && (
                        <Grid
                          xs={12}
                          md={2}
                          sx={{
                            marginTop: '20px',
                            paddingLeft: '20px',
                          }}
                        >
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
                              setSelectedAnalyzer(analyzerdetail);
                              setOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </Grid>)}
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Stack spacing={1}>
                    <Typography variant="h4">Create Analyzer </Typography>
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
                            router.push(`/dashboard/datadevicecontrol/allocation/?id=${id}`)
                          }
                          disabled={analyzerdetail?.active_inactive_status =="Inactive" }
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
                          disabled={analyzerdetail?.assigned_unassigned_status =="Assigned" }
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
              <DataDeviceEditForm
                customer={analyzerdetail}
                date={date}
                dateend={dateend}
                createdAtendDate={createdAtendDate}
              />
            ) : (
              <GatewayCreateForm />
            )}
          </> 
          )}
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
              Are you sure want to Remove this Analyzer
            </DialogContentText>
          </DialogContent>
          <Divider />
          <DialogActions className="dialog-actions-dense">
            <Grid sx={{ pb: 2, px: 4, mt: 4 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  removeAnalyzer();

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
          <DialogTitle>Create New Analyzer</DialogTitle>
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
