import type { NextPage } from 'next';
import { styled } from '@mui/material/styles';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { TextField } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';

import IconButton from '@mui/material/IconButton';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { GetThingShadowCommand, IoTDataPlaneClient, ListNamedShadowsForThingCommand, UpdateThingShadowCommand } from "@aws-sdk/client-iot-data-plane"; // ES Modules import
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fileDownload from 'js-file-download';
import * as queries from '../../../graphql/queries';
import { Amplify, API, Auth } from 'aws-amplify';
import awsconfig from 'aws-exports.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { EventBridgeClient, PutRuleCommand } from "@aws-sdk/client-eventbridge";

const Page: NextPage = () => {
  usePageView();

	// VINCENT_NOTE: the menu item for this page is created by src/layouts/dashboard/config.tsx, which references src/paths.s
	// paths.s references src/pages/dashboard
	
	/*** MY CODE ***/
	const config = {
		region: "us-west-1",
		endpoint: "https://a35th8mhj0yen6-ats.iot.us-west-1.amazonaws.com", // not sure if this is OK in plain text
		credentials: {
			accessKeyId: "AKIAWGYN4BC5JC356DPT", // NOTE!! WE SHOULD NOT BE STORING THESE IN PLAIN TEXT IN CODE
			secretAccessKey: "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", // I NEED TO FIGURE OUT HOW TO REQUEST THEM FROM THE ENVIRONMENT
		},
		thingName: "RichGateway"
	}
	const S3Config = {
		credentials: {
			accessKeyId: config.credentials.accessKeyId,
			secretAccessKey: config.credentials.secretAccessKey,
		},
		region: config.region,
		//sha256: Hash.bind(null, "sha256"),
		bucket: "powersighta118a3c3f62e4994aecfa01048f2d7d032334-dev",
	};
	const EBConfig = {
		credentials: {
			accessKeyId: config.credentials.accessKeyId,
			secretAccessKey: config.credentials.secretAccessKey,
		},
		region: config.region,
	};
	const IoT = new IoTDataPlaneClient(config);
	const S3 = new S3Client(S3Config);
	
	const searchTypography = "caption";	
	const [shadowStatus, setShadowStatus] = useState(null);
	const [refreshingAnalyzers, setRefreshingAnalyzers] = useState(false);
	const [analyzers, setAnalyzers] = useState(null);
	const [modelSearch, setModelSearch] = useState("");
	const [serialSearch, setSerialSearch] = useState("");
	const [customerSearch, setCustomerSearch] = useState("");
	const [siteSearch, setSiteSearch] = useState("");
	const [roomSearch, setRoomSearch] = useState("");
	const [circuitSearch, setCircuitSearch] = useState("");
	const [selectedAnalyzer, setSelectedAnalyzer] = useState(null);
	const [connectedAnalyzers, setConnectedAnalyzers] = useState(null);
	const [selectedLogFiles, setSelectedLogFiles] = useState({"LOG": true, "STP": true /*, "TPL": true*/});
	const [selectedEventFiles1, setSelectedEventFiles1] = useState({"WFM": true /*, "SWM": true, "TWM": true*/});
	const [selectedEventFiles2, setSelectedEventFiles2] = useState({"MTR": true /*, "PFD": true*/});
	const extensions = [
		[".$LO", ".$WF", ".$SL",".$SW", ".$RL", ".$TL", ".$TW", ".stp", ".$PF", ".$MT"],
		["LOG", "WFM", "SLG", "SWM", "RLG", "TLG", "TWM", "STP", "PFD", "MTR"],	
	];
	const fileLabels = [
		["$LO", "$WF", "$SL","$SW", "$RL", "$TL", "$TW", "STP", "$PF", "$MT"],
		["Data Log Records", "Instant Waveform", "Swell/Sag Event Log","Swell/Sag Waveforms", "Swell/Sag RMS Graphs", "Fast Transient Event Log", "Fast Transient Waveforms", "Data Setup", "Hi Frequency Spectrum", "Motor Spectrum"]
	];
	const [stpName, setStpName] = useState("");
	const [s3Files, setS3Files] = useState(null);
	const [deleting, setDeleting] = useState([]);
	const [user, setUser] = useState(null);
	const [customerNames, setCustomerNames] = useState(null);
	const [showAllFiles, setShowAllFiles] = useState(false);
	const [showScheduleData, setShowScheduleData] = useState(false);
	const [transferDateTime, setTransferDateTime] = useState(null);
	const [repeat, setRepeat] = useState("One-Time");
	const [repeatFrequency, setRepeatFrequency] = useState("168");
	const [repeatFrequencyNumber, setRepeatFrequencyNumber] = useState(1);
	const [repeatFrequencyTimeframe, setRepeatFrequencyTimeframe] = useState("168");
	const [automaticTransferLimit, setAutomaticTransferLimit] = useState(0);
	const [filename, setFilename] = useState("");
	const [showDataAvailable, setShowDataAvailable] = useState(false);
	
	async function getShadowStatus() {
		if (selectedAnalyzer && selectedAnalyzer.ps_analyzer_id) {
			const response = await API.get('powersightrestapi', `/IoTShadow/getShadow?shadowName=${selectedAnalyzer.ps_analyzer_id}`);
			setShadowStatus(response);
			console.log("shadow status", response);
		}
	}
	
	async function updateShadow(requestStateDocument) { // update the gateway shadow with presigned s3 urls for put
		const requestStateDocumentStr = JSON.stringify(requestStateDocument);
		const myPayload = Buffer.from(requestStateDocumentStr);
		const input = {
			thingName: config.thingName,
			shadowName: selectedAnalyzer.ps_analyzer_id,
			payload: myPayload,
		}
		const command = new UpdateThingShadowCommand(input);
		const response = await IoT.send(command);
		//console.log("shadow updated", response);
		getShadowStatus();
	}
	
	async function getAnalyzers() { // create map of [id, boolean] for selecting what analyzers to show, and store in state
		try {
			let next = null;
			let myData = [];
			const currentuser = await Auth.currentAuthenticatedUser();
			const customerId  = currentuser.attributes['custom:customerId'];
			
			let filters = {}
			if(customerId){
				filters ={ ...filters, customer_id: { eq: customerId }}
			}
			const variables = {
				limit: 1000,
				nextToken: next,
				filter: filters
			};
			
			do {
				const apiData = await API
				.graphql({
							query: queries.listAnalyzers,
							variables,
						});
				next = apiData.data.listAnalyzers.nextToken;
				myData = myData.concat(apiData.data.listAnalyzers.items); // combine data into one flat array
			}
			while (next != null);
			setAnalyzers(myData);
			setRefreshingAnalyzers(false);
		}
		catch(e) {
		console.log('Error on getting analyzers.', e);
		}
	}
	
	async function getConnectedAnalyzers() {
		let nextToken = "";
		const pageSize = 1000;
		const response = await API.get('powersightrestapi', `/IoTShadow/listNamedShadows?nextToken=${nextToken}&pageSize=${pageSize}`);
		setConnectedAnalyzers(response.shadows);
	}
	
	useEffect(() => { // regularly poll for shadow status if an analyzer is selected
		const checkShadow = setInterval( async () => {
			getShadowStatus();
		}, 5000);
		return () => clearInterval(checkShadow);
	}, [selectedAnalyzer]);
	
	useEffect(() => { // periodically check to see if upload has completed once S3 URLs have been generated
		if (shadowStatus && shadowStatus.data.state.reported) {
			const checkUpload = setInterval( async () => {
				const reported = shadowStatus.data.state.reported;
				const files = extensions[1];
				const completed = [];
				
				for (let i=0; i<files.length; i++) {
					const file = files[i];
					if (reported[file] && reported[file] == 'Complete')
						completed.push(file);
				}
				
				if (completed.length > 0) {
					const requestStateDocument = { // clear the shadow state
						"state": {
								"desired": {
							},
								"reported": {
							}
						}
					};
					for (let i=0; i<completed.length; i++) {
						const file = completed[i];
						requestStateDocument.state.desired[file] = null;
						requestStateDocument.state.reported[file] = null;
					}
					updateShadow(requestStateDocument);
					clearInterval(checkUpload);
				}
			}, 5000);
			return () => clearInterval(checkUpload);
		}
	}, [shadowStatus]);
	
	useEffect(() => {
		async function getCustomerNames() {
				const names = [];
				for (let i=0; i<analyzers.length; i++) {
					if (analyzers[i].customer_id) {
						const variables = {
							limit: 1000,
							nextToken: null,
							id: analyzers[i].customer_id
						};
						const apiData = await API
						.graphql({
							query: queries.getCustomer,
							variables,
						});
						
						names.push(apiData.data.getCustomer.name);
					}
					else
						names.push(null);
				}
				setCustomerNames(names);
		}
		
		if (analyzers && user && user.signInUserSession.accessToken.payload['cognito:groups'] == 'Admin' )
			getCustomerNames();
	}, [analyzers, user]);
	
	async function getFiles() {
		async function requestUserFiles() { // use powersightrestapi getFileNames to retrieve current user's files
			const currentuser = await Auth.currentAuthenticatedUser();
			const customerId  = currentuser.attributes['custom:customerId'];
			const clientId    = currentuser.attributes['custom:clientId'];
			const group       = currentuser.signInUserSession.accessToken.payload['cognito:groups'];
			
			const response = await API.get('powersightrestapi', `/getFileNames?customer_id=${customerId?customerId:''}&role=${group ? group[0] :''}&client_id=${clientId?clientId:''}`);
			setUser(currentuser);
			return response.files;
		}
		
		async function buildMetaData(files) { // get size and last modified information
			const metaData = [];
			for (const file of files) {
				const input = {
					Bucket: S3Config.bucket,
					Key: file,
				}
				const command = new HeadObjectCommand(input);
				const response = await S3.send(command)
				response["Key"] = file;
				metaData.push(response);
			}
			return metaData;
		}

		try {
			const filenames = await requestUserFiles();
			const files = await buildMetaData(filenames);
			setS3Files(files);
		} catch (err) {
			console.log(err);
		}
	};
	
	useEffect(() => {
		function clearDeleted() {
			const myArray = deleting;
			if (s3Files) {
				for (let i=0; i<deleting.length; i++) {
					let processing = false
					for (const file of s3Files) {
						console.log(file);
						if (deleting == file.Key)
							processing = true;
					}
					/*if (!processing) {
						myArray.splice(i, 1);
						setDeleting(myArray);
					}*/
				}
			}
		}
		
		getAnalyzers();
		getConnectedAnalyzers();
		getFiles();
		clearDeleted();
		
		const checkFiles = (setInterval(getFiles, 5000));
		return () => clearInterval(checkFiles);
		
		/*const checkDeleted = (setInterval(clearDeleted, 5000));
		return () => clearDeleted(checkDeleted);*/
		
	}, []);
	
	function renderMain() {
		try {
			if (showScheduleData) {
				return (
					<>
						{ renderScheduleData() }
					</>
				);
			}
			else if (showDataAvailable) {
				return (
					<>
						{ renderDataAvailable() }
					</>
				);
			}
			else {
				return (
					<>
						{ renderAnalyzerCard() }
					</>
				);
			}
		}
		catch(e) {
			console.log("Error rendering main.", e);
		}
	}
	
	function renderDataAvailable() {
		function renderDataAvailableBody() {
			if (shadowStatus) {
				console.log(shadowStatus);
				if (shadowStatus.data.state.reported.Status != null) {
					const status = shadowStatus.data.state.reported.Status;
					return (
						<Box sx={{mt:2}}>
							<Typography variant="h6">Logged Data —</Typography>
							<Box sx={{mt:0.5, ml:2.5}}>
								<Box display="flex" flexDirection="row" alignItems="center">
									<Typography variant="h6">Session Name: </Typography>
									{selectedAnalyzer.ps_analyzer_id}-{status.sessName }
								</Box>
								<Box display="flex" flexDirection="row" alignItems="center">
									<Typography variant="h6">Start Time: </Typography>
									{ new Date(status.strtTime).toLocaleString() }
								</Box>
								<Box display="flex" flexDirection="row" alignItems="center">
									<Typography variant="h6">Stop Time: </Typography>
									{ new Date(status.stopTime).toLocaleString() }
								</Box>
								{
									extensions[1].slice(0,8).map((file, i) => {
										return (
											status[file] &&
											<Box key={i} display="flex" flexDirection="row" alignItems="center">
												<Typography variant="h6">{fileLabels[1][i]} ({fileLabels[0][i]}): </Typography>
												<Typography> { status[file] } </Typography> 
											</Box>
										);
									})
								}
							</Box>
							<Typography sx={{mt:2}} variant="h6">Manually Captured Data —</Typography>
							<Box sx={{mt:0.5, ml:2.5}}>
							{
								extensions[1].slice(8,10).map((file, i) => {
									return (
										status[file] &&
										<Box key={i} display="flex" flexDirection="row" alignItems="center">
											<Typography variant="h6">{fileLabels[1][i+8]} ({fileLabels[0][i+8]}): </Typography>
											<Typography> { status[file] } </Typography> 
										</Box>
									);
								})
							}
							</Box>
						</Box>
					);
				}
				else {
					return (
						<Box sx={{mt:2}} >
							<Typography variant="h6">Succesfully read from IoT Shadow, but no status JSON populated in reported state.</Typography>
						</Box>
					);
				}
			}
			else {
				return (
					<Box sx={{mt:2}} >
						<Typography variant="h6">Getting IoT Shadow State . . .</Typography>
						<LinearProgress sx={{my: 2}}/>
					</Box>
				);
			}
		}
		
		return (
				<Card sx={{maxWidth: "60rem"}}>
					<Box display="flex" flexDirection="column" sx={{m:2}}>
						<Button
						sx={{pb: 2.5, height: "2rem", width: "10rem", whiteSpace:"nowrap"}}
						component="label"
						variant="text"
						tabIndex={-1}
						startIcon={<ArrowBackIcon />}
						onClick={() => {setShowDataAvailable(false)}}
						>
							Device Management
						</Button>
						<Typography variant="h5">Data Available for {selectedAnalyzer.ps_analyzer_id} </Typography>
						{ renderDataAvailableBody() }
						<Typography sx={{mt:2}}>PS-Cloud last checked IoT Shadow State on: { new Date(Date.now()).toLocaleString() }</Typography>
					</Box>
				</Card>
		);
	}
	
	function renderScheduleData() {
		function renderAnalyzerInfo() {
			const headers = ["Model#", "Serial#", "Site", "Room", "Circuit"];
			const keys = ["model", "serial_number", "site_location", "room_location", "circuit"];
			return (
				<Table sx={{mt:3.5}}>
					<TableHead>
						<TableRow>
							{
								headers.map((header, i) => {
									return (
										<TableCell key={i}>
											{header}
										</TableCell>
									);
								})
							}
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							{
								keys.map((myKey, i) => {
									return (
										<TableCell key={i}>
											{ selectedAnalyzer[myKey] || "N/A" }
										</TableCell>
									);
								})
							}
						</TableRow>
					</TableBody>
				</Table>
			);
		}
		
		function renderDTPicker() {
			return (
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Box sx={{mt:3.5}} components={['DateTimePicker']}>
						<DateTimePicker
							label="Next Transfer Date & Time"
							onChange={(val) => setTransferDateTime(val)}
							timezone="system"
						/>
					</Box>
				</LocalizationProvider>
			);
		}
		
		function renderRepeatButton() {
			return (
				<ToggleButtonGroup
					color="primary"
					exclusive
					aria-label="Repeat"
					value={repeat}
					sx={{mt: 3.5}}
					onChange={ (event: React.MouseEvent<HTMLElement>, repeat: string) => {setRepeat(repeat)} }
				>
					<ToggleButton value="One-Time">One-Time</ToggleButton>
					<ToggleButton value="Repeat">Repeat</ToggleButton>
				</ToggleButtonGroup>
			);
		}
		
		function renderRepeatFrequency() {
			function renderRepeatFrequencyButtons() {
				return (
					<Box>
						<ToggleButtonGroup
							color="primary"
							orientation="vertical"
							value={repeatFrequency}
							exclusive
							onChange={ (event: React.MouseEvent<HTMLElement>, freq: string) => {setRepeatFrequency(freq)} }
							aria-label="Repeat Frequency"
							sx={{mt: 1}}
						>
							<ToggleButton value="730" aria-label="each month">each month</ToggleButton>
							<ToggleButton value="168" aria-label="each week">each week</ToggleButton>
							<ToggleButton value="24" aria-label="each day">each day</ToggleButton>
							<ToggleButton value="1" aria-label="each hour">each hour</ToggleButton>
							<ToggleButton value="0" aria-label="other">other</ToggleButton>
						</ToggleButtonGroup>
						{ repeatFrequency == "0" && renderRepeatOther() }
					</Box>
				);
			}
			
			function renderRepeatOther() {
				function renderRepeatOtherMenu() {
					return(
						<>
							<FormControl>
								<InputLabel>Time Frame</InputLabel>
								<Select
									value={repeatFrequencyTimeframe}
									label="Time Frame"
									onChange={(event) => {setRepeatFrequencyTimeframe(event.target.value)}}
									size="small"
									sx={{ml:0.5}}
								>
									<MenuItem value="730">month(s)</MenuItem>
									<MenuItem value="168">week(s)</MenuItem>
									<MenuItem value="24">day(s)</MenuItem>
									<MenuItem value="1">hour(s)</MenuItem>
								</Select>
							</FormControl>
						</>
					);
				}
			
				return (
					<Box sx={{mt:1}} display="flex" flexDirection="row">
						<TextField
							sx={{width: "7rem"}}
							label=<Typography variant="caption">"Type a number…"</Typography>
							variant="outlined"
							onChange={(event) => setRepeatFrequencyNumber(event.target.value)}
							value={repeatFrequencyNumber}
							type="number"
							InputProps={{
								inputProps: { min: 1 }
							}}
							size="small"
						/>
						{ renderRepeatOtherMenu() }
					</Box>
				);
			}
			
			return (
				<Box sx={{mt:3.5, p: 2, border: 2, borderRadius: 1, borderColor: "neutral.200"}}>
					<Typography variant="h6">Repeat How Often?</Typography>
					{ renderRepeatFrequencyButtons() }
				</Box>
			);
		}
		
		function renderAutomaticTransfer() {
			return (
				<Box sx={{mt:3.5, p: 2, border: 2, borderRadius: 1, borderColor: "neutral.200"}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>
									First Automatic Transfer Date
								</TableCell>
								<TableCell>
									First Automatic Transfer Time
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell>
									N/A
								</TableCell>
								<TableCell>
									N/A
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<Typography sx={{mt: 2}} variant="h6">Limit of Automatic Transfers</Typography>
					<TextField
						sx = {{mt: 1, width: "7rem"}}
						label=<Typography variant="caption">"Type a number…"</Typography>
						variant="outlined"
						size="small"
						onChange={(event) => setAutomaticTransferLimit(event.target.value)}
						value={automaticTransferLimit}
						type="number"
						InputProps={{
							inputProps: { min: 0 }
						}}
					/>
				</Box>
			);
		}
		
		const scheduleDataTransfer = async () => {
			if (transferDateTime) {
				const client = new EventBridgeClient(EBConfig);
				var schedExp;
				if (repeat == "One-Time")
					schedExp =
						'cron(' +
						transferDateTime.$d.getUTCSeconds() + ', ' +
						transferDateTime.$d.getUTCMinutes() + ', ' +
						transferDateTime.$d.getUTCDay() + ', ' +
						transferDateTime.$d.getUTCMonth() + ', ' +
						'?, ' +
						transferDateTime.$d.getUTCFullYear() +')';
				else if (repeatFrequency)
					schedExp = 'rate(' + repeatFrequency + ' hours)';
				else
					schedExp = 'rate(' + repeatFrequencyNumber * repeatFrequencyTimeframe + ' hours)';
				
				const response = await client.send(
					new PutRuleCommand({
						Name: selectedAnalyzer.ps_analyzer_id + '_scheduledtransfer',
						Description: repeat + ' scheduled data transfer for ' + selectedAnalyzer.ps_analyzer_id + ', ' + schedExp,
						ScheduleExpression: schedExp,
						State: "DISABLED",
						EventBusName: "default",			
					}),
				);
			}
			else
				alert('Please select a transfer date and time.');
		};
	
		return (
			<Card sx={{maxWidth: "60rem"}}>
				<Box display="flex" flexDirection="column" sx={{m:2}}>
					<Button
					sx={{pb: 2.5, height: "2rem", width: "10rem", whiteSpace:"nowrap"}}
					component="label"
					variant="text"
					tabIndex={-1}
					startIcon={<ArrowBackIcon />}
					onClick={() => {setShowScheduleData(false)}}
					>
						Device Management
					</Button>
					<Typography variant="h5">Schedule Data Transfer</Typography>
					{ renderRepeatButton() }
					{ renderAnalyzerInfo() }
					{ renderDTPicker() }
					{ repeat == "Repeat" && renderRepeatFrequency() }
					{ renderAutomaticTransfer() }
					<Typography sx={{mt: 3.5}} variant="h6">Use Filename</Typography>
					<TextField
						variant="outlined"
						size="small"
						onChange={(event) => setFilename(event.target.value)}
						value={filename}
						sx={{width: "15rem", mt:0.25}}
					/>
					<Button
						sx={{mt:3.5, p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						disabled
						>
							Generate Report?
					</Button>
					<Box display="flex" flexDirection="row" sx={{mt:4}}>
					<Button
						sx={{p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={scheduleDataTransfer}
					>
						Accept
					</Button>
					<Button
						sx={{ml: 4, p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={() => setShowScheduleData(false)}
					>
						Cancel
					</Button>
					</Box>
				</Box>
			</Card>
		);
	}
	
	function renderAnalyzerCard() {
		function validateAnalyzersNames() {
			const validAnalyzers = [];
			const validNames = [];
			for (let i=0; i<connectedAnalyzers.length; i++) { // double for loop is inefficient, but probably doesn't matter for the number of analyzers available
				for (let j=0; j<analyzers.length; j++) {
					if (connectedAnalyzers[i] == analyzers[j].ps_analyzer_id) {
						validAnalyzers.push(analyzers[j]);
						if(user && user.signInUserSession.accessToken.payload['cognito:groups'] == 'Admin')
							validNames.push(customerNames[j]);
						break;
					}
				}
			}
			return {validAnalyzers, validNames};
		}
	
		if (analyzers == null) {
			return (
				<div>
					<Typography variant="h5">Loading analyzers, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</div>
			);
		}
		else if (analyzers.length == 0) {
			return (
				// <Typography variant="h5">No analyzers found, please add your analyzer(s) and try again.</Typography>
				<Typography variant="body1" align="center">
                <span style={{ fontSize: '1.2rem' }}><strong>No analyzers allocated to this account.</strong></span> <br />
				To order an analyzer, contact <a href="mailto:sales@powersight.com">sales@powersight.com</a>.<br/>
				If an analyzer has been allocated, contact <a href="mailto:support@powersight.com">support@powersight.com</a>.
				</Typography>			
			);
		}
		else if (connectedAnalyzers == null) {
			return (
				<div>
					<Typography variant="h5">Getting gateway status, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</div>
			);
		}
		else if (connectedAnalyzers.length == 0) {
			return (
				<Typography variant="h5">No connected analyzers found, please check your gateway(s) and try again.</Typography>
			);
		}
		else if (user && user.signInUserSession.accessToken.payload['cognito:groups'] == 'Admin' && customerNames == null) {
			return (
				<div>
					<Typography variant="h5">Getting customers, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</div>
			);
		}
		else { // analyzers in dynamoDB, analyzers connected to thing shadow, and customer names were found
			const validAnalyzersNames = validateAnalyzersNames();
			if (validAnalyzersNames.validAnalyzers.length == 0) {
				return (
					<>
						<Typography variant="h5">Connected analyzer(s) do not match any available analyzer(s).</Typography>
						<Typography variant="h5">Please check your gateway(s) or add your analyzer(s) and try again.</Typography>
					</>
				);
			}
			else { // matching analyzer + connected analyzer found
				if (!selectedAnalyzer) {// initial analyzer selection
					setSelectedAnalyzer(validAnalyzersNames.validAnalyzers[0]);
				}
				else {
					return (
						<Box display="block">
								<Box display="flex">
									<Accordion defaultExpanded>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="panel-content"
											id="panel-header"
										>
											<Typography variant="h5">Request Files From {selectedAnalyzer.ps_analyzer_id}</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<Box sx={{display: "flex", flexDirection: "row"}}>
												{ renderSelectTool(validAnalyzersNames) }
											</Box>
										</AccordionDetails>
									</Accordion>
								</Box>
							{ renderDownloadStatus() }
							{ renderFiles() }
						</Box>
					);
				}
			}
		}
	}
	
	function renderDownloadStatus() {
		if (shadowStatus) {
			const desired = shadowStatus.data.state.desired;
			const reported = shadowStatus.data.state.reported;
			const files = extensions[1];
			const status = [];
			
			for (let i=0; i<files.length; i++) {
				const file = files[i];
				let progObj = "";
				if (reported && reported[file]) {
					progObj = {"type": file, "progress": reported[file]};
					status.push(progObj);
				}
				else if (desired && desired[file] && desired[file].includes(".com")) {
					progObj = {"type": file, "progress": "Presigned URL sent to shadow"};
					status.push(progObj);
				}
			}
			
			if (status.length > 0) {
				return (
					<Box sx={{my:2}}>
						<Typography variant="h5">File upload status: </Typography>
						<Box sx={{mt:1}}>
						{
							status.map((myFile, i) => {
								if (myFile.progress == "Presigned URL sent to shadow") {
									return (
										<div key={i}>
											<span>{myFile.type}: {myFile.progress}</span>
											<LinearProgress/>
										</div>
									);
								}
								else {
									return (
										<div key={i}>
											<span>{myFile.type}: {myFile.progress == 'Complete' ? 100 : parseInt(myFile.progress)} %</span>
											<LinearProgress variant="determinate" value={myFile.progress == 'Complete' ? 100 : parseInt(myFile.progress)}/>
										</div>
									);
								}
							})
						}
						</Box>
					</Box>
				);
			}
		}
		else {
			return (
				<Box sx={{my:2}}>
					<Typography variant="h5">Getting status . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</Box>
			);
		}
	}
	
	function renderFiles() {
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
			);
		}
		
		function formatBytes(bytes, decimals = 1) { // from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
			if (!+bytes) return '0 KB'

			const k = 1024
			const dm = decimals < 0 ? 0 : decimals
			const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

			const i = 1;//Math.floor(Math.log(bytes) / Math.log(k))

			return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
		}
		
		function renderTableHeader() {
			return (
				<TableHead>
					<TableRow>
						{ renderTableCells(["File", "Last Modified", "Size", ""]) }
					</TableRow>
				</TableHead>
			);
		}
		
		function renderDownloadButton(file) {
			return(
				<TableCell>
					<Button
					onClick={downloadFile}
					component="label"
					variant="outlined"
					tabIndex={-1}
					startIcon={<CloudDownloadIcon/>}
					data-file-name={file}
					>
						{file}
					</Button>
				</TableCell>
			);
		}
		
		function renderDeleteButton(file) {
			return (
				<TableCell>
					<Box display="flex" justifyContent="center" alignItems="center">
						<Button
						variant="outlined"
						startIcon={<DeleteIcon />}
						data-file-name={file}
						onClick={deleteFile}
						disabled={false/*deleting.includes(file)*/}
						>
							Delete
						</Button>
						{
							/*deleting.includes(file) &&
							<CircularProgress sx={{ml: 1}} size="1.75rem"/>*/
						}
					</Box>
				</TableCell>
			);
		}
		
		function renderTableBody() {
			let match = false;
			return (
				<TableBody>
					{
						s3Files.map((file, i) => {
							if (file.Key.includes(selectedAnalyzer.ps_analyzer_id) || showAllFiles) {
								match = true;
								return(
									<TableRow hover key={i}>
										{ renderDownloadButton(file.Key) }
										{ renderTableCells([file.LastModified.toLocaleString(), formatBytes(file.ContentLength)]) }
										{ renderDeleteButton(file.Key) }
									</TableRow>
								);
							}
						})
					}
					{ !match &&
						<TableRow>
							<TableCell>
								No uploaded files were found in S3.
							</TableCell>
						</TableRow>
					}
				</TableBody>
			);
		}
		
		function renderTable() {
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
		}
	
		const downloadFile = async (event: React.MouseEvent<HTMLElement>) => {
			const fileName = event.currentTarget.dataset.fileName;
			const command = new GetObjectCommand({
				Bucket: S3Config.bucket,
				Key: fileName,
			});
			
			const response = await S3.send(command);
			const data = await new Response(response.Body).arrayBuffer();
			const fileType = response.Body.ContentType;
			fileDownload(data, fileName, fileType);
		}
		
		const deleteFile = async (event: React.MouseEvent<HTMLElement>) => {
			const fileName = event.currentTarget.dataset.fileName;
			const myArray = deleting;
			myArray.push(fileName);
			await setDeleting(myArray);
			const command = new DeleteObjectCommand({
				Bucket: S3Config.bucket,
				Key: fileName,
			});
			const response = await S3.send(command);
		}
		
		if(s3Files == null) { // still looking for files
			return (
				<Box sx={{mt: 2}}>
					<Typography variant="h5">Searching for files, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</Box>
			);
		}
		else if (s3Files.length > 0) { // found files
			const group = user.signInUserSession.accessToken.payload['cognito:groups'];
			return (
				<>
					{
						(group == "Admin" || group == "AdminMaster") && 
						<FormControlLabel sx={{mt:0.5}}
							control={
								<Checkbox
									onChange={() => setShowAllFiles(!showAllFiles)}
								/>
							}
							label={<Typography variant="caption">show all files</Typography>}
						/>
					}
					<Card sx={{mt:0.5}}>
						{ renderTable() }
					</Card>
				</>
			);
		}
		else { // no files found
			return (
				<Box sx={{mt: 2}}>
					<Typography variant="h5">No files in cloud.</Typography>
				</Box>
			);
		}
	}
	
	async function generateS3Url(filename) { // get a presigned S3 URL
		const KEY = filename; // S3 "keys" are filenames
		const createPresignedUrlWithClient = ({ region, bucket, key }) => {
			
			let command = new PutObjectCommand({ Bucket: bucket, Key: key });
			return getSignedUrl(S3, command, { expiresIn: 60 * 60 * 6 }); // expects time in seconds. 60*60*6=6hr
		};
		
		try {
			const clientUrl = await createPresignedUrlWithClient({
				region: S3Config.region,
				bucket: S3Config.bucket,
				key: KEY,
			});
			return clientUrl;
		}
		catch(e) {
			console.log("Error generating S3 presigned URL", e);
			setError(e);
		}
	}
	
	function renderSelectTool(analyzersNames) {
		function searchAnalyzers() {
			const analyzers = analyzersNames.validAnalyzers;
			const names = analyzersNames.validNames;
			const searchResults = [];
			const a = [modelSearch.toLowerCase(), serialSearch.toLowerCase(), siteSearch.toLowerCase(), roomSearch.toLowerCase(), circuitSearch.toLowerCase(), customerSearch.toLowerCase()];
		
			for (let i=0; i<analyzers.length; i++) {
				const b = [analyzers[i].model, analyzers[i].serial_number, analyzers[i].site_location, analyzers[i].room_location, analyzers[i].circuit];
				if (names)
					b.push(names[i]);
				let match = true;
					for (let j=0; j<a.length; j++) {
						if ((a[j] && !b[j]) || (b[j] && !(b[j].toLowerCase().includes(a[j])))) {
							match = false;
							break;
						}
					}
				if (match) {
					if(names)
						analyzers[i].customer_name = names[i];
					searchResults.push(analyzers[i]);
				}
			}
			return searchResults;
		}
		
		const uploadFiles = async () => {
			if (shadowStatus) {
				let requestStateDocument = {
					"state": {
						"desired": {
						}
					}
				};
				
				let myFilename = selectedAnalyzer.ps_analyzer_id;
				if (shadowStatus.data.state.reported.Status) {
					const status = shadowStatus.data.state.reported.Status;
					myFilename = myFilename + "_" + status.sessName;
				}
				
				try {
					for (let i=0; i<extensions[0].length; i++)
						requestStateDocument.state.desired[extensions[1][i]] = await generateS3Url(myFilename + extensions[0][i]);
					updateShadow(requestStateDocument);
				}
				catch (e) {
					console.log("Error uploading files", e);
				}
			}
			else
				alert("Please wait for status to complete.");
		}
		
		const cancelFiles = () => {
			const requestStateDocument = { // clear the shadow state
				"state": {
						"desired": {
					},
						"reported": {
					}
				}
			};
			for (const file of extensions[1])
				requestStateDocument.state.desired[file] = "Cancel";
			updateShadow(requestStateDocument);
		}
		
		function renderAccordionButtons() {
			return(
				<Box display="flex" flexDirection="row" justifyContent="left">
					<Button
					sx={{p: 2.5, height: "2rem", width: "10rem"}}
					onClick={uploadFiles}
					component="label"
					variant="contained"
					tabIndex={-1}
					startIcon={<CloudUploadIcon />}
					>
						Get Data Now
					</Button>
					<Button
					sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem"}}
					onClick={cancelFiles}
					component="label"
					variant="contained"
					tabIndex={-1}
					startIcon={<CancelIcon />}
					>
						Cancel
					</Button>
					<Button
					sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem", lineHeight:1}}
					component="label"
					variant="contained"
					tabIndex={-1}
					startIcon={<AccessTimeIcon />}
					onClick={() => {setShowScheduleData(true)}}
					>
						Schedule Data Transfer
					</Button>
					<Button
					sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem", lineHeight:1}}
					component="label"
					variant="contained"
					tabIndex={-1}
					startIcon={<CheckCircleIcon />}
					onClick={() => {setShowDataAvailable(true)}}
					>
						Data Available
					</Button>
				</Box>
			);
		}
		
		if (!refreshingAnalyzers) {
			return (
				<Box>
					{ renderAccordionButtons() }
					{ renderMenu(searchAnalyzers()) }
				</Box>
			);
		}
		else {
			return (
				<div>
					<Typography variant="button">Refreshing connected analyzers, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</div>
			);
		}
	}
	
	function renderTextInput() {
		return (
			<>
				<Box sx={{ display:"flex", flexDirection: "column", ml: 2, mt:2}}>
					{
						Object.keys(selectedLogFiles).map((fileType, i) => {
							if (selectedLogFiles[fileType]) {
								return (
									<TextField
										sx={{width: "12rem", p: 0.25}}
										label={<Typography variant={searchTypography}>Optional {fileType} Name</Typography>}
										size="small"
										id="inputLo"
										key = {i}
									/>
								);
							}
						})
					}
				</Box>
				<Box sx={{ display:"flex", flexDirection: "column", ml: 2, mt:2}}>
					{
						Object.keys(selectedEventFiles1).map((fileType, i) => {
							if (selectedEventFiles1[fileType]) {
								return (
									<TextField
										sx={{width: "12rem", p: 0.25}}
										label={<Typography variant={searchTypography}>Optional {fileType} Name</Typography>}
										size="small"
										id="inputLo"
										key={i}
									/>
								);
							}
						})
					}
				</Box>
				{<Box sx={{ display:"flex", flexDirection: "column", ml: 2, mt:2}}>
					{
						Object.keys(selectedEventFiles2).map((fileType, i) => {
							if (selectedEventFiles2[fileType]) {
								return (
									<TextField
										sx={{width: "12rem", p: 0.25}}
										label={<Typography variant={searchTypography}>Optional {fileType} Name</Typography>}
										size="small"
										id="inputLo"
										key={i}
									/>
								);
							}
						})
					}
				</Box>}
			</>
		);
	}
	
	function renderMenu(searchResults) {
		let sz = 2.4;
		let w = "42rem"
		
		let group = "";
		if (user && user.signInUserSession)
			group = user.signInUserSession.accessToken.payload['cognito:groups'];
		if (group == 'Admin' || group == 'AdminMaster') { // add space for customer field
			sz = 2;
			w = "50rem"
		}
		
		function renderSearch() {
			const functions = [
				setModelSearch,
				setSerialSearch,
				setCustomerSearch,
				setSiteSearch,
				setRoomSearch,
				setCircuitSearch
			];
			const labels = [
				"Enter Model",
				"Enter Serial#",
				"Enter Customer",
				"Enter Site",
				"Enter Room",
				"Enter Circuit"
			];
			const values = [
				modelSearch,
				serialSearch,
				customerSearch,
				siteSearch,
				roomSearch,
				circuitSearch
			];
			
			return (
				functions.map((myFunction, i) => {
					if (i!=2 || group == 'Admin' || group == 'AdminMaster') { // hide customer field when not admin
						return (
							<Grid sx={{width: "8rem"}} size={sz} key={i}>
								<TextField
									sx={{mr: 0.5, mb: 1, mt:0.5}}
									label=<Typography variant="caption">{labels[i]}</Typography>
									variant="outlined"
									size="small"
									id={labels[i]}
									key={i}
									onChange={(event) => myFunction(event.target.value)}
									value={values[i]}
									InputProps=
									{{
										endAdornment:
											<InputAdornment position="end">
												<IconButton
													aria-label="clear"
													onClick={() => myFunction("")}
													edge="end"
													sx = {{py: 0, px: 0.5}}
												>
													{ <ClearIcon sx={{fontSize: 16}} /> }
												</IconButton>
											</InputAdornment>
									}}
								/>
							</Grid>
						);
					}
				})
			)
		}
		
		function renderMenuButtons() {
			const handleChange = (event: React.MouseEvent<HTMLElement>, nextAnalyzer) => {
				if (nextAnalyzer !== null) {
					setSelectedAnalyzer(nextAnalyzer);
					setShadowStatus(null);
				}
			}
			const myKeys = [
				"model",
				"serial_number",
				"customer_name",
				"site_location",
				"room_location",
				"circuit"
			];
			return (
				<ToggleButtonGroup
					color="primary"
					exclusive
					aria-label="Analyzer"
					orientation="vertical"
					onChange={handleChange}
					value={selectedAnalyzer}
				>
					{
						searchResults.map((analyzer, i) => {
							return (
								<ToggleButton key={i} sx={{height:"2.15rem", lineHeight:1, whiteSpace:"nowrap", p:0}} value={analyzer}>
									{
										myKeys.map((key, j) => {
											if (j!=2 || group == 'Admin' || group == 'AdminMaster') { // hide customer field when not admin
												return (
													<Grid textAlign="left" sx={{pl:1, width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={sz} key={j}>
														{analyzer[key] || "N/A"}
													</Grid>
												);
											}
										})
									}
								</ToggleButton>
							);
						})
					}
				</ToggleButtonGroup>
			);
		}
		
		if (selectedAnalyzer) {
			return (
				<Grid container maxWidth={w} sx={{mt: 0.5, overflow: "hidden", overflowY: "auto", overflowX: "auto", maxHeight: "9.75rem"}}>	
					{ renderSearch() }
					{ renderMenuButtons() }
				</Grid>
			);
		}
	}
	
	function renderCheckboxes() {
		const handleChangeLogFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
			let mySelectedFiles = {...selectedLogFiles};
			mySelectedFiles[event.target.value] = !mySelectedFiles[event.target.value];
			setSelectedLogFiles(mySelectedFiles);
		};
		const handleChangeEventFiles1 = (event: React.ChangeEvent<HTMLInputElement>) => {
			let mySelectedFiles = {...selectedEventFiles1};
			mySelectedFiles[event.target.value] = !mySelectedFiles[event.target.value];
			setSelectedEventFiles1(mySelectedFiles);
		};
		const handleChangeEventFiles2 = (event: React.ChangeEvent<HTMLInputElement>) => {
			let mySelectedFiles = {...selectedEventFiles2};
			mySelectedFiles[event.target.value] = !mySelectedFiles[event.target.value];
			setSelectedEventFiles2(mySelectedFiles);
		};
		
		function renderCheckboxGroup(labels, myFunction) {
			return (
				<div>
					<FormGroup>
						{
							labels.map((label, i) => {
								return (
									<FormControlLabel
										control=
											{ 
												<Checkbox
												defaultChecked
												inputProps={{ 'aria-label': {label} }}
												sx={{m:0.5, p:0}}
												/>
											}
										value={label}
										label={<Typography variant="caption" fontWeight="600">{label}</Typography>}
										key={i}
										onChange={myFunction}
										sx={{m:1, p:0}}
									/>
								)
							})
						}
					</FormGroup>
				</div>
			)
		}
		
		return (
			<>
				<Box sx={{ display:"flex", flexDirection: "row", ml: 2, mt:2, p: 1, border: 0.5, borderRadius: 1, borderColor: "neutral.200", color: "neutral.500" }}>
					{ renderCheckboxGroup(Object.keys(selectedLogFiles), handleChangeLogFiles) }
					{ renderCheckboxGroup(Object.keys(selectedEventFiles1), handleChangeEventFiles1) }
					{ renderCheckboxGroup(Object.keys(selectedEventFiles2), handleChangeEventFiles2) }
				</Box>
			</>
		)
	}
	
	/*** MY CODE ***/

  return (
    <>
      <Seo title="Dashboard: Download Files" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 0,
          width: "auto",
          px: 1.5,
					mt: 1.5,
        }}
      >
        {renderMain()}
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;