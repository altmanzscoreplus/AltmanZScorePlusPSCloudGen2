import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';
import { FC } from 'react';

import numeral from 'numeral';

interface GatewayAllocationListTableProps {
  count?: number;
  items?: any;
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  setSelecteddata?: any;
  selecteddata?: any;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
}

export const GatewayAllocationListTable: FC<GatewayAllocationListTableProps> = ({
  count = 0,
  items = [],
  onDeselectAll,
  setSelecteddata,
  onDeselectOne,
  onPageChange = () => {},
  onRowsPerPageChange,
  selecteddata,
  onSelectAll,
  onSelectOne,
  page = 0,
  rowsPerPage = 0,
  selected = [],
}) => {
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;

  return (
    <Box
      sx={{ position: 'relative' }}
      className="scroolcustomer"
    >
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table
          stickyHeader
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
              <TableCell>Model #</TableCell>
              <TableCell>Serial #</TableCell>
              <TableCell>Customer Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selecteddata ? (
              <TableRow
                // onClick={() => {
                //   setSelecteddata(null); // Assuming you want to deselect when clicking on already selected data
                // }}
                hover
                key={selecteddata.id} // Assuming selecteddata has an id
                selected={true} // Assuming you want this row to be selected
              >
                <TableCell>{selecteddata.model}</TableCell>
                <TableCell>{selecteddata.serial_number}</TableCell>
                <TableCell>
                  {' '}
                  {selecteddata?.gateway_rental?.items.filter((gat) => !gat.termination_date)
                    .length > 0
                    ? selecteddata.gateway_rental.items.filter((gat) => !gat.termination_date)[0]
                        .customer?.name
                    : '-'}
                </TableCell>
              </TableRow>
            ) : (
              items?.items?.map((customer) => {
                const isTerminationDateEmpty = customer?.gateway_rental?.items.filter(
                  (gat: any) => !gat.termination_date
                );
                const isSelected = selected.includes(customer.id);
                const location = `${customer.city}, ${customer.state}, ${customer.country}`;
                const totalSpent = customer.totalSpent
                  ? numeral(customer.totalSpent).format(`${customer.currency}0,0.00`)
                  : '';

                if (customer?.length === 1) {
                  setSelecteddata(customer);
                }
                return (
                  <TableRow
                    onClick={() => {
                      setSelecteddata(customer);
                    }}
                    hover
                    key={customer.id}
                    selected={isSelected}
                  >
                    <TableCell>{customer.model}</TableCell>
                    <TableCell>{customer.serial_number}</TableCell>

                    <TableCell>
                      {isTerminationDateEmpty.length > 0 && (
                        <>{isTerminationDateEmpty[0].customer?.name}</>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25]}
      /> */}
    </Box>
  );
};

GatewayAllocationListTable.propTypes = {
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
