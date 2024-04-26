import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBEoyoq82gzQI84m8MRw1vGK-ISrBQhqec",
  authDomain: "nfl-db-83d98.firebaseapp.com",
  projectId: "nfl-db-83d98",
  storageBucket: "nfl-db-83d98.appspot.com",
  messagingSenderId: "1078500304271",
  appId: "1:1078500304271:web:ace1ba56674340cd7917fa"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
export const addGame = httpsCallable(functions, 'addGame');
export const addPlayer = httpsCallable(functions, 'addPlayer');
export const deletePlayers = httpsCallable(functions, 'deletePlayers');
export const deleteGames = httpsCallable(functions, 'deleteGames');
export const getTeams = httpsCallable(functions, 'getTeams');
export const getTeamsOrderedByDiv = httpsCallable(functions, 'getTeamsOrderedByDiv');
export const getTeamsByConference = httpsCallable(functions, 'getTeamsByConference');
export const getTeamsByDivision = httpsCallable(functions, 'getTeamsByDivision');
export const getPositions = httpsCallable(functions, 'getPositions');
export const getPlayers = httpsCallable(functions, 'getPlayers');
export const getPlayersOnTeam = httpsCallable(functions, 'getPlayersOnTeam');
export const getPlayersByPos = httpsCallable(functions, 'getPlayersByPos');
export const getPlayersByTeamAndPos = httpsCallable(functions, 'getPlayersByTeamAndPos');
export const getGames = httpsCallable(functions, 'getGames');
export const getGamesByTeam = httpsCallable(functions, 'getGamesByTeam');
export const getGamesByDate = httpsCallable(functions, 'getGamesByDate');
export const getGamesByTeamAndDate = httpsCallable(functions, 'getGamesByTeamAndDate');
