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
import { Chip } from '@mui/material';
import Circle from '@mui/icons-material/Circle';

interface AllocatedGatewayTableProps {
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
  setgatewayid: any;
  selected?: string[];
  setgatewaymodel: any;
  setgatewayserial: any;
  setHasSingleItem: any;
  setselectedtype?: any;
  setcustomernameselected?: any;
  setclientnameselected?: any;
  setSelecteddata?: any;
  setgatewayidnutral?: any;
  setmodelsetaildata?: any;
  setcompanyid?: any;
  setclientcompanyid?: any;
  setsite: any;
  setroom: any;
  setanalyzeridnutral: any;
  setSelectedunassignedgateway:any
}

export const AllocatedGatewayTable: FC<AllocatedGatewayTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    setgatewaymodel,
    setgatewayserial,
    onSelectOne,
    page = 0,
    setgatewayid,
    setHasSingleItem,
    setanalyzeridnutral,
    setSelectedunassignedgateway,
    setselectedtype,
    setcustomernameselected,
    setclientnameselected,
    setSelecteddata,
    setgatewayidnutral,
    setmodelsetaildata,
    setsite,
    setroom,
    rowsPerPage = 0,
    setcompanyid,
    setclientcompanyid,
    selected = [],
  } = props;
  // console.log(items,"items allocated gateway table")
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

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
            Allocate
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
          <TableBody>
            {items?.slice(0, 1000).map((customer) => {
              // if (customer.customer_id == null || !customer.customer_id) {
              //   return null;
              // }

              // if ((customer.allocated_unallocated_status !== 'Allocated')  || (customer.assigned_unassigned_status !== 'Unassigned')) {
              //   return null;
              // }

              if (customer.allocated_unallocated_status !== 'Allocated')  {
                return null;
              }

              // Rest of your code
              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              const isTerminationDateEmpty = customer?.gateway_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );

              if (items?.length === 1) {
                setHasSingleItem(true);
                setmodelsetaildata(customer);
              } else {
                setHasSingleItem(false);
                setmodelsetaildata(customer);
              }
              // console.log(
              //   customer,
              //   'ko999999999999999999999999999999999999999999999999999999999999999999'
              // );

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
                          setselectedtype('UnAllocate');
                          setgatewayidnutral('1');
                          setHasSingleItem(customer.id);
                          setgatewayid(customer.id);
                          setgatewaymodel(customer.model);
                          setgatewayserial(customer.serial_number);
                          setcustomernameselected([isTerminationDateEmpty[0]?.customer?.name]);
                          // setclientnameselected([isTerminationDateEmpty[0]?.customer?.name]);
                          setsite(customer.site_location);
                          setroom(customer.room_location);
                          setcompanyid(isTerminationDateEmpty[0]?.customer?.id);
                          setanalyzeridnutral('1');
                          setSelectedunassignedgateway(isTerminationDateEmpty[0]?.customer?.id)
                          console.log(isTerminationDateEmpty[0]?.customer?.name, 'nnnnnnnnnnnn');
                        }}
                      >
                        {customer.ps_gateway_id ? customer.ps_gateway_id : '-'}

                        {customer?.active_inactive_status == 'Inactive' && (
                          <Circle
                            fontSize="small"
                            style={{
                              color: '#A9A9A9',
                              fontSize: '0.75rem',
                              verticalAlign: 'middle',
                              paddingLeft: 2, // Adjust vertical alignment here
                              marginBottom: '12px', // Add some margin bottom to fine-tune the position
                            }}
                          />
                        )}
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

AllocatedGatewayTable.propTypes = {
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
