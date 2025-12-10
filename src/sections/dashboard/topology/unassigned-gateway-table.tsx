import type { ChangeEvent, FC, MouseEvent } from 'react';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Circle from '@mui/icons-material/Circle';
import { API, graphqlOperation,Auth } from 'aws-amplify';
import * as queries from '../../../graphql/queries';

interface UnassignedGatewayTableProps {
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
  setcompanyid?: any;
  setclientcompanyid?: any;
  setsite: any;
  setroom: any;
  setSelecteddata: any;
  selectedanalyzerass:any;
  setgatewayidnutral: any;
  setanalyzeridnutral: any;
  setcustomernameselected: any;
  setclientnameselected: any;
  setSelectedunassignedgateway:any
  setSelectedclientunassignedgateway:any
  setClientSelectedOption:any
}

export const UnassignedGatewayTable: FC<UnassignedGatewayTableProps> = (props) => {
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
    setgatewayidnutral,
    setanalyzeridnutral,
    setcustomernameselected,
    setclientnameselected,
    setsite,
    setroom,
    setHasSingleItem,
    setselectedtype,
    selectedanalyzerass,
    setcompanyid,
    setclientcompanyid,
    setSelectedunassignedgateway,
    setSelectedclientunassignedgateway,
    setSelecteddata,
    rowsPerPage = 0,
    selected = [],
    setClientSelectedOption,
  } = props;
  
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();
  // const [clientData, setClientData] = useState();
  // console.log(clientData, 'client detail');
  // const [clientId, setClientId] = useState();

  // console.log(items,"items")
  // useEffect(() => {
  //  const clientdetail = API.graphql(graphqlOperation(queries.getClient, 
  //   {
  //     id: clientId,
  //   }));
  //   setClientData(clientdetail.data?.getClient)
  //   console.log(clientData, 'client detail');
  // },[clientId])
  console.log(items,"items...")
  return (
    <Box
      sx={{ position: 'relative' }}
      className="scrool"
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
          <TableBody>
            {items?.slice(0, 1000).map((customer) => {

              const clientId = customer.client_id;
              // setClientId(clientId)

              if ((customer.allocated_unallocated_status !== 'Allocated')
              ||(customer.assigned_unassigned_status !="Unassigned" )) {
                return null;
              }

              // Check if the assigned_unassigned_status is not "Assigned"
              // if (customer.assigned_unassigned_status !== 'Unassigned') {
              //   return null;
              // }
              const isTerminationDateEmpty = customer?.gateway_rental?.items.filter(
                (gat: any) => !gat.termination_date
              );

              const filteredByClientId = customer?.gateway_rental?.items.filter(
                (gat: any) => gat.client_id === clientId
              );
                //  console.log(filteredByClientId[0].client,"client idddd") 
              // Rest of your code
             
              const isSelected = selected.includes(customer.id);
              const location = `${customer.city}, ${customer.state}, ${customer.country}`;
              const totalSpent = numeral(customer.totalSpent).format(`${customer.currency}0,0.00`);
              if (items?.length === 1) {
                setHasSingleItem(true);
              } else {
                setHasSingleItem(false);
              }
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
                          setgatewayid(customer.id);
                          setHasSingleItem(customer.id);
                          setgatewaymodel(customer.model);
                          setgatewayserial(customer.serial_number);
                          setsite(customer.site_location);
                          setroom(customer.room_location);
                          setcompanyid(isTerminationDateEmpty[0]?.customer?.id);
                          setclientcompanyid(filteredByClientId[0]?.client?.id);
                          // setgatewayidnutral('1');
                          // setanalyzeridnutral('1');
                          if (customer.client_id != null && customer.client_id != "0000-0000-0000-0000-0000-0000-0000-0000" || customer.customer_id != null) {
                            setgatewayidnutral('1');
                            setanalyzeridnutral('1');
                          } 
                          else if (customer.client_id == null || customer.client_id == "0000-0000-0000-0000-0000-0000-0000-0000"){
                            setgatewayidnutral('');
                            setanalyzeridnutral('');
                          }
                          setcustomernameselected([isTerminationDateEmpty[0]?.customer?.name])
                          setclientnameselected([filteredByClientId[0]?.client?.name])
                          setSelectedunassignedgateway(isTerminationDateEmpty[0]?.customer?.id)
                          setSelectedclientunassignedgateway(filteredByClientId[0]?.client?.id)
                          setClientSelectedOption([filteredByClientId[0]?.client?.name])
                        //   const selectedGatewayId = customer?.client_id 
                        //     ? filteredByClientId[0]?.client?.id 
                        //     : isTerminationDateEmpty[0]?.customer?.id;
                        //   setSelectedunassignedgateway(selectedGatewayId);
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

UnassignedGatewayTable.propTypes = {
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
