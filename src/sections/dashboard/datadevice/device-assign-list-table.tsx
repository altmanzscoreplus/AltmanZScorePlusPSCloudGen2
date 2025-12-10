import React, { FC } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,Typography,
  TablePagination,
  TableContainer,
} from '@mui/material';

import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import numeral from 'numeral';

interface DeviceAssignListTableProps {
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

export const DeviceAssignListTable: FC<DeviceAssignListTableProps> = ({
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
console.log(selecteddata,'tttttt')
  return (
    <Box sx={{ position: 'relative' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table
          stickyHeader
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
              <TableCell>Model #</TableCell>
              <TableCell>Serial #</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Gateway Assigned</TableCell>
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
                  {selecteddata?.analyzer_rental?.items.filter((gat) => !gat.termination_date)
                    .length > 0
                    ? selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0]
                        .customer?.name
                    : '-'}
                </TableCell>
                {/* <TableCell>
                  {' '}
                  {selecteddata?.analyzer_rental?.items.filter((gat) => !gat.termination_date)
                    .length > 0
                    ? selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0]
                        .gateway?.ps_gateway_id
                    : selecteddata.analyzer_rental.items.filter((gat) => !gat.termination_date)[0]
                    .gateway==null && '-'}
                </TableCell> */}
                <TableCell>
                {(() => {
                    const filteredItems = selecteddata?.analyzer_rental?.items.filter((gat) => !gat.termination_date) || [];
                    if (filteredItems.length > 0) {
                    const firstItem = filteredItems[0];
                    return firstItem.gateway?.ps_gateway_id || (firstItem.gateway === null ? '-' : '');
                    } else {
                    return '-';
                    }
                })()}
                </TableCell>
              </TableRow>
            ) : (
              items?.items?.length > 0 ? (
              items?.items?.map((customer) => {
                const isSelected = selected.includes(customer.id);
                const location = `${customer.city}, ${customer.state}, ${customer.country}`;
                const totalSpent = customer.totalSpent
                  ? numeral(customer.totalSpent).format(`${customer.currency}0,0.00`)
                  : '';
                  const isTerminationDateEmpty = customer?.analyzer_rental?.items.filter(
                    (gat: any) => !gat.termination_date
                  );
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
                    <TableCell>
                      {isTerminationDateEmpty.length > 0 && (
                        <>{isTerminationDateEmpty[0].gateway?.ps_gateway_id}</>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
              )
              : (
                <TableRow>
                  <TableCell colSpan={4}><Typography variant="subtitle1" color="textSecondary">No items to display</Typography></TableCell>
                </TableRow>
              )



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

DeviceAssignListTable.propTypes = {
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
