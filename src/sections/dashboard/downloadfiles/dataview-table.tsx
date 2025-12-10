import { type ChangeEvent, type FC, type MouseEvent} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';

interface DataViewTableProps {
/*** MY CODE ***/
  count?: number;
  items?: Customer[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page?: number;
  rowsPerPage?: number;
}

DataViewTable.propTypes = {
	/*** MY CODE ***/
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};

export const DataViewTable: FC<DataViewTableProps> = (props) => {
  const {
	/*** MY CODE ***/
		readings,
		measurements,
		phases,
		
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 10,
  } = props;

	function renderTableHeader() {
		return (
			<TableHead>
				<TableRow>
					<TableCell>{new Date(readings[0].createdAt).toLocaleDateString()}</TableCell>
					{ renderTableCells(labels) }
				</TableRow>
			</TableHead>
		);
	}

	function renderTableCells(myArray) {
		return (
			<>
				{
					myArray.map((item, i) => {
						return (
							<TableCell key={i}>{ item }</TableCell>
						)
					})
				}
			</>
		)
	}

	function renderMeasurements(dataObj) {
		const values = [];
		labels.map((label) => {
			if(label.includes("THDv") || label.includes("V1") || label.includes("V2") || label.includes("V3"))
				values.push(dataObj[label.slice(0, -1)].N);
			else
				values.push(dataObj[label].N);
		})
		
		return (
			<>
				{ renderTableCells(values) }
			</>
		)
	}

	function renderTableBody() {
		return (
			<TableBody>
				{readings.map((reading, i) => {
					return (
						(rowLimit-- > 0) &&
						<TableRow
							hover
							key={i}
						>
							<TableCell>
								{new Date(reading.createdAt).toLocaleTimeString( 'en-US', {hour12:false})}
							</TableCell>
							{ renderMeasurements(JSON.parse(reading.data)) }
						</TableRow>
					)
				})}
			</TableBody>
		);
	}

	/*** MY CODE ***/
	let rowLimit = rowsPerPage;
	return (
		<Box sx={{ position: 'relative'}}>
			<TableContainer sx={{ maxHeight: 850 }}>
				<Table stickyHeader sx={{ minWidth: 700 }}>
					{ renderTableHeader() }
					{ renderTableBody() }
				</Table>
			</TableContainer>
			{
				<TablePagination
					component="div"
					count={count}
					onPageChange={onPageChange}
					onRowsPerPageChange={onRowsPerPageChange}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[5, 10, 20, 30, 40, 50]}
				/>
			}
		</Box>
	);
};