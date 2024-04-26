import { useState, useEffect } from 'react';
import { getTeams, getPositions, getPlayers, getPlayersOnTeam, getPlayersByPos, getPlayersByTeamAndPos, addPlayer, deletePlayers } from '../common/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const allTeams = { TeamId: 0, TeamLocation: 'All', Nickname: '', Conference: '', Division: '' }
const allPositions = { Position: 'All' };

function TeamSelect({ team, teams, handleTeamChange }: any) {
  return (
    <FormControl fullWidth>
      <InputLabel id="team-select-label">Team</InputLabel>
      <Select
        labelId="team-select-label"
        id="team-select"
        value={team}
        label="Team"
        name="team"
        onChange={handleTeamChange}
      >
        {teams.map(({ TeamId, TeamLocation, Nickname }: any) => (
          <MenuItem key={TeamId} value={TeamId}>{TeamLocation} {Nickname}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function PositionSelect({ position, positions, handlePositionChange }: any) {
  return (
    <FormControl fullWidth>
      <InputLabel id="position-select-label">Position</InputLabel>
      <Select
        labelId="position-select-label"
        id="position-select"
        value={position}
        label="Position"
        name="position"
        onChange={handlePositionChange}
      >
        {positions.map(({ Position }: any) => (
          <MenuItem key={Position} value={Position}>{Position}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function Players() {
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [team, setTeam] = useState(allTeams.TeamId);
  const [position, setPosition] = useState(allPositions.Position);
  const [teams, setTeams] = useState([allTeams]);
  const [positions, setPositions] = useState([allPositions]);
  const [rows, setRows] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const response: any = await getTeams();
      setTeams([allTeams, ...response.data]);
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    async function fetchPositions() {
      const response: any = await getPositions();
      setPositions([allPositions, ...response.data]);
    }
    fetchPositions();
  }, []);

  async function fetchPlayers() {
    setLoading(true);
    let response: any;
    if (team === allTeams.TeamId && position === allPositions.Position) {
      response = await getPlayers();
    } else if (team !== allTeams.TeamId && position === allPositions.Position) {
      response = await getPlayersOnTeam({ teamId: team });
    } else if (team === allTeams.TeamId && position !== allPositions.Position) {
      response = await getPlayersByPos({ position });
    } else {
      response = await getPlayersByTeamAndPos({ teamId: team, position });
    }
    setRows(response.data);
    setLoading(false);
  }
  useEffect(() => {
    fetchPlayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, position]);

  const getTeamName = (teamId: number) => {
    const team = teams[teamId];
    if (team == null) {
      return '';
    }
    return team.TeamLocation + " " + team.Nickname;
  };

  const columns: GridColDef<never>[] = [
    { field: 'PlayerId', headerName: 'Player ID', width: 100 },
    { field: 'Position', headerName: 'Position', width: 100 },
    { field: 'TeamId', headerName: 'Team', width: 250, valueGetter: (teamId) => getTeamName(teamId) },
    { field: 'PlayerName', headerName: 'Name', width: 250 },
  ];

  const handleTeamChange = (event: any) => {
    const val = parseInt(event.target.value);
    setTeam(val);
  }

  const handlePositionChange = (event: any) => {
    setPosition(event.target.value);
  }

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  }

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  }

  const handleAddDialogSubmit = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const name = formJson.name;
    const team = formJson.team;
    const position = formJson.position;
    addPlayer({ playerName: name, teamId: team, position }).then(() => {
      fetchPlayers();
    });
    handleAddDialogClose();
  }

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  }

  const handleDeleteDialogSubmit = (event: any) => {
    event.preventDefault();
    const playerIds = selectedPlayers.map((player: any) => player.PlayerId);
    deletePlayers({ playerIds }).then(() => {
      fetchPlayers();
    });
    handleDeleteDialogClose();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectionChange = (rowIds: any, _: any) => {
    const players = rows.filter((row: any) => rowIds.includes(row.PlayerId));
    setSelectedPlayers(players);
  };

  return (
    <Box sx={{ height: 700, width: '100%', mt: 2 }}>
      <Typography variant="h2" sx={{mb: 1}}>
        Players
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TeamSelect team={team} teams={teams} handleTeamChange={handleTeamChange} />
        </Grid>
        <Grid item xs={3}>
          <PositionSelect position={position} positions={positions} handlePositionChange={handlePositionChange} />
        </Grid>
        <Grid item xs={6}>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="stretch"
            gap={2}
            sx={{ height: '100%' }}
          >
            <Button
              variant="contained"
              size="large"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={selectedPlayers.length === 0}
              onClick={handleDeleteDialogOpen}
            >
              Delete Selected Players
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddDialogOpen}
            >
              Add Player
            </Button>
          </Box>
        </Grid>
      </Grid>
      <DataGrid
        sx={{ mt: 2 }}
        loading={loading}
        rows={rows}
        columns={columns}
        getRowId={({ PlayerId }) => PlayerId}
        onRowSelectionModelChange={handleSelectionChange}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          columns: {
            columnVisibilityModel: {
              PlayerId: false,
            },
          },
        }}
        pageSizeOptions={[10, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
      />
      <Dialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleAddDialogSubmit,
        }}
      >
        <DialogTitle>Add Player</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a player, please enter their name, position, and select their team
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                id="player-name-textfield"
                name="name"
                label="Name"
                fullWidth
              />
            </Grid>
            <Grid item xs={9}>
              <TeamSelect teams={teams.slice(1)} />
            </Grid>
            <Grid item xs={3}>
              <PositionSelect positions={positions.slice(1)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button type="submit">Add Player</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleDeleteDialogSubmit,
        }}
      >
        <DialogTitle>Delete Players</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the following players?
          </DialogContentText>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table aria-label="table of players pending deletion">
              <TableHead>
                <TableRow>
                  <TableCell>Player ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Team</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPlayers.map((player: any) => (
                  <TableRow key={player.PlayerId}>
                    <TableCell>{player.PlayerId}</TableCell>
                    <TableCell>{player.PlayerName}</TableCell>
                    <TableCell>{player.Position}</TableCell>
                    <TableCell>{getTeamName(player.TeamId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button type="submit" color="error">Delete Players</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
