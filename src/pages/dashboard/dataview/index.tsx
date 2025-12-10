import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { customersApi } from 'src/api/customers';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import { DataViewTable } from 'src/sections/dashboard/dataview/dataview-table';


/*** MY CODE ***/
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Unstable_Grid2';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import { API, Auth } from 'aws-amplify';

import * as queries from '../../../graphql/queries';

const Page: NextPage = () => {
  usePageView();

	/*** MY CODE ***/
	const [readings, setReadings] = useState(null);
	const [error, setError] = useState(null);
  const [analyzers, setAnalyzers] = useState(null);
	const [modelSearch, setModelSearch] = useState("");
	const [serialSearch, setSerialSearch] = useState("");
	const [customerSearch, setCustomerSearch] = useState("");
	const [siteSearch, setSiteSearch] = useState("");
	const [roomSearch, setRoomSearch] = useState("");
	const [circuitSearch, setCircuitSearch] = useState("");
  const [measurements, setMeasurements] = useState({"V":true, "I":true, "W":true, "THDv":true, "THDi":true, "TPF":true, "VA":true, "Hz":true});
	const [phases, setPhases] = useState({"1":true, "2":true, "3":true, "n/t":true});
	const [selectedAnalyzer, setSelectedAnalyzer] = useState(null);
	const [refreshingAnalyzers, setRefreshingAnalyzers] = useState(false);
	const [pause, setPause] = useState(false);
	const [dataInterval, setDataInterval] = useState(0);
	const [user, setUser] = useState(null);
	const [customerNames, setCustomerNames] = useState(null);
	
	useEffect(() => {
		getAnalyzers();
	}, []);
	
	useEffect(() => {
		if (analyzers && selectedAnalyzer == null) { // only trigger when we haven't selected an analyzer yet
			if (analyzers.length > 0)
				setSelectedAnalyzer(analyzers[0].ps_analyzer_id);
		}
	}, [analyzers]);
	
	useEffect(() => {
		if (selectedAnalyzer) {
			getReadings();
			setDataInterval(setInterval(getReadings, 5000));
			return () => clearInterval(dataInterval);
		}
	}, [selectedAnalyzer]);
	
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
	
	async function getReadings() {
    try {
			const variables = {
				limit: 300,
				sortDirection: 'DESC',
				analyzer_id: selectedAnalyzer
			}

			const apiData = await API
			.graphql({
				query: queries.listReadingTests,
				variables
			});
			// console.log("apiData", apiData.data.listReadingTests.items);
			setReadings(apiData.data.listReadingTests.items);
    }
    catch(e) {
      console.log('Error on fetching data.', e);
			setReadings([]);
    }
  }

  const getAnalyzers = useCallback(async ()  => {
    // create map of [id, boolean] for selecting what analyzers to show, and store in state
    try {
      let next = null;
      let myData = [];
	  
			const currentuser = await Auth.currentAuthenticatedUser();
      const customerId  = currentuser.attributes['custom:customerId'];
			setUser(currentuser);

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
			
	  //console.log("GetAnalyzers(), myData", myData);
	  setAnalyzers(myData);
	  setRefreshingAnalyzers(false);
    }
    catch(e) {
		console.log('Error on making getAnalyzers.', e);
	}
  },[]);

	function renderMain() {
		try {
			return (
				<div>
					{ renderAnalyzerCard() }
				</div>
			);
		}
		catch(e) {
			console.log("Error rendering main.", e);
		}
	}
	
	function renderTable() {
		//console.log(readings);
		const togglePause = () => {
			//console.log("interval", dataInterval);
			if (pause) {
				getReadings();
				setDataInterval(setInterval(getReadings, 5000));
				//console.log("resumed");
			}
			else {
				clearInterval(dataInterval);
				//console.log("paused");
			}
			setPause(!pause);
		}
		
		if (readings == null) {
			return (
				<Box sx={{mt:2}}>
					<Typography variant="h5">Initializing, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</Box>
			);
		}
		else if (readings.length == 0) {
			return (
				<Box sx={{mt:2}}>
					<Typography variant="h5">No data found for this analyzer.</Typography>
					<Typography variant="h5">Data is updated every 5 seconds.</Typography>
				</Box>
			);
		}
		else {
			return (
				<Box sx={{mt:2, mb: 4}}>
					<Box sx={{mb: 2, display: "flex", flexDirection: "row" }}>
						<IconButton sx={{ mr:0.5 }} aria-label="pausePlay" size="large" onClick={togglePause}>
							{ pause ? <PlayArrowIcon/> : <PauseIcon/> }
						</IconButton>
						<p>Total readings: {readings.length}, {pause ? "streaming is paused." : "data is updated every 5 seconds."}</p>
					</Box>
					<Card>
						<DataViewTable
							readings={readings}
							measurements={measurements}
							phases={phases}
						/>
					</Card>
				</Box>
			);
		}
	}
	
	function renderAnalyzerCard() {
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
		else if (user && user.signInUserSession.accessToken.payload['cognito:groups'] == 'Admin' && customerNames == null) {
			return (
				<div>
					<Typography variant="h5">Getting customers, please wait . . .</Typography>
					<LinearProgress sx={{my: 2}}/>
				</div>
			);
		}
		else {
			return (
				<>
					<Box display="inline-block">
						<Accordion defaultExpanded>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel-content"
								id="panel-header"
							>
								<Typography variant="h5">Streaming data from {selectedAnalyzer}</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Box sx={{display: "flex", flexDirection: "row"}}>
									{ renderSelectTool() }
								</Box>
							</AccordionDetails>
						</Accordion>
					</Box>
					{ selectedAnalyzer != null && renderTable() }
				</>
			);
		}
	}
	
	function renderMenu(searchResults) {
		const group = user.signInUserSession.accessToken.payload['cognito:groups'];
		let sz = 2.4;
		let w = "42rem"
		if (group == "Admin" || group == "AdminMaster") {
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
					if (i!=2 || group == "Admin" || group == "AdminMaster") { // hide customer field when not admin
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
			const handleChange = (event: React.MouseEvent<HTMLElement>, nextAnalyzer: string) => {
				if (nextAnalyzer !== null) {
					clearInterval(dataInterval);
					setSelectedAnalyzer(nextAnalyzer);
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
								<ToggleButton key={i} sx={{height:"2.15rem", lineHeight:1, whiteSpace:"nowrap", p:0}} value={analyzer.ps_analyzer_id}>
									{
										myKeys.map((key, j) => {
											if (j!=2 || group == "Admin" || group == "AdminMaster") { // hide customer field when not admin
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
		const handleChangePhases = (event: React.ChangeEvent<HTMLInputElement>) => {
			//console.log(event.target.checked);
			//console.log(event.target.value);
			let myPhases = {...phases};
			myPhases[event.target.value] = !myPhases[event.target.value];
			setPhases(myPhases);
		};
		const handleChangeMeasurements = (event: React.ChangeEvent<HTMLInputElement>) => {
			let myMeasurements = {...measurements};
			myMeasurements[event.target.value] = !myMeasurements[event.target.value];
			setMeasurements(myMeasurements);
		};
		
		const phases1 = {"1":"Phase 1", "2":"Phase 2"};
		const phases2 = { "3":"Phase 3", "n/t":"Neutral / Total"};
		const core = {"V":"Voltage", "I":"Current", "W":"Power"};
		const extended1 = {"THDv":"THD V", "THDi":"THD I", "TPF":"TPF"};
		const extended2 = {"VA":"VA", "Hz":"Frequency"};
		
		return (
			<Box display="flex" flexDirection="row">
				<Box sx={{ display:"flex", flexDirection: "row", p: 1, border: 2, borderRadius: 1, borderColor: "neutral.300", color: "neutral.500", width: "fit-content" }}>
					{ renderCheckboxGroup(phases1, handleChangePhases) }
					{ renderCheckboxGroup(phases2, handleChangePhases) }
				</Box>
				<Box sx={{ml: 1, display:"flex", flexDirection: "row", p: 1, border: 2, borderRadius: 1, borderColor: "neutral.300", color: "neutral.500", width: "fit-content" }}>
					{ renderCheckboxGroup({"V":"Voltage", "I":"Current"}, handleChangeMeasurements) }
					{ renderCheckboxGroup({"W":"Power", "VA":"VA"}, handleChangeMeasurements) }
					{ renderCheckboxGroup({"TPF":"TPF", "Hz":"Frequency"}, handleChangeMeasurements) }
					{ renderCheckboxGroup({"THDv":"THD V", "THDi":"THD I"}, handleChangeMeasurements) }
				</Box>
			</Box>
		)
	}
	
	function renderCheckboxGroup(valueLabels, myFunction) {
		return (
			<div>
				<FormGroup>
					{
						Object.entries(valueLabels).map(([value, label], i) => {
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
									value={value}
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
	
	function renderSelectTool() {
		const searchResults = [];
		const a = [modelSearch.toLowerCase(), serialSearch.toLowerCase(), siteSearch.toLowerCase(), roomSearch.toLowerCase(), circuitSearch.toLowerCase(), customerSearch.toLowerCase()];
		for (let i=0; i<analyzers.length; i++) {
			const b = [analyzers[i].model, analyzers[i].serial_number, analyzers[i].site_location, analyzers[i].room_location, analyzers[i].circuit];
			if(customerNames)
				b.push(customerNames[i]);
			let match = true;
			for (let j=0; j<a.length; j++) {
				if ((a[j] && !b[j]) || (b[j] && !(b[j].toLowerCase().includes(a[j])))) {
					match = false;
					break;
				}
			}
			if (match) {
				if(customerNames)
					analyzers[i].customer_name = customerNames[i];
				searchResults.push(analyzers[i]);
			}
		}
		return (
			<Box>
				{ renderCheckboxes() }
				{ renderMenu(searchResults) }
			</Box>
		);
	}
	
	/*** MY CODE ***/

  return (
    <>
      <Seo title="Dashboard: Live Measurements" />
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