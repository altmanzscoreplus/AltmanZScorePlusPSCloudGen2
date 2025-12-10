import type { ChangeEvent, FC, MouseEvent } from 'react';
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
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { padding } from '@mui/system';
import { Chip } from '@mui/material';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';

interface ClientListTableProps {
  count?: number;
  items?: Customer[];
  analyzerRentalsData: any[];
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
    analyzerRentalsData,
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;
  // console.log(items,"items")
  console.log(analyzerRentalsData,"rental datas")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const jsonData = [
    {
      id: 1,
      model: 'PS4550',
      serial: '44123',
      gate_serial: '022502',
      name: 'Intel',
      astatus: 'Assigned',
      cstatus: 'Communicating',
      color: 'green',
      forecolor: 'white',
      site: 'Antioc',
      location: '306E',
      circuit: '12-E5',
      start: '02-04-2024',
      end: '02-13-2024',
      acc: '02-23-2023',
    },
    {
      id: 2,
      model: 'PS3550',
      serial: '44134',
      gate_serial: '022503',
      name: 'Cisco',
      astatus: 'UnAssigned',
      cstatus: 'Not Detected',
      color: 'white', // '#d3b64c',
      forecolor: 'gray',
      site: 'Larkspur',
      location: '2125',
      circuit: 'PO1',
      start: '02-02-2024',
      end: '04-14-2024',
      acc: '09-13-2024',
    },
    {
      id: 3,
      model: 'PS5000',
      serial: '44145',
      gate_serial: '022504',
      name: 'Apple',
      astatus: 'Assigned',
      cstatus: 'Not Detected',
      color: 'red',
      forecolor: 'white',
      site: 'Santa Clara',
      location: 'AA5T',
      circuit: '1004E',
      start: '01-02-2024',
      end: '01-15-2024',
      acc: '01-20-2024',
    },
    {
      id: 4,
      model: 'PS5000',
      serial: '44156',
      gate_serial: '022507',
      name: 'Intuitive Surgical',
      astatus: 'Assigned',
      cstatus: 'Communicating',
      color: 'green',
      forecolor: 'white',
      site: 'Sunnyvale',
      location: 'G1',
      circuit: 'A456',
      start: '05-2-2024',
      end: '04-16-2024',
      acc: '08-25-2024',
    },
    {
      id: 5,
      model: 'PS4550',
      serial: '34134',
      gate_serial: '022511',
      name: 'HP',
      astatus: 'UnAssigned',
      cstatus: 'Not Detected',
      site: 'Palo Alto',
      location: 'A25KL8',
      circuit: '314',
      color: 'white', // '#d3b64c',
      forecolor: 'gray',
      start: '07-02-2024',
      end: '04-18-2024',
      acc: '08-26-2024',
    },
    {
      id: 6,
      model: 'PS4550',
      serial: '34145',
      gate_serial: '022521',
      name: 'PowerSight',
      astatus: 'Assigned',
      cstatus: 'Not Detected',
      site: 'Pleasant Hill',
      location: '2515-1',
      circuit: '125-A1',
      color: 'red',
      forecolor: 'white',
      start: '09-02-2024',
      end: '04-19-2024',
      acc: '08-27-2024',
    },
    /*     {
      id: 7,
      gate_serial: '022509',
      name: 'Safeway',
      status: 'Communicating',
      color: 'green',
      start: '11-2-2024',
      end: '20-4-2024',
      acc: '28-8-2024',
    },
    {
      id: 8,
      gate_serial: '022502',
      name: 'HP',
      status: 'Pending',
      color: '#d3b64c',
      start: '12-2-2024',
      end: '21-4-2024',
      acc: '29-8-2024',
    },
    {
      id: 9,
      gate_serial: '022502',
      name: 'Home Depot',
      status: 'Closed',
      color: 'red',
      start: '15-2-2024',
      end: '22-4-2024',
      acc: '30-8-2024',
    },
    {
      id: 10,
      gate_serial: '022502',
      name: 'Sephora',
      status: 'Communicating',
      color: 'green',
      start: '16-2-2024',
      end: '23-4-2024',
      acc: '7-10-2024',
    }, */
  ];

