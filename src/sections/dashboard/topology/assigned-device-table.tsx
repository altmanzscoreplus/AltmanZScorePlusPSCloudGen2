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

interface AssignedDeviceTableProps {
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
  setSelecteddevicedata:any;
  setselectedAnalyzertype:any;
  setanalyzeridnutral:any;
  setcompanyid:any;
  setcustomernameselected:any;
  setclientcompanyid:any;
  setclientnameselected:any;
  setgatewayidnutral:any;
  setgatewayserial:any;
  setgatewaymodel:any;
  setSelectedanalyzer:any;
  setsite:any;
  setroom:any;
  setgatewayid:any
  loggedInCustomerName: any
}

export const AssignedDeviceTable: FC<AssignedDeviceTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setsite,
    setroom,
    onSelectOne,
    setanalyzeridnutral,
    setcompanyid,
    setcustomernameselected,
    setclientcompanyid,
    setclientnameselected,
    page = 0,
    rowsPerPage = 0,
    selected = [],
    setanalyzerid,
    setanalyzermodel,
    setanalyzerserial,
    setSelecteddevicedata,
    setgatewayidnutral,
    setSelectedanalyzer,
    setselectedAnalyzertype,
    setgatewayid,
    setgatewayserial,
    setgatewaymodel,
    loggedInCustomerName,
  } = props;
  
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
              
              // if (customer?.gateway?.items?.length === 0 || customer?.gateway==null) {
              //   return null; // Skip rendering this customer if customer.analyzer.items is empty
              // }
             
              if (customer.assigned_unassigned_status !== 'Assigned') {
                return null;
              }
              const isTerminationDateEmpty = customer?.analyzer_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );
              const filteredByClientId = customer?.analyzer_rental?.items.filter(
                (gat: any) => gat.client_id === clientId
              );

              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                  onClick={() => {
                  setSelecteddevicedata(customer)}}
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
                          setselectedAnalyzertype('UnAssign');
                          setcustomernameselected([isTerminationDateEmpty[0]?.customer?.name])
                          setcompanyid(isTerminationDateEmpty[0]?.customer?.id);
                          setanalyzeridnutral('1');
                          setgatewayidnutral('1');
                          setsite(customer.site_location)
                          setroom(customer.room_location)
                          setgatewaymodel(isTerminationDateEmpty[0]?.gateway?.model);
                          setgatewayserial(isTerminationDateEmpty[0]?.gateway?.serial_number);
                          setSelectedanalyzer(customer)
                          setgatewayid(isTerminationDateEmpty[0]?.gateway?.id);
                          setclientcompanyid(filteredByClientId[0]?.client?.id);
                          setclientnameselected([filteredByClientId[0]?.client?.name])
                        }}
                      >
                        {customer.ps_analyzer_id ? customer.ps_analyzer_id : '-'}
                        {customer.circuit ? '\u00A0\u00A0\u00A0'+customer.circuit : ''}
                        <Typography sx={{ fontSize: 12 }}>
                        {customer.site_location && customer.room_location
                          ? `${customer.site_location}\u00A0\u00A0\u00A0\u00A0 - \u00A0\u00A0${customer.room_location}`
                            : customer.site_location || customer.room_location || ''}
                        </Typography>
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

AssignedDeviceTable.propTypes = {
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
