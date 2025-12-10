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

interface UnassignedDeviceTableProps {
  count?: number;
  items?: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  setanalyzerid: any;
  setanalyzermodel: any;
  setanalyzerserial: any;
  setselectedAnalyzertype:any;
  setcompanyid:any;
  setclientcompanyid:any;
  setHasSingleDevice:any;
  setsite:any;
  setroom:any;
  setSelecteddevicedata:any;
  setcustomernameselected:any;
  setclientnameselected:any;
  setgatewayidnutral:any;
  setanalyzeridnutral:any;
  setSelectedanalyzerass:any
  setClientSelectedOption:any
};


export const UnassignedDeviceTable: FC<UnassignedDeviceTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
    setanalyzerid,
    setanalyzermodel,
    setanalyzerserial,
    setcustomernameselected,
    setgatewayidnutral,
    setanalyzeridnutral,
    setselectedAnalyzertype,
    setcompanyid,
    setclientcompanyid,
    setclientnameselected,
    setHasSingleDevice,
    setSelecteddevicedata,
    setSelectedanalyzerass,
    setsite,
    setroom,
    setClientSelectedOption,
    
  } = props;
  // console.log(items,"items")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  return (
    <Box
      sx={{ position: 'relative' }}
      className="scrool "
    >
      <Scrollbar>
        <Table>
          {/* <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
            </TableRow>
          </TableHead> */}
          <TableBody>
            {items?.slice(0, 1000).map((customer) => {

              const clientId = customer.client_id;
              // if (customer.gateway === null) {
              //   return null; // Skip rendering this customer if customer.analyzer.items is not an empty array
              // }
              // if (customer.customer_id == null || !customer.customer_id) {
              //   return null;
              // }

              if ((customer.allocated_unallocated_status !== 'Allocated')
                ||(customer.assigned_unassigned_status !=="Unassigned" )) {
                  return null;
                }

                
              const isTerminationDateEmpty = customer?.analyzer_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );
              console.log(isTerminationDateEmpty,"isTerminationDateEmpty")
              const filteredByClientId = customer?.analyzer_rental?.items.filter(
                (gat: any) => gat.client_id === clientId
              );
                 console.log(filteredByClientId[0]?.client?.name,"client name") 

              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              if (items?.length === 1) {
                setHasSingleDevice(true);
              } else {
                setHasSingleDevice(false);
              }
              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                  onClick={() => {
                    setSelecteddevicedata(customer);
                  }}
                >
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Typography
                        sx={{ fontSize: 12 }}
                        onClick={() => {
                          setanalyzerid(customer.id);
                          setanalyzermodel(customer.model);
                          setanalyzerserial(customer.serial_number);
                          setselectedAnalyzertype('Assign');
                          setHasSingleDevice(customer.id);
                          setsite(customer.site_location)
                          setroom(customer.room_location)
                          setcompanyid(isTerminationDateEmpty[0]?.customer?.id);
                          setclientcompanyid(filteredByClientId[0]?.client?.id);
                          setclientnameselected([filteredByClientId[0]?.client?.name])
                          setcustomernameselected([isTerminationDateEmpty[0]?.customer?.name])
                          setClientSelectedOption([filteredByClientId[0]?.client?.name])
                          // setanalyzeridnutral('1');
                          // setgatewayidnutral('1');
                          if (customer.client_id != null && customer.client_id != "0000-0000-0000-0000-0000-0000-0000-0000" || customer.customer_id != null ) {
                            setgatewayidnutral('1');
                            setanalyzeridnutral('1');
                          } else if (customer.client_id == null || customer.client_id == "0000-0000-0000-0000-0000-0000-0000-0000") {
                            setgatewayidnutral('');
                            setanalyzeridnutral('');
                          }
                          setSelectedanalyzerass(customer)
                        }}
                      >
                        {customer.ps_analyzer_id ? customer.ps_analyzer_id : '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </Box>
  );
};

UnassignedDeviceTable.propTypes = {
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