  const [sortOrder, setSortOrder] = useState({ column: 'serial_number', order: 'asc' }); 
  const [sortedItems, setSortedItems] = useState([]); 
  // console.log(sortedItems,"sorted")

  useEffect(() => {
    setSortedItems([...analyzerRentalsData]);
  }, [analyzerRentalsData]);
 

  useEffect(() => {
    // console.log("Current sort order:", sortOrder);
    if (sortOrder.column){
      sortData(sortOrder.column, sortOrder.order);
    }
  }, [sortOrder, analyzerRentalsData]); // Re-sort when items change

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
      case 'assigned_unassigned_status':
      case 'communication_status':
        return item.analyzer?.[column] || '';
      case 'gateway':
        return item.analyzer?.gateway?.model || '';
      case 'gateway_serial_number':
        return item.analyzer?.gateway?.serial_number || '';
      case 'customer':
        return item.customer?.name || '';
      case 'client':
        return item.client?.name || '';
      default:
        return '';
    }
  };

  const sortData = (column, order) => {
    // console.log("Sorting data for column:", column, "Order:", order);
    if (!column) return;
  
    const sorted = [...analyzerRentalsData].sort((a, b) => {
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
        <div style={{ overflowX: 'auto' }}>
          {' '}
          {/* Add this wrapper div */}
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={2}
                  style={{ padding: '12px 5px 5px' }}
                >
                  Device
                </TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>Assigned</TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>Device</TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>Assigned To</TableCell>
                <TableCell
                  colSpan={6}
                  style={{ padding: '12px 5px 5px' }}
                >
                  Assigned To
                </TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>Start</TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>End</TableCell>
                <TableCell style={{ padding: '12px 5px 5px' }}>Access</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  Model#
                  <IconButton
                    onClick={() => handleIconToggle('model')}
                    sx={{ p: 0 }}
                  >
                    <SvgIcon>{sortOrder.column === 'model' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '60px' }}>
                    Serial#
                    <IconButton
                    onClick={() => handleIconToggle('serial_number')}
                    sx={{ p: 0 }}
                  >
                    <SvgIcon>{sortOrder.column === 'serial_number' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : < ChevronDownIcon/>}</SvgIcon>
                  </IconButton>
                  </div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  Status
                  <IconButton onClick={() => handleIconToggle('assigned_unassigned_status')}>
                    <SvgIcon>{sortOrder.column === 'assigned_unassigned_status' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  Status
                  <IconButton onClick={() => handleIconToggle('communication_status')}>
                    <SvgIcon>{sortOrder.column === 'communication_status' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  Gateway#
                  <IconButton onClick={() => handleIconToggle('gateway')}>
                    <SvgIcon>{sortOrder.column === 'gateway' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  Serial#
                  <IconButton
                    onClick={() => handleIconToggle('gateway_serial_number')}
                    sx={{ p: 0 }}
                  >
                    <SvgIcon>{sortOrder.column === 'gateway_serial_number' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : < ChevronDownIcon/>}</SvgIcon>
                  </IconButton>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '10px' }}>
                    Customer
                    <IconButton onClick={() => handleIconToggle('customer')}>
                    <SvgIcon>{sortOrder.column === 'customer' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                  </div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '10px' }}>
                    Client
                    <IconButton onClick={() => handleIconToggle('client')}>
                    <SvgIcon>{sortOrder.column === 'client' && sortOrder.order === 'desc' ? <ChevronUpIcon /> : <ChevronDownIcon />}</SvgIcon>
                  </IconButton>
                  </div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '30px' }}>Site</div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '10px' }}>Location</div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>
                  <div style={{ width: '50px' }}>Circuit</div>
                </TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>Date</TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>Date</TableCell>
                <TableCell style={{ padding: '5px 5px 10px 5px' }}>Ends </TableCell>

                {/* <TableCell>Orders</TableCell>
              <TableCell>Spent</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems
              // .sort((a, b) => {
              //   const serialA = a.analyzer?.serial_number?.toLowerCase() || ''; // Convert to lowercase for case-insensitive comparison
              //   const serialB = b.analyzer?.serial_number?.toLowerCase() || '';
              //   return serialA.localeCompare(serialB); // Sort in ascending order
              // })
              .filter((customer) => 
                customer.analyzer?.serial_number !== null   &&             
                customer.analyzer?.allocated_unallocated_status === 'Allocated' &&
                customer.customer_id !== null
              )
              .map((customer) => {
                // console.log(customer,"customer");
                const isSelected = selected.includes(customer.id);
                const location = `${customer.city}, ${customer.state}, ${customer.country}`;
                const totalSpent = numeral(customer.totalSpent).format(
                  `${customer.currency}0,0.00`
                );
                const createdDate = customer.createdAt ? customer.createdAt.split('T')[0] : 'N/A';
                return (
                  <TableRow
                    hover
                    key={customer.id}
                    selected={isSelected}
                  >
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        {customer.analyzer?.model}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        {customer.analyzer?.serial_number}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        {customer.analyzer?.assigned_unassigned_status}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Chip
                        // label={customer.analyzer?.communication_status}
                        label={customer.analyzer?.communication_status === "Archive" ? "Offline" : customer.analyzer?.communication_status}
                        style={{ 
                          height: '80%', // Set chip height to 80%
                          // minWidth: '60px', // Set a minimum width for consistency
                          display: 'flex', // Flexbox to help with alignment
                          justifyContent: 'center', // Center the label horizontally
                          alignItems: 'center', // Center the label vertically                          
                          backgroundColor:
                          customer.analyzer?.communication_status === "Communicating"
                            ? "#00AB66"
                            : customer.analyzer?.communication_status === "Not_Detected"
                            ? "#FF3131"
                            : customer.analyzer?.communication_status === "Archive"
                            ? "lightgray"
                            : customer.color, // Fallback color
                        color:
                          customer.analyzer?.communication_status === "Archive" ? "black" : "white", }}
                      />
                      {/* {customer.analyzer?.communication_status} */}
                      <Typography
                        className="file-size"
                        variant="caption" // or "body2", "subtitle2", etc.
                      ></Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        {customer.analyzer?.gateway?.model ? customer.analyzer?.gateway?.model : '-'}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        // variant="outlined"
                        sx={{ fontSize: '0.75rem', width: '60px' }}
                      >
                        {customer.analyzer?.gateway?.serial_number ? customer.analyzer?.gateway?.serial_number : '-'}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
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
                          {/* <Link
                            color="inherit"
                            component={RouterLink}
                            href={paths.dashboard.customercontrol.details}
                            variant="subtitle2"
                          > */}
                            <Typography
                              // variant="outlined"
                              sx={{ fontSize: '0.75rem', width: '70px' }}
                            >
                              {customer.customer?.name}
                            </Typography>
                          {/* </Link> */}
                          {/* <Typography
                          color="text.secondary"
                          variant="caption" // or "body2", "subtitle2", etc.
                        >
                          {customer.email}
                        </Typography> */}
                        </div>
                      </Stack>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        {customer.client?.name}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        <Typography
                          // variant="outlined"
                          sx={{ fontSize: '0.75rem', width: '60px' }}
                        >
                         {customer.analyzer?.site_location ? customer.analyzer?.site_location : '-'}
                        </Typography>
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                        <Typography
                          // variant="outlined"
                          sx={{ fontSize: '0.75rem', width: '30px' }}
                        >
                          {customer.analyzer?.room_location ? customer.analyzer?.room_location : '-'}
                        </Typography>
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="caption" // or "body2", "subtitle2", etc.
                      >
                       {customer.analyzer?.circuit ? customer.analyzer?.circuit : '-'}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap', fontSize: 12 }}
                      >
                        {createdDate}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell style={{ padding: '5px 5px' }}>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap', fontSize: 12 }}
                      >
                       {customer.end_date}
                      </Typography>
                    </TableCell>{' '}
                    <TableCell
                      style={{ padding: '5px 5px' }}
                      // className="end_d_n_sh"
                    >
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap', fontSize: 12 }}
                      >
                       {customer.access_end_date}
                      </Typography>
                    </TableCell>{' '}
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
        </div>
      </Scrollbar>
      {/* <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Box>
  );
};

ClientListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  // analyzerRentalsData: PropTypes.array,
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
