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

interface ClientListTableProps {
  count?: number;
  items?: Customer[];
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

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter()

  return (
    <Box sx={{ position: 'relative' }}>
      
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              
              <TableCell>Customer Name</TableCell>
              <TableCell>Model Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell align="left">Actions</TableCell>
              <TableCell>Control</TableCell>
              {/* <TableCell>Orders</TableCell>
              <TableCell>Spent</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((customer) => {
              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);

              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                >
                  
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Avatar
                        src={customer.avatar}
                        sx={{
                          height: 42,
                          width: 42,
                        }}
                      >
                        {getInitials(customer.name)}
                      </Avatar>
                      <div>
                        <Link
                          color="inherit"
                          component={RouterLink}
                          href={paths.dashboard.customercontrol.details}
                          variant="subtitle2"
                        >
                          {customer.name}
                        </Link>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {customer.email}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>{' '}
                  <TableCell>
                    
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {customer.email}
                        </Typography>
                    
                  </TableCell>{' '}
                  <TableCell>
                    
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {customer.email}
                        </Typography>
                    
                  </TableCell>{' '}
                  <TableCell>
                    
                    <Button
                      startIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                      color="success"
                      component="a"
                      onClick={() => router.push('/dashboard/clientcontrol/:clientId/edit')}
                    >Edit</Button>
                  
                    {' '}
                    <Button
                      startIcon={
                        <SvgIcon>
                          <DeleteIcon />
                        </SvgIcon>
                      }
                      color="error"
                      variant="outlined"
                    >
                      Delete
                    </Button>
                    </TableCell>
                    <TableCell>
                    <Button
                      startIcon={
                        <SvgIcon>
                          <Lock01Icon />
                        </SvgIcon>
                      }
                      variant="outlined"
                    >
                      Assign
                    </Button>
                 
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
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
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
