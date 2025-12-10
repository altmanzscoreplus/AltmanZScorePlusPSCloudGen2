import { useCallback, type ChangeEvent, type FC, type MouseEvent, useState, useEffect } from 'react';
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
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronUpIcon from '@untitled-ui/icons-react/build/esm/ChevronUp';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Key01Icon from '@untitled-ui/icons-react/build/esm/Key01';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import DeleteIcon from '@untitled-ui/icons-react/build/esm/Delete';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import type { Product } from 'src/types/product';
import { paths } from 'src/paths';
import type { Customer } from 'src/types/customer';
import { getInitials } from 'src/utils/get-initials';

import { useRouter } from 'next/router';
import { padding } from '@mui/system';
import { Chip } from '@mui/material';

interface DataViewTableProps {
/*** MY CODE ***/
	readings?: [];
	measurements?: {};
	phases?: {};
	
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

export const DataViewTable: FC<DataViewTableProps> = (props) => {
  const {
	/*** MY CODE ***/
		readings,
		measurements,
		phases,
		
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 300,
    selected = [],
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;
  const router = useRouter();

  const [manualIconChange, setManualIconChange] = useState(false);
  const handleIconToggle = () => {
    setManualIconChange(!manualIconChange);
  };

	let labels = [];

	function getLabels() {
		const vltMode = 0;
		//console.log(measurements);
		//console.log(phases);
		//console.log("phases['1']", phases["1"]);
		
		if (measurements["V"]) {
			if (vltMode == 0) { // VPN
				for (const [phase, phaseVal] of Object.entries(phases)) {
					if (phase != "n/t" && phases[phase])
						labels.push("V" + phase + "n");
				}
			}
			else { // VPP
				if (phases["1"])
					labels.push("V12");
				if (phases["2"])
					labels.push("V23");
				if (phases["3"])
					labels.push("V31");
			}
		}
		
		if (measurements["I"]) {
			for (const [phase, phaseVal] of Object.entries(phases)) {
				if (phases[phase]) {
					if (phase != "n/t")
						labels.push("I" + phase);
					else
						labels.push("In");
				}
			}
		}
		
		if (measurements["W"]) {
			for (const [phase, phaseVal] of Object.entries(phases)) {
				if (phases[phase]) {
					if (phase != "n/t")
						labels.push("W" + phase);
					else
						labels.push("Wt");
				}
			}
		}
		
		if (measurements["THDv"]) {
			if (vltMode == 0) { // VPN
				for (const [phase, phaseVal] of Object.entries(phases)) {
					if (phase != "n/t" && phases[phase])
						labels.push("THDv" + phase + "n");
				}
			}
			else { // VPP
				if (phases["1"])
					labels.push("THDv12");
				if (phases["2"])
					labels.push("THDv23");
				if (phases["3"])
					labels.push("THDv31");
			}
		}
		
		if (measurements["THDi"]) {
			for (const [phase, phaseVal] of Object.entries(phases)) {
				if (phases[phase]) {
					if (phase != "n/t")
						labels.push("THDi" + phase);
					else
						labels.push("THDin");
				}
			}
		}
		
		if (measurements["TPF"]) {
			for (const [phase, phaseVal] of Object.entries(phases)) {
				if (phases[phase]) {
					if (phase != "n/t")
						labels.push("TPF" + phase);
					else
						labels.push("TPFt");
				}
			}
		}
		
		if (measurements["VA"]) {
			for (const [phase, phaseVal] of Object.entries(phases)) {
				if (phases[phase]) {
					if (phase != "n/t")
						labels.push("VA" + phase);
					else
						labels.push("VAt");
				}
			}
		}
		
		if (measurements["Hz"])
			labels.push("Hz")
	}

	function renderTableHeader() {
		getLabels();
		//console.log("labels", labels);
		
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

		// Function to extract time part from createdAt
		const extractTime = (dateString) => {
			// Use a regular expression to capture the part between 'T' and the timezone offset, if present
			return dateString.match(/T(.*?)($|[+-]\d{2}:\d{2})/)[1];
		};		

		return (
			<TableBody>
				{readings.map((reading, i) => {

					// Extract the time part from the createdAt string
					const timeString = extractTime(reading.createdAt);					
					return (
						(rowLimit-- > 0) &&
						<TableRow
							hover
							key={i}
						>
							<TableCell>
								{timeString} {/* new Date(reading.createdAt).toLocaleTimeString( 'en-US', {hour12:false})} */}
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
		</Box>
	);
};

DataViewTable.propTypes = {
	/*** MY CODE ***/
	readings: PropTypes.array,
	measurements: PropTypes.object,
	phases: PropTypes.object,

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