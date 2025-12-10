import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import type { ChangeEvent, FC, MouseEvent } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import type { Customer } from 'src/types/customer';

interface GatewayAssignedProps {
  count?: number;
  gatewaydetail?:any;
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

export const GatewayAssigned: FC<GatewayAssignedProps> = (props) => {
  const {
    count = 0,
    gatewaydetail,
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

  const selectedSome = selected.length > 0 && selected.length < gatewaydetail.length;
  const selectedAll = gatewaydetail?.length > 0 && selected.length === gatewaydetail?.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model Name</TableCell>
              <TableCell>Serial Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {items?.map((customer) => { */}
            
                <TableRow
                  hover
                  // key={customer.id}
                  // selected={isSelected}
                >
                  <TableCell>{gatewaydetail?.gateway?.model}</TableCell>{' '}
                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {gatewaydetail?.gateway?.serial_number}
                    </Typography>
                  </TableCell>
                </TableRow>
             
          
          </TableBody>
        </Table>
      </Scrollbar>
      {gatewaydetail?.gateway == null && (
      <Typography
        gutterBottom
        variant="subtitle2"
        style={{ marginTop: 80, marginBottom: 40, textAlign: 'center' }}
      >
        No Data found
      </Typography>)}
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

GatewayAssigned.propTypes = {
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
