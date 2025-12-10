import ClearIcon from '@mui/icons-material/Clear';
import {
  Autocomplete,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  TextField
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { API, graphqlOperation,Auth } from 'aws-amplify';
import moment from 'moment';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import type { ChangeEvent, MouseEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { AllocatedDeviceTable } from 'src/sections/dashboard/topology/allocated-device-table';
import { AllocatedGatewayTable } from 'src/sections/dashboard/topology/allocated-gateway-table';
import { AssignedDeviceTable } from 'src/sections/dashboard/topology/assigned-device-table';
import { AssignedGatewayTable } from 'src/sections/dashboard/topology/assigned-gateway-table';
import { UnallocatedDeviceTable } from 'src/sections/dashboard/topology/unallocated-device-table';
import { UnallocatedGatewayTable } from 'src/sections/dashboard/topology/unallocated-gateway-table';
import { UnassignedDeviceTable } from 'src/sections/dashboard/topology/unassigned-device-table';
import { UnassignedGatewayTable } from 'src/sections/dashboard/topology/unassigned-gateway-table';
import type { Customer } from 'src/types/customer';
import * as mutations from '../../../graphql/mutations';
import * as queries from '../../../graphql/queries';

const top100Films = [
  { label: '', year: 1994 }
]

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

const Page: NextPage = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);
  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);
  const [open3, setOpen3] = React.useState(false);
  const handleOpen3 = () => setOpen3(true);
  const handleClose3 = () => setOpen3(false);
  const [open5, setOpen5] = React.useState(false);
  const handleOpen5 = () => setOpen5(true);
  const handleClose5 = () => setOpen5(false);
  const [open6, setOpen6] = React.useState(false);
  const handleOpen6 = () => setOpen6(true);
  const handleClose6 = () => setOpen6(false);
  const [open7, setOpen7] = React.useState(false);
  const handleOpen7 = () => setOpen7(true);
  const handleClose7 = () => setOpen7(false);
  const [open8, setOpen8] = React.useState(false);
  const handleOpen8 = () => setOpen8(true);
  const handleClose8 = () => setOpen8(false);
  const [datadevicedata, setdatadevicedata] = useState();
  const [gatewayid, setgatewayid] = useState('');
  const [gatewayidnutral, setgatewayidnutral] = useState('');
  const [analyzeridnutral, setanalyzeridnutral] = useState('');
  const [analyzerid, setanalyzerid] = useState('');
  const [getgatewayunassigned, setgetgatewayunassigned] = useState();
  const [getgatewayassigned, setgetgatewayassigned] = useState();
  // console.log(getgatewayassigned," get gateway assigned")
  const [gatewaymodel, setgatewaymodel] = useState('');
  const [getsite, setsite] = useState('');
  const [getroom, setroom] = useState('');
  const [gatewayserial, setgatewayserial] = useState('');
  const [selectedtype, setselectedtype] = useState('');
  console.log(selectedtype,"...")
  const [selectedgatewayrental, setselectedgatewayrental] = useState('');
  const [selectedAnalyzertype, setselectedAnalyzertype] = useState('');
  console.log(selectedAnalyzertype,'iiiii')
  const [analyzermodel, setanalyzermodel] = useState('');
  const [analyzerserial, setanalyzerserial] = useState('');
  const [companyname, setcompanyname] = useState('');
  const [clientcompanyname, setclientcompanyname] = useState('');
  console.log(clientcompanyname,"clienttt")
  const [searchcompany, setsearchcompany] = useState('');
  const [companyid, setcompanyid] = useState('');
  const [clientcompanyid, setclientcompanyid] = useState('');
  const [analyzerrentaldata, setanalyzerrentaldata] = useState();
  // console.log(analyzerrentaldata,"analyzerrentaldata")
  const [gatewayrentaldata, setgatewayrentaldata] = useState();
  const [customernameselected, setcustomernameselected] = useState([]);
  // console.log(customernameselected,"customer name..")
  const [clientnameselected, setclientnameselected] = useState([]);
  console.log(clientnameselected,"clientnameselected")
  const [modelsetaildata, setmodelsetaildata] = useState('');
  const [modelsetaildatas, setmodelsetaildatas] = useState('');
  const [customerfiltername, setCustomerfiltername] = useState('');
  console.log(customerfiltername,"customer filter name")
  const [clientfiltername, setClientfiltername] = useState('');
  const [analyzerlist, setAnalyzerlist] = useState('');
  const [open4, setOpen4] = React.useState(false);
  const handleOpen4 = () => setOpen4(true);
  const handleClose4 = () => setOpen4(false);
  const [value, setValue] = useState('');
  const [enddate, setEnddate] = useState('');
  const [accessends, setAccessends] = useState('');
  const [dateends, setdateEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitting1, setIsSubmitting1] = useState(false)
  const [selectedanalyzerass, setSelectedanalyzerass] = useState('');
  const [selectedgateway, setSelectedgateway] = useState('');
  const [selectedunassignedgateway, setSelectedunassignedgateway] = useState('');
  const [selectedclientunassignedgateway, setSelectedclientunassignedgateway] = useState('');
  const [gatewaydetail, setgatewaydetail] = useState('');
  console.log(gatewaydetail,"gatewaydetail")
  const [analyzerdetail, setanalyzerdetail] = useState('');
  console.log(analyzerdetail,"analyzerdetail")
  const [logedinuser, setLogedinuser] = useState('');
  // console.log(logedinuser,'id')
  const [logedinusergroup, setLogedinusergroup] = useState('');
  console.log(logedinusergroup,'group')
    const currentuser = Auth.currentAuthenticatedUser();
    console.log(currentuser,'yyy')
  const [loggedInCustomerName, setLoggedInCustomerName] = useState('');
  // console.log(loggedInCustomerName,"name")
  const [userClient, setUserClient] =useState('');
  // console.log(userClient,"user")
  const [loggedInClientName, setLoggedInClientName] = useState('');
  const [gatewayRentalDetail, setGatewayRentalDetail] = useState('');
  const [analyzerRentalDetail, setAnalyzerRentalDetail] = useState('');
  // console.log(analyzerRentalDetail,"analyzerRentalDetail")
  const [selecteddata, setSelecteddata] = useState('');
  console.log(selecteddata,"selected data")
  const [selecteddevicedata, setSelecteddevicedata] = useState('');
  const [selectedanalyzer, setSelectedanalyzer] = useState('');
  console.log(selecteddevicedata,"device detail")
  // const [psAnalyzerId, setPsAnalyzerId] = useState('');
  const [psGatewayIdWhiteList, setPsGatewayIdWhiteList] = useState('');
  // console.log(psGatewayId, psAnalyzerId, "ps gateway and ps analyser id")
  const [unallocatedGateway, setUnallocatedGateway] = useState([]);
  const [unallocatedAnalyzer, setUnallocatedAnalyzer] = useState([]);

      useEffect(() => {
        const logedinuserdetail =   currentuser.then(result => {

          const customerId = result.attributes['custom:customerId'];
          setLogedinuser(customerId)
          const clientId = result.attributes['custom:clientId'];
          setUserClient(clientId)
          // console.log(customerId,'uuu');
          const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
          setLogedinusergroup(group)
         
    
          }).catch(error => {
              console.error('Error:', error);
          });
        }, [Auth]);


  const getCustomer = useCallback(async () => {
    try{
    
    const response = await API.graphql(
      graphqlOperation(queries.getCustomer, { id : logedinuser }))
    console.log(response,"customer")
    setLoggedInCustomerName(response.data.getCustomer.name)
    } catch (err)
    {
      console.log(err)
    }
  },[logedinuser]);

  const getClient = useCallback(async () => {
    try{
    
    const response = await API.graphql(
      graphqlOperation(queries.getClient, { id : userClient }))
    console.log(response,"client")
    setLoggedInClientName(response.data.getClient.name)
    } catch (err)
    {
      console.log(err)
    }
  },[logedinuser]);

  useEffect(() => {
    getClient();
    getCustomer();
  },[logedinuser])
      
  useEffect(() => {
    if (open1) {
      const today = new Date();
      today.setDate(today.getDate() + 30); // Add 30 days
      const defaultValue = today.toISOString().substr(0, 10); // Format: YYYY-MM-DD
      setValue(defaultValue);
      setEnddate(defaultValue)
    }
  }, [open1]);


  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  const handleChangeEndDate = (event: any) => {
    setEnddate(event.target.value);
  };


  useEffect(() => {
    if (open4) {
      const today = new Date();
      today.setDate(today.getDate() + 30); // Add 30 days
      const defaultValue = today.toISOString().substr(0, 10); // Format: YYYY-MM-DD
      setAccessends(defaultValue);
      setdateEnd(defaultValue)
    }
  }, [open4]);


  const handleChangeAccessDate = (event: any) => {
    setAccessends(event.target.value);
  };

  const handleChangeDateEnd = (event: any) => {
    setdateEnd(event.target.value);
  };


  const handleRestore = () => {
    handleClose1();
    setValue('');
    setEnddate('')
  };

  const handleRestore1 = () => {
    handleClose4();
    setAccessends('');
    setdateEnd('')
  };

  const listgatewayassigned = useCallback(async () => {
    //   let condition;

    // if (logedinuser !== undefined) {
    //     condition = { eq: logedinuser };
    // } else {
    //     condition = selectedAnalyzertype !== "Allocate" 
    //         ? (selectedanalyzerass ?  { eq: companyid }  : { ne: null } )
    //         :  { eq: null } ;
    // }
    

    try {

      // let condition =  selectedAnalyzertype !== "Allocate" 
      //   ? (selectedanalyzerass ? { eq: companyid } : { ne: null }) 
      //   : { eq: null };

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];
      
      let variables = {
        filter: {serial_number: { contains: gatewayserial },
          model: { contains: gatewaymodel }}
      };
      // if (logedinuser == customerId) {
      //   if (clientId) {
      //     variables.filter.client_id = { eq: clientId };
      //   } else if (selectedAnalyzertype !== "Allocate" && selectedanalyzerass) {
      //     variables.filter.client_id = { contains: clientcompanyid };
      //   } else if ( selectedAnalyzertype == "Allocate") { 
      //     variables.filter.client_id = { eq: null }
      //   }else if (selectedtype=='' && selectedAnalyzertype ==''&& clientcompanyid) {
      //       variables.filter.client_id = { eq: clientcompanyid };
      //     } else if (clientcompanyid){
      //       variables.filter.client_id = { eq: clientcompanyid };
      //     }
      // }
      if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      } else if (selectedAnalyzertype !== "Allocate" && selectedanalyzerass) {
        variables.filter.customer_id = { contains: companyid };
      } else if ( selectedAnalyzertype == "Allocate") { 
        variables.filter.customer_id = { eq: null }
      }else if (selectedtype=='' && selectedAnalyzertype ==''&& companyid) {
          variables.filter.customer_id = { eq: companyid };
        } 
      if (clientId) {
          variables.filter.client_id = { eq: clientId };
        } else if (selectedAnalyzertype !== "Allocate" && selectedanalyzerass) {
          variables.filter.client_id = { contains: clientcompanyid };
        } else if ( selectedAnalyzertype == "Allocate") { 
          variables.filter.client_id = { eq: null }
        }else if (selectedtype=='' && selectedAnalyzertype ==''&& clientcompanyid) {
            variables.filter.client_id = { eq: clientcompanyid };
          } 
          else if (clientcompanyid){
            variables.filter.client_id = { eq: clientcompanyid };
          }
        
        
      // const variables = {
      //   filter: {
      //     serial_number: { contains: gatewayserial },
      //     model: { contains: gatewaymodel },
      //     // ...(selectedAnalyzertype !== "Allocate" ? { customer_id: selectedanalyzerass ? { eq: companyid } : { ne: null } } : { customer_id: { eq: null } }),
      //     customer_id:condition
      //   },
      // };

      const assets = await API.graphql(graphqlOperation(queries.listGateways, variables));
      const sortedOptions = assets.data.listGateways.items.slice().sort((a, b) => {
        return a?.ps_gateway_id?.localeCompare(b?.ps_gateway_id);
      });
      setgetgatewayassigned(sortedOptions);
    } catch (err) {
      console.error(err);
    }
  }, [gatewayserial, gatewaymodel,selectedanalyzerass,selectedAnalyzertype,companyid, clientcompanyid]);

  const getdatadevicecontrol = useCallback(async () => {

    // let condition = (logedinusergroup == "CustomerMaster" || logedinusergroup == "Customer")
    // ? { eq: logedinuser } 
    // : selectedtype !== "Allocate" 
    //     ? selectedunassignedgateway 
    //         ? { eq: selectedunassignedgateway } 
    //         : { ne: null } 
    //     : { eq: null }

    try {

      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];

      let variables = {
        filter: {
          serial_number :{ contains: analyzerserial },
          model :{ contains: analyzermodel }
        }
      };
      // if (logedinuser == customerId) {
        if (clientId) {
          variables.filter.client_id = { eq: clientId };
        } else if (selectedtype !== "Allocate" && selectedclientunassignedgateway ) { 
          variables.filter.client_id = { eq: selectedclientunassignedgateway };
        } else if (selectedgateway) {
          variables.filter.gateway_id = { eq: selectedgateway };
        }  else if (selectedgateway) {
          variables.filter.assigned_unassigned_status = { eq: "Unassigned" };
        } else if ( selectedtype == "Allocate") { 
          variables.filter.client_id = { eq: null }
        }else if (selectedtype=='' && selectedAnalyzertype ==''&& clientcompanyid) {
          variables.filter.client_id = { eq: clientcompanyid };
        } 
      // }
      
      if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      } else if (selectedtype !== "Allocate" && selectedunassignedgateway ) { 
        variables.filter.customer_id = { eq: selectedunassignedgateway };
      } else if (selectedgateway) {
        variables.filter.gateway_id = { eq: selectedgateway };
      }  else if (selectedgateway) {
        variables.filter.assigned_unassigned_status = { eq: "Unassigned" };
      } else if ( selectedtype == "Allocate") { 
        variables.filter.customer_id = { eq: null }
      }else if (selectedtype=='' && selectedAnalyzertype ==''&& companyid) {
        variables.filter.customer_id = { eq: companyid };
      } 
      // if (logedinuser == clientId) {
      //   if (clientId) {
      //     variables.filter.client_id = { eq: clientId };
        // } else if (selectedtype !== "Allocate" && selectedunassignedgateway ) { 
        // variables.filter.client_id = { eq: selectedunassignedgateway };
      // } else if (selectedgateway) {
      //   variables.filter.gateway_id = { eq: selectedgateway };
      // }  else if (selectedgateway) {
      //   variables.filter.assigned_unassigned_status = { eq: "Unassigned" };
      // } else if ( selectedtype == "Allocate") { 
      //   variables.filter.client_id = { eq: null }
      // } }
      // else if (selectedtype=='' && selectedAnalyzertype ==''&& clientcompanyid) {
      //   variables.filter.client_id = { eq: clientcompanyid };
      // } 
      // const variables = {
      //   filter: {
      //     serial_number: { contains: analyzerserial },
      //     model: { contains: analyzermodel },
      //     // ...(selectedtype !== "Allocate" ? { customer_id: selectedunassignedgateway ? { eq: selectedunassignedgateway } : { ne: null } } : { customer_id: { eq: null } }),
      //     customer_id:condition,
      //     ...(selectedunassignedgateway ? { assigned_unassigned_status: { eq: "Unassigned" } } : {}),
      //     ...(selectedgateway ? { gateway_id: { eq: selectedgateway } } : {})
      //   },
      // };
      const assets = await API.graphql(graphqlOperation(queries.listAnalyzers, variables));
      const sortedOptions = assets.data.listAnalyzers.items.slice().sort((a, b) => {
        return a?.ps_analyzer_id?.localeCompare(b?.ps_analyzer_id);
      });
      
        setdatadevicedata(sortedOptions)
      
      
    } catch (err) {
      console.error(err);
    }
  }, [analyzermodel, analyzerserial,selectedgateway,selectedunassignedgateway,selectedclientunassignedgateway,selectedtype,selectedAnalyzertype,companyid, clientcompanyid]);

  useEffect(() => {
    getdatadevicecontrol()
  }, [analyzermodel, analyzerserial,selectedgateway,selectedunassignedgateway,selectedclientunassignedgateway,selectedtype,selectedAnalyzertype,companyid, clientcompanyid]);

  const listgatewayunassigned = useCallback(async () => {
    try {
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];

      const variables = {
        filter: { serial_number: { contains: gatewayserial }, model: { contains: gatewaymodel } },
      };
      
      if (clientcompanyid) {
        variables.filter.client_id = { eq: clientcompanyid };
      } 
      // else if (clientId){
      //   variables.filter.client_id = { eq: clientId };
      // }

      const assets = await API.graphql(graphqlOperation(queries.listGateways, variables));
      console.log(assets,"assets")
      setgetgatewayunassigned(assets?.data?.listGateways);
    } catch (err) {
      console.error(err);
    }
  }, [gatewayserial, gatewaymodel, clientcompanyid]);

  const listCustomerGet = useCallback(async () => {
    try {
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];

      let filters ={status: { eq: 'Active' }};
      if(customerId){
        filters ={...filters, id: { eq: customerId }}
      }else if(searchcompany){
        filters={...filters, name:{contains:searchcompany}}
      }

      const variables = {
        filter: filters
      }

      const assets = await API.graphql(graphqlOperation(queries.listCustomers, variables));
      // const sortedAssets = assets?.data?.listCustomers.sort((a, b) => a.name.localeCompare(b.name));
      // setcompanyname(sortedAssets);
      setcompanyname(assets?.data?.listCustomers);
    } catch (err) {
      console.error(err);
    }
  }, [searchcompany]);

  const listClientGet = useCallback(async () => {
    try {
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId = currentuser.attributes['custom:clientId']

      let filters ={status: { eq: 'Active' }};
      if(customerId){
        filters ={...filters, customer_id: { eq: customerId }}
      }
      else if(searchcompany){
        filters={...filters, name:{contains:searchcompany}}
      }

      const variables = {
        filter: filters
      }

      const assets = await API.graphql(graphqlOperation(queries.listClients, variables));
      console.log(assets,"assets client")
      setclientcompanyname(assets?.data?.listClients);
    } catch (err) {
      console.error(err);
    }
  }, [searchcompany]);

  const listAnalyzerRentalsget = useCallback(async () => {
    try {
      let variables = {
        filter: {
          customer_id: { contains: companyid },
        },
      };

      if (getroom && getsite) {
        variables.filter.room = { contains: getroom };
        variables.filter.site = { contains: getsite };
      } else if (getroom) {
        variables.filter.room = { contains: getroom };
      } else if (getsite) {
        variables.filter.site = { contains: getsite };
      }

      const assets = await API.graphql(graphqlOperation(queries.listAnalyzerRentals, variables));
      console.log(assets, 'lllllllllllllllllllllllllllllllllllllllll');
      setanalyzerrentaldata(assets.data.listAnalyzerRentals);
    } catch (err) {
      console.error(err);
    }
  }, [companyid]);

  const handleInputChangecompanyid = (event, newInputValue) => {
    console.log(newInputValue, 'lllllllllllllllll name');
    setCustomerfiltername(newInputValue);
  };

  const handleInputChangeclientcompanyid = (event, newInputValue) => {
    console.log(newInputValue, 'client company');
    setClientfiltername(newInputValue);
  };

  const listGatewayRentalsget = useCallback(async () => {
    try {
      const nameLowerCase = customerfiltername.replace(/\s+/g, '').toLowerCase();
      const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
      const clientId  = currentuser.attributes['custom:clientId'];

      let variables = {
        filter: {},
      };
      if (gatewayid) {
        variables.filter.gateway_id = { contains: gatewayid };
      } else if (selectedtype=='' && selectedAnalyzertype ==''&& companyid) {
        variables.filter.customer_id = { eq: companyid };
      } else if (getroom && getsite) {
        variables.filter.room = { contains: getroom };
        variables.filter.site = { contains: getsite };
      } else if (getroom) {
        variables.filter.room = { contains: getroom };
      } else if (getsite) {
        variables.filter.site = { contains: getsite };
      } else if (selectedAnalyzertype == "Allocate") {
        variables.filter.customer_id = { eq: null };
      }else if (customerId) {
        variables.filter.customer_id = { eq: customerId };
      }
      else if (selectedtype=='' && selectedAnalyzertype ==''&& clientcompanyid) {
        variables.filter.client_id = { eq: clientcompanyid };
      }else if (selectedAnalyzertype == "Allocate") {
        variables.filter.client_id = { eq: null };
      }
      if (clientId) {
        variables.filter.client_id = { eq: clientId };
      }

      const assets = await API.graphql(graphqlOperation(queries.listGatewayRentals, variables));
      console.log(assets, 'lllllllllllllllllllllllllllllllllllllllll');
      setgatewayrentaldata(assets.data.listGatewayRentals);
    } catch (err) {
      console.error(err);
    }
  }, [companyid, getsite, getroom, analyzerid, gatewayid, customerfiltername,selectedtype,selectedAnalyzertype, clientcompanyid, clientfiltername]);

  const [selectedOption, setSelectedOption] = useState(customernameselected);
  const handleAutocompleteChange = (event, newValue) => {
    setSelectedOption(newValue);
  };

  const [clientSelectedOption, setClientSelectedOption] = useState('');
  console.log(clientSelectedOption,"clientSelectedOption")
  const handleAutocompleteChangeClient = (event, newValue) => {
    setClientSelectedOption(newValue);
  };

  // useEffect(() => {
  //   // console.log(loggedInCustomerName,"nameeeee")
  //   if ((gatewaydetail?.assigned_unassigned_status == "Assigned" && gatewaydetail?.client_id == null || gatewaydetail?.client_id == "0000-0000-0000-0000-0000-0000-0000-0000")
  //       || (selecteddevicedata?.assigned_unassigned_status == "Assigned" && selecteddevicedata?.client_id == null || selecteddevicedata?.client_id == "0000-0000-0000-0000-0000-0000-0000-0000")) {
  //     console.log(loggedInCustomerName,"nameeeee")
  //       setClientSelectedOption(loggedInCustomerName);
  //     } else if ((gatewaydetail?.client_id != null && gatewaydetail?.client_id != "0000-0000-0000-0000-0000-0000-0000-0000")|| 
  //     (selecteddevicedata?.client_id != null && selecteddevicedata?.client_id != "0000-0000-0000-0000-0000-0000-0000-0000")) {
  //       setClientSelectedOption(clientnameselected); // Or some fallback
  //     }
  // }, [loggedInCustomerName, clientnameselected, gatewaydetail, selecteddevicedata]);

  useEffect(() => {
    if (gatewaydetail?.client_id != null && gatewaydetail?.client_id != "0000-0000-0000-0000-0000-0000-0000-0000"){
      setClientSelectedOption(clientnameselected);
    }else if(selecteddevicedata?.client_id != null && selecteddevicedata?.client_id != "0000-0000-0000-0000-0000-0000-0000-0000"){
      setClientSelectedOption(clientnameselected);
    }else if(gatewaydetail?.client_id == null || gatewaydetail?.client_id == "0000-0000-0000-0000-0000-0000-0000-0000"){
      setClientSelectedOption(loggedInCustomerName);
    }else if(selecteddevicedata?.client_id == null || selecteddevicedata?.client_id == "0000-0000-0000-0000-0000-0000-0000-0000"){
      setClientSelectedOption(loggedInCustomerName);
    }
  }, [loggedInCustomerName, clientnameselected, gatewaydetail, selecteddevicedata]);

  const handleButtonClick = () => {
    if (companyid) {
      router.push(`/dashboard/customercontrol/edit/?id=${companyid}`);
    } else {
      router.push('/dashboard/customercontrol/create');
    }
  };

  const [hasSingleItem, setHasSingleItem] = useState('');
  const [hasSingledevice, setHasSingleDevice] = useState('');

  const handleGatewayCreate = useCallback(async () => {
    if (!gatewaymodel || !gatewayserial) {
      // If either gatewaymodel or gatewayserial is empty, show an alert message
      if (logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') {
        alert('Please provide both gateway model and serial number.');
      } else if (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') {
        alert('Please Select Gateway First.')
      }      
      return; // Exit the function
    }
    if (gatewayid) {

      window.localStorage.setItem('previouspageName', 'Network Management');
      window.localStorage.setItem('previouspageUrl','/dashboard/networktopology')
      router.push(`/dashboard/gatewaycontrol/information/?id=${gatewayid}`);
    } else if (gatewayserial && gatewaymodel) {
      const response = await API.graphql(
        graphqlOperation(mutations.createGateway, {
          input: {
            model: gatewaymodel,
            serial_number: gatewayserial,
            active_inactive_status: 'Active',
            assigned_unassigned_status: "Unassigned",
            allocated_unallocated_status: "Unallocated",
            communication_status: "Not_Detected",
            ps_gateway_id: `${gatewaymodel}-${gatewayserial}`,
          },
        })
      );
      if (response?.data.createGateway) {
        
        await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
          shadowName: `${gatewaymodel}-${gatewayserial}`,
        } });

        window.localStorage.setItem('previouspageName', 'Network Management');
        window.localStorage.setItem('previouspageUrl','/dashboard/networktopology')
        router.push(
          `/dashboard/gatewaycontrol/information/?id=${response?.data?.createGateway?.id}`
        );
      }
    } else {
      router.push('/dashboard/gatewaycontrol/');
    }
  }, [gatewaymodel, gatewayserial, gatewayid, listgatewayunassigned, logedinusergroup]);

  // const handleGatewayCreate = useCallback(
  //   async (gatewayid: any) => {
  //     //modelsetaildata
  //     // console.log(gatewaymodel, gatewayserial, 'hyyyyyyyyyyyyyyyyyyyy');
  //     if (gatewayserial && gatewaymodel) {
  //       // router.push(`/dashboard/gatewaycontrol/?s_id=${gatewayserial}&m_id=${gatewaymodel}`);
  //       const response = await API.graphql(
  //         graphqlOperation(mutations.createGateway, {
  //           input: {
  //             model: gatewaymodel,
  //             serial_number: gatewayserial,
  //             status: 'Active',
  //             ps_gateway_id: `${gatewaymodel}-${gatewayserial}`,
  //           },
  //         })
  //       );
  //       if (response?.data.createGateway) {
  //         window.localStorage.setItem('previouspage', 'Network management');
  //         router.push(
  //           `/dashboard/gatewaycontrol/information/?id=${response?.data?.createGateway?.id}`
  //         );
  //       }
  //     } else if (hasSingleItem) {
  //       window.localStorage.setItem('previouspage', 'Network management');
  //       router.push(`/dashboard/gatewaycontrol/information/?id=${hasSingleItem}`);
  //     } else {
  //       router.push('/dashboard/gatewaycontrol/');
  //     }
  //   },
  //   [gatewaymodel, gatewayserial, listgatewayunassigned]
  // );

  // const handleDeviceCreate = useCallback(async () => {
  //   if (!analyzermodel) {
  //     alert('Model number cannot be empty');
  //     return;
  //   }
  //   if (!analyzerserial) {
  //     alert('Serial number cannot be empty');
  //     return;
  //   }
  //   const response = await API.graphql(
  //     graphqlOperation(mutations.createAnalyzer, {
  //       input: {
  //         ps_analyzer_id: `${analyzermodel}-${analyzerserial}`,
  //         model: analyzermodel,
  //         serial_number: analyzerserial,
  //         device_status: 'Active',
  //       },
  //     })
  //   );

  //   if (response.data.createAnalyzer) {
  //     setanalyzermodel(''), setanalyzerserial(''), getdatadevicecontrol();
  //   }
  // }, [analyzermodel, analyzerserial]);

  const handleDeviceCreate = useCallback(async () => {
    if (!analyzermodel || !analyzerserial) {
      // If either gatewaymodel or gatewayserial is empty, show an alert message
      if (logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') {
        alert('Please provide both analyzer model and serial number.');
      } else if (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') {
        alert('Please Select Analyzer First.')
      }   
      return; // Exit the function
    }
    if (analyzerid) {
      window.localStorage.setItem('previouspageName', 'Network Management');
      window.localStorage.setItem('previouspageUrl','/dashboard/networktopology')
      router.push(`/dashboard/datadevicecontrol/information/?id=${analyzerid}`);
    } else if (analyzerserial && analyzermodel) {
      const response = await API.graphql(
        graphqlOperation(mutations.createAnalyzer, {
          input: {
            model: analyzermodel,
            serial_number: analyzerserial,
            active_inactive_status: 'Active',
            assigned_unassigned_status: "Unassigned",
            allocated_unallocated_status: "Unallocated",
            communication_status: "Not_Detected",
            ps_analyzer_id: `${analyzermodel}-${analyzerserial}`,
          },
        })
      );
      if (response?.data.createAnalyzer) {
        await API.post('powersightrestapi', `/IoTShadow/createShadow`, { body: {
          shadowName: `${analyzermodel}-${analyzerserial}`,
        }} );
        window.localStorage.setItem('previouspageName', 'Network Management');
        window.localStorage.setItem('previouspageUrl','/dashboard/networktopology')
        router.push(
          `/dashboard/datadevicecontrol/information/?id=${response?.data?.createAnalyzer?.id}`
        );
      }
    } else {
      router.push('/dashboard/datadevicecontrol/');
    }
  }, [analyzermodel, analyzerserial, analyzerid, getdatadevicecontrol, logedinusergroup]);


  useEffect(() => {
    listgatewayassigned();
    listgatewayunassigned();
  }, [gatewaymodel, gatewayserial,selectedanalyzerass,selectedAnalyzertype,companyid, clientcompanyid]);

  

  useEffect(() => {
    listCustomerGet();
    listClientGet();
  }, [searchcompany]);

  useEffect(() => {
    listGatewayRentalsget();
  }, [companyid, getsite, getroom, analyzerid, gatewayid, customerfiltername,selectedAnalyzertype,selectedtype, clientfiltername]);

  useEffect(() => {
    listAnalyzerRentalsget();
    // getdatadevicecontrol();
    listGatewayRentalsget();
  }, []);

  const handleChangesite = (event: any) => {
    setsite(event.target.value);
  };

  const handleChangeroom = (event: any) => {
    setroom(event.target.value);
  };


  

  const handleChangegatewaymodel = (event: any) => {
    setgatewaymodel(event.target.value);
    setgatewayid('');
    setgatewayidnutral('');
  };
  const router = useRouter();

  const { cus_id, p } = router.query;

  
  useEffect(() => {
    console.log(selecteddevicedata, 'selecteddataselecteddataselecteddataselecteddata');
  }, [selecteddevicedata]);

  const getgateways = useCallback(async () => {
    if (gatewayid) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getGateway, {
            id: selecteddata?.id,
          })
        );
        console.log(assets.data.getGateway, '66clearassetttttttttttttttttttttttttttttt');
        setgatewaydetail(assets.data.getGateway);
        // setcustomername(
        //   assets.data.getGateway.gateway_rental.items.filter((gat: any) => !gat.termination_date)[0]
        //     .customer?.name
        // );
      } catch (err) {
        console.error(err);
      }
    }
  }, [selecteddata?.id]);

  useEffect(() => {
    getgateways();
  }, [selecteddata?.id]);

  const getanalyzer = useCallback(async () => {
    if (analyzerid) {
      try {
        //   const variables = {
        //     nextToken,
        //     limit,
        // filter: {email: {eq: auth.user.email}}
        //   }
        const assets = await API.graphql(
          graphqlOperation(queries.getAnalyzer, {
            id: selecteddevicedata?.id,
          })
        );
        console.log(assets.data.getAnalyzer, '66clearassetttttttttttttttttttttttttttttt');
        setanalyzerdetail(assets.data.getAnalyzer);
        // setcustomername(
        //   assets.data.getGateway.gateway_rental.items.filter((gat: any) => !gat.termination_date)[0]
        //     .customer?.name
        // );
      } catch (err) {
        console.error(err);
      }
    }
  }, [selecteddevicedata?.id]);

  useEffect(() => {
    getanalyzer();
  }, [selecteddevicedata?.id]);

  const updateallocation = async (id: any) => {
    
    try {
      if (!companyid) {
        // Show an alert if companyid is empty
        alert('Please Select Customer !');
        return;
      }
      if (!value && !enddate) {
        handleOpen1();
      }
      // Update Gateway
      if (value && enddate) {
        setIsSubmitting(true)
        const updateGatewayResponse = await API.graphql(
          graphqlOperation(mutations.updateGateway, {
            input: { customer_id: companyid, id: selecteddata?.id,allocated_unallocated_status:"Allocated", communication_status: "Archive"},
          })
        );
        console.log("Update Gateway Response:", updateGatewayResponse);
        // Update Customer

        const updategatewayrentalResponse = await API.graphql(
          graphqlOperation(mutations.createGatewayRental, {
            input: {
              customer_id: companyid,
              gateway_id: selecteddata?.id,
              site: gatewaydetail.site_location ? gatewaydetail.site_location : null,
              room: gatewaydetail.room_location ? gatewaydetail.room_location : null,
              access_end_date: value,
              end_date:enddate,
              // client_id: clientcompanyid,
            },
          })
        );
        
        // If both mutations succeed
        if (updateGatewayResponse && updategatewayrentalResponse) {
          // router.back();
          // setcustomernameselected;
          // [''];
          setgatewayserial('');
          setgatewaymodel('');
          setgatewayid('');
          listgatewayunassigned();
          setValue('');
          setEnddate('')
          // setcompanyname('');
          setOpen1(false);
          toast.success('Updated Successfully!');
          setSelecteddata('');
          setselectedtype('')
          listCustomerGet();
          setcompanyid('');          
          setIsSubmitting(false)
          setClientSelectedOption('');
          setUnallocatedAnalyzer('');
          setUnallocatedGateway('');
        }
      }
    } catch (error) {
      console.error(error);
      setOpen1(false);
      setIsSubmitting(false)
      toast.error('Something went wrong!');
    }
  };

  const updateReallocation = async (id: any) => {
    // alert(clientcompanyid)
    try {
      // console.log(clientcompanyid,"idddd")
      if (!clientcompanyid) {
        // Show an alert if companyid is empty
        alert('Please Select Client !');
        return;
      }
      
      // Update Gateway
      
        console.log(clientcompanyid,"iddddss")
        setIsSubmitting(true)
        const updateGatewayResponse = await API.graphql(
          graphqlOperation(mutations.updateGateway, {
            input: { customer_id: companyid, id: selecteddata?.id,allocated_unallocated_status:"Allocated", client_id: clientcompanyid, communication_status: "Archive"},
          })
        );
        
        // Update Customer
        console.log(clientcompanyid,"client iddd")
        const updategatewayrentalResponse = await API.graphql(
          graphqlOperation(mutations.createGatewayRental, {
            input: {
              customer_id: companyid,
              gateway_id: selecteddata?.id,
              site: gatewaydetail.site_location ? gatewaydetail.site_location : null,
              room: gatewaydetail.room_location ? gatewaydetail.room_location : null,
              access_end_date: gatewayRentalDetail?.access_end_date,
              end_date:gatewayRentalDetail?.end_date,
              client_id: clientcompanyid,
            },
          })
        );
        // setgatewayrentalresponse(updategatewayrentalResponse)
        console.log("reallocate",updategatewayrentalResponse)
        
        // If both mutations succeed
        if (updateGatewayResponse && updategatewayrentalResponse) {
          // router.back();
          // setcustomernameselected;
          // [''];
          setclientnameselected;
          setClientSelectedOption('');
          setgatewayserial('');
          setgatewaymodel('');
          setgatewayid('');
          listgatewayunassigned();
          setcompanyname('');
          setclientcompanyname('');
          setOpen1(false);
          toast.success('Updated Successfully!');
          setSelecteddata('');
          setselectedtype('')
          listCustomerGet();
          listClientGet();
          setcompanyid('');
          setclientcompanyid('');
          setValue('');
          setEnddate('')
          setIsSubmitting(false)
          setSelecteddata('')
          setUnallocatedAnalyzer('');
          setUnallocatedGateway('');
        }
      
    } catch (error) {
      console.error(error);
      setOpen1(false);
      setIsSubmitting(false)
      toast.error('Something went wrong!');
    }
  };

  const updateunallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: { customer_id: null, 
                  id: selecteddata?.id || selectedgatewayrental.id ,
                  allocated_unallocated_status:"Unallocated", 
                  client_id: null,
                  communication_status: "Not_Detected",
                },
        })
      );
      console.log(updateGatewayResponse,"response gateway")
      // const updateCustomer = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { customer_id: id, gateway_id: null },
      //   })
      // );
      const updategatewayrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateGatewayRental, {
          input: {
            id: selecteddata.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id
            ||
            selectedgatewayrental.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            client_id: null,
            customer_id: null,
          },
        })
      );
      if (updateGatewayResponse && updategatewayrentalResponse) {
        // router.back();
        // setcustomernameselected;
        // [''];
        setclientnameselected('');
        setClientSelectedOption('');
        setgatewayserial('');
        setgatewaymodel('');
        setcompanyname('');
        setclientcompanyname('');
        setOpen(false);
        listgatewayunassigned();
        setgatewayid('');
        // setgatewayidnutral('');
        toast.success('Updated Successfully!');
        setSelecteddata('');
        listCustomerGet();
        setcompanyid('');
        setclientcompanyid('');
        setselectedgatewayrental('')
        setsite('')
        setroom('')
        // setanalyzeridnutral('');
        setSelectedunassignedgateway('')
        setSelectedclientunassignedgateway('')
        setSelecteddata('')
        setselectedtype('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      }
    } catch (error) {
      console.error(error);
      setOpen(false);
      toast.error('Something went wrong!');
    }
  };

  const updateClientGatewayUnallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: { customer_id: selecteddata?.customer_id, 
                    id: selecteddata?.id || selectedgatewayrental.id,
                    allocated_unallocated_status:"Unallocated", 
                    client_id: null },
        })
      );

      // const updateCustomerResponse = await API.graphql(
      //   graphqlOperation(mutations.updateCustomer, {
      //     input: { id: selecteddata?.customer_id, 
      //               client_id: null },
      //   })
      // );

      // const updategatewayrentalResponse = await API.graphql(
      //   graphqlOperation(mutations.updateGatewayRental, {
      //     input: {
      //       id: selecteddata.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id
      //       ||
      //       selectedgatewayrental.gateway_rental.items.filter((gat) => !gat.termination_date)[0].id,
      //       termination_date: currentDate,
      //     },
      //   })
      // );
      if (updateGatewayResponse) {
        // router.back();
        // setcustomernameselected;
        // [''];
        setclientnameselected('');
        setClientSelectedOption('');
        setgatewayserial('');
        setgatewaymodel('');
        setcompanyname('');
        setclientcompanyname('');
        setOpen(false);
        listgatewayunassigned();
        setgatewayid('');
        // setgatewayidnutral('');
        toast.success('Updated Successfully!');
        setSelecteddata('');
        listCustomerGet();
        listClientGet();
        setcompanyid('');
        setclientcompanyid('');
        setselectedgatewayrental('')
        setsite('')
        setroom('')
        // setanalyzeridnutral('');
        setSelectedunassignedgateway('')
        setSelectedclientunassignedgateway('')
        setSelecteddata('')
        setselectedtype('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      }
    } catch (error) {
      console.error(error);
      setOpen(false);
      toast.error('Something went wrong!');
    }
  };

  const updateanalyzerallocation = async (id: any) => {
    
    try {
      if (!companyid) {
        // Show an alert if companyid is empty
        alert('Please Select Customer !');
        return;
      }
      if (!accessends && !dateends) {
        handleOpen4();
      }

      if (accessends && dateends) {
        setIsSubmitting(true)
        const updateAnalyzerResponse = await API.graphql(
          graphqlOperation(mutations.updateAnalyzer, {
            input: { customer_id: companyid, id: selecteddevicedata?.id,allocated_unallocated_status:"Allocated", communication_status: "Archive"},
          })
        );

        // Update Customer

        const updateanalyzerrentalResponse = await API.graphql(
          graphqlOperation(mutations.createAnalyzerRental, {
            input: {
              customer_id: companyid,
              analyzer_id: selecteddevicedata?.id,
              site: analyzerdetail.site_location ? analyzerdetail.site_location : null,
              room: analyzerdetail.room_location ? analyzerdetail.room_location : null,
              access_end_date: accessends,
              end_date:dateends,
              // client_id: clientcompanyid,
            },
          })
        );

        // If both mutations succeed
        if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
          // setcustomernameselected;
          // [''];
          setanalyzerserial('');
          setanalyzermodel('');
          setanalyzerid('');
          getdatadevicecontrol();
          // setcompanyname('');
          setclientcompanyname('');
          setOpen4(false);
          setSelectedanalyzerass('')
          toast.success('Updated Successfully!');
          setSelecteddevicedata('');
          listCustomerGet();
          listClientGet();
          setcompanyid('');
          setclientcompanyid('');
          setAccessends('');
          setselectedAnalyzertype('')
          setdateEnd('')
          setIsSubmitting(false)
          setClientSelectedOption('');
          setSelecteddata('')
          setUnallocatedAnalyzer('');
          setUnallocatedGateway('');
        }
      }
    } catch (error) {
      console.error(error);
      setOpen1(false);
      setIsSubmitting(false)
      toast.error('Something went wrong!');
    }
  };

  const fetchAssets = async () => {
    const variables = {
      filter: {
        customer_id: {
          eq: selecteddata?.customer_id
        }
      }
    };
    
    const gatewayassets = await API.graphql(
      graphqlOperation(queries.listGatewayRentals, variables)
    );
    // console.log(gatewayassets.data.listGatewayRentals.items,"gatewayassets....")
  
    // console.log(gatewayassets.data.listGatewayRentals, 'gateway access date');
    setGatewayRentalDetail(gatewayassets.data.listGatewayRentals.items[0]);
    
    const analyzerassets = await API.graphql(
      graphqlOperation(queries.listAnalyzerRentals, variables)
    );
  
    // console.log(analyzerassets.data.listAnalyzerRentals, 'analyzer access date');
    setAnalyzerRentalDetail(analyzerassets.data.listAnalyzerRentals.items[0]);
  };

  useEffect(()=>{
    fetchAssets();
  },[selecteddata])

  const updateanalyzerReallocation = async (id: any) => {
    
    try {
      if (!clientcompanyid) {
        // Show an alert if companyid is empty
        alert('Please Select Client !');
        return;
      }
      
        setIsSubmitting(true)
        const updateAnalyzerResponse = await API.graphql(
          graphqlOperation(mutations.updateAnalyzer, {
            input: { customer_id: companyid, id: selecteddevicedata?.id,allocated_unallocated_status:"Allocated", client_id: clientcompanyid },
          })
        );

        // Update Customer

        const updateanalyzerrentalResponse = await API.graphql(
          graphqlOperation(mutations.createAnalyzerRental, {
            input: {
              customer_id: companyid,
              analyzer_id: selecteddevicedata?.id,
              site: analyzerdetail.site_location ? analyzerdetail.site_location : null,
              room: analyzerdetail.room_location ? analyzerdetail.room_location : null,
              access_end_date: analyzerRentalDetail?.access_end_date,
              end_date:analyzerRentalDetail?.end_date,
              client_id: clientcompanyid,
            },
          })
        );

        // If both mutations succeed
        if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
          // setcustomernameselected;
          // [''];
          setclientnameselected;
          setClientSelectedOption('');
          setanalyzerserial('');
          setanalyzermodel('');
          setanalyzerid('');
          getdatadevicecontrol();
          setcompanyname('');
          setclientcompanyname('');
          setOpen4(false);
          setSelectedanalyzerass('')
          toast.success('Updated Successfully!');
          setSelecteddevicedata('');
          listCustomerGet();
          listClientGet();
          setcompanyid('');
          setclientcompanyid('');
          setAccessends('');
          setselectedAnalyzertype('')
          setdateEnd('')
          setIsSubmitting(false)
          setSelecteddata('')
          setselectedtype('')
          setsite('')
          setroom('')
          setUnallocatedAnalyzer('');
          setUnallocatedGateway('');
        }
      
    } catch (error) {
      console.error(error);
      setOpen1(false);
      setIsSubmitting(false)
      toast.error('Something went wrong!');
    }
  };

  const updateanalyzerunallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: null, id: selecteddevicedata?.id,allocated_unallocated_status:"Unallocated", client_id: null,
            communication_status: "Not_Detected",
           },
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
            id: selecteddevicedata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            client_id: null,
            customer_id: null,
          },
        })
      );
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        // router.back();
        // setcustomernameselected;
        // [''];
        setanalyzerserial('');
        setanalyzermodel('');
        setgatewayserial('');
        setgatewaymodel('');
        setSelectedanalyzerass('')
        setcompanyname('');
        setclientcompanyname('');
        setOpen2(false);
        getdatadevicecontrol();
        setanalyzerid('');
        // setanalyzeridnutral('');
        toast.success('Updated Successfully!');
        setSelecteddevicedata('');
        listCustomerGet();
        setcompanyid('');
        setclientcompanyid('');
        setsite('')
        setroom('')
        // setgatewayidnutral('');
        setClientSelectedOption('');
        setSelecteddata('')
        setselectedtype('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      }
    } catch (error) {
      console.error(error);
      setOpen(false);
      toast.error('Something went wrong!');
    }
  };

  const updateClientAnalyzerUnallocation = async (id: any) => {
    try {
      const currentDate = moment().format('YYYY-MM-DD'); // Format as "Month Date, Year"

      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: { customer_id: selecteddevicedata?.customer_id, 
                    id: selecteddevicedata?.id,
                    allocated_unallocated_status:"Unallocated", 
                    client_id: null },
        })
      );

      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: selecteddevicedata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            termination_date: currentDate,
            client_id: null,
          },
        })
      );
      if (updateAnalyzerResponse && updateanalyzerrentalResponse) {
        // router.back();
        // setcustomernameselected;
        // [''];
        setanalyzerserial('');
        setanalyzermodel('');
        setgatewayserial('');
        setgatewaymodel('');
        setSelectedanalyzerass('')
        setcompanyname('');
        setclientcompanyname('');
        setOpen2(false);
        getdatadevicecontrol();
        setanalyzerid('');
        // setanalyzeridnutral('');
        toast.success('Updated Successfully!');
        setSelecteddevicedata('');
        listCustomerGet();
        listClientGet();
        setcompanyid('');
        setclientcompanyid('');
        setsite('')
        setroom('')
        // setgatewayidnutral('');
        setClientSelectedOption('');
        setSelecteddata('')
        setselectedtype('')
        setselectedAnalyzertype('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      }
    } catch (error) {
      console.error(error);
      setOpen(false);
      toast.error('Something went wrong!');
    }
  };

  const handleChangegatewayserialnumber = (event: any) => {
    const onlyNumbers = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setgatewayserial(onlyNumbers);
    setgatewayid('');
    setgatewayidnutral('');
  };

  const handleChangeanalyzermodel = (event: any) => {
    setanalyzermodel(event.target.value);
    setanalyzerid('');
    setanalyzeridnutral('')
  };

  const handleChangeanalyzernumber = (event: any) => {
    const onlyNumbers = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setanalyzerserial(onlyNumbers);
    setanalyzerid('');
    setanalyzeridnutral('');
  };

  usePageView();

  const sortedOptions = companyname.items?.slice()?.sort((a, b) => {
    if (a?.name < b?.name) return -1;
    if (a?.name > b?.name) return 1;
    return 0;
  });

  const clientsortedOptions = clientcompanyname.items?.slice()?.sort((a, b) => {
    if (a?.name < b?.name) return -1;
    if (a?.name > b?.name) return 1;
    return 0;
  });

  const handleAnalyzerslist = useCallback(async () => {
    try {
      const response = await API.graphql(
        graphqlOperation(queries.listAnalyzers, {
          filter:{gateway_id: {eq: selectedanalyzer.gateway_id}} ,
          limit: 1000,
        })
      );
      console.log(response, 'responseresponseresponseresponseresponseresponseresponse');
      setAnalyzerlist(response.data.listAnalyzers);
      
    } catch (err) {
      console.error(err);
    }
  }, [selectedanalyzer]);

  const handleAssign = async () => {
   
    try {

      if (!gatewayid) {
        // Show an alert if companyid is empty
        alert('Please Select Gateway !');
        return;
      }
      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {  id: selectedanalyzerass.id,assigned_unassigned_status:'Assigned',gateway_id: gatewayid, communication_status: "Communicating" },
        })
      );
      // setPsAnalyzerId(updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id)
      const psAnalyzerId = updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id

      // console.log(updateAnalyzerResponse.ps_analyzer_id,"updateAnalyzerResponse")
      const updateGatewayResponse = await API.graphql(
        graphqlOperation(mutations.updateGateway, {          
          input: {  id: gatewayid,assigned_unassigned_status:'Assigned', communication_status: "Communicating" },
        })
      );
      // setPsGatewayId(updateGatewayResponse.data.updateGateway.ps_gateway_id)
      const psGatewayId = updateGatewayResponse.data.updateGateway.ps_gateway_id
      // // Update Customer
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          input: {
            id: selectedanalyzerass.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            gateway_id: gatewayid,
          },
        })
      );
      
      // If both mutations succeed
      if (updateAnalyzerResponse && updateGatewayResponse && updateanalyzerrentalResponse) {
        console.log(psGatewayId, psAnalyzerId,"IDSSS")
        await API.post('powersightrestapi', `/IoTShadow/AddToWhitelist`, { body: {
          shadowName: psGatewayId,
          deviceName: psAnalyzerId,
        }} );
        toast.success('Assigned Successfully!');
        setSelectedanalyzerass('');
        getdatadevicecontrol();
        setselectedAnalyzertype('');
        // setcustomernameselected([''])
        setcompanyid('');
        setclientcompanyid('');
        setselectedtype('');
        // setanalyzeridnutral('');
        // setgatewayidnutral('');
        setgatewaymodel('');
        setgatewayserial('');
        setanalyzermodel(''),
        setanalyzerserial(''),
        listgatewayunassigned(),
        setsite(''),
        setroom(''),
        setSelectedunassignedgateway(''),
        setSelectedclientunassignedgateway(''),
        listGatewayRentalsget();
        setgatewayrentaldata('')
        setgatewayid('')
        setClientSelectedOption('');
        setSelecteddata('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      } else {
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
    }
  };


  const handleUnAssignGateway = async () => {
    setIsSubmitting(true)
    try {
      const updateGateway=await API.graphql(
        graphqlOperation(mutations.updateGateway, {
          input: {  id: selectedanalyzer.gateway_id,assigned_unassigned_status:'Unassigned', communication_status: "Archive" },
        })
      );
      setPsGatewayIdWhiteList(updateGateway.data.updateGateway.ps_gateway_id)

      if(updateGateway){
        setSelectedanalyzer('');
        setOpen3(false);
        getdatadevicecontrol();
        setIsSubmitting1(false);
        setselectedAnalyzertype('');
        // setcustomernameselected([''])
        setcompanyid('');
        setclientcompanyid('');
        setselectedtype('')
        // setanalyzeridnutral('');
        // setgatewayidnutral('');
        setgatewaymodel('');
        setgatewayserial('');
        setanalyzermodel(''),
        setanalyzerserial(''),
        setSelectedgateway(''),
        setsite(''),
        setroom(''),
        setgatewayid('')
        setSelectedanalyzerass(''),
        listGatewayRentalsget();
        setgatewayrentaldata('')
        setClientSelectedOption('');
        setSelecteddata('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
      }
     
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
  if(analyzerlist?.items?.length ==0){
    handleUnAssignGateway()}else{
    setSelectedanalyzer(''); 
    setOpen3(false);
    setIsSubmitting1(false);
    getdatadevicecontrol();
    setselectedAnalyzertype('');
    // setcustomernameselected([''])
    setcompanyid('');
    setclientcompanyid('');
    // setanalyzeridnutral('');
    setsite(''),
    setroom(''),
    // setgatewayidnutral('');
    setgatewaymodel('');
    setgatewayserial('');
    setanalyzermodel(''),
    setanalyzerserial(''),
    setselectedtype('')
    setSelectedgateway(''),
    listGatewayRentalsget();
    setgatewayrentaldata('');
    setgatewayid('')
    setClientSelectedOption('');
    setSelecteddata('')
    setUnallocatedAnalyzer('');
    setUnallocatedGateway('');
    }
}, [analyzerlist, psGatewayIdWhiteList]);


  const handleUnAssign = useCallback(async (psgatewayid) => {
    console.log(psgatewayid,"ps gateway id white list")
    setIsSubmitting1(true)

    try {
     
      const updateAnalyzerResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzer, {
          input: {  id: selectedanalyzer.id,assigned_unassigned_status:'Unassigned',gateway_id:null, communication_status: "Archive" },
        })
      );
      // setPsAnalyzerId(updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id)
      const psAnalyzerIdWhiteList = updateAnalyzerResponse.data.updateAnalyzer.ps_analyzer_id
     
      const updateanalyzerrentalResponse = await API.graphql(
        graphqlOperation(mutations.updateAnalyzerRental, {
          
          input: {
            id: selectedanalyzer.analyzer_rental.items.filter((gat) => !gat.termination_date)[0].id,
            gateway_id: null,
          },
        })
      );
      
      handleAnalyzerslist()

      
      // If both mutations succeed
      if(updateAnalyzerResponse && updateanalyzerrentalResponse){
        console.log(psGatewayIdWhiteList, psAnalyzerIdWhiteList,"whitelist id")
        await API.del('powersightrestapi', `/IoTShadow/RemoveFromWhitelist`, { body: {
          shadowName: psgatewayid,
          deviceName: psAnalyzerIdWhiteList,
        }} );
        toast.success('Updated Successfully!');}
        setSelectedanalyzer('');
        setOpen3(false);
        getdatadevicecontrol();
        setIsSubmitting1(false);
        setselectedAnalyzertype('');
        // setcustomernameselected([''])
        setcompanyid('');
        setclientcompanyid('');
        setselectedtype('')
        // setanalyzeridnutral('');
        // setgatewayidnutral('');
        setgatewaymodel('');
        setgatewayserial('');
        setanalyzermodel(''),
        setanalyzerserial(''),
        setSelectedgateway(''),
        setsite(''),
        setroom(''),
        setgatewayid('')
        setSelectedanalyzerass(''),
        listGatewayRentalsget();
        setgatewayrentaldata('')
        setClientSelectedOption('');
        setSelecteddata('')
        setUnallocatedAnalyzer('');
        setUnallocatedGateway('');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong!');
      setIsSubmitting1(false)
    }
  },[selectedanalyzer, psGatewayIdWhiteList]);
  


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
              alignItems="center" // Align items vertically
              spacing={1}
            ><Grid
            container
                spacing={1}>
              <Grid
              xs={12}
              md={6}
              item>
              <Typography variant="h5">Network Management</Typography>
              </Grid>
            {(logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) && (
                        
                <Box
                // component = "form"
                sx={{
                  backgroundColor: 'white',
                  padding: 1,
                  // borderRadius: 0,
                  border: '1px solid black',
                  position: 'relative',
                  left: '-200px',
                  top: '20px',
                  width: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  <Grid
                  xs={12}
                  md={6}
                  item
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginLeft: '5px', 
                    whiteSpace: 'nowrap',
                  }}
                  >
                    <Typography variant="h5">
                    {loggedInCustomerName}
                    </Typography>
                  </Grid>
                  </Box>
            
            )}
            </Grid>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              flexWrap="wrap"
              spacing={3}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  md={4}
                  item
                >
                  <Card>
                    <Typography
                      sx={{ mt: 2, ml: 2, mb: 2 }}
                      variant="h5"
                    >
                      Your Gateways
                    </Typography>

                    <Grid
                      item
                      xs={12}
                      md={12}
                    >
                      
                      {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                      <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 10 }}>
                        {gatewayidnutral && (
                          <>
                            {!gatewaymodel || !gatewayserial ? (
                              <Button
                                variant="contained"
                                onClick={() => handleGatewayCreate(gatewayid)}
                                fullWidth
                                /* disabled */
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                Create/Delete/Edit
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() => handleGatewayCreate(gatewayid)}
                                fullWidth
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                Create/Delete/Edit
                              </Button>
                            )}
                          </>
                        )}
                        {!gatewayidnutral && (
                          <>
                            {!gatewaymodel || !gatewayserial ? (
                              <Button
                                variant="contained"
                                onClick={() => handleGatewayCreate(gatewayid)}
                                fullWidth
                                /* disabled */
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                {modelsetaildata.model === gatewaymodel &&
                                modelsetaildata.serial_number === gatewayserial
                                  ? 'Copy'
                                  : 'Create/Delete/Edit'}
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() => handleGatewayCreate(gatewayid)}
                                fullWidth
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                {modelsetaildata.model === gatewaymodel &&
                                modelsetaildata.serial_number === gatewayserial
                                  ? 'Copy'
                                  : 'Create/Delete/Edit'}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      )}
                    </Grid>
                    {
                    // (selectedtype == "UnAllocate" || selecteddata?.assigned_unassigned_status == "Assigned") && 
                          (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) &&(
                          <Button
                          onClick={() => handleGatewayCreate(gatewayid)}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                                style={{ marginRight: 10, width: '40%' }} // Set width to 40%
                          >
                           Edit
                          </Button>)}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        paddingTop: 5,
                        paddingLeft: 10,
                      }}
                    >
                      {(gatewayid != '' ) && (
                        <>
                         {selectedtype == "Allocate" && selecteddata?.active_inactive_status !="Inactive" &&(
                          <Button
                            onClick={() => {
                              updateallocation('88')
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           Allocate
                          </Button>)}
                          {/* {(selectedtype == "UnAllocate")  &&( */}
                          {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin")  && (selectedtype == "UnAllocate")  &&(
                          <Button
                            onClick={() => {
                               handleOpen();
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           Unallocate
                          </Button>)}
                          
                          
                          {(selectedtype == "UnAllocate" && 
                          (selecteddata.client_id == null || selecteddata.client_id == "0000-0000-0000-0000-0000-0000-0000-0000")) && 
                          (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) &&(
                          <Button
                            onClick={() => {
                              if(!clientcompanyid){
                                alert('Please Select Client !')
                              } else {
                               handleOpen5();
                              }
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           Reallocate
                          </Button>)}
                          {(selecteddata.client_id != null && selecteddata.client_id != "0000-0000-0000-0000-0000-0000-0000-0000") && 
                          (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) &&
                          (selectedtype == "UnAllocate") && (
                          <Button
                            onClick={() => {
                               handleOpen7();
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           UnAllocate
                          </Button>)}
                          
                        </>
                      )}
                    </div>

                    <Grid
                      container
                      spacing={2}
                      style={{ padding: 10 }}
                    >
                      <Grid
                        item
                        xs={12}
                        md={6}
                      >
                        <TextField
                          label="Enter Model#"
                          name="name"
                          onChange={handleChangegatewaymodel}
                          value={gatewaymodel}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {gatewaymodel && ( // Render icon only if gatewaymodel is not empty
                                  <IconButton
                                    aria-label="clear"
                                    onClick={() => {
                                      // Clear the value when close icon is clicked
                                      setSelecteddata('')
                                      setcustomernameselected;
                                      [''];
                                      setclientnameselected;
                                      setClientSelectedOption('');
                                      setSelectedanalyzer('');
                                      setanalyzermodel(''),
                                      setanalyzerserial(''),
                                      setgatewayserial('');
                                      setgatewaymodel('');
                                      setgatewayid('');
                                      setselectedAnalyzertype('')
                                      setgatewayidnutral('');
                                      setanalyzeridnutral('')
                                      listgatewayunassigned();
                                      setHasSingleItem(false);
                                      setcompanyid('');
                                      setclientcompanyid('');
                                      setsite('');
                                      setroom('');
                                      setselectedgatewayrental('')
                                      setSelectedgateway('')
                                      setSelectedunassignedgateway('')
                                      setSelectedclientunassignedgateway('')
                                      setselectedtype('')
                                      setCustomerfiltername('')
                                      setClientfiltername('')
                                      setUnallocatedAnalyzer('');
                                      setUnallocatedGateway('');
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{ paddingRight: 1 }}
                      >
                        <TextField
                          // error={!!(formik.touched.email && formik.errors.email)}
                          // helperText={formik.touched.email && formik.errors.email}
                          label="Enter Serial#"
                          name="email"
                          inputProps={{ maxLength: 6 }}
                          // onBlur={formik.handleBlur}
                          onChange={handleChangegatewayserialnumber}
                          value={gatewayserial}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {gatewaymodel && ( // Render icon only if gatewaymodel is not empty
                                  <IconButton
                                    aria-label="clear"
                                    onClick={() => {
                                      // Clear the value when close icon is clicked
                                      setSelecteddata('')
                                      setcustomernameselected(['']);
                                      setclientnameselected('');
                                      setClientSelectedOption('');
                                      setgatewayserial('');
                                      setSelectedanalyzer('');
                                      setanalyzermodel(''),
                                      setanalyzerserial(''),
                                      setselectedAnalyzertype('')
                                      setgatewaymodel('');
                                      setgatewayid('');
                                      setselectedgatewayrental('')
                                      setgatewayidnutral('');
                                      setanalyzeridnutral('')
                                      listgatewayunassigned();
                                      setHasSingleItem(false);
                                      setcompanyid('');
                                      setclientcompanyid('');
                                      setsite('');
                                      setroom('');
                                      setSelectedgateway('')
                                      setSelectedunassignedgateway('')
                                      setSelectedclientunassignedgateway('')
                                      setselectedtype('')
                                      setCustomerfiltername('')
                                      setClientfiltername('')
                                      setUnallocatedAnalyzer('');
                                      setUnallocatedGateway('');
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }}
                          // Adjust the height as needed
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={3}
                    >
                      {(logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') && 
                      <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Allocated
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <AllocatedGatewayTable
                            count={customersStore.customersCount}
                            items={getgatewayassigned}
                            setcompanyid={setcompanyid}
                            setclientcompanyid={setclientcompanyid}
                            setmodelsetaildata={setmodelsetaildata}
                            setcustomernameselected={setcustomernameselected}
                            setclientnameselected={setclientnameselected}
                            setSelecteddata={setSelecteddata}
                            setHasSingleItem={setHasSingleItem}
                            setselectedtype={setselectedtype}
                            setgatewayid={setgatewayid}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setgatewaymodel={setgatewaymodel}
                            setgatewayserial={setgatewayserial}
                            setsite={setsite}
                            setroom={setroom}
                            setSelectedunassignedgateway={setSelectedunassignedgateway}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                        </div>
                      </Grid>}
                      <Grid
                        xs={12}
                        md={6}
                        item
                        
                        alignItems="center"
                      >
                        <Typography
                          sx={{ mt: 2, ml: 0, mb: 2 }}
                          variant="h6"
                        >
                          Assigned to Analyzer
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <AssignedGatewayTable
                            count={customersStore.customersCount}
                            items={getgatewayassigned}
                            setgatewayid={setgatewayid}
                            setgatewaymodel={setgatewaymodel}
                            setgatewayserial={setgatewayserial}
                            setSelecteddata={setSelecteddata}
                            setcompanyid={setcompanyid}  
                            setclientcompanyid={setclientcompanyid}                        
                            setSelectedgateway={setSelectedgateway}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setsite={setsite}
                            setroom={setroom}
                            setselectedtype={setselectedtype}
                            setcustomernameselected={setcustomernameselected}
                            setclientnameselected={setclientnameselected}
                            loggedInCustomerName={loggedInCustomerName}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                        </div>
                      </Grid>
                     
                      
                    </Grid>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={3}
                    >
                      {(logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') && <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Unallocated
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          {unallocatedGateway.length > 0 ? (
                          <UnallocatedGatewayTable
                            count={customersStore.customersCount}
                            setcompanyid={setcompanyid}
                            setselectedtype={setselectedtype}
                            setmodelsetaildata={setmodelsetaildata}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setSelecteddata={setSelecteddata}
                            setHasSingleItem={setHasSingleItem}
                            items={unallocatedGateway}
                            setgatewaymodel={setgatewaymodel}
                            setgatewayserial={setgatewayserial}
                            setgatewayid={setgatewayid}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                          ): <UnallocatedGatewayTable
                          count={customersStore.customersCount}
                          setcompanyid={setcompanyid}
                          setselectedtype={setselectedtype}
                          setmodelsetaildata={setmodelsetaildata}
                          setgatewayidnutral={setgatewayidnutral}
                          setanalyzeridnutral={setanalyzeridnutral}
                          setSelecteddata={setSelecteddata}
                          setHasSingleItem={setHasSingleItem}
                          items={getgatewayassigned}
                          setgatewaymodel={setgatewaymodel}
                          setgatewayserial={setgatewayserial}
                          setgatewayid={setgatewayid}
                          onDeselectAll={customersSelection.handleDeselectAll}
                          onDeselectOne={customersSelection.handleDeselectOne}
                          onPageChange={customersSearch.handlePageChange}
                          onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                          onSelectAll={customersSelection.handleSelectAll}
                          onSelectOne={customersSelection.handleSelectOne}
                          page={customersSearch.state.page}
                          rowsPerPage={customersSearch.state.rowsPerPage}
                          selected={customersSelection.selected}
                        />}
                        </div>
                      </Grid>}
                      <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Unassigned to Analyzer
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <UnassignedGatewayTable
                            count={customersStore.customersCount}
                            items={getgatewayassigned}
                            setcompanyid={setcompanyid}
                            setclientcompanyid={setclientcompanyid}
                            // setmodelsetaildata={setmodelsetaildata}
                            setHasSingleItem={setHasSingleItem}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setcustomernameselected={setcustomernameselected}
                            setclientnameselected={setclientnameselected} 
                            setClientSelectedOption={setClientSelectedOption}
                            selectedanalyzerass={selectedanalyzerass}
                            setSelecteddata={setSelecteddata}
                            setselectedtype={setselectedtype}
                            setgatewayid={setgatewayid}
                            setgatewaymodel={setgatewaymodel}
                            setgatewayserial={setgatewayserial}
                            setSelectedunassignedgateway={setSelectedunassignedgateway}
                            setSelectedclientunassignedgateway={setSelectedclientunassignedgateway}
                            setsite={setsite}
                            setroom={setroom}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {(logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster') ?
                (<Grid
                  xs={12}
                  md={4}
                  item
                >
                  <Card>
                    <Typography
                      sx={{ mt: 2, ml: 2, mb: 2 }}
                      variant="h5"
                    >
                      Your Clients
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 10 }}>
                      <Button
                        // onClick={() => handleButtonClick()}
                        variant="contained"
                        fullWidth
                        size="small"
                        color="success"
                        style={{ marginRight: 5, marginBottom: 7, width: '35%' }} // Set width to 40%
                      >
                        Create/Delete/Edit
                      </Button>
                    </div>
                    <Grid
                      container
                      spacing={2}
                      sx={{ padding: 1 }}
                    >
                      <Grid
                        item
                        xs={12}
                      >
                        <>  
                        {(gatewayidnutral =='') || (analyzeridnutral == '') ? (
                            <>
                              {clientcompanyname?.items && (                          
                                <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={clientsortedOptions}
                                  value={clientcompanyname.items?.find((option) => option.id === cus_id)}
                                  getOptionLabel={(option) => {
                                    if (typeof option === 'string') {
                                      return option;
                                    }
                                    if (option.name) {
                                      return option.name;
                                    }

                                    return option.ps_client_id;
                                  }}
                                  onInputChange={handleInputChangeclientcompanyid}
                                  onChange={(e, value) => {
                                    console.log(value, 'idddddddddddddddddddddddddddds');
                                    setclientcompanyid(value?.id);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Enter Client"
                                      size="small"
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
                                            {option.ps_client_id}
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  }}
                                />
                              )}
                            </>
                          ) : null}
                          {(gatewayidnutral ==1) || (analyzeridnutral ==1) ? (
                            
                            <Autocomplete
                              disablePortal
                              id="multiple-limit-tags"
                              disabled={true}
                              options={clientnameselected} 
                              // options={Array.isArray(clientnameselected) ? clientnameselected : []}
                              getOptionLabel={(option) => option} // Since 'option' is a string, no need for option.title
                              value={clientSelectedOption} // Set the default value to an array containing 'user'
                              onChange={handleAutocompleteChangeClient}
                              renderInput={(params) => {
                                console.log('Options:', clientSelectedOption);
                                return(
                                <TextField
                                  {...params}
                                  label="Assigned Client"
                                  placeholder="Favorites"
                                />)
                              }}
                              sx={{ width: '420px', marginBottom: '10px' }}
                            />
                          ):null}
                          {(gatewayidnutral ==2) || (analyzeridnutral ==2) ? (
                            <>
                              {clientcompanyname?.items && (
                                // Check if companyname?.items is defined
                                <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={clientsortedOptions}
                                  value={clientcompanyname.items.find((option) => option.id === cus_id)}
                                  getOptionLabel={(option) => {
                                    if (typeof option === 'string') {
                                      return option;
                                    }
                                    if (option.name) {
                                      return option.name;
                                    }

                                    return option.ps_client_id;
                                  }}
                                  onChange={(e, value) => {
                                    console.log(value, 'idddddddddddddddddddddddddddds');
                                    setclientcompanyid(value?.id);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Enter Client"
                                      size="small"
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
                                            {option.ps_client_id}
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  }}
                                />
                              )}
                            </>
                          ):null}

          
                        </>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={6}
                      >
                        <TextField
                          label="Site"
                          name="site"
                          // onBlur={formik.handleBlur}
                          onChange={handleChangesite}
                          value={getsite}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{ paddingRight: 1 }}
                      >
                        <TextField
                          // error={!!(formik.touched.email && formik.errors.email)}
                          // helperText={formik.touched.email && formik.errors.email}
                          label="Room"
                          name="room"
                          // onBlur={formik.handleBlur}
                          onChange={handleChangeroom}
                          value={getroom}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }} // Adjust the height as needed
                        />
                      </Grid>
                    </Grid>

                    {/* <Grid
                      container
                      spacing={3}
                    ></Grid> */}
                  </Card>
                  <Card style={{ marginBottom: 5, marginTop: 35 }}>
                    <CardContent
                      style={{ borderBottom: '1px solid #e0e0e0' }}
                      className="scroolcustomer"
                    >
                      <Typography
                        sx={{ mb: 2 }}
                        variant="h5"
                      >
                        Your Monitoring Networks
                      </Typography>
                      {gatewayrentaldata?.items?.length > 0 ? (
                        gatewayrentaldata?.items
                          .filter((option) => {
                            const matchesTerminationDate = option?.termination_date === null;
                            const matchesGateway = option?.gateway !== null;
                            const matchesClientName =
                              !clientfiltername ||
                              option?.client?.name
                                .toLowerCase()
                                .includes(clientfiltername.toLowerCase());

                            return matchesTerminationDate && matchesGateway && matchesClientName;
                          })
                          .map((option, index) => (
                            <Card
                              onClick={() => {
                                setgatewayid(option.gateway.id);
                                setgatewaymodel(option.gateway.model);
                                setgatewayserial(option.gateway.serial_number);
                                setgatewayidnutral('1');
                                setanalyzeridnutral('1');
                                console.log(
                                  option,
                                  'optionnnnn'
                                );
                                console.log(
                                  option?.customer.id,
                                  'kiiiiiiiiiiiiiiiiiiiii888888888888888888888'
                                );
                                setroom(option?.gateway?.room_location);
                                setcompanyid(option?.customer?.id);
                                setclientcompanyid(option?.client?.id);
                                setsite(option?.gateway?.site_location);
                                setcustomernameselected([option?.customer?.name]);
                                setclientnameselected([option?.client?.name])
                                if(option?.client_id){
                                setClientSelectedOption([option?.client?.name])
                                }else if(!option?.client_id){
                                  setClientSelectedOption([option?.customer?.name])
                                }
                                setselectedgatewayrental(option.gateway)
                                // setselectedtype('UnAllocate');
                                if(option?.gateway?.analyzer?.items?.length > 0){
                                  setSelectedgateway(option.gateway.id)}
                                  else{
                                    setSelectedclientunassignedgateway(option?.client?.id)
                                    setselectedtype('UnAllocate')
                                  }
                                
                              }}
                              key={index}
                              style={{
                                backgroundColor: '#f4f4f4',
                                marginTop: '15px',
                                cursor: 'pointer',
                              }}
                            >
                              <Grid
                                container
                                spacing={1}
                              >
                                <Grid
                                  xs={12}
                                  md={6}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{ ml: 3, mt: 3 }}
                                  >
                                    Gateway{' '}
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {option?.gateway?.ps_gateway_id}
                                    </Typography>
                                  </Typography>
                                </Grid>
                                <Grid
                                  xs={12}
                                  sm={12}
                                  md={6}
                                >
                                  <Stack spacing={0}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontSize: 12, marginTop: '15px' }}
                                    >
                                      {option?.client_id == null ? "Customer" : "Client"}
                                      {/* Customer */}
                                      {/* Client */}
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {option?.client_id == null ? option?.customer?.name : option?.client?.name}
                                      {/* {option?.customer?.name} */}
                                      {/* {option?.client?.name} */}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                              <Grid
                                container
                                spacing={1}
                              >
                                <Grid
                                  xs={12}
                                  md={6}
                                ></Grid>
                                <Grid
                                  xs={12}
                                  sm={12}
                                  md={6}
                                >
                                  <Stack spacing={0}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontSize: 12, marginTop: '0px' }}
                                    >
                                    Site & Room Field
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {option?.gateway?.site_location} -{' '}
                                      {option?.gateway?.room_location}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                              <Grid sx={{ mt: 2 }}>
                              <Grid
                                container
                                spacing={1}
                              >
                              <Grid
                        xs={12}
                        md={6}
                      >
                        <Typography
                          variant="h6"
                          sx={{ ml: 3, mt: 1,mb:1.5 }}
                        >
                          Data Devices{' '}
                          </Typography>
                          </Grid>
                          {option?.gateway?.analyzer?.items?.length > 0 && (
                          <Grid
                        xs={12}
                        md={6}
                        sx={{ textAlign: 'left' }}
                      >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontSize: 12, marginTop: '5px' }}
                          >
                          Circuit{' '}
                          </Typography>
                          </Grid>)}
                          </Grid>

                      {option?.gateway?.analyzer?.items?.length > 0 ? (
                      option.gateway.analyzer.items.map((analyzer, index) => (
                      <Grid container spacing={2} className='das_sec' sx={{ mb: 1 }}>
                        <Grid item sm={5.5} xs={12} sx={{}}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ fontSize: 12,ml:2 }}
                          >
                             {analyzer?.ps_analyzer_id}
                          </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12} sx={{ textAlign: 'left' }}>
                          <Typography
                           variant="subtitle1"
                           color="text.secondary"
                           sx={{ fontSize: 12}}
                          >
                            {analyzer?.circuit  ? analyzer?.circuit:'-'}
                          </Typography>
                        </Grid>
                        </Grid>
                          ))
                          ) : (
                            <Grid item sm={5.5} xs={12} sx={{mt:0}}>
                            <Typography
                              variant="subtitle1"
                              color="text.secondary"
                              sx={{ fontSize: 12,ml:2}}
                            >
                              -
                            </Typography>
                          </Grid>
                            
                          )}
                        </Grid>
                            </Card>
                          ))
                      ) : (
                        <Typography variant="body1">No Monitoring Networks match.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>)
              :
                (<Grid
                  xs={12}
                  md={4}
                  item
                >
                  <Card>
                    <Typography
                      sx={{ mt: 2, ml: 2, mb: 2 }}
                      variant="h5"
                    >
                      {userClient ? "Client" : " Your Customers"}
                      {/* Customers */}
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 10 }}>
                      {(logedinusergroup != "Client" && logedinusergroup != "ClientMaster") && (
                      <Button
                        onClick={() => handleButtonClick()}
                        variant="contained"
                        fullWidth
                        size="small"
                        color="success"
                        style={{ marginRight: 5, marginBottom: 7, width: '35%' }} // Set width to 40%
                      >
                        Create/Delete/Edit
                      </Button>
                      )}
                    </div>
                    <Grid
                      container
                      spacing={2}
                      sx={{ padding: 1 }}
                    >
                      <Grid
                        item
                        xs={12}
                      >
                        {(logedinusergroup == "Client" || logedinusergroup == "ClientMaster") && (
                          <>
                            <TextField
                          label="Client"
                          name="clientname"
                          // onBlur={formik.handleBlur}
                          // onChange={handleChangesite}
                          value={loggedInClientName}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '50px',
                              width: '380px' // Adjust the height as needed
                            },
                          }}
                        />
                          </>
                        )}
                        {(logedinusergroup != "Client" && logedinusergroup != "ClientMaster") && (
                        <>
                          {(gatewayidnutral =='') || (analyzeridnutral == '') ? (
                            <>
                              {companyname?.items && (
                                // Check if companyname?.items is defined
                                <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={sortedOptions}
                                  value={companyname.items.find((option) => option.id === cus_id)}
                                  getOptionLabel={(option) => {
                                    console.log(option,"optionnn neutral ' ' ")
                                    if (typeof option === 'string') {
                                      return option;
                                    }
                                    if (option.name) {
                                      return option.name;
                                    }

                                    return option.ps_customer_id;
                                  }}
                                  onInputChange={handleInputChangecompanyid}
                                  onChange={(e, value) => {
                                    // console.log(value, 'idddddddddddddddddddddddddddds');
                                    setcompanyid(value?.id)
                                    // console.log(getgatewayassigned,"sorted options")
                                    const filtered = getgatewayassigned.filter(
                                      (gateway) => gateway.allocated_unallocated_status === "Unallocated"
                                    );
                                    setUnallocatedGateway(filtered)
                                    // console.log(filtered, 'Filtered gateways for selected customer');
                                    const filteredAnalyzer = datadevicedata.filter((analyzer) => 
                                      analyzer.allocated_unallocated_status === "Unallocated");
                                    setUnallocatedAnalyzer(filteredAnalyzer);
                                    // console.log(filteredAnalyzer," filtered analysers for selected customer")
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Enter Customer"
                                      size="small"
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
                              )}
                            </>
                          ):null}
                          {(gatewayidnutral ==1) || (analyzeridnutral ==1)  ? (
                            // <Autocomplete
                            //   disablePortal
                            //   id="multiple-limit-tags"
                            //   disabled={true}                              
                            //   options={customernameselected} // Include 'user' as the default option
                            //   getOptionLabel={(option) => option} // Since 'option' is a string, no need for option.title
                            //   value={customernameselected} // Set the default value to an array containing 'user'
                            //   onChange={handleAutocompleteChange}
                            //   renderInput={(params) => (
                            //     <TextField
                            //       {...params}
                            //       label="Assigned Customer"
                            //       placeholder="Favorites"
                            //     />
                            //   )}
                            //   sx={{ width: '420px', marginBottom: '10px' }}
                            // />
                            <Autocomplete
                              disablePortal
                              id="multiple-limit-tags"
                              options={customernameselected} // Options for Autocomplete
                              getOptionLabel={(option) => option} // Get the label for the options
                              value={customernameselected}
                              onChange={handleAutocompleteChange}
                              // onChange={(event, newValue) => {
                              //   handleAutocompleteChange(newValue); // Handle the change
                              // }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Assigned Customer"
                                  placeholder="Favorites"
                                  InputProps={{
                                    ...params.InputProps,
                                    readOnly: true, // Disable typing but keep field interactive for the clear icon
                                    endAdornment: (
                                    <InputAdornment position="end">
                                      {customernameselected && (
                                      <IconButton
                                        aria-label="clear"
                                        onClick={() => {
                                        // Clear customer selection
                                        setSelecteddata('');
                                      setcustomernameselected;
                                      [''];
                                      setSelectedanalyzer('');
                                      setanalyzermodel(''),
                                      setanalyzerserial(''),
                                      getdatadevicecontrol();
                                      setanalyzerid('');
                                      setgatewayserial(''),
                                      setgatewaymodel(''),
                                      setHasSingleDevice(false);
                                      setgatewayidnutral('');
                                      setcompanyid('');
                                      setclientcompanyid('');
                                      setsite('');
                                      setroom('');
                                      setgatewayid('')
                                      setanalyzeridnutral('');
                                      setSelectedanalyzerass('');
                                      setselectedAnalyzertype('')
                                      setselectedtype('')
                                      setCustomerfiltername('')
                                      setClientfiltername('')
                                      setClientSelectedOption('');
                                      setUnallocatedAnalyzer('');
                                      setUnallocatedGateway('');
                                      setselectedgatewayrental('')
                                      setHasSingleItem(false)
                                      listgatewayunassigned()
                                      setSelectedunassignedgateway('')
                                      setSelectedclientunassignedgateway('')
                                        }}
                                      >
                                        <ClearIcon />
                                      </IconButton>
                                      )}
                                    </InputAdornment>
                                    ),
                                  }}
                                />
                              )}
                                sx={{ width: '420px', marginBottom: '10px' }}
                            />
                            
                          ):null}
                          {(gatewayidnutral ==2) || (analyzeridnutral ==2) ? (
                            <>
                              {companyname?.items && (
                                // Check if companyname?.items is defined
                                <Autocomplete
                                  disablePortal
                                  id="combo-box-demo"
                                  options={sortedOptions}
                                  value={companyname.items.find((option) => option.id === cus_id)}
                                  getOptionLabel={(option) => {
                                    // console.log(option,"neutral 2")
                                    if (typeof option === 'string') {
                                      return option;
                                    }
                                    if (option.name) {
                                      return option.name;
                                    }

                                    return option.ps_customer_id;
                                  }}
                                  onChange={(e, value) => {
                                    console.log(value, 'idddddddddddddddddddddddddddds value');
                                    setcompanyid(value?.id);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Enter Customer"
                                      size="small"
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
                              )}
                            </>
                          ):null}

          
                        </>
                        )}
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={6}
                      >
                        <TextField
                          label="Site"
                          name="site"
                          // onBlur={formik.handleBlur}
                          onChange={handleChangesite}
                          value={getsite}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{ paddingRight: 1 }}
                      >
                        <TextField
                          // error={!!(formik.touched.email && formik.errors.email)}
                          // helperText={formik.touched.email && formik.errors.email}
                          label="Room"
                          name="room"
                          // onBlur={formik.handleBlur}
                          onChange={handleChangeroom}
                          value={getroom}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }} // Adjust the height as needed
                        />
                      </Grid>
                    </Grid>

                    {/* <Grid
                      container
                      spacing={3}
                    ></Grid> */}
                  </Card>
                  <Card style={{ marginBottom: 5, marginTop: 35 }}>
                    <CardContent
                      style={{ borderBottom: '1px solid #e0e0e0' }}
                      className="scroolcustomer"
                    >
                      <Typography
                        sx={{ mb: 2 }}
                        variant="h5"
                      >
                       Your Monitoring Networks
                      </Typography>
                      {gatewayrentaldata?.items?.length > 0 ? (
                        gatewayrentaldata?.items
                          .filter((option) => {
                            const matchesTerminationDate = option?.termination_date === null;
                            const matchesGateway = option?.gateway !== null;
                            const matchesCustomerName =
                              !customerfiltername ||
                              option?.customer?.name
                                .toLowerCase()
                                .includes(customerfiltername.toLowerCase());
                            const matchesClientId = userClient ? option?.client?.id === userClient : true;

                            return matchesTerminationDate && matchesGateway && matchesCustomerName && matchesClientId;
                          })
                          .map((option, index) => (
                            <Card
                              onClick={() => {
                                setgatewayid(option.gateway.id);
                                setgatewaymodel(option.gateway.model);
                                setgatewayserial(option.gateway.serial_number);
                                setgatewayidnutral('1');
                                setanalyzeridnutral('1');
                                // console.log(
                                //   option,
                                //   'option...'
                                // );
                                console.log(
                                  option?.customer.id,
                                  'kiiiiiiiiiiiiiiiiiiiii888888888888888888888'
                                );
                                setroom(option?.gateway?.room_location);
                                setcompanyid(option?.customer?.id);
                                setsite(option?.gateway?.site_location);
                                setcustomernameselected([option?.customer?.name]);
                                setselectedgatewayrental(option.gateway)
                                // setselectedtype('UnAllocate');
                                if(option?.gateway?.analyzer?.items?.length > 0){
                                  setSelectedgateway(option.gateway.id)}
                                  else{
                                    setSelectedunassignedgateway(option?.customer?.id)
                                    setselectedtype('UnAllocate')
                                  }
                                
                              }}
                              key={index}
                              style={{
                                backgroundColor: '#f4f4f4',
                                marginTop: '15px',
                                cursor: 'pointer',
                              }}
                            >
                              <Grid
                                container
                                spacing={1}
                              >
                                <Grid
                                  xs={12}
                                  md={6}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{ ml: 3, mt: 3 }}
                                  >
                                    Gateway{' '}
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {option?.gateway?.ps_gateway_id}
                                    </Typography>
                                  </Typography>
                                </Grid>
                                <Grid
                                  xs={12}
                                  sm={12}
                                  md={6}
                                >
                                  <Stack spacing={0}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontSize: 12, marginTop: '15px' }}
                                    >
                                      {userClient? "Client" : "Customer"}
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                      {userClient? (option?.client?.name) : (option?.customer?.name)}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                              <Grid
                                container
                                spacing={1}
                              >
                                <Grid
                                  xs={12}
                                  md={6}
                                ></Grid>
                                <Grid
                                  xs={12}
                                  sm={12}
                                  md={6}
                                >
                                  <Stack spacing={0}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontSize: 12, marginTop: '0px' }}
                                    >
                                    Site & Room Field
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      sx={{ fontSize: 12 }}
                                    >
                                    {option?.gateway?.site_location} -{' '}
                                    {option?.gateway?.room_location}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                              <Grid sx={{ mt: 1 }}>
                              <Grid
                                container
                                spacing={1}
                              >
                              <Grid
                        xs={12}
                        md={6}
                      >
                        <Typography
                          variant="h6"
                          sx={{ ml: 3, mt: 0, mb:1.0 }}
                        >
                          Data Devices{' '}
                          </Typography>
                          </Grid>
                          {option?.gateway?.analyzer?.items?.length > 0 && (
                          <Grid
                            xs={12}
                            md={6}
                            sx={{ textAlign: 'left' }}
                          >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontSize: 12, marginTop: '5px' }}
                          >
                          Circuit{' '}
                          </Typography>
                          </Grid>)}
                          </Grid>

                        {option?.gateway?.analyzer?.items?.length > 0 ? (
                        option.gateway.analyzer.items.map((analyzer, index) => (
                      <Grid container spacing={2} className='das_sec' sx={{ mb: 1 }}>
                        <Grid item sm={5.5} xs={12} sx={{}}>
                          <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ fontSize: 12,ml:2 }}
                          >
                             {analyzer?.ps_analyzer_id}
                          </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12} sx={{ textAlign: 'left' }}>
                          <Typography
                           variant="subtitle1"
                           color="text.secondary"
                           sx={{ fontSize: 12}}
                          >
                            {analyzer?.circuit  ? analyzer?.circuit:'-'}
                          </Typography>
                        </Grid>
                        </Grid>
                          ))
                          ) : (
                            <Grid item sm={5.5} xs={12} sx={{mt:0}}>
                            <Typography
                              variant="subtitle1"
                              color="text.secondary"
                              sx={{ fontSize: 12,ml:2}}
                            >
                              -
                            </Typography>
                          </Grid>
                            
                          )}
                        </Grid>
                            </Card>
                          ))
                      ) : (
                        <Typography variant="body1">No Monitoring Networks match.</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                )}
                <Grid
                  xs={12}
                  md={4}
                  item
                >
                  <Card>
                    <Typography
                      sx={{ mt: 2, ml: 2, mb: 2 }}
                      variant="h5"
                    >
                      Your Analyzers
                    </Typography>
                    {(logedinusergroup == "Admin" || logedinusergroup == "AdminMaster") && (
                    <div style={{ display: 'flex', flexDirection: 'row', paddingLeft: 10 }}>
                      
                      {analyzeridnutral && (
                          <>
                            {!analyzermodel || !analyzerserial ? (
                              <Button
                                variant="contained"
                                onClick={() => handleDeviceCreate(analyzerid)}
                                fullWidth
                                /* disabled */
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                Create/Delete/Edit
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() => handleDeviceCreate(analyzerid)}
                                fullWidth
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                Create/Delete/Edit
                              </Button>
                            )}
                          </>
                        )}
                        {!analyzeridnutral && (
                          <>
                            {!analyzermodel || !analyzerserial ? (
                              <Button
                                variant="contained"
                                onClick={() => handleDeviceCreate(analyzerid)}
                                fullWidth
                                /* disabled */
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                {modelsetaildatas.model === analyzermodel &&
                                modelsetaildatas.serial_number === analyzerserial
                                  ? 'Copy'
                                  : 'Create/Delete/Edit'}
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() => handleDeviceCreate(analyzerid)}
                                fullWidth
                                size="small"
                                color="success"
                                style={{ marginRight: 5, width: '40%' }} // Set width to 40%
                              >
                                {modelsetaildatas.model === analyzermodel &&
                                modelsetaildatas.serial_number === analyzerserial
                                  ? 'Copy'
                                  : 'Create/Delete/Edit'}
                              </Button>
                            )}
                          </>
                        )}
                        </div>
                      )}
                      {
                      // (selectedAnalyzertype == 'UnAllocate' ||selectedAnalyzertype == 'Assign' || selectedAnalyzertype == 'UnAssign' ) && 
                            (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) && (
                          <Button
                            onClick={() => handleDeviceCreate(analyzerid)}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginLeft: 10, width: '40%' }}
                          >
                            Edit
                          </Button>) 
                          }
                   <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        paddingTop: 5,
                        paddingLeft: 10,
                      }}
                    >
                      {(analyzerid != ''|| gatewayid !='') && (
                        <>
                         {selectedAnalyzertype == 'Allocate' && selecteddevicedata?.active_inactive_status !="Inactive" &&(
                          <Button
                            onClick={() => {
                             updateanalyzerallocation('88');
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           Allocate
                          </Button>
                         )}
                          {(logedinusergroup == "AdminMaster" || logedinusergroup == "Admin") &&
                          (selectedAnalyzertype == 'UnAllocate' ||selectedAnalyzertype == 'Assign') && (
                          <Button
                            onClick={() =>
                              handleOpen2()
                            }
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }}
                          >
                            UnAllocate
                          </Button>) 
                          }
                          {(selecteddevicedata.client_id != null && selecteddevicedata.client_id != "0000-0000-0000-0000-0000-0000-0000-0000") && 
                          (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) &&
                          (selectedAnalyzertype == 'UnAllocate' ||selectedAnalyzertype == 'Assign') && (
                          <Button
                            onClick={() => {
                               handleOpen8();
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }} // Add margin-right to create space between buttons
                          >
                           UnAllocate
                          </Button>)}
                          {(selectedAnalyzertype == 'UnAllocate' ||selectedAnalyzertype == 'Assign') && 
                            (selecteddevicedata.client_id == null || selecteddevicedata.client_id == "0000-0000-0000-0000-0000-0000-0000-0000") &&
                            (logedinusergroup == 'Customer' || logedinusergroup == 'CustomerMaster' ) && (
                          <Button
                            onClick={() => {
                              if (!clientcompanyid) {
                                alert('Please Select Client !');
                              } else {
                              handleOpen6();
                              }
                            }}
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }}
                          >
                            ReAllocate
                          </Button>) 
                          }
                          {(selectedAnalyzertype == 'Assign'||selectedAnalyzertype == 'UnAllocate'  ) && 
                           (logedinusergroup != 'Client' && logedinusergroup != 'ClientMaster') && (
                          <Button
                            onClick={() =>
                              handleAssign()
                            }
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }}
                            disabled={getgatewayassigned?.length==0}
                          >
                            Assign
                          </Button>) 
                          }
                          {(selectedAnalyzertype == 'UnAssign') &&
                          (logedinusergroup != 'Client' && logedinusergroup != 'ClientMaster') && (
                          <Button
                            onClick={() =>
                              handleOpen3()
                            }
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            style={{ marginBottom: 5, marginRight: 3 }}
                          >
                            UnAssign
                          </Button>) 
                          }
                        </>
                      )}
                    </div>

                    <Grid
                      container
                      spacing={2}
                      style={{ padding: 10 }}
                    >
                      <Grid
                        item
                        xs={12}
                        md={6}
                      >
                        <TextField
                          label="Enter Model#"
                          name="name"
                          // onBlur={formik.handleBlur}
                          onChange={handleChangeanalyzermodel}
                          value={analyzermodel}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {analyzermodel && ( // Render icon only if gatewaymodel is not empty
                                  <IconButton
                                    aria-label="clear"
                                    onClick={() => {

                                      // Clear the value when close icon is clicked
                                      setSelecteddata('');
                                      setcustomernameselected;
                                      [''];
                                      setSelectedanalyzer('');
                                      setanalyzermodel(''),
                                      setanalyzerserial(''),
                                      getdatadevicecontrol();
                                      setanalyzerid('');
                                      setgatewayserial(''),
                                      setgatewaymodel(''),
                                      setHasSingleDevice(false);
                                      setgatewayidnutral('');
                                      setcompanyid('');
                                      setclientcompanyid('');
                                      setsite('');
                                      setroom('');
                                      setgatewayid('')
                                      setanalyzeridnutral('');
                                      setSelectedanalyzerass('');
                                      setselectedAnalyzertype('')
                                      setselectedtype('')
                                      setCustomerfiltername('')
                                      setClientfiltername('')
                                      setClientSelectedOption('');
                                      setUnallocatedAnalyzer('');
                                      setUnallocatedGateway('');
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{ paddingRight: 1 }}
                      >
                        <TextField
                          // error={!!(formik.touched.email && formik.errors.email)}
                          // helperText={formik.touched.email && formik.errors.email}
                          label="Enter Serial#"
                          name="email"
                          inputProps={{ maxLength: 5 }}
                          // onBlur={formik.handleBlur}
                          onChange={handleChangeanalyzernumber}
                          value={analyzerserial}
                          sx={{
                            '& .MuiInputLabel-root': {
                              transform: 'translateY(50%)', // Center the label vertically
                              marginLeft: 1, // Add left margin to the label
                            },
                            '& .MuiInputBase-root': {
                              height: '40px', // Adjust the height as needed
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {analyzermodel && ( // Render icon only if gatewaymodel is not empty
                                  <IconButton
                                    aria-label="clear"
                                    onClick={() => {
                                      // Clear the value when close icon is clicked
                                      setSelecteddata('');
                                      setcustomernameselected(['']);
                                      setanalyzermodel(''),
                                      setanalyzerserial(''),
                                      setanalyzerid('');
                                      getdatadevicecontrol();
                                      setanalyzeridnutral('');
                                      setgatewayserial(''),
                                      setSelectedanalyzer(''),
                                      setgatewaymodel(''),
                                      setgatewayidnutral('');
                                      setHasSingleDevice(false);
                                      setcompanyid('');
                                      setclientcompanyid('');
                                      setsite('');
                                      setroom('');
                                      setgatewayid('')
                                      setSelectedanalyzerass('')
                                      setselectedAnalyzertype('')
                                      setselectedtype('')
                                      setCustomerfiltername('')
                                      setClientfiltername('')
                                      setClientSelectedOption('');
                                      setUnallocatedAnalyzer('');
                                      setUnallocatedGateway('');
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }} // Adjust the height as needed
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={3}
                    >
                      {(logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') && <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Allocated
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <AllocatedDeviceTable
                            count={customersStore.customersCount}
                            items={datadevicedata}
                            setanalyzerid={setanalyzerid}
                            setanalyzermodel={setanalyzermodel}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzerserial={setanalyzerserial}
                            setcompanyid={setcompanyid}
                            setmodelsetaildatas={setmodelsetaildatas}
                            setcustomernameselected={setcustomernameselected}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setSelecteddevicedata={setSelecteddevicedata}
                            setHasSingleDevice={setHasSingleDevice}
                            setselectedAnalyzertype={setselectedAnalyzertype}
                            setsite={setsite}
                            setroom={setroom}
                            setSelectedanalyzerass={setSelectedanalyzerass}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                        </div>
                      </Grid>}
                      <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 0, mb: 2 }}
                          variant="h6"
                        >
                          Assigned to Gateway
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <AssignedDeviceTable
                            count={customersStore.customersCount}
                            items={datadevicedata}
                            setanalyzerid={setanalyzerid}
                            setanalyzermodel={setanalyzermodel}
                            setanalyzerserial={setanalyzerserial}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setcompanyid={setcompanyid}
                            setclientcompanyid={setclientcompanyid}
                            setgatewayidnutral={setgatewayidnutral}
                            setcustomernameselected={setcustomernameselected}
                            setclientnameselected={setclientnameselected}
                            setSelecteddevicedata={setSelecteddevicedata}
                            setgatewayserial={setgatewayserial}
                            setgatewaymodel={setgatewaymodel}
                            setsite={setsite}
                            setroom={setroom}
                            setgatewayid={setgatewayid}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                            setselectedAnalyzertype={setselectedAnalyzertype}
                            setSelectedanalyzer={setSelectedanalyzer}
                            loggedInCustomerName={loggedInCustomerName}
                          />
                        </div>
                      </Grid>
                      
                    </Grid>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={3}
                    >
                      {(logedinusergroup == 'Admin' || logedinusergroup == 'AdminMaster') && <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Unallocated
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          {unallocatedAnalyzer.length > 0 ? (
                          <UnallocatedDeviceTable 
                            count={customersStore.customersCount}
                            items={unallocatedAnalyzer}
                            setcompanyid={setcompanyid}
                            setselectedAnalyzertype={setselectedAnalyzertype}
                            setmodelsetaildatas={setmodelsetaildatas}
                            setanalyzerid={setanalyzerid}
                            setanalyzermodel={setanalyzermodel}
                            setanalyzerserial={setanalyzerserial}
                            setHasSingleDevice={setHasSingleDevice}
                            setSelecteddevicedata={setSelecteddevicedata}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setgatewayidnutral={setgatewayidnutral}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />) : (<UnallocatedDeviceTable 
                          count={customersStore.customersCount}
                          items={datadevicedata}
                          setcompanyid={setcompanyid}
                          setselectedAnalyzertype={setselectedAnalyzertype}
                          setmodelsetaildatas={setmodelsetaildatas}
                          setanalyzerid={setanalyzerid}
                          setanalyzermodel={setanalyzermodel}
                          setanalyzerserial={setanalyzerserial}
                          setHasSingleDevice={setHasSingleDevice}
                          setSelecteddevicedata={setSelecteddevicedata}
                          setanalyzeridnutral={setanalyzeridnutral}
                          setgatewayidnutral={setgatewayidnutral}
                          onDeselectAll={customersSelection.handleDeselectAll}
                          onDeselectOne={customersSelection.handleDeselectOne}
                          onPageChange={customersSearch.handlePageChange}
                          onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                          onSelectAll={customersSelection.handleSelectAll}
                          onSelectOne={customersSelection.handleSelectOne}
                          page={customersSearch.state.page}
                          rowsPerPage={customersSearch.state.rowsPerPage}
                          selected={customersSelection.selected}
                        />)
                          }
                        </div>
                      </Grid>}
                      <Grid
                        xs={12}
                        md={6}
                        item
                      >
                        <Typography
                          sx={{ mt: 2, ml: 2, mb: 2 }}
                          variant="h6"
                        >
                          Unassigned to Gateway
                        </Typography>
                        <div
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            paddingRight: '10px',
                            cursor: 'pointer', // Adjust the padding as needed
                          }}
                        >
                          <UnassignedDeviceTable
                            count={customersStore.customersCount}
                            items={datadevicedata}
                            setanalyzerid={setanalyzerid}
                            setanalyzermodel={setanalyzermodel}
                            setanalyzerserial={setanalyzerserial}
                            setselectedAnalyzertype={setselectedAnalyzertype}
                            setcompanyid={setcompanyid}
                            setclientcompanyid={setclientcompanyid}
                            setHasSingleDevice={setHasSingleDevice}
                            setSelecteddevicedata={setSelecteddevicedata}
                            setcustomernameselected={setcustomernameselected}
                            setclientnameselected={setclientnameselected}
                            setClientSelectedOption={setClientSelectedOption}
                            setgatewayidnutral={setgatewayidnutral}
                            setanalyzeridnutral={setanalyzeridnutral}
                            setsite={setsite}
                            setroom={setroom}
                            setSelectedanalyzerass={setSelectedanalyzerass}
                            onDeselectAll={customersSelection.handleDeselectAll}
                            onDeselectOne={customersSelection.handleDeselectOne}
                            onPageChange={customersSearch.handlePageChange}
                            onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                            onSelectAll={customersSelection.handleSelectAll}
                            onSelectOne={customersSelection.handleSelectOne}
                            page={customersSearch.state.page}
                            rowsPerPage={customersSearch.state.rowsPerPage}
                            selected={customersSelection.selected}
                          />
                        </div>
                      </Grid>
                      
                    </Grid>
                  </Card>
                  -{' '}
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Container>
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
                onClick={handleClose}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                // onClick={() => { updateunallocation('88')}}
                onClick={() => {
                    updateunallocation('88');
                }}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open1}
          onClose={handleClose1}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h3"
              sx={{ mb: 2 }}
            >
              Access End Date
            </Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
              >
                <>
                  <TextField
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                    }}
                    size="small"
                    value={value}
                    onChange={handleChange}
                    sx={{ mb: 1 }}
                    fullWidth
                  />
                </>
              </Grid>
              <Grid
            item
            xs={12}
           
          >
            <Typography
            id="modal-modal-title"
            variant="h6"
            component="h3"
              sx={{  mb: 2 }}
            >
               End Date
            </Typography>
            <>
              <TextField
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                }}
                size="small"
                value={enddate}
                onChange={handleChangeEndDate}
                sx={{ mb: 3 }}
                fullWidth
              />
            </>
          </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={() => {
                  handleRestore();
                }}
                startIcon={
                  <SvgIcon>
                    <DeleteIcon />
                  </SvgIcon>
                }
                color="error"
                variant="outlined"
                size="small"
                disabled={isSubmitting}
              >
                Restore
              </Button>
              <Button
                onClick={() => {
                  updateallocation('88');
                }}
                size="small"
                startIcon={
                  <SvgIcon>
                    <Edit02Icon />
                  </SvgIcon>
                }
                color="success"
                variant="outlined"
                disabled={!value || !enddate || isSubmitting}
                sx={{ ml: 1 }}
              >
                Accept
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open2}
          onClose={handleClose2}
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
                onClick={handleClose2}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                // onClick={() => updateanalyzerunallocation('88')}
                onClick={() => {
                    updateanalyzerunallocation('88');
                    handleClose2();
                }}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
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
            Are you sure you want to Unassign?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleClose3}
              color="secondary"
              disabled={isSubmitting1}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUnAssign(selecteddevicedata?.gateway?.ps_gateway_id)}
              color="primary"
              sx={{ ml: 1 }}
              disabled={isSubmitting1}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
          open={open4}
          onClose={handleClose4}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h3"
              sx={{ mb: 2 }}
            >
              Access End Date
            </Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
              >
                <>
                  <TextField
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                    }}
                    size="small"
                    value={accessends}
                    onChange={handleChangeAccessDate}
                    sx={{ mb: 1 }}
                    fullWidth
                  />
                </>
              </Grid>
              <Grid
            item
            xs={12}
           
          >
            <Typography
            id="modal-modal-title"
            variant="h6"
            component="h3"
              sx={{  mb: 2 }}
            >
               End Date
            </Typography>
            <>
              <TextField
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().substr(0, 10), // Set minimum allowed date to today
                }}
                size="small"
                value={dateends}
                onChange={handleChangeDateEnd}
                sx={{ mb: 3 }}
                fullWidth
              />
            </>
          </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={() => {
                  handleRestore1();
                }}
                startIcon={
                  <SvgIcon>
                    <DeleteIcon />
                  </SvgIcon>
                }
                color="error"
                variant="outlined"
                size="small"
                disabled={isSubmitting}
              >
                Restore
              </Button>
              <Button
                onClick={() => {
                  updateanalyzerallocation('88');
                }}
                size="small"
                startIcon={
                  <SvgIcon>
                    <Edit02Icon />
                  </SvgIcon>
                }
                color="success"
                variant="outlined"
                disabled={!accessends || !dateends || isSubmitting}
                sx={{ ml: 1 }}
              >
                Accept
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open5}
          onClose={handleClose5}
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
              Are you sure you want to Reallocate?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={handleClose5}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateReallocation('88');
                  handleClose5();
                }}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open6}
          onClose={handleClose6}
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
              Are you sure you want to Reallocate?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                onClick={handleClose6}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updateanalyzerReallocation('88');
                  handleClose6();
                }}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open7}
          onClose={handleClose7}
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
                onClick={handleClose7}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                // onClick={() => { updateunallocation('88')}}
                onClick={() => {
                    updateClientGatewayUnallocation('88');
                    handleClose7();
                }}
                color="primary"
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
        <Modal
          open={open8}
          onClose={handleClose8}
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
                onClick={handleClose8}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                // onClick={() => updateanalyzerunallocation('88')}
                onClick={() => {
                    updateClientAnalyzerUnallocation('88');
                    handleClose8();
                }}
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
