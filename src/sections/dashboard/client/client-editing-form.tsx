import { Avatar, Chip, MenuItem, Select } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { API, graphqlOperation } from 'aws-amplify';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState, type FC } from 'react';
import toast from 'react-hot-toast';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';
import { wait } from 'src/utils/wait';
import * as Yup from 'yup';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

interface ClientEditFormProps {
  customer: Customer;
}

export const ClientEditForm: FC<ClientEditFormProps> = (props) => {
  const { customer, ...other } = props;
  const [sections, setSections] = useState([
    {
      customer_id: '',
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

  const router = useRouter();
  const { id } = router.query;
  // const pathnameParts = router.asPath.split('/');
  // const id = pathnameParts[pathnameParts.length - 2]; // Assuming the id is the second-to-last segment of the path
  const [clientdata, setclientdata] = useState();
    const [contactdata, setcontactdata] = useState<any>([]);

 const addSection = () => {
    const newSection = {
      //id: sections.length + 1,
      name: '',
      email: '',
      title: '',
      text: '',
      phone: '',
      alarm_level_email: '',
      alarm_level_phone: '',
      alarm_level_sms: '',
    };
    setSections([...sections, newSection]);
  };
useEffect(() => {
    const newSection = {
      id: '',
      name: '',
      email: '',
      title: '',
      text: '',
      phone: '',
      alarm_level_email: '',
      alarm_level_phone: '',
      alarm_level_sms: '',
    };
    setSections([...contactdata]);
  }, [contactdata]);

  const removeSection = async (id) => {
    try {
      if (sections.length <= 3) {
        alert(
          'You cannot delete a contact because at least three contacts are required. You can edit existing contacts instead.'
        );
      } else {
        const updatedSections = sections.filter((section) => section.id !== id);
        setSections(updatedSections);
        if (id) {
          await API.graphql({
            query: mutations.deleteContact,
            variables: { input: { id } },
          });
          toast.success(`Contact removed successfully.`);
        }
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getclient = useCallback(async () => {
    if (id) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getClient, {
            id: id,
          })
        ); //membership:{response.data.getMemberByEmail.items[0].membershipId}}.then((response, error) => {
        console.log(assets.data.getClient, 'clearassetttttttttttttttttttttttttttttt');
        //await API.graphql(graphqlOperation(queries.getMemberByEmail,variables));
        //alert('getMemberByEmail')
        setclientdata(assets.data.getClient);
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

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

  useEffect(() => {
        getContact();
    getclient();
  }, [id]);

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    const updatedSections = sections.map((section, index) => {
      if (index === id) {
        return { ...section, [name]: value };
      }
      return section;
    });
    setSections(updatedSections);
    const updatedFormikSections = formik.values.sections.map((section) => {
      if (section.id === id) {
        return { ...section, [name]: value };
      }
      return section;
    });
    formik.setFieldValue('sections', updatedFormikSections);
  };

  useEffect(() => {
    const newSections = contactdata.map((contact) => ({
      id: contact.id, // Assuming contact has a unique identifier
      name: contact.name || '',
      email: contact.email || '',
      title: contact.title || '',
      phone: contact.phone || '',
      alarm_level_email: contact.alarm_level_email || '',
      alarm_level_phone: contact.alarm_level_phone || '',
      alarm_level_sms: contact.alarm_level_sms || '',
    }));
    setSections(newSections);
  }, [contactdata]);

  const formik = useFormik(
    {
      initialValues: {
        name: clientdata?.name || '',
   
        sections: contactdata.map((contact) => ({
          name: contact.name || '',
          email: contact.email || '',
          title: contact.title || '',
          phone: contact.phone || '',
          alarm_level_email: contact.alarm_level_email || '',
          alarm_level_phone: contact.alarm_level_phone || '',
          alarm_level_sms: contact.alarm_level_sms || '',
        })),
      },
      validationSchema: Yup.object({
        name: Yup.string().max(255).required('Name is Required'),
  
      }),

      enableReinitialize: true,
      onSubmit: async (values, helpers): Promise<void> => {
        const formData = {
          ...values,
          control: sections,
        };
        try {
          if (sections.length < 3) {
            alert('At least Three contact is needed');
          } else {
            let createCustomerResponse;
            if (clientdata?.id) {
              createCustomerResponse = await API.graphql(
                graphqlOperation(mutations.updateClient, {
                  input: {
                    id: clientdata.id,
                    name: values.name,
       
                  },
                })
              );
            } else {
              createCustomerResponse = await API.graphql(
                graphqlOperation(mutations.createClient, {
                  input: {
                    name: values.name,
               
                  },
                })
              );
            }
            const createdCustomer =
              createCustomerResponse.data.createClient ||
              createCustomerResponse.data.updateClient;

            await wait(500);

            if (createdCustomer) {
              const createContacts = async (sections: any) => {
                const contactIds = [];
                for (const section of sections) {
                  const user = {
                    client_id: createdCustomer.id,
                    id: section.id,
                    alarm_level_phone: section.alarm_level_phone,
                    alarm_level_email: section.alarm_level_email,
                    alarm_level_sms: section.alarm_level_sms,
                    email: section.email,
                    name: section.name,
                           phone: section.phone,
                    title: section.title,
                  };
                  const usercreate = {
                    client_id: createdCustomer.id,
                       phone: section.phone,
                    alarm_level_phone: section.alarm_level_phone,
                    alarm_level_email: section.alarm_level_email,
                    alarm_level_sms: section.alarm_level_sms,
                    email: section.email,
                    name: section.name,
                    title: section.title,
                  };

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
                    }
                    contactIds.push(
                      contactMutationResponse.data.createClient.id ||
                        contactMutationResponse.data.updateContact.id
                    );
                  } catch (error) {
                    console.error('Error creating/updating contact:', error);
                  }
                }
                return contactIds;
              };

              createContacts(sections).then((contactIds) => {
                console.log('Created/Updated contacts:', contactIds);
              });
            }

                         toast.success('Customer And Contact Created/Updated Successfully');
                          router.push('/dashboard/clientcontrol');
            helpers.setStatus({ success: true });
            helpers.setSubmitting(false);
          }
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      },
    },
    []
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
        <Stack
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
            <Typography variant="h4">{clientdata?.name}</Typography>
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
              <Typography variant="subtitle2">user_id:</Typography>
              <Chip
                label={clientdata?.id}
                size="small"
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <form
        onSubmit={formik.handleSubmit}
        {...other}
      >
        <Card>
          <CardHeader title="Edit Client" />
          <CardContent sx={{ pt: 0 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={4}
              >
                <TextField
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label="Client name"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                />
              </Grid>
            </Grid>
            <Stack
              divider={<Divider />}
              spacing={3}
              sx={{ mt: 3 }}
            ></Stack>
          </CardContent>

          <Divider />
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <CardHeader title="Contacts" />
            </Grid>
            <Grid
              item
              sx={{ mr: 3 }}
            >
              <Button
                variant="contained"
                onClick={addSection}
              >
                Add Contact
              </Button>
            </Grid>
          </Grid>
        {sections.map((section, index) => (
              <>
                <CardContent sx={{ pt: 0 }}>
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid xs={12}>Contact: {index + 1} </Grid>
                    <Grid
                      xs={12}
                      md={4}
                    >
                      <TextField
                        error={!!(formik.touched.names && formik.errors.names)}
                        fullWidth
                        helperText={formik.touched.names && formik.errors.names}
                        label="Name"
                        name="name"
                        onBlur={formik.handleBlur}
                        onChange={(e) => handleChange(e, index)} // Update this line
                        value={section.name}
                        required
                      />
                    </Grid>

                    <Grid
                      xs={12}
                      md={4}
                    >
                      <TextField
                        error={!!(formik.touched.email && formik.errors.email)}
                        fullWidth
                        helperText={formik.touched.email && formik.errors.email}
                        label="Email"
                        name="email"
                        onBlur={formik.handleBlur}
                        onChange={(e) => handleChange(e, index)}
                        value={section.email}
                        required
                      />
                    </Grid>

                    <Grid
                      xs={12}
                      md={4}
                    >
                      <TextField
                        error={!!(formik.touched.title && formik.errors.title)}
                        fullWidth
                        helperText={formik.touched.title && formik.errors.title}
                        label="Title"
                        name="title"
                        onBlur={formik.handleBlur}
                        value={section.title}
                        onChange={(e) => handleChange(e, index)}
                        required
                      />
                    </Grid>

                    <Grid
                      xs={12}
                      md={4}
                    >
                      <TextField
                        error={!!(formik.touched.phone && formik.errors.phone)}
                        fullWidth
                        helperText={formik.touched.phone && formik.errors.phone}
                        label="Phone"
                        name="phone"
                        onBlur={formik.handleBlur}
                        value={section.phone}
                        onChange={(e) => handleChange(e, index)}
                          required
                  />
<Typography
  sx={{
    fontSize: 10,
    color: 'black'
  }}
>
  Please Enter phone number with country code
</Typography>
                    </Grid>
                    <Grid
                      xs={12}
                      md={4}
                    >
                      <Select
                        error={
                          !!(
                            formik.touched[`sections[${index}].alarm_level_phone`] &&
                            formik.errors[`sections[${index}].alarm_level_phone`]
                          )
                        }
                        fullWidth
                        displayEmpty
                        helperText={
                          formik.touched[`sections[${index}].alarm_level_phone`] &&
                          formik.errors[`sections[${index}].alarm_level_phone`]
                        }
                        name={`sections[${index}].alarm_level_phone`}
                        onBlur={formik.handleBlur}
                         onChange={(e) => {
    const newValue = e.target.value;
    const updatedSections = [...sections]; // Make a copy of sections array
    updatedSections[index].alarm_level_phone = newValue; // Update the corresponding value
    setSections(updatedSections); // Update the state
  }}
  value={section.alarm_level_phone}
>
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography>Alarm For Phone</Typography>;
                          }
                          if (!Array.isArray(selected)) {
                            selected = [selected];
                          }
                          return selected.join(', ');
                        }}
                        required
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
                    </Grid>
                    <Grid
                      xs={12}
                      md={4}
                    >
                      <Select
                        error={
                          !!(formik.touched.alarm_level_email && formik.errors.alarm_level_email)
                        }
                        fullWidth
                        displayEmpty
                        helperText={
                          formik.touched.alarm_level_email && formik.errors.alarm_level_email
                        }
                        name={`sections[${index}].alarm_level_email`}
                        onBlur={formik.handleBlur}
                           onChange={(e) => {
    const newValue = e.target.value;
    const updatedSections = [...sections]; // Make a copy of sections array
    updatedSections[index].alarm_level_email = newValue; // Update the corresponding value
    setSections(updatedSections); // Update the state
  }}
  value={section.alarm_level_email}
>
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography>Alarm For Email</Typography>;
                          }
                          if (!Array.isArray(selected)) {
                            selected = [selected];
                          }
                          return selected.join(', ');
                        }}
                        required
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
                    </Grid>
                    <Grid
                      xs={12}
                      md={4}
                    >
                      <Select
                        error={!!(formik.touched.alarm_level_sms && formik.errors.alarm_level_sms)}
                        fullWidth
                        displayEmpty
                        helperText={formik.touched.alarm_level_sms && formik.errors.alarm_level_sms}
                        name={`sections[${index}].alarm_level_sms`}
                        onBlur={formik.handleBlur}
                                onChange={(e) => {
    const newValue = e.target.value;
    const updatedSections = [...sections]; // Make a copy of sections array
    updatedSections[index].alarm_level_sms = newValue; // Update the corresponding value
    setSections(updatedSections); // Update the state
  }}
  value={section.alarm_level_sms}
>
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography>Alarm For SMS</Typography>;
                          }
                          if (!Array.isArray(selected)) {
                            selected = [selected];
                          }
                          return selected.join(', ');
                        }}
                        required
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
                    </Grid>
                  </Grid>
                  <Stack
                    divider={<Divider />}
                    spacing={3}
                    sx={{ mt: 3 }}
                  ></Stack>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={() => removeSection(section.id)}
                      >
                        Remove Contact
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </>
            ))}
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            flexWrap="wrap"
            spacing={3}
            sx={{ p: 3 }}
          >
            <Button
              disabled={formik.isSubmitting}
              type="submit"
              variant="contained"
            >
              Update
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              disabled={formik.isSubmitting}
              href={paths.dashboard.customercontrol.details}
            >
              Cancel
            </Button>
          </Stack>
        </Card>
      </form>
    </>
  );
};

ClientEditForm.propTypes = {
  // @ts-ignore
  customer: PropTypes.object.isRequired,
};
