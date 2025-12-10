import { CheckCircleOutline, Clear } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select
} from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import AWS from 'aws-sdk';
import { ErrorMessage, FieldArray, Form, Formik } from 'formik';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import type { FC } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import 'react-phone-input-2/lib/style.css';
import 'react-phone-number-input/style.css';
import type { Client } from 'src/types/client';
import { wait } from 'src/utils/wait';
import * as Yup from 'yup';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface ClientEditFormProps {
  client: Client;
}
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
export const ClientEditForm: FC<ClientEditFormProps> = (props: any) => {
  const [sections, setSections] = useState([
    {
      client_id: '',
      name: '',
      email: '',
      title: '',
      text: '',
      phone: '',
      alarm_level_email: '',
      alarm_level_phone: '',
      alarm_level_sms: '',
    },
  ]);
  const router = useRouter();
  const { id } = router.query;
  console.log(id, 'kppppppppppppppppppppppppppppppppppppppppppppppppppp');
  // const pathnameParts = router.asPath.split('/');
  // const id = pathnameParts[pathnameParts.length - 2]; // Assuming the id is the second-to-last segment of the path
  const [clientdata, setclientdata] = useState();
  const [contactdata, setcontactdata] = useState<any>([]);
  const [removeSectionid, setremoveSectionid] = useState();
  const [removeid, setremoveid] = useState<any>();
  const [companyname, setcompanyname] = useState('');
  const [selectedContact, setSelectedContact] = useState();
  console.log(selectedContact,"selected contact")
  const [selectedContactId, setSelectedContactId] = useState();
  const [selectedUser, setSelectedUser] = useState();
  console.log(selectedUser,"selected user")

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const levelOptions = [
    { value: 'None', label: 'None' },
    { value: 'Level_1', label: 'Level_1' },
    { value: 'Level_2', label: 'Level_2' },
    { value: 'Level_3', label: 'Level_3' },
  ];

  const getclient = useCallback(async () => {
    if (id) {
      try {
        const assets = await API.graphql(
          graphqlOperation(queries.getClient, {
            id: id,
          })
        );
        console.log(assets.data.getClient, 'clearassetttttttttttttttttttttttttttttt');
        setclientdata(assets.data.getClient);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

  const listCustomerGet = useCallback(async () => {
    try {
      const variables = {
        filter: { status: { eq: 'Active' } },
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

  const getContact = useCallback(async () => {
    if (id) {
      try {
        const assets = await API.graphql(
          graphqlOperation(queries.getContactByClient, {
            client_id: id,
          })
        );
        console.log(assets.data.getContactByClient, 'clearassetttttttttttttttttttttttttttttt');
        setcontactdata(assets.data.getContactByClient.items);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

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

  const removeClientFromGroup = useCallback(
    async (username, group) => {
      let token = await Auth.currentSession();
      console.log(token.getAccessToken(), 'token');
      let apiName = 'AdminQueries';
      let path = '/removeUserFromGroup';
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

  const inviteUser = (username, email, phoneNumber, group, customerId, name, clientId) => {
    // alert(1)
    // console.log(username, email, phoneNumber, group, customerId, name,"invite user")
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
    // console.log(UserAttributes,"attributes")

    if (phoneNumber) {
      UserAttributes.push({
        Name: 'phone_number',
        Value: phoneNumber.replace(/\s+/g, ''),
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
    getContact();
    getclient();
  }, [id]);

  // const addSection = () => {
  //   const newSection = {
  //     //id: sections.length + 1,
  //     name: '',
  //     email: '',
  //     title: '',
  //     text: '',
  //     phone: '',
  //     alarm_level_email: '',
  //     alarm_level_phone: '',
  //     alarm_level_sms: '',
  //   };
  //   setSections([...sections, newSection]);
  // };

  // useEffect(() => {
  //   const newSection = {
  //     id: '',
  //     name: '',
  //     email: '',
  //     title: '',
  //     text: '',
  //     phone: '',
  //     alarm_level_email: '',
  //     alarm_level_phone: '',
  //     alarm_level_sms: '',
  //   };
  //   setSections([...contactdata]);
  // }, [contactdata]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [open1, setOpen1] = React.useState(false);
  const handleClose1 = () => setOpen1(false);

  const [open2, setOpen2] = React.useState(false);
  const handleClose2 = () => {setOpen2(false);
    // setSelectedContact('')
  };

  const [open3, setOpen3] = React.useState(false);
  const handleClose3 = () => {setOpen3(false);
    // setSelectedContact('')
  };

  const [open4, setOpen4] = React.useState(false);
  const handleClose4 = () => setOpen4(false);

  const [open5, setOpen5] = React.useState(false);
  const handleClose5 = () => setOpen5(false);

  const [open6, setOpen6] = React.useState(false);
  const handleClose6 = () => setOpen6(false);

  const [phonenumber, setphonenumber] = useState();
  // const [currentEditIndex, setCurrentEditIndex] = useState(null);

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
      } catch (error) {
        console.error('Error configuring AWS:', error);
      }
    };

    configureAWS();
  }, [Auth]);

  const removeSection = async (id) => {
    try {
      const updatedSections = sections.filter((section) => section.id !== id);
      setSections(updatedSections);
      if (id) {
        await API.graphql({
          query: mutations.deleteContact,
          variables: { input: { id } },
        });

        toast.success(`Contact removed successfully.`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error(`Error removing Contact.`);
    }
  };

  const deleteContact = async (username) => {
    console.log(username,"username")
    const cognito = new AWS.CognitoIdentityServiceProvider();

    const params = {
      UserPoolId: 'us-west-1_F0uiXhSAc',
      Username: username,
      // DesiredDeliveryMediums: ['EMAIL'],
      // UserAttributes: UserAttributes,
    };

    try {
      const data = await new Promise((resolve, reject) => {
      cognito.adminDeleteUser(params, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    return data;
    } catch (error) {
    if (error.code === 'UserNotFoundException') {
      console.error('User not found:', username);
      await getContact();
    }}
    };

 
  const disableUser = useCallback ( async ( ) => {
    try {
      // Get the current authenticated user's session
      const currentSession = await Auth.currentSession();
      const idToken        = currentSession.getIdToken().getJwtToken();

      console.log(currentSession,'currentSession')
      const apiName = 'AdminQueries';
      const path    = selectedContact.access_status == "Enabled" ? '/disableUser' : '/enableUser';

      await API.graphql(
        graphqlOperation(mutations.updateContact, {
          input: {
            id: selectedContactId,
            access_status: selectedContact.access_status == "Enabled" ? "Disabled" : "Enabled",
          },
        })
      );

        const myInit  = {
          body: {
            username: selectedContact?.email,
          },
          headers: {
            'Content-Type' : 'application/json',
            Authorization: `${currentSession.getAccessToken().getJwtToken()}`
          }
        };
  
        const response = await API.post(apiName, path, myInit);
      
      console.log('User disabled successfully:', response);
      setSelectedContact('')
    } catch (error) {
      console.error('Error disabling user:', error);
      
    }
  },[selectedContact, selectedContactId]);

  const userGroup = selectedUser?.contact_type === 'Primary' ? 'ClientMaster' : 'Client';

  const resetUserPassword = useCallback(() => { 
    //AWS.config.update({ region: 'us-west-1' });

    const cognito = new AWS.CognitoIdentityServiceProvider();
    console.log(selectedUser,selectedContact,'Callback selectedContact')
    const username = selectedContact;
    const params = {
        UserPoolId: 'us-west-1_F0uiXhSAc',
        Username: username,
    };

    return new Promise((resolve, reject) => {
        cognito.adminResetUserPassword(params, (err, data) => {
            if (err) {
                // console.error('Error in adminResetUserPassword:', err); 
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
    .then((data) => {
        handleClose3();
        console.log('Password reset successful', data);
        return data; // Optionally return data to caller if needed
    })
    .catch(async(err) => {
      console.log(err.code,'Inside Error Log---')
        // console.error('Error caught in promise chain:', err);
        if (err.code === 'NotAuthorizedException') {
          await deleteContact(selectedContact);
          await inviteUser(selectedContact, selectedContact, selectedUser.phone, userGroup, selectedUser.customer_id, selectedUser.name, selectedUser.client_id);
            // console.error('Not authorized to perform this operation. Please check your AWS credentials and permissions.');
        }
        if (err.code === 'UserNotFoundException') {
          // console.error('User not found')
          await inviteUser(selectedContact, selectedContact, selectedUser.phone, userGroup, selectedUser.customer_id, selectedUser.name, selectedUser.client_id);
        }
        // throw err; 
    });
}, [selectedContact, selectedUser]);

  // const handleChange = (e, id) => {
  //   const { name, value } = e.target;
  //   const updatedSections = sections.map((section, index) => {
  //     if (index === id) {
  //       return { ...section, [name]: value };
  //     }
  //     return section;
  //   });
  //   setSections(updatedSections);
  //   const updatedFormikSections = formik.values.sections.map((section) => {
  //     if (section.id === id) {
  //       return { ...section, [name]: value };
  //     }
  //     return section;
  //   });
  //   formik.setFieldValue('sections', updatedFormikSections);
  // };

  const { customer, client, ...other } = props;

  // useEffect(() => {
  //   const newSections = contactdata.map((contact) => ({
  //     id: contact.id, // Assuming contact has a unique identifier
  //     names: contact.name || '',
  //     email: contact.email || '',
  //     title: contact.title || '',
  //     phone: contact.phone || '',
  //     alarm_level_email: contact.alarm_level_email || '',
  //     alarm_level_phone: contact.alarm_level_phone || '',
  //     alarm_level_sms: contact.alarm_level_sms || '',
  //   }));
  //   setSections(newSections);
  // }, [contactdata]);


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

    const formatPhoneNumber = (phone) => {

      if (!phone) return '';
      const phoneNumber = parsePhoneNumberFromString(
        phone,
        'US'
      );
  
      if (phoneNumber) {
        return phoneNumber.formatInternational();
      }
      return '';
  
    };

  const initialValues = {
    name: clientdata?.name || '',
    client_id: clientdata?.ps_client_id || '',
    customer_id: clientdata?.customer_id || '',
    customer_name:clientdata?.customer?.name || '',
    status: clientdata?.status || '',
    contacts: contactdata
    .sort((a, b) => a.contact_order - b.contact_order)
    .map((contact) => ({
      id: contact.id || '',
      name: contact.name || '',
      email: contact.email || '',
      title: contact.title || '',
      phone: formatPhoneNumber(contact.phone) || '',
      alarm_level_email: contact.alarm_level_email || '',
      alarm_level_phone: contact.alarm_level_phone || '',
      alarm_level_sms: contact.alarm_level_sms || '',
      isUpdate: 1,
      access_status: contact.access_status || '',
      contact_type: contact.contact_type || '',
      client_id: contact.client_id || '',
      contact_order: contact.contact_order || 0,
    })),
  };
  console.log(initialValues, 'ttttttt');

  const onEmailValid = async (value) => {
    try {
      const response = await getUsers(value);
      console.log(response, 'response');
      console.log(response.Enabled, 'kkk');

      return false;
    } catch (error) {
      console.error('API error:', error);
      return true;
    }
  };

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

  const validationSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is Required'),
    client_id: Yup.string().max(255).required('Customer Id is Required'),
    status: Yup.string().max(255).required('Status is Required'),
    contacts: Yup.array()
      .of(
        Yup.object()
          .shape({
            name: Yup.string(),
            email: Yup.string()
              .email('Invalid email')
              .required('Email is Required')
              .test('email-validation-callback', 'Email validation failed', async function (value, context) {
                const { createError, path, parent } = this;
                const readOnly = parent.id ? true : false;
                if (readOnly) {
                  return true;  // Skip validation if readOnly is true
                }
                try {
                  //await Yup.string().email().validate(value);
                  if (
                    value
                      .toLowerCase()
                      .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      )
                  ) 
                  //await onEmailValid(value);
                  {
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
              // Check if any of name, email, or phone is filled
              return !!value.name || !!value.email;
            }
          )
      )
      .required('At least one contact is required'),
  });
  const validationSchema1 = Yup.object().shape({
    name: Yup.string().max(255).required('Name is Required'),
    client_id: Yup.string().max(255).required('Customer Id is Required'),
    customer_id: Yup.string().required('Customer is required'),
    status: Yup.string().max(255).required('Status is Required'),
    contacts: Yup.array()
      .of(
        Yup.object()
          .shape({
            name: Yup.string(),
            email: Yup.string()
              .email('Invalid email')
              .required('Email is Required')
              .test('email-validation-callback', 'Email validation failed', async function (value, context) {
                const { createError, path, parent } = this;
                const readOnly = parent.id ? true : false;
                if (readOnly) {
                  return true;  // Skip validation if readOnly is true
                }
                try {
                  //await Yup.string().email().validate(value);
                  if (
                    value
                      .toLowerCase()
                      .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                      )
                  ) 
                  //await onEmailValid(value);
                  {
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
              // Check if any of name, email, or phone is filled
              return !!value.name || !!value.email;
            }
          )
      )
      .required('At least one contact is required'),
  });

  const handleSubmit = async (values, helpers) => {
    const formData = {
      ...values,
      control: values.contacts,
    };
    try {
      let createClientResponse;
      const nameLowerCase = values.name.replace(/\s+/g, '').toLowerCase();
      if (clientdata?.id) {
        createClientResponse = await API.graphql(
          graphqlOperation(mutations.updateClient, {
            input: {
              id: clientdata.id,
              name: values.name,
              ps_client_id: values.client_id,
              customer_id: values.customer_id,
              status: values.status,
              nameLowerCase: nameLowerCase,
            },
          })
        );
      } else {
        createClientResponse = await API.graphql(
          graphqlOperation(mutations.createClient, {
            input: {
              name: values.name,
              ps_client: values.client_id,
              customer_id: values.customer_id,
              status: values.status,
              nameLowerCase: nameLowerCase,
            },
          })
        );
      }
      const createdClient =
        createClientResponse.data.createClient || createClientResponse.data.updateClient;
      await wait(500);
      if (createdClient) {
        const createContacts = async (sections: any) => {
          const contactIds = [];

          for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const nameLowerCasecontact = values.contacts[i]?.name
              ? values.contacts[i].name.replace(/\s+/g, '').toLowerCase()
              : section.name.replace(/\s+/g, '').toLowerCase(); // Fallback to section.name if values.contacts[i]?.names is not provided
            const numberformatedCasecontact = values.contacts[i]?.phone.replace(/\D/g, '');
            const user = {
              client_id: createdClient.id,
              id: section.id,
              // Assuming this is the contact ID
              alarm_level_phone:
                values.contacts[i]?.alarm_level_phone !== undefined &&
                values.contacts[i]?.alarm_level_phone !== null &&
                values.contacts[i]?.alarm_level_phone != ''
                  ? values.contacts[i].alarm_level_phone
                  : null,

              alarm_level_email:
                values.contacts[i]?.alarm_level_email !== undefined &&
                values.contacts[i]?.alarm_level_email !== null &&
                values.contacts[i]?.alarm_level_email != ''
                  ? values.contacts[i].alarm_level_email
                  : null,

              alarm_level_sms:
                values.contacts[i]?.alarm_level_sms !== undefined &&
                values.contacts[i]?.alarm_level_sms !== null &&
                values.contacts[i]?.alarm_level_sms != ''
                  ? values.contacts[i].alarm_level_sms
                  : null,

              // email: values.contacts[i]?.email || section.email,
              // name: values.contacts[i]?.names || section.name,
              title: values.contacts[i]?.title || section.title,
              phone: numberformatedCasecontact || section.phone,
              nameLowerCase: nameLowerCasecontact,
            };

            if (values.contacts[i]?.name) {
              user.name = values.contacts[i]?.name;
            } else {
              user.name = null;
            }

            if (nameLowerCasecontact) {
              user.nameLowerCase = nameLowerCasecontact;
            } else {
              user.nameLowerCase = null;
            }
            if (values.contacts[i]?.email) {
              user.email = values.contacts[i]?.email;
            } else {
              user.email = null;
            }

            if (values.contacts[i]?.phone) {
              user.phone = numberformatedCasecontact;
            } else {
              user.phone = null;
            }
            user.access_status = "Enabled";

            const nameLowerCasecontact1 = values.contacts[i]?.name
              ? values.contacts[i].name.replace(/\s+/g, '').toLowerCase()
              : '';
            const numberformatedCasecontact1 = values.contacts[i]?.phone.replace(/\D/g, '');

            const usercreate = {
              client_id: createdClient?.id,
              alarm_level_phone: values.contacts[i]?.alarm_level_phone
                ? values.contacts[i].alarm_level_phone
                : null,
              alarm_level_email: values.contacts[i]?.alarm_level_email
                ? values.contacts[i].alarm_level_email
                : null,
              alarm_level_sms: values.contacts[i]?.alarm_level_sms
                ? values.contacts[i].alarm_level_sms
                : null,

              // name: values.contacts[i]?.names,
              title: values.contacts[i]?.title,

              // nameLowerCase: nameLowerCasecontact1,
            };

            if (values.contacts[i]?.name) {
              usercreate.name = values.contacts[i]?.name;
            }

            if (nameLowerCasecontact1) {
              usercreate.nameLowerCase = nameLowerCasecontact1;
            }

            if (values.contacts[i]?.email) {
              usercreate.email = values.contacts[i]?.email;
            }

            if (values.contacts[i]?.phone) {
              usercreate.phone = numberformatedCasecontact1;
            }
            usercreate.access_status="Enabled";
            usercreate.contact_type = "Secondary";
            usercreate.contact_order = i + 1 ;
            try {
              let contactMutationResponse;

              if (section.id) {
                contactMutationResponse = await API.graphql({
                  query: mutations.updateContact,
                  variables: { input: user },
                });
              } else {
                contactMutationResponse = await API.graphql({
                  query: mutations.createContact,
                  variables: { input: usercreate },
                });
                await inviteUser(
                  values.contacts[i].email,
                  values.contacts[i].email,
                  values.contacts[i].phone ? `+${values.contacts[i].phone.replace(/\D/g, '')}` : null,
                  'Client',
                  // contactMutationResponse.data.updateContact.id,
                  values.customer_id,
                  values.contacts[i].name,
                  createdClient?.id,
                  // createCustomer.data.createCustomer.name
                );
              }
              contactIds.push(
                contactMutationResponse.data.createContact.id ||
                  contactMutationResponse.data.updateContact.id
              );
            } catch (error) {
              // const errorMessage = error.errors[0]?.message;
              // console.error('Error creating/updating contact:', errorMessage);
              //toast.error('Error creating/updating contact:', error);
            }
          }
          return contactIds;
        };

        await createContacts(values.contacts);

        // createContacts(values.contacts).then((contactIds) => {
        //   console.log('Created/Updated contacts:', contactIds);
        // });
      }

      toast.success('Client Updated Successfully');
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
  const goBack = () => {
    router.back();
  };

  const removecustomer = async (customerid: any) => {
    try {
      let img = await API.del('powersightrestapi', '/batchDeleteCustomer', {
        body: {
          customerId: customerid,
        },
      });
      toast.success('Customer removed successfully');
      router.back();

      // setdeleterefresh('success');
      return img;
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing customer: ' + error.message);
      throw error;
    }
  };

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

  const handleMarkasPrimary = (async (contact) => {    
    try {
     await removeClientFromGroup(contact.email, 'Client');      
    
    await API.graphql(graphqlOperation(mutations.updateContact, { 
      input: {
        id: contact.id,
        contact_type: "Primary",
      },
    }));
    await addCustomerToGroup(contact.email, 'ClientMaster');
    
    toast.success('Contact marked as primary');
    } catch (err) {
      console.error('Error marking contact as primary:', err);
      toast.error('Failed to mark contact as primary');
    }
  });

  const handleMarkasSecondary = (async (contact) => {    
    try {
      
      await removeClientFromGroup(contact.email, 'ClientMaster');      
    
      await API.graphql(graphqlOperation(mutations.updateContact, { 
        input: {
          id: contact.id,
          contact_type: "Secondary",
        },
      }));
      await addCustomerToGroup(contact.email, 'Client');
    
    toast.success('Contact marked as secondary');
    } catch (err) {
      console.error('Error marking contact as secondary:', err);
      toast.error('Failed to mark contact as secondary');
    }
  });

  // const formik = useFormik(
  //   {
  //     initialValues: {
  //       name: customerdata?.name || '',
  //       customer_id: customerdata?.ps_customer_id || '',
  //       status: customerdata?.status || '',
  //       sections: contactdata.map((contact) => ({
  //         name: contact.name || '',
  //         email: contact.email || '',
  //         title: contact.title || '',
  //         phone: contact.phone || '',
  //         alarm_level_email: contact.alarm_level_email || '',
  //         alarm_level_phone: contact.alarm_level_phone || '',
  //         alarm_level_sms: contact.alarm_level_sms || '',
  //       })),
  //     },
  //     validationSchema: Yup.object({
  //       name: Yup.string().max(255).required('Name is Required'),
  //       customer_id: Yup.string().max(255).required('Customer Id is Required'),
  //       status: Yup.string().max(255).required('Status is Required'),
  //     }),

  //     enableReinitialize: true,
  //     onSubmit: async (values, helpers): Promise<void> => {
  //       const formData = {
  //         ...values,
  //         control: sections,
  //       };
  //       try {
  //         let createCustomerResponse;
  //         if (customerdata?.id) {
  //           createCustomerResponse = await API.graphql(
  //             graphqlOperation(mutations.updateCustomer, {
  //               input: {
  //                 id: customerdata.id,
  //                 name: values.name,
  //                 ps_customer_id: values.customer_id,
  //                 status: values.status,
  //               },
  //             })
  //           );
  //         } else {
  //           createCustomerResponse = await API.graphql(
  //             graphqlOperation(mutations.createCustomer, {
  //               input: {
  //                 name: values.name,
  //                 ps_customer_id: values.customer_id,
  //                 status: values.status,
  //               },
  //             })
  //           );
  //         }
  //         const createdCustomer =
  //           createCustomerResponse.data.createCustomer ||
  //           createCustomerResponse.data.updateCustomer;

  //         await wait(500);

  //         if (createdCustomer) {
  //           const createContacts = async (sections: any) => {
  //             const contactIds = [];
  //             for (const section of sections) {
  //               const user = {
  //                 customer_id: createdCustomer.id,
  //                 id: section.id,
  //                 alarm_level_phone: section.alarm_level_phone,
  //                 alarm_level_email: section.alarm_level_email,
  //                 alarm_level_sms: section.alarm_level_sms,
  //                 email: section.email,
  //                 name: section.name,
  //                 title: section.title,
  //                 phone: section.phone,
  //               };
  //               const usercreate = {
  //                 customer_id: createdCustomer.id,
  //                 phone: section.phone,
  //                 alarm_level_phone: section.alarm_level_phone,
  //                 alarm_level_email: section.alarm_level_email,
  //                 alarm_level_sms: section.alarm_level_sms,
  //                 email: section.email,
  //                 name: section.name,
  //                 title: section.title,
  //               };

  //               try {
  //                 let contactMutationResponse;
  //                 if (section.id) {
  //                   contactMutationResponse = await API.graphql({
  //                     query: mutations.updateContact,
  //                     variables: { input: user },
  //                   });
  //                 } else {
  //                   contactMutationResponse = await API.graphql({
  //                     query: mutations.createContact,
  //                     variables: { input: usercreate },
  //                   });
  //                 }
  //                 contactIds.push(
  //                   contactMutationResponse.data.createContact.id ||
  //                     contactMutationResponse.data.updateContact.id
  //                 );
  //               } catch (error) {
  //                 console.error('Error creating/updating contact:', error);
  //               }
  //             }
  //             return contactIds;
  //           };

  //           createContacts(sections).then((contactIds) => {
  //             console.log('Created/Updated contacts:', contactIds);
  //           });
  //         }

  //         toast.success('Customer And Contact Created/Updated Successfully');
  //         router.back();
  //         helpers.setStatus({ success: true });
  //         helpers.setSubmitting(false);
  //       } catch (err) {
  //         console.error(err);
  //         toast.error('Something went wrong!');
  //         helpers.setStatus({ success: false });
  //         helpers.setErrors({ submit: err.message });
  //         helpers.setSubmitting(false);
  //       }
  //     },
  //   },
  //   []
  // );

  return (
    <>
      <Grid
        container
        spacing={1}
        style={{ justifyContent: 'flex-end', marginLeft: '600px', alignItems: 'flex-start' }}
      >
        <Grid
          item
          style={{ marginTop: '-35px' }}
          xs={12}
          md={4}
        >
          <Button
            onClick={() => {
              setOpen1(true);
            }}
            size="small"
            variant="outlined"
            color="error"
            startIcon={
              <SvgIcon>
                <DeleteIcon />
              </SvgIcon>
            }
          >
            Delete
          </Button>
        </Grid>
      </Grid>
      <Formik
        initialValues={initialValues}
        validationSchema={(logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') ? validationSchema:validationSchema1}
        enableReinitialize={true}
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
                      error={Boolean(formik.touched.name && formik.errors.name)}
                      fullWidth
                      helperText={formik.touched.name && formik.errors.name}
                      label="Client name"
                      name="name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.name}
                      required
                      autocomplete="off"
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    md={3}
                  >
                    <TextField
                      error={!!(formik.touched.client_id && formik.errors.client_id)}
                      fullWidth
                      helperText={formik.touched.client_id && formik.errors.client_id}
                      label="Client ID"
                      disabled
                      name="client_id"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.client_id}
                      required
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
                        options={[]}
                        // value={{name:formik.getFieldProps('customer_name')}}
                        // value={sortedCustomers?.find(
                        //   (option) =>
                        //     option.id === clientdata?.customer_id || formik.values.customer_id
                        // )}
                        value={
                          sortedCustomers?.find(option => option.name === formik.values.customer_name) || null
                        }
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') {
                            return option;
                          }
                          if (option.name) {
                            return option.name;
                          }

                          return option.ps_customer_id;
                        }}
                        onChange = {null}
                        // onChange={(event, newValue) => {
                        //   formik.setFieldValue('customer_id', newValue ? newValue.id : '');
                        //   formik.setFieldValue('customer_name', newValue ? newValue.name : '');
                        // }}
                        PaperComponent={({ children }) => <div style={{ display: 'none' }}>{children}</div>}
                        clearIcon={null}
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
                            InputProps={{
                              ...params.InputProps,
                              readOnly: true,  // This makes the field read-only
                              // disabled: true,
                              endAdornment: null
                            }}
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
                          <Grid container spacing={1}>
                          <Grid item xs={12} md={1}>
                          <Typography
                            variant="h6"
                            sx={{ mb: 1 }}
                          >
                            Contact {index + 1}
                          </Typography>
                          </Grid>
                          <Grid item xs={12} md={2}>
                              <Chip
                                label={formik.values.contacts[index].contact_type}
                                style={{ backgroundColor: formik.values.contacts[index].contact_type === 'Primary' ? 'green' 
                                                        : formik.values.contacts[index].contact_type === 'Secondary' ? 'red' 
                                                        : 'white', 
                                        color: formik.values.contacts[index].forecolor || 'white' }}
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
                                  formik.touched.contacts?.[index]?.name &&
                                  !!formik.errors.contacts?.[index]?.name
                                }
                                fullWidth
                                helperText={
                                  formik.touched.contacts?.[index]?.name &&
                                  formik.errors.contacts?.[index]?.name
                                }
                                label="Name"
                                name={`contacts.${index}.name`}
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
                                  formik.touched.contacts?.[index]?.title &&
                                  !!formik.errors.contacts?.[index]?.title
                                }
                                fullWidth
                                helperText={
                                  formik.touched.contacts?.[index]?.title &&
                                  formik.errors.contacts?.[index]?.title
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
                                  error={
                                    !!(
                                      formik.touched.contacts?.[index]?.alarm_level_email &&
                                      formik.errors.contacts?.[index]?.alarm_level_email
                                    )
                                  }
                                  fullWidth
                                  displayEmpty
                                  helperText={
                                    formik.touched.contacts?.[index]?.alarm_level_email &&
                                    formik.errors.contacts?.[index]?.alarm_level_email
                                  }
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
                                {/* <PhoneInput
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
                                  onChange={(e) => {
                                    if (/^\d+$/.test(e)) {
                                      const formattedValue = '+' + e;
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
                                      formik.setFieldValue(`contacts.${index}.phone`, e);
                                    }
                                    console.log(e, 'juuuuuuuuuuuuuuuuuuuuuuu');
                                  }}
                                /> */}
                                <TextField
                                  country={'us'}
                                  className="phoneInputCustomStyle"
                                  name={`contacts.${index}.phone`}
                                  style={{ flex: 1, height: '55px', marginRight: '5px' }}
                                  inputProps={{
                                    style: { height: '55px', width: 'calc(100% - 1px)' },
                                  }}
                                  placeholder="Phone number"
                                  value={formik.values.contacts[index]?.phone}
                                  onBlur={() => {
                                    formik.setFieldTouched(`contacts.${index}.phone`, true);
                                  }}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    const phoneNumber = parsePhoneNumberFromString(
                                      inputValue,
                                      'US'
                                    );
                                    // setCurrentEditIndex(index);
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
                                      console.log(formik.values.contacts[index].phone, 'ooooo');
                                    } else {
                                      // If the input is not a valid phone number
                                      formik.setFieldValue(`contacts.${index}.phone`, inputValue);
                                    }
                                  }}
                                  onInput={(e) => {
                                    const inputValue = e.target.value;
                                    const phoneNumber = parsePhoneNumberFromString(
                                      inputValue,
                                      'US'
                                    );
                                    // setCurrentEditIndex(index);
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
                                      console.log(formik.values.contacts[index].phone, 'ooooo');
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
                                {/* {formik.values.contacts[index].isUpdate === 1 && formik.values.contacts[index].phone !== '' ? (
                                  <CheckCircleOutline style={{ color: 'green' }} />
                                ) : formik.values.contacts[index].isUpdate === 2 ? (
                                  <Clear style={{ color: 'red' }} />
                                ) :
                                  null
                                } */}
                              </div>
                              {/* <PhoneInput
                                country={'us'}
                                className="phoneInputCustomStyle"
                                style={{ width: '100%', height: '55px' }}
                                inputStyle={{ height: '55px', width: '100%' }}
                                placeholder="Phone number"
                                value={formik.values.contacts[index]?.phone}
                                onBlur={() => {
                                  formik?.setFieldTouched(`contacts.${index}?.phone`, true);
                                  // formik?.validateField(`contacts.${index}?.phone`);
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
                              /> */}

                              {formik.touched.contacts?.[index]?.phone &&
                                formik.errors.contacts?.[index]?.phone &&
                                formik.values.contacts[index].isUpdate === 2 && (
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
                            {formik.values.contacts[index].contact_type != 'Primary' &&
                            <Grid
                              item
                              xs={12}
                              md={3}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                  setOpen(true);
                                  setremoveid(index);
                                  setremoveSectionid(formik.values.contacts[index].id);
                                  setSelectedContact(formik.values.contacts[index].email);
                                }}
                              >
                                Remove Contact
                              </Button>

                              {/* <Button
                                variant="outlined"
                                onClick={async () => {
                                  // Remove the contact from the formik array
                                  remove(index);
                                  // Make a GraphQL call to delete the contact if it exists
                                  if (formik.values.contacts[index]?.id) {
                                    const contactId = formik.values.contacts[index].id;
                                    // Assuming customer_id is accessible here

                                    try {
                                      await API.graphql({
                                        query: mutations.deleteContact,
                                        variables: {
                                          input: {
                                            id: contactId,
                                            customer_id: id,
                                          },
                                        },
                                      });
                                      console.log('Contact deleted successfully');
                                      toast.success(`Contact removed successfully.`);
                                    } catch (error) {
                                      console.error('Error deleting contact:', error);
                                    }
                                  }
                                }}
                              >
                                Remove Contact
                              </Button> */}
                            </Grid>
                            }
                            <Grid
                              item
                              xs={12}
                              md={3}
                            >
                              {(formik.values.contacts[index].access_status == null || formik.values.contacts[index].access_status == "Enabled") && <Button
                                size="small"
                                onClick={() => {
                                  setOpen2(true);
                                  setSelectedContact(formik.values.contacts[index])
                                  setSelectedContactId(formik.values.contacts[index].id)
                                }}
                                startIcon={
                                  <SvgIcon>
                                  <Lock01Icon />
                                  </SvgIcon>
                                }
                                variant="outlined"
                              >
                                Deny Access
                              </Button>
                              }
                              {formik.values.contacts[index].access_status == "Disabled" && <Button
                              size="small"
                              onClick={() => {
                                setOpen6(true);
                                setSelectedContact(formik.values.contacts[index])
                                setSelectedContactId(formik.values.contacts[index].id)
                              }}
                              startIcon={
                              <SvgIcon>
                              <Lock01Icon />
                              </SvgIcon>
                              }
                              variant="outlined"
                              color="warning"
                              >
                                Enable Access
                              </Button>}{' '}
                            </Grid>
                          <Grid
                              item
                              xs={12}
                              md={3}
                          >
                            <Button
                              size="small"
                              onClick = {() => {
                                setOpen3(true);
                                setSelectedContact(formik.values.contacts[index].email);
                                setSelectedUser(formik.values.contacts[index]);
                              }}
                              startIcon={
                              <SvgIcon>
                                <Key01Icon />
                              </SvgIcon>
                              }
                              variant="outlined"
                            >
                              Reset Password
                            </Button>{' '}
                          </Grid> 
                        {formik.values.contacts[index].contact_type != 'Primary' &&
                        <Grid
                          item
                          xs={12}
                          md={3}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setOpen4(true);
                              setSelectedContact(formik.values.contacts[index]);
                              // handleMarkasPrimary(formik.values.contacts[index]);
                            }}
                          >
                            Mark as Primary
                          </Button>
                        </Grid>
                      }
                      {formik.values.contacts[index].contact_type == 'Primary' &&
                      <Grid
                        item
                        xs={12}
                        md={3}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpen5(true);
                            setSelectedContact(formik.values.contacts[index]);
                          }}
                        >
                          Mark as Secondary
                        </Button>
                      </Grid>
                      }   
                          </Grid>
                        </CardContent>
                      ))}
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
                          Are you sure you want to delete the contact?
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{ marginTop: 3 }}
                          onClick={handleClose}
                          // onClick={() => {
                          //   remove(index);
                          //   removeSection(formik.values.contacts[index].id);
                          // }}
                        >
                          cancel
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ marginTop: 3, marginLeft: 2 }}
                          onClick={() => {
                            remove(removeid);
                            removeSection(removeSectionid);
                            deleteContact(selectedContact);
                            setOpen(false);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Modal>
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
                            isUpdate: 0,
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
                </Typography>
              )}
            </ErrorMessage>
            {formik.touched.contacts &&
              formik.values.contacts.map((contact, index) => (
                <div key={index}>
                  {!contact.isUpdate &&
                    contact.phone && (  // Check if phone number is not empty
                    // index === currentEditIndex && ( 
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
            {/* <ErrorMessage name="contacts">
              {(msg) => (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ marginLeft: 2, marginTop: 2 }}
                >
                  {msg}
                </Typography>
              )}
            </ErrorMessage> */}
            {/* {formik.touched.contacts &&
              formik.values.contacts.map((contact, index) => (
                <div key={index}>
                  {(!contact.name || !contact.phone || !contact.email) && (
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: 'red',
                        marginTop: 1,
                      }}
                    >
                      Some Field is Missing
                    </Typography>
                  )}
                </div>
              ))} */}
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
              variant="outlined"
              sx={{ marginTop: 5 }}
              disabled={formik.isSubmitting || formik.values.contacts.length === 0}
              onClick={goBack}
            >
              Cancel
            </Button>
            {formik.values.contacts.isUpdate}
            <Button
              disabled={formik.isSubmitting || formik.values.contacts.length === 0}
              type="submit"
              variant="contained"
              sx={{ marginTop: 5, marginLeft: 1 }}
            >
              Update
            </Button>
          </Form>
        )}
      </Formik>
      <Dialog
        open={open1}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose1();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the Client.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                removecustomer(id);
                setOpen1(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen1(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open2}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose2();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Deny Access
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                disableUser();
                setOpen2(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose2()}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open3}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose3();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Reset Password
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                resetUserPassword();
                setOpen3(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose3()}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open4}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose4();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to mark this contact as Primary
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {                
                handleMarkasPrimary(selectedContact); 
                setOpen4(false);               
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose4()}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open5}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose5();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to mark this contact as Secondary
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {                
                handleMarkasSecondary(selectedContact);  
                setOpen5(false);              
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose5()}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open6}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose6();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to Enable Access
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {                
                disableUser();  
                setOpen6(false);              
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose6()}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

ClientEditForm.propTypes = {
  // @ts-ignore
  client: PropTypes.object.isRequired,
};
