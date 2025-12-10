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
import React from 'react';

interface AssignedGatewayTableProps {
  count?: number;
  items?: any;
  setgatewayid: any;
  setgatewaymodel: any;
  setgatewayserial: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  setSelecteddata: any;
  setcompanyid:any;
  setclientcompanyid:any;
  setgatewayidnutral:any;
  setanalyzeridnutral:any;
  setsite:any;
  setroom:any;
  setSelectedgateway:any;
  setcustomernameselected:any;
  setclientnameselected:any;
  loggedInCustomerName:any;
  setselectedtype:any
}

export const AssignedGatewayTable: FC<AssignedGatewayTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    setgatewayid,
    setgatewaymodel,
    setgatewayserial,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setSelecteddata,
    setcompanyid,
    setclientcompanyid,
    setgatewayidnutral,
    setanalyzeridnutral,
    setSelectedgateway,
    setsite,
    setroom,
    setcustomernameselected,
    setclientnameselected,
    loggedInCustomerName,
    onSelectOne,
    page = 0,
    setselectedtype,
    rowsPerPage = 0,
    selected = [],
  } = props;

  // console.log(items,"items assigned gateway table")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  // const [selected, setSelected] = React.useState([]);
  // const handleRowClick = (customerId) => {
  //   const selectedIndex = selected.indexOf(customerId);
  //   let newSelected = [];

  //   if (selectedIndex === -1) {
  //     // Customer ID is not selected, add it to the selected list
  //     newSelected = newSelected.concat(selected, customerId);
  //   } else if (selectedIndex === 0) {
  //     // Customer ID is the only one selected, remove it
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     // Customer ID is the last one selected, remove it
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     // Customer ID is in the middle of the selected list, remove it
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1)
  //     );
  //   }

  //   setSelected(newSelected);
  // };

  return (
    <Box
      sx={{ position: 'relative' }}
      className="scrool "
    >
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 1,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectAll?.();
              } else {
                onDeselectAll?.();
              }
            }}
          />
          <Button
            color="inherit"
            size="small"
            variant="contained"
          >
            Assign
          </Button>
          {/* <Button
            color="inherit"
            size="small"
          >
            Edit
          </Button> */}
        </Stack>
      )}
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
              // Check if customer_id exists
              // if (customer.analyzer.items.length === 0) {
              //   return null; // Skip rendering this customer if customer.analyzer.items is empty
              // }
              // if (customer.allocated_unallocated_status !== 'Allocated') {
              //   return null;
              // }

              // Check if the assigned_unassigned_status is not "Assigned"
              if (customer.assigned_unassigned_status !== 'Assigned') {
                return null;
              }
              // Rest of your code
              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              const isTerminationDateEmpty = customer?.gateway_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );
              const filteredByClientId = customer?.gateway_rental?.items.filter(
                (gat: any) => gat.client_id === clientId
              );

              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                  onClick={() => {
                    setSelecteddata(customer);
                  }}
                >
                  {/* <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onSelectOne?.(customer.id);
                        } else {
                          onDeselectOne?.(customer.id);
                        }
                      }}
                      value={isSelected}
                      sx={{ padding: 0 }}
                    />
                  </TableCell> */}
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Typography
                        sx={{ fontSize: 12 }}
                        onClick={() => {
                          setSelectedgateway(customer.id)
                          setgatewayid(customer.id);
                          setgatewaymodel(customer.model);
                          setgatewayserial(customer.serial_number);
                          setgatewayidnutral('1');
                          setcustomernameselected([isTerminationDateEmpty[0]?.customer?.name]);
                          setsite(customer.site_location);
                          setroom(customer.room_location);
                          setcompanyid(isTerminationDateEmpty[0]?.customer?.id);
                          setclientcompanyid(filteredByClientId[0]?.client?.id);
                          setclientnameselected([filteredByClientId[0]?.client?.name])
                          setanalyzeridnutral('1');
                        }}
                      >
                        {customer.ps_gateway_id ? customer.ps_gateway_id : '-'}
                        <Typography sx={{ fontSize: 12 }}>
                        {customer.site_location && customer.room_location
                          ? `${customer.site_location}\u00A0\u00A0\u00A0\u00A0 -\u00A0\u00A0 ${customer.room_location}`
                            : customer.site_location || customer.room_location || ''}
                        </Typography>
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* <TableCell align="left">
                    {isSelected && (
                      <>
                        <Button
                          startIcon={
                            <SvgIcon>
                              <DeleteIcon />
                            </SvgIcon>
                          }
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{ marginBottom: 1 }}
                        >
                          Restore
                        </Button>{' '}
                        <Button
                          size="small"
                          startIcon={
                            <SvgIcon>
                              <Edit02Icon />
                            </SvgIcon>
                          }
                          color="success"
                          variant="outlined"
                          onClick={() => router.push('/dashboard/gatewaycontrol/information')}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                  </TableCell> */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </Box>
  );
};

AssignedGatewayTable.propTypes = {
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
