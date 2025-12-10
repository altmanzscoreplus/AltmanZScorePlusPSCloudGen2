import { Divider, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import { useState, type ChangeEvent, type FC, type MouseEvent } from 'react';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';

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
  const [open2, setOpen2] = useState<boolean>(false);
  const handleClose2 = () => setOpen2(false);
  const [open1, setOpen1] = useState<boolean>(false);
  const handleClose1 = () => setOpen1(false);
  return (
    <Box sx={{ position: 'relative' }}>
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 2,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              alert('Delete');
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
          >
            Delete
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
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
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
              </TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell align="left">Actions</TableCell>
              {/* <TableCell>Location</TableCell>
              <TableCell>Orders</TableCell>
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
                  <TableCell padding="checkbox">
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
                    />
                  </TableCell>
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <div>
                        <Link
                          color="inherit"
                          component={RouterLink}
                          href={paths.dashboard.customercontrol.details}
                          variant="subtitle2"
                        >
                          {customer.name}
                        </Link>
                      </div>
                    </Stack>
                  </TableCell>{' '}
                  <TableCell>
                    {' '}
                    <Button
                      // startIcon={
                      //   <SvgIcon>
                      //     <PlusIcon />
                      //   </SvgIcon>
                      // }
                      variant="contained"
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell>
                    {' '}
                    <Button
                      onClick={() => {
                        setOpen2(true);
                      }}
                      // startIcon={
                      //   <SvgIcon>
                      //     <PlusIcon />
                      //   </SvgIcon>
                      // }
                      variant="contained"
                    >
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell>
                    {' '}
                    <Button
                      onClick={() => {
                        setOpen1(true);
                      }}
                      // startIcon={
                      //   <SvgIcon>
                      //     <PlusIcon />
                      //   </SvgIcon>
                      // }
                      variant="contained"
                    >
                      Deny Access
                    </Button>
                  </TableCell>
                  <TableCell>
                    {' '}
                    <Button
                      // startIcon={
                      //   <SvgIcon>
                      //     <PlusIcon />
                      //   </SvgIcon>
                      // }
                      variant="contained"
                    >
                      Reset Password
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
      <Dialog
        open={open1}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose1();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            If you click Deny Access, the Customer account remains, but all data associated with it
            is not accessible to Customer. Customer can still log in and change password.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setOpen1(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen1(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog
        open={open2}
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose2();
          }
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ fontSize: 20, fontWeight: '600', color: '#000' }}
        >
          Confirmation?
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <DialogContentText id="alert-dialog-description">
            Deleting this Customer will delete the Customer account and any Clients in the account.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions className="dialog-actions-dense">
          <Grid sx={{ pb: 2, px: 4, mt: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setOpen2(false);
              }}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpen2(false)}
              sx={{ ml: 3 }}
            >
              No
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
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
