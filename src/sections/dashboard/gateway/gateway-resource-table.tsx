import { useCallback, useEffect, type ChangeEvent, type FC, type MouseEvent, useState } from 'react';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronUpIcon from '@untitled-ui/icons-react/build/esm/ChevronUp';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import type { Product } from 'src/types/product';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';

import { useRouter } from 'next/router';
import { padding } from '@mui/system';
import { Chip, Paper, TableContainer } from '@mui/material';
import { DatasetTwoTone } from '@mui/icons-material';

interface ClientListTableProps {
  count?: number;
  items?: Customer[];
  gatewayRentalsData: any[]; 
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
}

export const ClientListTable: FC<ClientListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    gatewayRentalsData,
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 10,
    selected = [],
  } = props;
  // console.log(items,"items")
  // console.log(gatewayRentalsData,"rental datas")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  const [manualIconChange, setManualIconChange] = useState(false);
  const jsonData = [
    {
      id: 1,
      serial: '022502',
      name: 'PowerSystems Testing',
      status: 'Communicating',
      color: 'green',
      foreground: 'white',
      resource: 'PS4550-04134',
      site: 'Antioc',
      location: 'GE201',
    },
    {
      id: 2,
      serial: '022500',
      name: 'Entinogy Resource Monitoring',
      status: 'Not Detected',
      color: '',
      foreground: 'black',
      resource: 'PS3550-03034',
      site: 'Larkspur',
      location: '12-E5',
    },
    {
      id: 3,
      serial: '022501',
      name: 'Compliance Engineering',
      status: 'Not Detected',
      color: 'red',
      foreground: 'white',
      resource: 'PS5000-50021',
      site: 'Santa Clara',
      location: 'PO1',
    },
    {
      id: 4,
      serial: '022505',
      name: 'Power Dynamics',
      status: 'Communicating',
      color: 'green',
      foreground: 'white',
      resource: 'PS4550-04134',
      site: 'Sunnyvale',
      location: 'N1004E',
    },
    {
      id: 5,
      serial: '022506',
      name: 'HP',
      status: 'Not Detected',
      color: '',
      foreground: 'black',
      resource: 'PS3550-03337',
      site: 'Palo Alto',
      location: 'A456',
    },
    {
      id: 6,
      serial: '022504',
      name: 'Compliance Engineering',
      status: 'Not Detected',
      color: 'red',
      foreground: 'white',
      resource: 'PS5000-50027',
      site: 'San Jose',
      location: '314',
    },
    {
      id: 7,
      serial: '022509',
      name: 'Power Dynamics',
      status: 'Communicating',
      color: 'green',
      foreground: 'white',
      resource: 'PS4550-04134',
      site: 'Pleasant Hill',
      location: '125-A1',
    },
    /*     { id: 8, serial: '022502', name: 'John Viser', status: 'Not Detected', color: '', foreground: 'black' },
    { id: 9, serial: '022502', name: 'Compliance Engineering', status: 'Not Detected', color: 'red', foreground: 'white' },
    { id: 10, serial: '022502', name: 'Power Dynamics', status: 'Communicating', color: 'green', foreground: 'white' }, */
  ];

  const [sortOrder, setSortOrder] = useState({ column: 'serial_number', order: 'asc' }); 
  const [sortedItems, setSortedItems] = useState([]); 

  useEffect(() => {
    setSortedItems([...gatewayRentalsData]);
  }, [gatewayRentalsData]);
 

  useEffect(() => {
    // console.log("Current sort order:", sortOrder);
    if (sortOrder.column){
      sortData(sortOrder.column, sortOrder.order);
    }
  }, [sortOrder, gatewayRentalsData]); // Re-sort when items change

  const handleIconToggle = (column) => {
    // console.log("Toggling column:", column);
    setSortOrder((prevState) => ({
      column: column,
      order: prevState.column === column && prevState.order === 'asc' ? 'desc' : 'asc'
    }));
    
  };

  const getValue = (item, column) => {
    switch (column) {
      case 'model':
      case 'serial_number':
      case 'communication_status':
        return item.gateway?.[column] || '';      
      case 'customer':
        return item.customer?.name || '';
        case 'resource':
        return item.gateway?.analyzer?.items[0]?.ps_analyzer_id || '';
      default:
        return '';
    }
  };

  const sortData = (column, order) => {
    // console.log("Sorting data for column:", column, "Order:", order);
    if (!column) return;
  
    const sorted = [...gatewayRentalsData].sort((a, b) => {
      // console.log("Item A:", a, "Item B:", b);
      const valueA = getValue(a, column);
      const valueB = getValue(b, column);

      // console.log(`Sorting ${column}:`, valueA, valueB);
  
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        return order === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  
    setSortedItems(sorted);
    // console.log(sorted,"sorted")
  };
  

  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 1150, minHeight: 5 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ paddingBottom: 0 }}
                >
                  Gateway
                </TableCell>
                <TableCell sx={{ paddingBottom: 0 }}>Assigned</TableCell>
                <TableCell sx={{ paddingBottom: 0 }}>Site</TableCell>
                <TableCell
                  colSpan={3}
                  sx={{ paddingBottom: 0 }}
                >
                  Location
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: `128px!important`, pr: 0 }}>
                  Model#
                  <IconButton
                    onClick={() => handleIconToggle('model')}
                    sx={{ p: 0 }}
                  >
                    <SvgIcon>{sortOrder.column === 'model' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>

                <TableCell sx={{ width: 130, pl: 1 }}>
                  Serial#{' '}
                  <IconButton
                    onClick={() => handleIconToggle('serial_number')}
                    sx={{ p: 0 }}
                  >
                    <SvgIcon>{sortOrder.column === 'serial_number' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : < ChevronDownIcon/>}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell>
                  Status
                  <IconButton onClick={() => handleIconToggle('communication_status')}>
                    <SvgIcon>{sortOrder.column === 'communication_status' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ width: '280px' }}>
                  Customer{' '}
                  <IconButton onClick={() => handleIconToggle('customer')}>
                    <SvgIcon>{sortOrder.column === 'customer' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  Resources{' '}
                  {/* <IconButton onClick={handleIconToggle}>
                    <SvgIcon>{!manualIconChange ? <ChevronDownIcon /> : <ChevronUpIcon />}</SvgIcon>
                  </IconButton> */}
                  <IconButton onClick={() => handleIconToggle('resource')} >
                  <SvgIcon>{sortOrder.column === 'resource' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                </IconButton>
                </TableCell>
                <TableCell>(e.g. Facility)</TableCell>
                <TableCell>(e.g. Room)</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>Start Date</TableCell>
                <TableCell>End Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems
              .filter((customer) =>                 
                customer.gateway && customer.gateway.allocated_unallocated_status === 'Allocated' &&
                /* customer.gateway.allocated_unallocated_status === 'Allocated' && */
                customer.customer_id !== null
              )
              .map((customer) => {
                const isSelected = selected.includes(customer.id);
                const createdDate = customer.createdAt ? customer.createdAt.split('T')[0] : 'N/A';
                // if (customer.customer_id == null || customer.gateway.allocated_unallocated_status == 'Allocated') {
                //   return null; 
                // }
                return (
                  <TableRow
                    sx={{
                      height: '10px', // Set height for TableRow
                      '& td': { height: 'auto !important' }, // Set height for td elements
                    }}
                    hover
                    key={customer.id}
                    selected={isSelected}
                  >
                    <TableCell sx={{ width: `128px!important`, pr: 0 }}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                      >
                        {customer.gateway?.model}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell sx={{ pl: 1 }}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                      >
                        {customer.gateway?.serial_number}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell>
                      <Chip
                        // label={customer.analyzer?.communication_status}
                        label={customer.gateway?.communication_status === "Archive" ? "Offline" : customer.gateway?.communication_status}
                        style={{ 
                          //height: '90%', // Set chip height to 80%
                          // minWidth: '60px', // Set a minimum width for consistency
                          display: 'flex', // Flexbox to help with alignment
                          justifyContent: 'center', // Center the label horizontally
                          alignItems: 'center', // Center the label vertically                          
                          backgroundColor:
                          customer.gateway?.communication_status === "Communicating"
                            ? "#00AB66"
                            : customer.gateway?.communication_status === "Not_Detected"
                            ? "#FF3131"
                            : customer.gateway?.communication_status === "Archive"
                            ? "lightgray"
                            : customer.color, // Fallback color
                        color:
                          customer.gateway?.communication_status === "Archive" ? "black" : "white", }}
                      />                      
                    </TableCell>{' '}
                    <TableCell>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        {/* <Avatar
                        src={customer.avatar}
                        sx={{
                          height: 42,
                          width: 42,
                        }}
                      >
                        {getInitials(customer.name)}
                      </Avatar> */}
                        <div>
                          <Typography
                           color="text.secondary"
                            // color="success"
                            // variant="outlined"
                            style={{
                              padding: '8px 8px', // Adjust padding to reduce height
                              fontSize: '0.875rem', // Adjust font size if needed
                              lineHeight: '1.0', // Adjust line height if needed
                            }}
                          >
                            
                            {customer.customer?.name}
                          </Typography>
                          {/* <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {customer.email}
                        </Typography> */}
                        </div>
                      </Stack>
                    </TableCell>{' '}
                    <TableCell>
                      <Typography
                       color="text.secondary"
                        style={{
                          padding: '8px 8px', // Adjust padding to reduce height
                          fontSize: '0.875rem', // Adjust font size if needed
                          lineHeight: '1.0', // Adjust line height if needed
                          whiteSpace: 'nowrap',
                        }}
                        // color="success"
                        // variant="outlined"
                      >
                        {customer.gateway?.analyzer?.items[0]?.ps_analyzer_id ? customer.gateway?.analyzer?.items[0]?.ps_analyzer_id : '-'}
                        {/* {customer.resource} */}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell>
                      <Typography
                       color="text.secondary"
                        style={{
                          padding: '8px 8px', // Adjust padding to reduce height
                          fontSize: '0.875rem', // Adjust font size if needed
                          lineHeight: '1.0', // Adjust line height if needed
                        }}
                        // color="success"
                        // variant="outlined"
                      >
                        {customer.gateway?.site_location ? customer.gateway.site_location : '-'}
                        {/* {customer.gateway?.site_location} */}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell>
                      <Typography
                       color="text.secondary"
                        style={{
                          padding: '8px 8px', // Adjust padding to reduce height
                          fontSize: '0.875rem', // Adjust font size if needed
                          lineHeight: '1.0', // Adjust line height if needed
                        }}
                        // color="success"
                        // variant="outlined"
                      >
                        {customer.gateway?.room_location ? customer.gateway?.room_location : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{}}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {createdDate}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{}}
                      // className="end_d_n_sh"
                    >
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {customer.end_date}
                      </Typography>
                    </TableCell>
                    {/* <TableCell>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.edit}
                    >
                      <SvgIcon>
                        <DeleteIcon />
                      </SvgIcon>
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.edit}
                    >
                      <SvgIcon>
                        <Edit02Icon />
                      </SvgIcon>
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customercontrol.details}
                    >
                      <SvgIcon>
                        <ArrowRightIcon />
                      </SvgIcon>
                    </IconButton>
                  </TableCell> */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      {/* <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={'10'}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Box>
  );
};

ClientListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
