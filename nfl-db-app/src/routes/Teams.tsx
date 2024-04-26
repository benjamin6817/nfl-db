import { useState, useEffect } from 'react';
import { getTeamsOrderedByDiv, getTeamsByConference, getTeamsByDivision } from '../common/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

const allConferences = 'ALL';
const conferences = [allConferences, 'AFC', 'NFC'];
const allDivisions = 'ALL';
const divisions = [allDivisions, 'NORTH', 'SOUTH', 'EAST', 'WEST'];

export default function Teams() {
  const [loading, setLoading] = useState(true);
  const [conference, setConference] = useState(allConferences);
  const [division, setDivision] = useState(allDivisions);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      let response: any;
      if (conference === allConferences && division === allDivisions) {
        response = await getTeamsOrderedByDiv();
      } else if (conference !== allConferences && division === allDivisions) {
        response = await getTeamsByConference({ conference });
      } else if (conference !== allConferences && division !== allDivisions) {
        response = await getTeamsByDivision({ conference, division });
      }
      setRows(response.data);
      setLoading(false);
    }
    fetchTeams();
  }, [conference, division]);

  const columns: GridColDef<never>[] = [
    { field: 'TeamLocation', headerName: 'Location' },
    { field: 'Nickname', headerName: 'Nickname' },
    { field: 'Conference', headerName: 'Conference' },
    { field: 'Division', headerName: 'Division' },
  ];

  const handleConferenceChange = (event: any) => {
    setConference(event.target.value);
    if (event.target.value === allConferences) {
      setDivision(allDivisions);
    }
  }

  const handleDivisionChange = (event: any) => {
    setDivision(event.target.value);
  }

  return (
    <Box sx={{ height: 700, width: '100%', mt: 2 }}>
      <Typography variant="h2" sx={{mb: 1}}>
        Teams
      </Typography>
      <FormControl sx={{ mr: 2, width: 250 }}>
        <InputLabel id="conference-select-label">Conference</InputLabel>
        <Select
          labelId="conference-select-label"
          id="conference-select"
          value={conference}
          label="Conference"
          onChange={handleConferenceChange}
        >
          {conferences.map((conference) => (
            <MenuItem key={conference} value={conference}>{conference}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: 250 }}>
        <InputLabel id="division-select-label">Division</InputLabel>
        <Select
          labelId="division-select-label"
          id="division-select"
          value={division}
          label="Division"
          onChange={handleDivisionChange}
          disabled={conference === allConferences}
        >
          {divisions.map((division) => (
            <MenuItem key={division} value={division}>{division}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <DataGrid
        sx={{ mt: 2 }}
        loading={loading}
        rows={rows}
        columns={columns}
        getRowId={({ TeamId }) => TeamId}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 50, 100]}
      />
    </Box>
  );
}
