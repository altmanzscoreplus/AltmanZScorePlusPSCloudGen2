import { OutlinedInput } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import type { ChangeEvent, FC, MouseEvent } from 'react';
import { Scrollbar } from 'src/components/scrollbar';

interface ClientgatewayListTableProps {
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

export const ClientgatewayListTable: FC<ClientgatewayListTableProps> = (props) => {
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

  // const items = [
  //   {
  //     id: '12',
  //     model: 'G2000',
  //     serial: '22500',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22501',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22502',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22504',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22505',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22506',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22507',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22508',
  //   },
  //   {
  //     id: 12,
  //     model: 'G2000',
  //     serial: '22509',
  //   },
  // ];

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 200 }}>
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
                  Assign
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
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={3}
                style={{ paddingBottom: 0 }}
              >
                Gateways
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    handleFiltersChange({ model: { contains: e.target.value } });
                  }}
                  placeholder="Enter Model"
                />
              </TableCell>
              <TableCell>
                <OutlinedInput
                  defaultValue=""
                  fullWidth
                  onChange={(e) => {
                    handleFiltersChange({ serial_number: { contains: e.target.value } });
                  }}
                  placeholder="Enter Serial #"
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

ClientgatewayListTable.propTypes = {
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
