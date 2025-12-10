import type { NextPage } from 'next';
import { styled } from '@mui/material/styles';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';

import { useEffect, useState } from 'react';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IoTDataPlaneClient, GetThingShadowCommand, UpdateThingShadowCommand, ListNamedShadowsForThingCommand } from "@aws-sdk/client-iot-data-plane"; // ES Modules import
import { API, Auth } from 'aws-amplify';
import * as queries from '../../../graphql/queries';

const Page: NextPage = () => {
  usePageView();
	
	const IoTConfig = {
		region: "us-west-1",
		endpoint: "https://a35th8mhj0yen6-ats.iot.us-west-1.amazonaws.com", // not sure if this is OK in plain text
		credentials: {
			// accessKeyId: "", // NOTE!! WE SHOULD NOT BE STORING THESE IN PLAIN TEXT IN CODE
			// secretAccessKey: "", // I NEED TO FIGURE OUT HOW TO REQUEST THEM FROM THE ENVIRONMENT
		},
		thingName: "RichGateway"
	}
	const IoT = new IoTDataPlaneClient(IoTConfig);
	
	// const S3Config = {
	// 	credentials: {
	// 		accessKeyId: "AKIAWGYN4BC5JC356DPT", // NOTE!! WE SHOULD NOT BE STORING THESE IN PLAIN TEXT IN CODE
	// 		secretAccessKey: "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", // I NEED TO FIGURE OUT HOW TO REQUEST THEM FROM THE ENVIRONMENT
	// 	},
	// 	region: "us-west-1",
	// 	//sha256: Hash.bind(null, "sha256"),
	// 	bucket: "ps-gateway-firmware",
	// };
	// const S3 = new S3Client(S3Config);
	
	const [selectedModel, setSelectedModel] = useState("G2000");
	const [selectedFirmware, setSelectedFirmware] = useState("");
	const [s3Files, setS3Files] = useState(null);
	const [devices, setDevices] = useState(null);
	const [selectedDevices, setSelectedDevices] = useState([]);
	const [upgradingFirmware, setUpgradingFirmware] = useState(false);
	const [fwStatus, setFWStatus] = useState(new Map());
	const [customerNames, setCustomerNames] = useState(new Map());
	
	const [serialSortDirection, setSerialSortDirection] = useState("ASC");
	
	// useEffect(() => {
	// 	async function getFiles() {
	// 		const command = new ListObjectsV2Command({
	// 			Bucket: S3Config.bucket,
	// 			// The default and maximum number of keys returned is 1000
	// 			MaxKeys: 1000,
	// 		});

	// 		try {
	// 			let isTruncated = true;
	// 			let contentList = [];

	// 			while (isTruncated) {
	// 				const { Contents, IsTruncated, NextContinuationToken } =
	// 					await S3.send(command);
	// 				contentList.push(Contents);
	// 				isTruncated = IsTruncated;
	// 				command.input.ContinuationToken = NextContinuationToken;
	// 			}
				
	// 			const matches = [];
	// 			for (let i=0; i<contentList[0].length; i++) {
	// 				//if (contentList[0][i].Key.includes(selectedModel))
	// 					matches.push(contentList[0][i]);
	// 			}
				
	// 			setS3Files(matches);
	// 			setSelectedFirmware(matches[0].Key);
	// 		} catch (err) {
	// 			console.error(err);
	// 		}
	// 	};
		
	// 	getFiles();
		
	// }, [devices]);

	useEffect(() => {
		async function getFiles() {
			try {
				const response = await API.get(
					'powersightrestapi',
					`/getFirmwareFileNames`
				);
				 console.log(response,"response")
				
				/*const matches = [];
	 			for (let i=0; i<contentList[0].length; i++) {
	 				if (response.files.Key.includes(selectedModel))
	 					matches.push(response.files.Key.includes(selectedModel));
	 			}*/
				
				if (response && response.files) {
					const matches = response.files.map(file => ({
						Key: file,
					}));
					setS3Files(matches);
					// console.log(matches,"matches")
					if (matches.length > 0) {
						setSelectedFirmware(matches[0].Key);
					}
				}
			} catch (err) {
				console.error(err);
			}
		}
		getFiles();
	}, [devices]);
	
	useEffect(() => {
		async function idToName(id) {
		const variables = {
			limit: 1,
			nextToken: null,
			id: id
		};
		const apiData = await API
		.graphql({
			query: queries.getCustomer,
			variables,
		});
		
		return(apiData.data.getCustomer.name);
	}
	
	async function getCustomerNames(myDevices) {
		const myMap = customerNames;
		for (let i=0; i<myDevices.length; i++) {
			if (myDevices[i].customer_id) {
				const id = myDevices[i].customer_id;
				if (!myMap.has(id)) {
					const name = await idToName(id);
					if (name)
						myMap.set(id, name);
				}
			}
		}
		setCustomerNames(myMap);
	}
	
		async function getGateways() {
			try {
				let next = null;
				let myData = [];

				do {
					const variables = {
						limit: 1000,
						nextToken: next,
					};
					const apiData = await API
					.graphql({
						query: queries.listGateways,
						variables,
					});

					next = apiData.data.listGateways.nextToken;
					myData = myData.concat(apiData.data.listGateways.items); // combine data into one flat array
				}
				while (next != null);
				
				myData.sort(function(a, b) { // from: https://stackoverflow.com/questions/8175093/simple-function-to-sort-an-array-of-objects/8175221#8175221
					let x = a["serial_number"];
					let y = b["serial_number"];
					if (serialSortDirection == 'ASC')
						return ((x < y) ? -1 : ((x > y) ? 1 : 0));
					else
						return ((x < y) ? 1 : ((x > y) ? -1 : 0));
				});
				
				for (let i=0; i<myData.length; i++)
					myData[i].device_id = myData[i].ps_gateway_id;
				
				setDevices(myData);
				getCustomerNames(myData)
			}
			catch(e) {
				console.log('Error on getting gateways.', e);
			}
		}
		
		async function getMatchingAnalyzers() { // create map of [id, boolean] for selecting what analyzers to show, and store in state
			try {
				let next = null;
				let myData = [];
				
				do {
					const apiData = await API
					.graphql({
								query: queries.listAnalyzers,
							});
					next = apiData.data.listAnalyzers.nextToken;
					myData = myData.concat(apiData.data.listAnalyzers.items); // combine data into one flat array
				}
				while (next != null);
				
				const matches = [];
				for (let i=0; i<myData.length; i++) {
					if (myData[i].model.includes(selectedModel)) {
						matches.push(myData[i]);
						myData[i].device_id = myData[i].ps_analyzer_id;
					}
				}
				
				setDevices(matches);
				getCustomerNames(matches);
			}
			catch(e) {
			console.log('Error on getting analyzers.', e);
			}
		}
		
		if (selectedModel == 'G2000')
			getGateways();
		else
			getMatchingAnalyzers();
		
	}, [selectedModel]);
	
	useEffect(() => {
		async function clearFWStatus(device) {
			const requestStateDocument = { // clear the shadow state
				"state": {
						"desired": {
						"FWM": null
					},
						"reported": {
						"FWM": null
					}
				}
			};
			const input = {
				thingName: IoTConfig.thingName,
				shadowName: device,
				payload: Buffer.from( JSON.stringify(requestStateDocument) ),
			}
			const command = new UpdateThingShadowCommand(input);
			const response = await IoT.send(command);
			console.log(reponse);
			
			//const response = await API.post('powersightrestapi', `/IoTShadow/updateShadow?shadowName=${device}`);
			
		}
	
		async function getStatus() {
			if (devices) {
				const statusMap = new Map();
				for (let i=0; i<devices.length; i++) {
					const device = devices[i].device_id;
					const status = await getShadowStatus(device);
					const reported = status.data.state.reported;
					if (reported) {
						if (reported.FWM) {
							//if (reported.FWM == "Complete")
							//	clearFWStatus(device);
							statusMap.set(device, reported.FWM);
						}
						//else
						//	statusMap.set(device, "Not Currently Updating");
					}
				}
				setFWStatus(statusMap);
			}
		}
		
		getStatus();
		
	}, [devices]);	
	
	async function getShadowStatus(device) {
		const response = await API.get('powersightrestapi', `/IoTShadow/getShadow?shadowName=${device}`);
		console.log(device,response);
		return response;
	}
	
	function renderMain() {
		function renderSelectModel() {
			const myModels = ["G2000", "PS5000", "PS4550", "PS3550" ];
			return (
				<Box display="flex" flexDirection="row">
					<Typography variant="h6">For: </Typography>
					<FormControl sx={{ml: 1}} size="small" fullWidth>
						<InputLabel id="simple-select-label">Model</InputLabel>
						<Select
							labelId="simple-select-label"
							id="simple-select"
							value={selectedModel}
							label="Model"
							autoWidth
							onChange={ (e: SelectChangeEvent) => {setSelectedModel(e.target.value), setDevices(null)} }
						>
							{
								myModels.map((myModel, i) => {
									return (
										<MenuItem value={myModel} key={i}>{myModel}</MenuItem>
									)
								})
							}
						</Select>
					</FormControl>
				</Box>
			);
		}
		
		function renderSelectFirmware() {
			if (s3Files) {
				return (
					<Box sx={{ml: 2}} display="flex" flexDirection="row">
						<Typography variant="h6">With: </Typography>
						{
							s3Files.length > 0 ?
							<FormControl sx={{ml: 1}} size="small" fullWidth>
								<InputLabel id="simple-select-label-FW">Firmware</InputLabel>
								<Select
									sx={{minWidth: "7rem"}}
									labelId="simple-select-label-FW"
									id="simple-select-FW"
									value={selectedFirmware}
									label="FW Vers."
									autoWidth
									onChange={ (e: SelectChangeEvent) => {setSelectedFirmware(e.target.value)} }
								>
									{
										s3Files.map((file, i) => {
											return (
												<MenuItem value={file.Key} key={i}>{file.Key}</MenuItem>
											)
										})
									}
								</Select>
							</FormControl> :
							<Typography sx={{ml: 2, mt: 1, wordWrap: "break-word", maxWidth:"20rem"}}>Matching firmware for this device not found. Please add firmware and try again.</Typography>
						}
					</Box>
				);
			}
			else {
				return (
					<Box display="flex" flexDirection="row">
						<Typography sx={{ml: 2}} variant="h6">With: </Typography>
						<Typography sx={{pl:1}}>Failed to get files from S3.</Typography>
					</Box>
				)
			}
		}
		
		function renderButtons() {
			const upgradeFirmware = async () => {
				async function updateShadow(requestStateDocument, device) {
					// const input = {
					// 	thingName: IoTConfig.thingName,
					// 	shadowName: device,
					// 	payload: Buffer.from( JSON.stringify(requestStateDocument) ),
					// }
					// const command = new UpdateThingShadowCommand(input);
					// const response = await IoT.send(command);

					const params = {
						firmware_file_name: selectedFirmware,    
						device_shadow_list: selectedDevices 
						// Key: selectedFirmware,
						// Bucket: device,
					};

					try {
						const response = await API.post('powersightrestapi', `/upgradeFirmware`, {body: params});
						console.log('Firmware upgrade response:', response);
					} catch (error) {
						console.error('Error upgrading firmware:', error);
					}
				}
				
				if (selectedFirmware) {
					if (selectedDevices.length > 0) {
						setUpgradingFirmware(true);
						console.log(selectedDevices);
						
						selectedDevices.map((device, i) => {
							let requestStateDocument = {
								"state": {
									"desired": {
									}
								}
							};
							
							try {
								(requestStateDocument.state.desired as any)['FWM'] = 'https://ps-gateway-firmware.s3.us-west-1.amazonaws.com/' + selectedFirmware;
								updateShadow(requestStateDocument, device);
							}
							catch (e) {
								console.log("Error uploading files", e);
							}
						});
					}
					else
						alert('Please select at least one device.');
				}
				else
					alert('No firmware selected.');
			}
		
			if (devices && devices.length > 0) {
				return (
					<Box sx={{mt:2.5}} display="flex" flexDirection="row" justifyContent="left">
						<Button
							sx={{p: 2.5, height: "3.5rem", width: "8rem", lineHeight:1, textAlign:"center"}}
							component="label"
							variant="contained"
							tabIndex={-1}
							onClick={upgradeFirmware}
							>
							Upgrade Firmware Now
						</Button>
						<Button
							sx={{ml: 1.5, p: 2.5, height: "3.5rem", width: "8rem", lineHeight:1, textAlign:"center"}}
							component="label"
							variant="contained"
							tabIndex={-1}
							disabled
							>
							Schedule Firmware Upgrade
						</Button>
					</Box>
				);
			}
		}
	
		try {
			return (
				<>
					<Box display="flex" flexDirection="row">
						<Typography variant="h5">Firmware Upgrade</Typography>
						<Box sx={{ml:5}} display="flex" flexDirection="row">
							{renderSelectModel()}
							{renderSelectFirmware()}
						</Box>
					</Box>
					{renderDeviceTable()}
					{renderButtons()}
				</>
			);
		}
		catch(e) {
			console.log("Error rendering main.", e);
		}
	}
	
	function renderDeviceTable() {
		function renderTableHeader() {
			return (
				<TableHead>
					<TableRow>
						{ renderTableCells([" ", "Model", "Serial #", "Status", "Start Date", "End Date", "End Access", "Customer", "Site", "Room", "Circuit", "HW Vers.", "FW Vers.", "FW Status"]) }
					</TableRow>
				</TableHead>
			);
		}
		
		function renderTableBody() {
			function renderCheckbox(id) {
				const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) =>
				{ 
					let myDevices = selectedDevices;
					if (event.target.checked)
						myDevices.push(event.target.value);
					else {
						myDevices = myDevices.filter( function(device) {
							return device !== event.target.value
						});
					}
					setSelectedDevices(myDevices);
				}
				
				return (
					<Checkbox
						value={id}
						onChange={handleCheckbox}
					/>
				)
			}
			
			return (
				<TableBody>
					{
						devices.map((device, i) => {

							const createdAt = device.gateway_rental?.items?.[0]?.createdAt ? device.gateway_rental.items[0].createdAt.split("T")[0] : "-";
							const end_date = device.gateway_rental?.items?.[0]?.end_date ? device.gateway_rental.items[0].end_date : "-";
							const access_end_date = device.gateway_rental?.items?.[0]?.access_end_date ? device.gateway_rental.items[0].access_end_date : "-";
							
							let fw_status = "-";
							if (fwStatus.size > 0) {
								fw_status = fwStatus.get(device.device_id);
								if (fw_status) {
									if (fw_status.includes(".com"))
										fw_status = "Presigned URL sent to shadow"
									else if (parseInt(fw_status))
										fw_status = fw_status + " %";
								}
							}
							else
								fw_status = "Reading Shadow State"
							//console.log("fwStatus", fwStatus);
								
							let customer_name = "-";
							if (device.customer_id && customerNames.has(device.customer_id))
								customer_name = customerNames.get(device.customer_id);
						
							const items = [
								device.model,
								device.serial_number,
								device.communication_status,
								createdAt, /* start date */
								end_date, /* end date */
								access_end_date, /* end access */
								customer_name,
								device.site_location,
								device.room_location,
								device.circuit,
								device.hw_ver || "N/A",
								device.fw_ver || "N/A", // fallback for fw_ver
								fw_status  /* fw status */
							]
						
							return(
								<TableRow hover key={i}>
									<TableCell key={i}>
										{ renderCheckbox(device.device_id) }
									</TableCell>
									{ renderTableCells(items) }
								</TableRow>
							);
						})
					}
				</TableBody>
			);
		}
		
		function renderTableCells(myArray) {
			return (
				<>
					{
						myArray.map((item, i) => {
							return (
								<TableCell key={i}>{ item ? item : '-' }</TableCell>
							)
						})
					}
				</>
			)
		}
		
		if (devices) {
			if (devices.length > 0) {
				return (
					<Box sx={{ mt:0.5, position: 'relative'}}>
						<TableContainer sx={{ maxHeight: 850 }}>
							<Table stickyHeader sx={{ minWidth: 700}}>
								{ renderTableHeader() }
								{ renderTableBody() }
							</Table>
						</TableContainer>
					</Box>
				);
			}
			else {
				return (
					<Box sx={{mt: 3, ml: 5}} >
						<Typography variant="h6">No available devices found.</Typography>
					</Box>
				);
			}
		}
		else {
			return (
				<Box display="flex" alignItems="center" sx={{mt: 3, ml: 5}} >
					<Typography variant="h6">Loading devices, please wait.</Typography>
					<CircularProgress sx={{ml: 1}} size="1.75rem"/>
				</Box>
			);
		}
	}
	
	return (
    <>
      <Seo title="Dashboard: Firmware Upgrade" />
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