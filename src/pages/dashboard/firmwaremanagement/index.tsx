import type { NextPage } from 'next';
import { styled } from '@mui/material/styles';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as DashboardLayout } from 'src/layouts/dashboard';
import * as React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';

import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { FileUploader } from "react-drag-drop-files";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useEffect, useState } from 'react';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	GetObjectTaggingCommand,
	PutObjectTaggingCommand,
	S3Client
} from "@aws-sdk/client-s3";

import { API } from 'aws-amplify';

const Page: NextPage = () => {
  usePageView();
	
	const S3Config = {
		bucket: "ps-gateway-firmware",
	};
	const S3 = new S3Client(S3Config);
	
	const [modelSearch, setModelSearch] = useState("");
	const [firmwareSearch, setFirmwareSearch] = useState("");
	const [dateSearch, setDateSearch] = useState("");
	
	const [s3Files, setS3Files] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [deleteDialog, setDeleteDialog] = useState(false);
	
	const [uploadDialog, setUploadDialog] = useState(false);
	const [showUploadFirmware, setShowUploadFirmware] = useState(false);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [uploadModel, setUploadModel] = useState("");
	const [uploadFwVer, setUploadFwVer] = useState("");
	const [uploadNotes, setUploadNotes] = useState("");
	
	const [showEdit, setShowEdit] = useState(false);
	const [editModel, setEditModel] = useState("");
	const [editFirmware, setEditFirmware] = useState("");
	const [editNotes, setEditNotes] = useState("");
	
	async function getFiles() {
		const command = new ListObjectsV2Command({
			Bucket: S3Config.bucket,
			// The default and maximum number of keys returned is 1000
			MaxKeys: 1000,
		});

		try {
			let isTruncated = true;
			let contentList = [];

			while (isTruncated) {
				const { Contents, IsTruncated, NextContinuationToken } =
					await S3.send(command);
				contentList.push(Contents);
				isTruncated = IsTruncated;
				command.input.ContinuationToken = NextContinuationToken;
			}
			
			//const response = await API.get('powersightrestapi', `/getFirmwareFileNames`);
			
			console.log(contentList[0]);
			//console.log(response.files);
			
			const taggedFiles = contentList[0];
			if (taggedFiles) {
				for (let i=0; i<taggedFiles.length; i++) {
					const input = {
						Bucket: S3Config.bucket,
						Key: taggedFiles[i].Key
					};
					const tagCommand = new GetObjectTaggingCommand(input);
					const tagResponse = await S3.send(tagCommand);
					for (let j=0; j<tagResponse.TagSet.length; j++)
						taggedFiles[i][tagResponse.TagSet[j].Key] = tagResponse.TagSet[j].Value;
				}
			}
			
			setS3Files(taggedFiles);
			
		} catch (err) {
			console.error(err);
		}
	};
	
	useEffect(() => {

		getFiles();
		const checkFiles = (setInterval(getFiles, 5000));
		return () => clearInterval(checkFiles);
		
	}, []);
	
	function formatBytes(bytes, decimals = 1) { // from https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
		if (!+bytes) return '0 KB'

		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

		const i = 1;//Math.floor(Math.log(bytes) / Math.log(k))

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
	}
	
	function renderMain() {
		try {
			if (showUploadFirmware) {
				return (
					<>
						{ renderUploadFirmware() }
					</>
				);
			}
			else if (showEdit) {
				return (
					<>
						{ renderEdit() }
					</>
				);
			}
			else {
				return (
					<>
						{ renderFirmwareCard() }
					</>
				);
			}
		}
		catch(e) {
			console.log("Error rendering main.", e);
		}
	}
	
	function renderEdit() {
		function renderEditHeader() {
			return (
				<>
					<Button
					sx={{pb: 2.5, height: "2rem", width: "10rem", whiteSpace:"nowrap"}}
					component="label"
					variant="text"
					tabIndex={-1}
					startIcon={<ArrowBackIcon />}
					onClick={() => {setShowEdit(false)}}
					>
						Firmware Management
					</Button>
					<Typography variant="h5">Editing: {selectedFile}</Typography>
				</>
			);
		}
		
		function renderEditModel() {
			const myModels = ["GS2000", "PS5000", "PS4550", "PS3550" ];
			return (
				<Box sx={{mt: 3, maxWidth: "7rem"}} size="small">
					<FormControl size="small" fullWidth>
						<InputLabel id="simple-select-label">Model</InputLabel>
						<Select
							labelId="simple-select-label"
							id="simple-select"
							value={editModel}
							label="Model"
							autoWidth
							onChange={ (e: SelectChangeEvent) => {setEditModel(e.target.value)} }
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
		
		const editTags = async () => {
			if (editNotes) { // no special chars in tag
				if(editNotes.match(/[!%<>\\$'"]/)) {
					alert("Please make sure your note does not include any of the following characters: !%<>$'\"");
					return;
				}
			}
			
			if (editModel && editFirmware) {
				const input = {
					Bucket: S3Config.bucket,
					Key: selectedFile
				};
				
				const getTagCommand = new GetObjectTaggingCommand(input);
				const getTagResponse = await S3.send(getTagCommand);
				const tagSet = getTagResponse.TagSet
				
				const foundTags = []
				for (let i=0; i<tagSet.length; i++) {
					if (tagSet[i].Key == "model")
						tagSet[i].Value = editModel;
					else if (tagSet[i].Key == "fw_ver")
						tagSet[i].Value = editFirmware;
					else if (editNotes && tagSet[i].Key == "notes") // dont edit note if empty
						tagSet[i].Value = editNotes;
					foundTags.push(tagSet[i].Key);
				}
				
				// if tag hasn't been created yet, we need to add the tag
				if (!foundTags.includes("model"))
					tagSet.push({'Key':'model', 'Value':editModel});
				if (!foundTags.includes("fw_ver"))
					tagSet.push({'Key':'fw_ver', 'Value':editFirmware});
				if (editNotes && !foundTags.includes("notes"))
					tagSet.push({'Key':'notes', 'Value':editNotes});
				
				input.Tagging = {TagSet:""};
				input.Tagging.TagSet = tagSet;
				console.log(input);
				const putTagCommand = new PutObjectTaggingCommand(input);
				const putTagResponse = await S3.send(putTagCommand);
				
				setEditModel('');
				setEditFirmware('');
				setEditNotes('');
				setShowEdit(false);
				getFiles();
			}
			else
				alert("Please make sure 'Model' and 'FW Ver.' are filled in.");
		}

		return (
			<Card sx={{maxWidth: "60rem"}}>
				<Box display="flex" flexDirection="column" sx={{m:2}}>
					{ renderEditHeader() }
					{ renderEditModel() }
					<TextField
						sx={{mt: 1, maxWidth: "7rem"}}
						label=<Typography variant="caption">FW Ver.</Typography>
						variant="outlined"
						size="small"
						onChange={(event) => setEditFirmware(event.target.value)}
						value={editFirmware}
						InputProps=
						{{
							endAdornment:
								<InputAdornment position="end">
									<IconButton
										aria-label="clear"
										onClick={() => setUploadFwVer("")}
										edge="end"
										sx = {{py: 0, px: 0.5}}
									>
										{ <ClearIcon sx={{fontSize: 16}} /> }
									</IconButton>
								</InputAdornment>
						}}
					/>
					<TextField
						sx={{mt: 3, maxWidth: "14rem"}}
						label=<Typography variant="caption">Notes (250 char.)</Typography>
						variant="outlined"
						size="small"
						onChange={(event) => setEditNotes(event.target.value)}
						value={editNotes}
						multiline
						rows={4}
						inputProps={{ maxLength: 250 }}
					/>
					<Button
						sx={{mt:3, p: 2.5, height: "2rem", width: "10rem", lineHeight:1, textAlign:"center"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={editTags}
					>
						Confirm Changes
					</Button>
					<Button
						sx={{mt:1, p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick=
						{
							() => {
								setEditModel('');
								setEditFirmware('');
								setEditNotes('');
								setShowEdit(false);
							}
						}
					>
						Cancel
					</Button>
				</Box>
			</Card>
		);
	}
	
	function renderUploadFirmware() {
		function renderUploadFirmwareHeader() {
			return (
				<>
					<Button
					sx={{pb: 2.5, height: "2rem", width: "10rem", whiteSpace:"nowrap"}}
					component="label"
					variant="text"
					tabIndex={-1}
					startIcon={<ArrowBackIcon />}
					onClick={() => {setShowUploadFirmware(false)}}
					>
						Firmware Management
					</Button>
					<Typography variant="h5">Uploading: {uploadedFile.name}</Typography>
				</>
			);
		}
		
		function renderSelectModel() {
			const myModels = ["GS2000", "PS5000", "PS4550", "PS3550" ];
			return (
				<Box sx={{mt: 3, maxWidth: "7rem"}} size="small">
					<FormControl size="small" fullWidth>
						<InputLabel id="simple-select-label">Model</InputLabel>
						<Select
							labelId="simple-select-label"
							id="simple-select"
							value={uploadModel}
							label="Model"
							autoWidth
							onChange={ (e: SelectChangeEvent) => {setUploadModel(e.target.value)} }
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
		
		const uploadFirmware = async () => {
			if (uploadModel && uploadFwVer) {
				const params = {
				Bucket: S3Config.bucket, 
				Key: uploadedFile.name, 
				Body: uploadedFile,
				Tagging: `model=${uploadModel}&fw_ver=${uploadFwVer}&notes=${uploadNotes}`,
				};
			
				try {
					const command = new PutObjectCommand(params);
					const data = await S3.send(command);
					console.log('File uploaded successfully:', data);
					setShowUploadFirmware(false);
				} catch (err) {
					console.error('Error uploading the file:', err);
				}
			}
			else
				alert("Please make sure 'Model' and 'FW Ver.' are filled in.");
		}

		return (
			<Card sx={{maxWidth: "60rem"}}>
				<Box display="flex" flexDirection="column" sx={{m:2}}>
					{ renderUploadFirmwareHeader() }
					{ renderSelectModel() }
					<TextField
						sx={{mt: 1, maxWidth: "7rem"}}
						label=<Typography variant="caption">FW Ver.</Typography>
						variant="outlined"
						size="small"
						onChange={(event) => setUploadFwVer(event.target.value)}
						value={uploadFwVer}
						InputProps=
						{{
							endAdornment:
								<InputAdornment position="end">
									<IconButton
										aria-label="clear"
										onClick={() => setUploadFwVer("")}
										edge="end"
										sx = {{py: 0, px: 0.5}}
									>
										{ <ClearIcon sx={{fontSize: 16}} /> }
									</IconButton>
								</InputAdornment>
						}}
					/>
					<Typography sx={{mt: 2}} variant="h6">Compile Date: {new Date(uploadedFile.lastModified).toLocaleString()}</Typography>
					<Typography sx={{mt: 1}} variant="h6">Size: {formatBytes(uploadedFile.size)}</Typography>
					<TextField
						sx={{mt: 3, maxWidth: "14rem"}}
						label=<Typography variant="caption">Notes (250 char.)</Typography>
						variant="outlined"
						size="small"
						onChange={(event) => setUploadNotes(event.target.value)}
						value={uploadNotes}
						multiline
						rows={4}
						inputProps={{ maxLength: 250 }}
					/>
					<Button
						sx={{mt:3, p: 2.5, height: "2rem", width: "10rem", lineHeight:1, textAlign:"center"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={uploadFirmware}
					>
						Confirm New Firmware
					</Button>
					<Button
						sx={{mt:1, p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={() => setShowUploadFirmware(false)}
					>
						Cancel
					</Button>
				</Box>
			</Card>
		);
	}
	
	function renderFirmwareCard() {
		function renderButtons() {
			function renderUploadButton() {
				const Transition = React.forwardRef(function Transition(
					props: TransitionProps & {
						children: React.ReactElement<any>;
					},
					ref: React.Ref<unknown>,
					) {
					return <Slide direction="up" ref={ref} {...props} />;
				});
				
				const handleFileUpload = (myFile) => {
					if (myFile) {
						setUploadedFile(myFile);
						setUploadDialog(false);
						setShowUploadFirmware(true);
					}
					else
						alert("Invalid file!");
				};
				
				const fileTypes = ["UPD", "s19"]; // , "PNG", "GIF", "PDF", "DOCX", "XLSX", "MP4", "MP3", "ZIP", "TXT", "CSV", "HTML", "SVG", "BMP", "TIFF"
			
				return (
					<>
						<Button
							sx={{p: 2.5, height: "2rem", width: "10rem"}}
							component="label"
							variant="contained"
							tabIndex={-1}
							onClick={() => {setUploadDialog(true)}}
						>
							Upload Firmware
						</Button>
						<Dialog
							fullScreen
							open={uploadDialog}
							onClose={() => {setUploadDialog(false)}}
						>
							<AppBar sx={{ position: 'relative' }}>
								<Toolbar>
								<IconButton
									edge="start"
									color="inherit"
									onClick={() => {setUploadDialog(false)}}
									aria-label="close"
								>
									<CloseIcon />
								</IconButton>
								<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
									Upload Firmware
								</Typography>
								<Button autoFocus sx={{backgroundColor:'#e11823',color:'#fff'}} onClick={() => {setUploadDialog(false)}}>
									Exit
								</Button>
								</Toolbar>
							</AppBar>
							<Box sx={{p:3}} className="cu_fi_up">
								<FileUploader handleChange={handleFileUpload} name="file" types={fileTypes} multiple={false}/>			
							</Box>
						</Dialog>
					</>
				);
			}
		
			function renderDeleteButton() {
				const deleteFile = async () => {
					if (selectedFile) {
						const command = new DeleteObjectCommand({
							Bucket: S3Config.bucket,
							Key: selectedFile,
						});
						const response = await S3.send(command);
					}
					else {
						alert('Please select a file to delete.');
					}
					setDeleteDialog(false);
				}
				
				return (
					<>
						<Button
						sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem"}}
						component="label"
						variant="contained"
						tabIndex={-1}
						onClick={() => {setDeleteDialog(true)}}
						>
							Delete
						</Button>
						<Dialog
							open={deleteDialog}
							onClose={() => {setDeleteDialog(false)}}
							aria-labelledby="alert-dialog-delete-firmware"
							aria-describedby="alert-dialog-delete-firmware"
						>
							<DialogTitle id="alert-dialog-title">
								Deleting {selectedFile}.
							</DialogTitle>
							<DialogContent>
								<DialogContentText id="alert-dialog-description">
									This will permanently remove this firmware from the repository.  Are you sure you want to do this?
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button onClick={()=> {setDeleteDialog(false)}}>Disagree</Button>
								<Button onClick={deleteFile} autoFocus>
									Agree
								</Button>
							</DialogActions>
						</Dialog>
					</>
				);
			}
		
			return(
				<Box display="flex" flexDirection="row" justifyContent="left">
					{ renderUploadButton() }
					<Button
					sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem", whiteSpace:"nowrap"}}
					variant="contained"
					tabIndex={-1}
					href="/dashboard/firmwareupgrade"
					>
						Firmware Upgrade
					</Button>
					<Button
					sx={{ml: 0.25, p: 2.5, height: "2rem", width: "10rem"}}
					component="label"
					variant="contained"
					tabIndex={-1}
					onClick={()=>{setShowEdit(true)}}
					>
						Edit
					</Button>
					{ renderDeleteButton() }
				</Box>
			);
		}
		
		return (
			<>
				<Typography variant="h5">Firmware Management</Typography>
				<Box sx={{mt:3, mx: 2}}>
					{ selectedFile && <Typography variant="h6">Managing: {selectedFile}</Typography> }
					<Box sx={{mt:2.5}} >
						{ renderButtons() }
						{ renderMenu() }
					</Box>
				</Box>
			</>
		);
	}
	
	function renderMenu() {
		
		function renderSearch() {
			const functions = [
				setModelSearch,
				setFirmwareSearch,
			];
			const labels = [
				"Model",
				"FW Ver.",
			];
			const values = [
				modelSearch,
				firmwareSearch,
			];
	
			return (
				<>
					{
						functions.map((myFunction, i) => {
							return(
								<Grid sx={{width: "8rem"}} size={2.4} key={i}>
									<TextField
										sx={{mr: 0.5, maxWidth: "8rem"}}
										label=<Typography variant="caption">{labels[i]}</Typography>
										variant="outlined"
										size="medium"
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
							)
						})
					}
					<Grid sx={{width: "16rem"}} size={5.8}>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<Box components={['DatePicker']} sx={{maxWidth: "10rem"}}>
								<DatePicker label="Date >=" onChange={(val) => setDateSearch(val)}/>
							</Box>
						</LocalizationProvider>
					</Grid>
					<Grid textAlign="left" sx={{width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
					</Grid>
				</>
			)
		}
		
		function searchFiles() {
			const searchResults = [];
			
			let myDate = new Date(dateSearch).toLocaleDateString();
			if (myDate == 'Invalid Date')
				myDate = '';
			
			const a = [modelSearch.toLowerCase(), firmwareSearch.toLowerCase(), myDate];
			if (s3Files) {
				for (let i=0; i<s3Files.length; i++) {
					const b = [s3Files[i].Key, "", s3Files[i].LastModified.toLocaleDateString()];
					let match = true;
						for (let j=0; j<a.length; j++) {
							if ((a[j] && !b[j]) || (b[j] && !(b[j].toLowerCase().includes(a[j])))) {
								match = false;
								break;
							}
						}
					if (match) 
						searchResults.push(s3Files[i]);
				}
			}
			
			return searchResults;
		}
		
		
		function renderMenu(myFiles) {
			function renderMenuHeader() {
				const myLabels = [
					"Model",
					"FW Ver.",
					"Date",
					"Size",
					"Notes",
				];
				
				return (
					<>
						{
							myLabels.map((label, i) => {

								const width = label === "Notes" ? "32rem" : "8rem"; // Make "Notes" field twice as wide

								return (
									<Grid textAlign="left" sx={{width, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4} key={i}>
										<Typography variant='h6'>{label}</Typography>
									</Grid>
								);
							})
						}
					</>
				)
			}
			
			const handleChange = (event: React.MouseEvent<HTMLElement>, next) => {
				if (next)
					setSelectedFile(next);
			}
		
			if (myFiles && myFiles.length > 0) {
				if (selectedFile == null) { // initial selection
					setSelectedFile(myFiles[0].Key);
				}
				else {
					return (
						<>
							{ renderMenuHeader() }
							<ToggleButtonGroup
								color="primary"
								exclusive
								aria-label="File"
								orientation="vertical"
								onChange={handleChange}
								value={selectedFile}
							>
								{
									myFiles.map((file, i) => {
										return (
											<ToggleButton key={i} sx={{height:"2.15rem", lineHeight:1, whiteSpace:"nowrap", p:0}} value={file.Key}>
												<Grid textAlign="left" sx={{width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
													{file["model"] || "-"}
												</Grid>
												<Grid textAlign="left" sx={{width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
													{file["fw_ver"] || "-"}
												</Grid>
												<Grid textAlign="left" sx={{width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
													{file["LastModified"].toLocaleDateString() || "-"}
												</Grid>
												<Grid textAlign="left" sx={{width: "8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
													{ file["Size"] ? formatBytes(file["Size"]) : "-" }
												</Grid>
												<Grid textAlign="left" sx={{width: "64rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={2.4}>
													{file["notes"] || "-"}
												</Grid>
											</ToggleButton>
										);
									})
								}
							</ToggleButtonGroup>
						</>
					);
				}
			}
			else {
				return (
					<Typography variant="h6">No matches found.</Typography>
				)
			}
		}
		
		if (s3Files == null) {
			return(
				<>
					<Typography sx={{mt:2, ml: 2}} variant="h6">Please wait, loading files.</Typography>
					<LinearProgress sx={{my: 2}}/>
				</>
			)
		}
		else if (s3Files && s3Files.length > 0) {
			return (
				<Grid container spacing={3} maxWidth="80rem" sx={{mt: 2, overflow: "hidden", overflowY: "auto", overflowX: "auto", maxHeight: "14rem"}}>
				<Grid item xs={12}>
					<Grid container direction="row" spacing={2}>
						{ renderSearch() }
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Grid container direction="row" spacing={2}>
					{ renderMenu(searchFiles()) }
					</Grid>
				</Grid>
				</Grid>
			);
		}
		else {
			return(
				<Typography sx={{mt:2, ml: 2}} variant="h6">No files found.</Typography>
			)
		}
	}
	
	return (
    <>
      <Seo title="Dashboard: Firmware Management" />
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