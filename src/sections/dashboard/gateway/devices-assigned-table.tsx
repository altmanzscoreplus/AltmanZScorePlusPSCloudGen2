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
import { Modal} from '@mui/material';
import PropTypes from 'prop-types';
import type { ChangeEvent, FC, MouseEvent } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import type { Customer } from 'src/types/customer';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { API, graphqlOperation,Auth } from 'aws-amplify';
import React, {useEffect, useState } from 'react';

interface DevicesAssignedProps {
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
  open2:any;
  setSelectedAnalyzer:any;
  handleClose2:any;
  handleOpen2:any;
  handleUnAssign:any;
  isSubmitting:any
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


export const DevicesAssigned: FC<DevicesAssignedProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    handleClose2,
    handleUnAssign,
    isSubmitting,
    handleOpen2,
    open2,
    onSelectOne,
    setSelectedAnalyzer,
    page = 0,
    rowsPerPage = 0,
    selected = [],
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  const [logedinusergroup, setLogedinusergroup] = useState('');

  useEffect(() => {
    const currentuser = Auth.currentAuthenticatedUser();
    const logedinuserdetail =   currentuser.then(result => {

      const customerId = result.attributes['custom:customerId'];
      // setLogedinuser(customerId)
      const clientId = result.attributes['custom:clientId'];
      // setUserClient(clientId)
      // console.log(customerId,'uuu');
      const group = result.signInUserSession.accessToken.payload['cognito:groups'][0]
      setLogedinusergroup(group)
     

      }).catch(error => {
          console.error('Error:', error);
      });
    }, [Auth]);
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Actions</TableCell>
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
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{customer.model}</TableCell>{' '}
                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {customer.serial_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                  <Button
                       onClick={() => {
                        window.localStorage.setItem('previouspageName', 'Back');
                        window.localStorage.setItem('previouspageUrl','');
                        router.push(`/dashboard/datadevicecontrol/information/?id=${customer?.id}`);
                      }}
                        startIcon={
                          <SvgIcon>
                            <RemoveRedEyeOutlinedIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                      >
                        View
                      </Button>{'  '}
                      {(logedinusergroup != "Client" && logedinusergroup != "ClientMaster" ) && (
                     <Button
                        onClick={() => {
                          setSelectedAnalyzer(customer);
                          handleOpen2();
                        }}
                        startIcon={
                          <SvgIcon>
                            <AssignmentTurnedInOutlinedIcon />
                          </SvgIcon>
                        }
                        variant="outlined"
                        style={{ padding: '2px 12px', fontSize: '0.875rem', minHeight: 'auto' }}
                      >
                        Unassign
                      </Button>
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      {items.length ==0 && (
      <Typography
        gutterBottom
        variant="subtitle2"
        style={{ marginTop: 80, marginBottom: 40, textAlign: 'center' }}
      >
        No Data found
      </Typography>)}
      <Modal
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Confirmation?
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2 }}
          >
            Are you sure you want to unassign the selected Analyzer from this Gateway?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleClose2}
              color="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleUnAssign()}
              color="primary"
              sx={{ ml: 1 }}
              disabled={isSubmitting}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
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

DevicesAssigned.propTypes = {
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
