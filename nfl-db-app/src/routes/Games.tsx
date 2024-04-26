import { useState, useEffect } from 'react';
import { getTeams, getGames, getGamesByTeam, getGamesByDate, getGamesByTeamAndDate, addGame, deleteGames } from '../common/api';
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
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const allTeams = { TeamId: 0, TeamLocation: 'All', Nickname: '', Conference: '', Division: '' }

function TeamSelect({ team, teams, handleTeamChange, id, labelId, label, name }: any) {
  id = id || "team-select";
  labelId = labelId || "team-select-label";
  label = label || "Team";
  name = name || "team";
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        value={team}
        label={label}
        name={name}
        onChange={handleTeamChange}
      >
        {teams.map(({ TeamId, TeamLocation, Nickname }: any) => (
          <MenuItem key={TeamId} value={TeamId}>{TeamLocation} {Nickname}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function DateSelect({ date, name, handleDateChange }: any) {
  return (
    <FormControl fullWidth>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          format="YYYY-MM-DD"
          label="Date"
          name={name}
          value={date}
          onChange={handleDateChange}
        />
      </LocalizationProvider>
    </FormControl>
  );
}

export default function Games() {
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [team, setTeam] = useState(allTeams.TeamId);
  const [date, setDate] = useState(null);
  const [teams, setTeams] = useState([allTeams]);
  const [rows, setRows] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const response: any = await getTeams();
      setTeams([allTeams, ...response.data]);
    }
    fetchTeams();
  }, []);

  async function fetchGames() {
    setLoading(true);
    let response: any;
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    if (team === allTeams.TeamId && date === null) {
      response = await getGames();
    } else if (team !== allTeams.TeamId && date === null) {
      response = await getGamesByTeam({ teamId: team });
    } else if (team === allTeams.TeamId && date !== null) {
      response = await getGamesByDate({ date: formattedDate });
    } else {
      response = await getGamesByTeamAndDate({ teamId: team, date: formattedDate });
    }
    setRows(response.data);
    setLoading(false);
  }
  useEffect(() => {
    fetchGames();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, date]);

  const columns: GridColDef<never>[] = [
    { field: 'GameId', headerName: 'Game ID', width: 100 },
    { field: 'GameDate', headerName: 'Game Date', width: 100 },
    { field: 'HomeTeamLocation', headerName: 'Home Team', width: 250, valueGetter: (_, row: any) => row.HomeTeamLocation + " " + row.HomeTeamNickname },
    { field: 'AwayTeamLocation', headerName: 'Away Team', width: 250, valueGetter: (_, row: any) => row.AwayTeamLocation + " " + row.AwayTeamNickname },
    { field: 'HomeTeamScore', headerName: 'Home Team Score', width: 150 },
    { field: 'AwayTeamScore', headerName: 'Away Team Score', width: 150 },
  ];

  const handleTeamChange = (event: any) => {
    const val = parseInt(event.target.value);
    setTeam(val);
  }

  const handleDateChange = (value: any) => {
    setDate(value);
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
    
    const date = formJson.date;
    const homeTeamId = formJson.homeTeam;
    const awayTeamId = formJson.awayTeam;
    const homeTeamScore = formJson.homeTeamScore;
    const awayTeamScore = formJson.awayTeamScore;

    addGame({ date, homeTeamId, awayTeamId, homeTeamScore, awayTeamScore }).then(() => {
      fetchGames();
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
    const gameIds = selectedGames.map((game: any) => game.GameId);
    deleteGames({ gameIds }).then(() => {
      fetchGames();
    });
    handleDeleteDialogClose();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectionChange = (rowIds: any, _: any) => {
    const games = rows.filter((row: any) => rowIds.includes(row.GameId));
    setSelectedGames(games);
  };

  return (
    <Box sx={{ height: 700, width: '100%', mt: 2 }}>
      <Typography variant="h2" sx={{mb: 1}}>
        Games
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TeamSelect team={team} teams={teams} handleTeamChange={handleTeamChange} />
        </Grid>
        <Grid item xs={3}>
          <DateSelect date={date} handleDateChange={handleDateChange} />
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
              disabled={selectedGames.length === 0}
              onClick={handleDeleteDialogOpen}
            >
              Delete Selected Games
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddDialogOpen}
            >
              Add Game
            </Button>
          </Box>
        </Grid>
      </Grid>
      <DataGrid
        sx={{ mt: 2 }}
        loading={loading}
        rows={rows}
        columns={columns}
        getRowId={({ GameId }) => GameId}
        onRowSelectionModelChange={handleSelectionChange}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          columns: {
            columnVisibilityModel: {
              GameId: false,
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
        <DialogTitle>Add Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a game, please enter the teams and their scores
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <DateSelect name="date" />
            </Grid>
            <Grid item xs={8}>
              <TeamSelect
                name="homeTeam"
                id="home-team-select"
                label="Home Team"
                labelId="home-team-select-label"
                teams={teams.slice(1)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="home-team-score-textfield"
                name="homeTeamScore"
                label="Home Team Score"
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TeamSelect
                name="awayTeam"
                id="away-team-select"
                label="Away Team"
                labelId="away-team-select-label"
                teams={teams.slice(1)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id="away-team-score-textfield"
                name="awayTeamScore"
                label="Away Team Score"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button type="submit">Add Game</Button>
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
        <DialogTitle>Delete Games</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the following games?
          </DialogContentText>
          <TableContainer component={Paper} sx={{ mt: 1 }}>
            <Table aria-label="table of games pending deletion">
              <TableHead>
                <TableRow>
                  <TableCell>Game ID</TableCell>
                  <TableCell>Game Date</TableCell>
                  <TableCell>Home Team</TableCell>
                  <TableCell>Away Team</TableCell>
                  <TableCell>Home Team Score</TableCell>
                  <TableCell>Away Team Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedGames.map((game: any) => (
                  <TableRow key={game.GameId}>
                    <TableCell>{game.GameId}</TableCell>
                    <TableCell>{game.GameDate}</TableCell>
                    <TableCell>{game.HomeTeamLocation} {game.HomeTeamNickname}</TableCell>
                    <TableCell>{game.AwayTeamLocation} {game.AwayTeamNickname}</TableCell>
                    <TableCell>{game.HomeTeamScore}</TableCell>
                    <TableCell>{game.AwayTeamScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button type="submit" color="error">Delete Games</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
