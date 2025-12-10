import { CheckCircleOutline, Clear } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { ErrorMessage, FieldArray, Form, Formik, useFormik } from 'formik';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import PropTypes from 'prop-types';
import type { FC } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
// import { useHistory } from 'react-router-dom';
import { Autocomplete, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-number-input/style.css';
import type { Client } from 'src/types/client';
import { wait } from 'src/utils/wait';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface ClientCreateFormProps {
  client: Client;
}

export const ClientCreateForm: FC<ClientCreateFormProps> = (props) => {
  const [sections, setSections] = useState([
    {
      customer_id: 1,
      name: '',
      email: '',
      title: '',
      text: '',
      phone: '',
      alarm_level_phone: '',
      alarm_level_email: '',
      alarm_level_sms: '',
    },
  ]);
  const router = useRouter();
  const { id } = router.query;
  // const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [customerdata, setcustomerdata] = useState();

  const currentuser = Auth.currentAuthenticatedUser();
  const [logedinusergroup, setLogedinusergroup] = useState('');
  const [logedinuser, setLogedinuser] = useState('');

  useEffect(() => {
    const logedinuserdetail =   currentuser.then(result => {
      const customerId = result.attributes['custom:customerId'];
      setLogedinuser(customerId)
      const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(group)
     

      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);
    
    const addCustomerToGroup = useCallback(
      async (username, group) => {
        let token = await Auth.currentSession();
        console.log(token.getAccessToken(), 'token');
        let apiName = 'AdminQueries';
        let path = '/addUserToGroup';
        let options = {
          body: {
            username: username,
            groupname: group,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token.getAccessToken().getJwtToken()}`,
          },
        };
        const { NextToken, ...rest } = await API.post(apiName, path, options);
      },
      [Auth]
    );
  
    const getUsers = useCallback(
      async (emailFilter: any) => {
        console.log(emailFilter, 'errrrr');
        let token = await Auth.currentSession();
        const decodedEmailFilter = decodeURIComponent(emailFilter);
        console.log(token.getAccessToken(), 'token');
        let apiName = 'AdminQueries';
        let path = '/getUser';
        let updateValue = {};
        // if (Users?.Username) {
        //   updateValue = {
        //     ...updateValue,
        //     Username: { eq: Users.Username },
        //   };
        // }
        let myInit = {
          queryStringParameters: {
            username: emailFilter,
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token.getAccessToken().getJwtToken()}`,
          },
        };
        const { NextToken, ...rest } = await API.get(apiName, path, myInit);
        console.log(NextToken, 'art');
  
        return rest;
      },
      [Auth]
    );
  
    const inviteUser = (username, email, phoneNumber, group, customerId, name, clientId) => {
      const cognito = new AWS.CognitoIdentityServiceProvider();
      let UserAttributes = [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'custom:customerId',
          Value: customerId,
        },
        {
          Name: 'name',
          Value: name,
        },
        {
          Name: 'custom:clientId',
          Value: clientId,
        },
      ];
  
      if (phoneNumber) {
        UserAttributes.push({
          Name: 'phone_number',
          Value: phoneNumber,
        });
      }
  
      const params = {
        UserPoolId: 'us-west-1_F0uiXhSAc',
        Username: username,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: UserAttributes,
      };
  
      return new Promise((resolve, reject) => {
        cognito.adminCreateUser(params, async (err, data) => {
          if (err) {
            reject(err);
          } else {
            await addCustomerToGroup(username, group);
            resolve(data);
          }
        });
      });
    };
  
    useEffect(() => {
      const configureAWS = async () => {
        try {
          const currentUserSession = await Auth.currentSession();
          const idToken = currentUserSession.getIdToken().getJwtToken();
  
          AWS.config.update({
            region: `us-west-1`,
            credentials: new AWS.CognitoIdentityCredentials({
              IdentityPoolId: 'us-west-1:1a42955b-5b4d-4846-a56f-bd96bee2702e',
              Logins: {
                [`cognito-idp.${`us-west-1`}.amazonaws.com/${`us-west-1_F0uiXhSAc`}`]: idToken,
              },
            }),
          });
          // setAwsConfigured(true);
        } catch (error) {
          console.error('Error configuring AWS:', error);
        }
      };
  
      configureAWS();
    }, [Auth]);
    

  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      name: '',
      email: '',
      title: '',
      text: '',
      phone: '',
      alarm_level_phone: '',
      alarm_level_email: '',
      alarm_level_sms: '',
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id) => {
    const updatedSections = sections.filter((section) => section.id !== id);
    setSections(updatedSections);
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const levelOptions = [
    { value: 'None', label: 'None' },
    { value: 'Level_1', label: 'Level 1' },
    { value: 'Level_2', label: 'Level 2' },
    { value: 'Level_3', label: 'Level 3' },
  ];

  const { customer, client, ...other } = props;

  const [returncustomerid, setreturncustomerid] = useState();
  const [companyname, setcompanyname] = useState('');
  const [createdClientIds, setCreatedClientIds] = useState([]);

  const initialValues = {
    name: '',
    customer_id:'',
    client_id: returncustomerid, // Assuming returncustomerid is defined elsewhere
    status: 'Active',
    contacts: [
      {
        name: '',
        email: '',
        title: '',
        phone: '',
        alarm_level_phone: '',
        alarm_level_email: '',
        alarm_level_sms: '',
        isUpdate: 0,
      },
    ],
  };

  const onEmailValid = async (value) => {
    try {
      const response = await getUsers(value);
      console.log(response.Enabled, 'kkk');

      return false;
    } catch (error) {
      console.error('API error:', error);
      return true;
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is Required'),
    client_id: Yup.string().max(255).required('Client Id is Required'),
    status: Yup.string().max(255).required('Status is Required'),
    contacts: Yup.array()
      .of(
        Yup.object()
          .shape({
            name: Yup.string(),
            email: Yup.string()
              .email('Invalid email format')
              .required('Email is required')
              .test('email-validation-callback', 'Email validation failed', async function (value) {
                const { createError, path, parent } = this;
                try {
                  //await Yup.string().email().validate(value);
                  if (
                    value
                      .toLowerCase()
                      .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      )
                  ) {
                    // await onEmailValid(value);
                    const isEmailUsed = await onEmailValid(value);
                      if (!isEmailUsed) {
                        throw new Error('Email is already in use');
                      }
                  } else {
                    return true;
                  }

                  return true;
                } catch (error) {
                  throw createError({ path, message: error.message });
                }
              }),
            phone: Yup.string()
            .nullable()
            .notRequired()
            .test('phone-validation', 'Invalid phone number with country code', function (val) {
              if (val && val.length > 0) {
                return /^\+\d{1,3}(\s\d{1,5}){1,4}$/.test(val);
              }
              return true;
            })
            .test('len', 'Phone number must be at least 10 digits', function (val) {
              if (val && val.length > 0) {
                return val.replace(/\s+/g, '').length >= 10;
              }
              return true;
            }),
            isUpdate: Yup.boolean(),
          })
          .test(
            'at-least-one-contact',
            'At least one of name, email, or phone is required',
            function (value) {
              return !!value.name || !!value.email;
            }
          )
      )
      .required('At least one contact is required'),
    // Make sure there is at least one contact
  });

  const validationSchema1 = Yup.object().shape({
    name: Yup.string().max(255).required('Name is Required'),
    client_id: Yup.string().max(255).required('Client Id is Required'),
    customer_id: Yup.string().required('Customer is required'),
    status: Yup.string().max(255).required('Status is Required'),
    contacts: Yup.array()
      .of(
        Yup.object()
          .shape({
            name: Yup.string(),
            email: Yup.string()
              .email('Invalid email format')
              .required('Email is required')
              .test('email-validation-callback', 'Email validation failed', async function (value) {
                const { createError, path, parent } = this;
                try {
                  //await Yup.string().email().validate(value);
                  if (
                    value
                      .toLowerCase()
                      .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      )
                  ) {
                    // await onEmailValid(value);
                    const isEmailUsed = await onEmailValid(value);
                      if (!isEmailUsed) {
                        throw new Error('Email is already in use');
                      }
                  } else {
                    return true;
                  }

                  return true;
                } catch (error) {
                  throw createError({ path, message: error.message });
                }
              }),
            phone: Yup.string()
            .nullable()
            .notRequired()
            .test('phone-validation', 'Invalid phone number with country code', function (val) {
              if (val && val.length > 0) {
                return /^\+\d{1,3}(\s\d{1,5}){1,4}$/.test(val);
              }
              return true;
            })
            .test('len', 'Phone number must be at least 10 digits', function (val) {
              if (val && val.length > 0) {
                return val.replace(/\s+/g, '').length >= 10;
              }
              return true;
            }),
            isUpdate: Yup.boolean(),
          })
          .test(
            'at-least-one-contact',
            'At least one of name, email, or phone is required',
            function (value) {
              return !!value.name || !!value.email;
            }
          )
      )
      .required('At least one contact is required'),
    // Make sure there is at least one contact
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') ? validationSchema:validationSchema1,
    onSubmit: async (values, helpers): Promise<void> => {
      const formData = {
        ...values,
        control: values.contacts,
      };
  //     try {
  //       console.log(values, '11111111111111111111111111111111111111111111');
  //       console.log(sections, '22222222222222222222222222222222222222222222222222');
  //       if (sections.length < 1) {
  //         alert('At least three contacts are needed');
  //       } else {
  //         const nameLowerCase = values.name.replace(/\s+/g, '').toLowerCase()

  //         // if (createdClientIds.includes(values.client_id)) {
  //         //   toast.error('Client ID already exists');
  //         //   return;
  //         // }

  //         const createClient = await API.graphql(
  //           graphqlOperation(mutations.createClient, {
  //             input: {
  //               name: values.name,
  //               ps_client_id: values.client_id,
  //               customer_id:values.customer_id,
  //               status: values.status,
  //               nameLowerCase:nameLowerCase
  //             },
  //           })
  //         );

  //         await wait(500);
  //         if (createClient.data.createClient) {
  //           // setCreatedClientIds([...createdClientIds, createClient.data.createClient.id]);
  //           const createContacts = async (sections: any) => {
  //             const contactIds = [];
  //             console.log(sections, 'njjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
  //             for (const section of sections) {
  //               const numberformatedCasecontact = section.phone.replace(/\D/g, '');
  //               const user = {
  //                client_id: createClient.data.createClient.id,
  //                 alarm_level_phone: section.alarm_level_phone,
  //                 alarm_level_email: section.alarm_level_email,
  //                 alarm_level_sms: section.alarm_level_sms,
  //                 email: section.email,
  //                 name: section.name,
  //                 title: section.title,
  //                 // text: section.text,
  //                 phone: section.phone ? numberformatedCasecontact : null,
  //               };

  //               try {
  //                 const { data } = await API.graphql({
  //                   query: mutations.createContact,
  //                   variables: { input: user },
  //                 });

  //                 contactIds.push(data.createContact.id);
  //               } catch (error) {
  //                 console.error('Error creating contact:', error);
  //                 toast.error('Error creating contact: ' + error.message); // Display error message
  //               }
  //             }

  //             return contactIds;
  //           };

  //           // Usage example
  //           createContacts(sections).then((contactIds) => {
  //             console.log('Created contacts:', contactIds);
  //           });
  //         }
  //         toast.success('Client Created Successfully');
  //         router.back();
  //         helpers.setStatus({ success: true });
  //         helpers.setSubmitting(false);
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       toast.error('Something went wrong!');
  //       helpers.setStatus({ success: false });
  //       helpers.setErrors({ submit: err.message });
  //       helpers.setSubmitting(false);
  //     }
    },
  });

  


  const handleSubmit = async (values, helpers) => {
    const formData = {
      ...values,
      control: values.contacts,
    };
    try {
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      console.log(values,"valuess")
      console.log(sections,"sections")
      const nameLowerCase = values.name.replace(/\s+/g, '').toLowerCase();
      
      const clientIdExist = await API.graphql(graphqlOperation(queries.listClients,{
        filter: { ps_client_id: { eq: values.client_id } }
      }));
      if (clientIdExist.data.listClients.items.length > 0) {
        throw new Error('Client ID already exists.');
      }

      let input = {
        name: values.name,
        ps_client_id: values.client_id,
        status: values.status,
        nameLowerCase: nameLowerCase,
        access_status: 'Enabled',
      };
      
      if (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') {
        input.customer_id =customerId;
      }else{
        input.customer_id =values.customer_id;
      }


      const createClient = await API.graphql(
        graphqlOperation(mutations.createClient, {input})
    
      );

      await wait(500);
      if (createClient.data.createClient) {
        await inviteUser(
          values.contacts[0].email,
          values.contacts[0].email,
          values.contacts[0].phone ? `+${values.contacts[0].phone.replace(/\D/g, '')}` : null,
          'ClientMaster',
          input.customer_id,
          values.contacts[0].name,
          createClient.data.createClient.id,
        );
        
        const createContacts = async (sections: any) => {
          const contactIds = [];
          let cuscogfirstid = createClient.data.createClient.id;

          let isFirstLoop = true;
          let contactOrder = 1;

          for (const section of sections) {
            const nameLowerCasecontact = section.name.replace(/\s+/g, '').toLowerCase();
            const numberformatedCasecontact = section.phone.replace(/\D/g, '');
            const user = {
              client_id: createClient.data.createClient.id,
              alarm_level_phone: section.alarm_level_phone ? section.alarm_level_phone : null,
              alarm_level_email: section.alarm_level_email ? section.alarm_level_email : null,
              alarm_level_sms: section.alarm_level_sms ? section.alarm_level_sms : null,
              // name: section.name,
              title: section.title,
              phone: section.phone ? numberformatedCasecontact : null,
              contact_type: isFirstLoop ? 'Primary' : 'Secondary',
              contact_order: contactOrder,
              // nameLowerCase: nameLowerCasecontact,
              // text: section.text,
            };

            if (section.email) {
              user.email = section.email;
            }
            if (section.title) {
              user.title = section.title;
            }
            if (section.nameLowerCase) {
              user.nameLowerCase = nameLowerCasecontact;
            }

            if (section.name) {
              user.name = section.name;
            }

            if (section.phone) {
              user.phone = section.phone;
            }

            user.client_id = cuscogfirstid;
            user.access_status ="Enabled"

            try {
              const { data } = await API.graphql({
                query: mutations.createContact,
                variables: { input: user },
              });

              if (!isFirstLoop) {
                const formatedPhone = section.phone.replace(/\D/g, '');
                await inviteUser(
                  section.email,
                  section.email,
                  section.phone ? `+${formatedPhone}` : null,
                  'Client',
                  values.customer_id,
                  section.name,
                  createClient.data.createClient.id,
                );
              }
              contactOrder++;
              isFirstLoop = false;

              contactIds.push(data.createContact.id);
            } catch (error) {
              console.error('Error creating contact:', error);
              toast.error('Error creating contact:', error);
            }
          }

          return contactIds;
        };

        // Usage example
        createContacts(values.contacts).then((contactIds) => {
          console.log('Created contacts:', contactIds);
        });
      }
      toast.success('Client Created Successfully');
      helpers.setStatus({ success: true });
      helpers.setSubmitting(false);

      router.back();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
      helpers.setStatus({ success: false });
      helpers.setErrors({ submit: err.message });
      helpers.setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log(sections, 'ddddddddddddddddddddddddddddddddddid');
  }, [sections]);

  const Clientidget = async () => {
    setLoading(true);
    try {
      let response = await API.get('powersightrestapi', '/getAutoIncrementedID?tableName=Customer');

      if (response) {
        let img = response.id;
        console.log('clientid fetched successfully:', response.id);
        setreturncustomerid(response.id);
        return img;
      } else {
        throw new Error('Failed to fetch client ID: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching client ID: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Clientidget();
  }, []);



  const listCustomerGet = useCallback(async () => {
    try {
      const variables = {
        filter: {status: { eq: 'Active' } },
      };
      const assets = await API.graphql(graphqlOperation(queries.listCustomers, variables));
      // const sortedAssets = assets?.data?.listCustomers.sort((a, b) => a.name.localeCompare(b.name));
      // setcompanyname(sortedAssets);
      setcompanyname(assets?.data?.listCustomers);
    } catch (err) {
      console.error(err);
    }
  }, []);


  useEffect(() => {
    listCustomerGet();
  }, []);

  const sortedCustomers = companyname.items?.slice()?.sort((a, b) => {
    if (a?.name < b?.name) return -1;
    if (a?.name > b?.name) return 1;
    return 0;
  });

  const getvalidatephone = useCallback(async (index: any, formik: any, formattedValue: any) => {
    if (formattedValue) {
      try {
        const assets = await API.graphql(
          graphqlOperation(mutations.createPhone, {
            input: {
              phone: formattedValue,
            },
          })
        );

        formik.setFieldValue(`contacts.${index}.isUpdate`, 1);
        // toast.success('Phone number validated successfully');
      } catch (err) {
        console.error(err);
        formik.setFieldValue(`contacts.${index}.isUpdate`, 2);
        // toast.error('Failed to validate phone number');
      }
    } else {
      toast.error('Phone number is empty');
    }
  }, []);

  const hasInvalidPhoneNumber = formik.values.contacts.some(
    (contact) => !contact.isUpdate && contact.phone && !isPhoneNumberValid(contact.phone)
  );

  return (
    <>
      <Stack
        alignItems="flex-start"
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        spacing={4}
      >
        {/* <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Avatar
            src={customer.avatar}
            sx={{
              height: 64,
              width: 64,
            }}
          >
            {getInitials(customer.name)}
          </Avatar>
          <Stack spacing={1}>
            <Typography variant="h4">{customerdata?.user_name}</Typography>
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
              <Typography variant="subtitle2">user_id:</Typography>
              <Chip
                label={customerdata?.id}
                size="small"
              />
            </Stack>
          </Stack>
        </Stack> */}
      </Stack>
      {loading ? (
        <Typography variant="h5">Loading...</Typography>
      ) : (
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={(logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') ? validationSchema:validationSchema1}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form onSubmit={formik.handleSubmit}>
            <Card>
              <CardHeader title="Client" />
              <CardContent sx={{ pt: 0 }}>
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    xs={12}
                    md={3}
                  >
                    <TextField
                      fullWidth
                      label="Client name"
                      name="name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.name}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={
                        formik.touched.name && formik.errors.name ? formik.errors.name : ''
                      }
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    md={3}
                  >
                    <TextField
                      fullWidth
                      label="Client ID"
                      name="client_id"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      defaultValue="000000"
                      value={formik.values.client_id}
                      required
                      disabled // Make the field readonly
                      error={!!(formik.touched.client_id && formik.errors.client_id)}
                      helperText={formik.touched.client_id && formik.errors.client_id}
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    md={3}
                  >
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Status</InputLabel>
                      <Select
                        label="Status"
                        error={!!(formik.touched.status && formik.errors.status)}
                        fullWidth
                        displayEmpty
                        helperText={formik.touched.status && formik.errors.status}
                        name="status"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.status}
                        renderValue={(selected) => {
                          if (selected.length === 0) {
                            return <Typography></Typography>;
                          }
                          if (!Array.isArray(selected)) {
                            selected = [selected];
                          }
                          return selected.join(', ');
                        }}
                        required
                      >
                        {statusOptions.map((option) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
              {(logedinusergroup !== 'Customer' && logedinusergroup !== 'CustomerMaster' ) && (
                  <Grid
                    xs={12}
                    md={3}
                  >
                    <FormControl fullWidth>
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={sortedCustomers}
                        value={sortedCustomers?.find(
                          (option) => option.id === formik.values.customer_id
                        )}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') {
                            return option;
                          }
                          if (option.name) {
                            return option.name;
                          }

                          return option.ps_customer_id;
                        }}
                        onChange={(event, newValue) => {
                          formik.setFieldValue('customer_id', newValue ? newValue.id : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Customer"
                            // size="small"
                            name="customer_id"
                            onBlur={formik.handleBlur}
                            error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                            helperText={
                              formik.touched.customer_id && formik.errors.customer_id
                                ? formik.errors.customer_id
                                : ''
                            }
                          />
                        )}
                        renderOption={(props, option, { inputValue }) => {
                          const matches = match(option.name, inputValue, {
                            insideWords: true,
                          });
                          const parts = parse(option.name, matches);

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
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                  }}
                                >
                                  {option.ps_customer_id}
                                </div>
                              </div>
                            </li>
                          );
                        }}
                      />
                    </FormControl>
                  </Grid>
                )}
                </Grid>
              </CardContent>

              <Divider />

              <FieldArray name="contacts">
                {({ push, remove }) => (
                  <>
                    {Array.isArray(formik.values.contacts) &&
                      formik.values.contacts.map((_, index) => (
                        <CardContent key={index}>
                          <Typography
                            variant="h6"
                            sx={{ mb: 3 }}
                          >
                            Contact {index + 1}
                          </Typography>
                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <TextField
                                fullWidth
                                label="Name"
                                name={`contacts.${index}.name`}
                                error={
                                  formik.touched.contacts?.[index]?.name &&
                                  Boolean(formik.errors.contacts?.[index]?.name)
                                }
                                helperText={
                                  formik.touched.contacts?.[index]?.name &&
                                  formik.errors.contacts?.[index]?.name
                                }
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.contacts?.[index]?.name}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <TextField
                                error={
                                  formik.touched.contacts?.[index]?.name &&
                                  !!formik.errors.contacts?.[index]?.name
                                }
                                fullWidth
                                helperText={
                                  formik.touched.contacts?.[index]?.name &&
                                  formik.errors.contacts?.[index]?.name
                                }
                                label="Title"
                                name={`contacts.${index}.title`}
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.contacts?.[index]?.title}
                              />
                            </Grid>
                          </Grid>
                          <Grid
                            container
                            spacing={2}
                          >
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <TextField
                                error={
                                  formik.touched.contacts?.[index]?.email &&
                                  !!formik.errors.contacts?.[index]?.email
                                }
                                helperText={
                                  formik.touched.contacts?.[index]?.email &&
                                  formik.errors.contacts?.[index]?.email
                                }
                                fullWidth
                                label="Email"
                                name={`contacts.${index}.email`}
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.contacts?.[index]?.email}
                              />
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                  Alarm For Email
                                </InputLabel>
                                <Select
                                  label="Alarm For Email"
                                  fullWidth
                                  displayEmpty
                                  name={`contacts.${index}.alarm_level_email`}
                                  onBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  value={formik.values.contacts[index]?.alarm_level_email || 'None'}
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <Typography></Typography>;
                                    }
                                    if (!Array.isArray(selected)) {
                                      selected = [selected];
                                    }
                                    return selected.join(', ');
                                  }}
                                >
                                  {levelOptions.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <TextField
                                  label="Phone Number"
                                  country={'us'}
                                  className="phoneInputCustomStyle"
                                  style={{ flex: 1, height: '55px', marginRight: '5px' }}
                                  inputProps={{
                                    style: { height: '55px', width: 'calc(100% - 0px)' },
                                  }}
                                  value={formik.values.contacts[index]?.phone}
                                  onBlur={() => {
                                    formik.setFieldTouched(`contacts.${index}.phone`, true);
                                  }}
                                  onInput={(e) => {
                                    const inputValue = e.target.value;
                                    const phoneNumber = parsePhoneNumberFromString(
                                      inputValue,
                                      'US'
                                    );

                                    if (phoneNumber) {
                                      // If the input is a valid phone number
                                      const formattedValue = phoneNumber.formatInternational();
                                      formik.setFieldValue(
                                        `contacts.${index}.phone`,
                                        formattedValue
                                      );

                                      if (formattedValue.length > 9) {
                                        getvalidatephone(index, formik, formattedValue);
                                      }
                                      formik.setFieldValue(`contacts.${index}.isUpdate`, 0);
                                    } else {
                                      // If the input is not a valid phone number
                                      formik.setFieldValue(`contacts.${index}.phone`, inputValue);
                                    }
                                  }}
                                />
                                {(formik.values.contacts[index].isUpdate === 1 && formik.values.contacts?.[index].phone !== '') ? (
                                  <CheckCircleOutline style={{ color: 'green' }} />
                                ) : (formik.values.contacts[index].isUpdate === 2 && formik.errors.contacts?.[index]?.phone ) ? (
                                  <Clear style={{ color: 'red' }} />
                                ) : null}
                              </div>

                              {/* <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <PhoneInput
                                  country={'us'}
                                  className="phoneInputCustomStyle"
                                  style={{ flex: 1, height: '55px', marginRight: '5px' }}
                                  inputStyle={{
                                    height: '55px',
                                    width: 'calc(100% - 1px)',
                                  }}
                                  placeholder="Phone number"
                                  value={formik.values.contacts[index]?.phone}
                                  onBlur={() => {
                                    formik.setFieldTouched(`contacts.${index}.phone`, true);
                                  }}
                                  // isValid={(value, country) => {
                                  //   if (value.match(/12345/)) {
                                  //     return 'Invalid value: ' + value + ', ' + country.name;
                                  //   } else if (value.match(/1234/)) {
                                  //     return false;
                                  //   } else {
                                  //     return true;
                                  //   }
                                  // }}
                                  // onChange={(e) => {
                                  //   if (/^\d+$/.test(e)) {
                                  //     const formattedValue = '+' + e;
                                  //     formik.setFieldValue(
                                  //       `contacts.${index}.phone`,
                                  //       formattedValue
                                  //     );
                                  //     setphonenumber(formattedValue);

                                  //     formik.setFieldValue(`contacts.${index}.isUpdate`, 0);
                                  //   } else {
                                  //     formik.setFieldValue(`contacts.${index}.phone`, e);
                                  //   }
                                  //   console.log(e, 'juuuuuuuuuuuuuuuuuuuuuuu');
                                  // }}

                                  onChange={(e) => {
                                    let formattedValue;
                                    if (/^\d+$/.test(e)) {
                                      formattedValue = '+' + e;
                                      formik.setFieldValue(
                                        `contacts.${index}.phone`,
                                        formattedValue
                                      );
                                      // setphonenumber(formattedValue);

                                      if (formattedValue.length > 9) {
                                        getvalidatephone(index, formik, formattedValue);
                                      }
                                      formik.setFieldValue(`contacts.${index}.isUpdate`, 0);
                                    } else {
                                      formattedValue = e;
                                      formik.setFieldValue(`contacts.${index}.phone`, e);
                                    }
                                    console.log(formattedValue.length, 'juuuuuuuuuuuuuuuuuuuuuuu');
                                  }}
                                />
                                {formik.values.contacts[index].isUpdate === 1 ? (
                                  <CheckCircleOutline style={{ color: 'green' }} />
                                ) : formik.values.contacts[index].isUpdate === 2 ? (
                                  <Clear style={{ color: 'red' }} />
                                ) : null}
                              </div> */}

                              {/* <PhoneInput
                                country={'us'}
                                className="phoneInputCustomStyle"
                                style={{ width: '100%', height: '55px' }}
                                inputStyle={{ height: '55px', width: '100%' }}
                                placeholder="Phone number"
                                value={formik.values.contacts[index]?.phone}
                                onBlur={() => {
                                  formik.setFieldTouched(`contacts.${index}.phone`, true);
                                  // formik.validateField(`contacts.${index}.phone`);
                                }}
                                onChange={(e) => {
                                  // Check if the value contains only digits
                                  if (/^\d+$/.test(e)) {
                                    // Prepend '+' prefix to the value
                                    const formattedValue = '+' + e;
                                    formik.setFieldValue(`contacts.${index}.phone`, formattedValue);
                                  } else {
                                    // If the value contains non-digit characters, set the value as it is
                                    formik.setFieldValue(`contacts.${index}.phone`, e);
                                  }
                                  console.log(e, 'juuuuuuuuuuuuuuuuuuuuuuu');
                                }}
                              />

                              <Button
                                variant="contained"
                                sx={{ marginTop: 5 }}
                              >
                                Validate
                              </Button> */}

                              {formik.touched.contacts?.[index]?.phone &&
                                formik.errors.contacts?.[index]?.phone && (
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: 'red',
                                    }}
                                  >
                                    {formik.errors.contacts?.[index]?.phone}
                                  </Typography>
                                )}
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">
                                  Alarm For Phone
                                </InputLabel>
                                <Select
                                  label="Alarm For Phone"
                                  error={
                                    !!(
                                      formik.touched.contacts?.[index]?.alarm_level_phone &&
                                      formik.errors.contacts?.[index]?.alarm_level_phone
                                    )
                                  }
                                  fullWidth
                                  displayEmpty
                                  helperText={
                                    formik.touched.contacts?.[index]?.alarm_level_phone &&
                                    formik.errors.contacts?.[index]?.alarm_level_phone
                                  }
                                  name={`contacts.${index}.alarm_level_phone`}
                                  onBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  value={formik.values.contacts[index]?.alarm_level_phone || 'None'}
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <Typography></Typography>;
                                    }
                                    if (!Array.isArray(selected)) {
                                      selected = [selected];
                                    }
                                    return selected.join(', ');
                                  }}
                                >
                                  {levelOptions.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Alarm For SMS</InputLabel>
                                <Select
                                  label="Alarm For SMS"
                                  error={
                                    !!(
                                      formik.touched.contacts?.[index]?.alarm_level_sms &&
                                      formik.errors.contacts?.[index]?.alarm_level_sms
                                    )
                                  }
                                  fullWidth
                                  displayEmpty
                                  helperText={
                                    formik.touched.contacts?.[index]?.alarm_level_sms &&
                                    formik.errors.contacts?.[index]?.alarm_level_sms
                                  }
                                  name={`contacts.${index}.alarm_level_sms`}
                                  onBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  value={formik.values.contacts[index]?.alarm_level_sms || 'None'}
                                  renderValue={(selected) => {
                                    if (!selected) {
                                      return <Typography></Typography>;
                                    }
                                    if (!Array.isArray(selected)) {
                                      selected = [selected];
                                    }
                                    return selected.join(', ');
                                  }}
                                >
                                  {levelOptions.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                          <Grid
                            container
                            spacing={3}
                          >
                            <Grid
                              item
                              xs={12}
                              md={4}
                            >
                              <Button
                                variant="outlined"
                                onClick={() => remove(index)}
                              >
                                Remove Contact
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      ))}
                    <Grid sx={{ textAlign: 'right', mb: 2, mt: 1 }}>
                      <Button
                        variant="contained"
                        sx={{ marginRight: 1 }}
                        onClick={() =>
                          push({
                            name: '',
                            email: '',
                            title: '',
                            phone: '',
                            alarm_level_phone: '',
                            alarm_level_email: '',
                            alarm_level_sms: '',
                            isUpdate: false,
                          })
                        }
                      >
                        Add Contact
                      </Button>
                    </Grid>
                  </>
                )}
              </FieldArray>
            </Card>
            <ErrorMessage name="contacts">
              {(msg) => (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ marginLeft: 2, marginTop: 2 }}
                >
                  At least Enter either name or phone or email
                  {/* Access the specific property, like email */}
                </Typography>
              )}
            </ErrorMessage>

            {formik.touched.contacts &&
              formik.values.contacts.map((contact, index) => (
                <div key={index}>
                  {!contact.isUpdate &&
                    contact.phone && ( // Check if phone number is not empty
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: 'red',
                          marginTop: 1,
                        }}
                      >
                        <div>Validate phone number</div>
                      </Typography>
                    )}
                </div>
              ))}

            {formik.values.contacts.length === 0 && (
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'red',
                  marginTop: 1,
                }}
              >
                At least one contact is required
              </Typography>
            )}

            <Button
              disabled={
                formik.isSubmitting || formik.values.contacts.length === 0 || hasInvalidPhoneNumber
              }
              type="submit"
              variant="contained"
              sx={{ marginTop: 5 }}
            >
              Create
            </Button>
          </Form>
        )}
      </Formik>
      )}
    </>
  );
};

ClientCreateForm.propTypes = {
  // @ts-ignore
  client: PropTypes.object.isRequired,
};
