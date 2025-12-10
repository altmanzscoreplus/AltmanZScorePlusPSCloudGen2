import { useEffect, type FC, useMemo, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DevicesAssigned } from 'src/sections/dashboard/gateway/devices-assigned-table';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { wait } from 'src/utils/wait';
import { useMounted } from 'src/hooks/use-mounted';
import { customersApi } from 'src/api/customers';
import { useSelection } from 'src/hooks/use-selection';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { API, graphqlOperation } from 'aws-amplify';

import { useRouter } from 'next/router';

import * as queries from '../../../graphql/queries';
import * as mutations from '../../../graphql/mutations';

interface GatewayEditFormProps {
  customer: Customer;
}

interface Filters {
  query?: string;
  hasAcceptedMarketing?: boolean;
  isProspect?: boolean;
  isReturning?: boolean;
}

interface AnalyzersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface CustomersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
const useDataDeviceSearch = () => {
  const [state, setState] = useState<AnalyzersSearchState>({
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
interface AnalyzersStoreState {
  analyzers: Analyzer[];
  analyzersCount: number;
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

const useAnalyzersStore = (searchState: AnalyzersSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<AnalyzersStoreState>({
    analyzers: [],
    analyzersCount: 0,
  });

  //   const handleAnalyzersGet = useCallback(async () => {
  //     try {
  //       const response = await API.graphql(
  //         graphqlOperation(queries.listAnalyzers, { filter: searchState.filters })
  //       );
  //       if (isMounted()) {
  //         setState({
  //           analyzers: response.data.listAnalyzers,
  //           analyzersCount: response.data.listAnalyzers.length,
  //         });
  //       }
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }, [searchState, isMounted]);

  //   useEffect(
  //     () => {
  //       handleAnalyzersGet();
  //     },
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     [searchState]
  //   );

  return {
    ...state,
  };
};

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

const useAnalyzersIds = (analyzers: any = []) => {
  return useMemo(() => {
    // return analyzers.map((analyzer) => analyzer.id);
  }, []);
};

export const GatewayCreateForm: FC<GatewayEditFormProps> = (props) => {
  const { customer, ...other } = props;
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);

  const analyzersSearch = useDataDeviceSearch();
  const analyzersStore = useAnalyzersStore(analyzersSearch.state);
  const analyzersIds = useAnalyzersIds(analyzersStore.analyzers);

  const router = useRouter();
  const pathnameParts = router.asPath.split('/');
  const { id } = router.query;
  const [gatewaydetail, setgatewaydetail] = useState();
  
  const getgateways = useCallback(async () => {
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
      } catch (err) {
        console.error(err);
      }
    }
  }, [id]);

  useEffect(() => {
    getgateways();
  }, [id]);

  const categoryOptions: CategoryOption[] = [
    {
      label: 'Healthcare',
      value: 'healthcare',
    },
    {
      label: 'Makeup',
      value: 'makeup',
    },
    {
      label: 'Dress',
      value: 'dress',
    },
    {
      label: 'Skincare',
      value: 'skincare',
    },
    {
      label: 'Jewelry',
      value: 'jewelry',
    },
    {
      label: 'Blouse',
      value: 'blouse',
    },
  ];
  const formik = useFormik({
    initialValues: {
      fw_ver: '',
      hw_ver: '',
      options: '',
      active_inactive_status: '',
      site_location: '',
      room_location: '',
      serial_number: '',
      gps_location: '',
      model: '',
      ps_gateway_id: '',
      // email: customer.email || '',
      // hasDiscount: customer.hasDiscount || false,
      // isVerified: customer.isVerified || false,
      // name: customer.name || '',
      // phone: customer.phone || '',
      // state: customer.state || '',
      // submit: null,
    },
    validationSchema: Yup.object({
      fw_ver: Yup.string().max(255).required('required'),
      hw_ver: Yup.string().max(255).required('required'),
      options: Yup.string().max(255).required('required'),
      active_inactive_status: Yup.string().max(255).required('required'),
      site_location: Yup.string().max(255).required('required'),
      room_location: Yup.string().max(255).required('required'),
      serial_number: Yup.string().max(255).required('required'),
      gps_location: Yup.string().max(255).required('required'),
      model: Yup.string().max(255).required('required'),
    }),
    // validateOnChange: true,
    // validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values, helpers): Promise<void> => {
      console.log(values, 'ddddddddddddddddddddddddddddddddddddddddddddddddd');
      if(values.serial_number && values.model){
        try{
          const response = await API.graphql(
            graphqlOperation(mutations.createGateway, {
              input: {
                serial_number: values.serial_number,
                model: values.model,
                hw_ver: values.hw_ver,
                fw_ver: values.fw_ver,
                options: values.options,
                active_inactive_status: values.active_inactive_status,
                site_location: values.site_location,
                room_location: values.room_location,
                gps_location: values.gps_location,
                ps_gateway_id: `${values.model}-${values.serial_number}`,
              },
            })
          )
        await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
          shadowName: `${values.model}-${values.serial_number}`,
        } });
        toast.success('Gateway Created Successfully');
        router.push(`/dashboard/gatewaycontrol`);
        }catch (error) {
          console.error('Error creating gateway:', error);
          toast.error('Failed to create gateway');
        }
      } else {
        toast.error('Serial number and model are required');
      }
    }
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      {...other}
    >
      <Card>
        <CardHeader title="" />
        <CardContent sx={{ pt: 0 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                xs={12}
                md={6}
              >
                <CardHeader
                  title=" "
                  sx={{ padding: 0, paddingBottom: 2 }}
                />
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.model && formik.errors.model)}
                    fullWidth
                    helperText={formik.touched.model && formik.errors.model}
                    label="Model"
                    name="model"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.model}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.serial_number && formik.errors.serial_number)}
                    fullWidth
                    helperText={formik.touched.serial_number && formik.errors.serial_number}
                    label="Serial Number"
                    name="serial_number"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.serial_number}
                    inputProps={{ maxLength: 6 }}
                  />
                </FormControl>
                <Stack
                  divider={<Divider />}
                  spacing={3}
                  sx={{ mt: 4 }}
                ></Stack>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.fw_ver && formik.errors.fw_ver)}
                    fullWidth
                    helperText={formik.touched.fw_ver && formik.errors.fw_ver}
                    label="Firmware Rev"
                    name="fw_ver"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.fw_ver}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.hw_ver && formik.errors.hw_ver)}
                    fullWidth
                    helperText={formik.touched.hw_ver && formik.errors.hw_ver}
                    label="Hardware Rev"
                    name="hw_ver"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.hw_ver}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.options && formik.errors.options)}
                    fullWidth
                    helperText={formik.touched.options && formik.errors.options}
                    label="Options"
                    name="options"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.options}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={formik.values.active_inactive_status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.active_inactive_status && formik.errors.active_inactive_status)}
                    fullWidth
                    required
                    label="Status"
                    name="active_inactive_status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.site_location && formik.errors.site_location)}
                    fullWidth
                    helperText={formik.touched.site_location && formik.errors.site_location}
                    label="Site Locaton"
                    name="site_location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.site_location}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.room_location && formik.errors.room_location)}
                    fullWidth
                    helperText={formik.touched.room_location && formik.errors.room_location}
                    label="Room Location"
                    name="room_location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.room_location}
                  />
                </FormControl>
                <FormControl
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <TextField
                    error={!!(formik.touched.gps_location && formik.errors.gps_location)}
                    fullWidth
                    helperText={formik.touched.gps_location && formik.errors.gps_location}
                    label="GPS Location"
                    name="gps_location"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    required
                    value={formik.values.gps_location}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
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
            Create
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            disabled={formik.isSubmitting}
            href={paths.dashboard.gatewaycontrol.index}
          >
            Cancel
          </Button>
        </Stack>
      </Card>
    </form>
  );
};

GatewayCreateForm.propTypes = {
  // @ts-ignore
  customer: PropTypes.object.isRequired,
};
