import { useState, type ChangeEvent, type FC, type MouseEvent } from 'react';
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
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Edit01Icon from '@untitled-ui/icons-react/build/esm/Edit01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { InputAdornment, OutlinedInput } from '@mui/material';

interface ClientListTableProps {
  count?: number;
  items?: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleFiltersChange: (filters: any | null) => void;
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
    handleFiltersChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;

  const initialData = [
    {
      id: '12',
      model: 'PS4550',
      serial: '22500',
      customer: 'Intel',
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22501',
      customer: "Power Systems Int'l",
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22502',
      customer: 'Transforming USA',
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22504',
      customer: 'Jones Futura xx',
    },
    {
      id: 12,
      model: 'PS3550',
      serial: '22505',
      customer: 'Jones Futura xx',
    },
    {
      id: 12,
      model: 'PS3550',
      serial: '22506',
      customer: 'Summit Technology',
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22507',
      customer: 'HG High Voltage Services',
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22508',
      customer: '',
    },
    {
      id: 12,
      model: 'PS4550',
      serial: '22509',
      customer: '',
    },
  ];

  // const [items, setItems] = useState(initialData);

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  const itemChange = (e, key) => {
    let stateCopy = initialData.filter((item) => {
      console.log(item[key], 'Itemmmmmm');
      return item[key].toLowerCase().includes(e.target.value.toLowerCase());
    });
    setItems(stateCopy);
  };
  console.log(items, 'n5433333333333333333333333333333333333333');
  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={3}
                style={{ backgroundColor: '#fff' }}
              >
                <Button
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  color="success"
                  style={{ marginRight: 4 }}
                >
                  Create
                </Button>{' '}
                <Button
                  startIcon={
                    <SvgIcon>
                      <Edit01Icon />
                    </SvgIcon>
                  }
                  variant="outlined"
                  style={{ marginRight: 4 }}
                >
                  Edit
                </Button>{' '}
                <Button
                  startIcon={
                    <SvgIcon>
                      <DeleteIcon />
                    </SvgIcon>
                  }
                  variant="outlined"
                  color="error"
                >
                  {initialData.length != items.length ? 'Unassign' : 'Delete'}
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={3}
                style={{ paddingBottom: 0 }}
              >
                Data Devices
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell width={`25%`}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    handleFiltersChange({ model: { contains: e.target.value } });
                  }}
                  placeholder="Enter Model"
                />
              </TableCell>
              <TableCell width={`25%`}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    handleFiltersChange({ serial_number: { contains: e.target.value } });
                  }}
                  placeholder="Enter Serial #"
                />
              </TableCell>
              <TableCell width={`50%`}>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  // inputProps={{ ref: queryRef }}
                  placeholder="Enter Customer"
                  onChange={(e) => {
                    handleFiltersChange({ name: { contains: e.target.value } });
                  }}
                />
              </TableCell>
              {/* <TableCell>Gateways</TableCell> */}

              {/* <TableCell>Orders</TableCell>
              <TableCell>Spent</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {items?.items?.map((customer) => {
              const isSelected = selected.includes(customer.id);

              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                >
                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {customer.model}
                    </Typography>
                  </TableCell>{' '}
                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {customer.serial_number}
                    </Typography>
                  </TableCell>{' '}
                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {customer.name ? customer.name : '-'}
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
      </Scrollbar>
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
