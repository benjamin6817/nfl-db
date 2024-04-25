/* eslint-disable require-jsdoc */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import mysql from "mysql2/promise";
import {Connector, IpAddressTypes} from "@google-cloud/cloud-sql-connector";

type MySqlResult = mysql.OkPacket | mysql.ResultSetHeader |
  mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket[];

async function executeSql(sql: string, params: any): Promise<MySqlResult> {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName: "nfl-db-83d98:us-central1:nfl-db-mysql-instance",
    ipType: IpAddressTypes.PUBLIC,
  });
  const pool = await mysql.createPool({
    ...clientOpts,
    user: "nfl-api",
    password: "1234",
    database: "NFL",
  });
  const conn = await pool.getConnection();

  const stmt = await conn.prepare(sql);
  const [result] = await stmt.execute(params);

  await pool.end();
  connector.close();

  return result;
}

function stringToDate(str: string): Date {
  const [yearStr, monthStr, dayStr] = str.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  return new Date(year, month - 1, day);
}

export const addGame = onCall(async (request) => {
  if (request.data.date == null) {
    throw new HttpsError("invalid-argument", "Must specify a game date.");
  }
  if (request.data.homeTeamId == null) {
    throw new HttpsError("invalid-argument", "Must specify a home team.");
  }
  if (request.data.awayTeamId == null) {
    throw new HttpsError("invalid-argument", "Must specify an away team.");
  }
  if (request.data.homeTeamScore == null) {
    throw new HttpsError("invalid-argument", "Must specify a home team score.");
  }
  if (request.data.awayTeamScore == null) {
    throw new HttpsError("invalid-argument",
      "Must specify an away team score.");
  }

  const date = stringToDate(request.data.date);
  const homeTeamId = request.data.homeTeamId;
  const awayTeamId = request.data.awayTeamId;
  const homeTeamScore = request.data.homeTeamScore;
  const awayTeamScore = request.data.awayTeamScore;

  return executeSql(`
    INSERT INTO Game
      (GameDate, HomeTeamId, AwayTeamId, HomeTeamScore, AwayTeamScore)
    VALUES (?, ?, ?, ?, ?)
  `, [date, homeTeamId, awayTeamId, homeTeamScore, awayTeamScore]);
});

export const addPlayer = onCall(async (request) => {
  if (request.data.teamId == null) {
    throw new HttpsError("invalid-argument", "Must specify a team ID.");
  }
  if (request.data.playerName == null) {
    throw new HttpsError("invalid-argument", "Must specify a player name.");
  }
  if (request.data.position == null) {
    throw new HttpsError("invalid-argument", "Must specify a player position.");
  }

  const teamId = request.data.teamId;
  const playerName = request.data.playerName;
  const position = request.data.position;

  return executeSql(
    "INSERT INTO Player (TeamId, PlayerName, Position) VALUES (?, ?, ?)",
    [teamId, playerName, position]
  );
});

export const getPlayersOnTeam = onCall(async (request) => {
  if (request.data.teamId == null) {
    throw new HttpsError("invalid-argument", "Must specify a team ID.");
  }

  const teamId = request.data.teamId;
  return executeSql("SELECT * FROM Player WHERE TeamId = ?", [teamId]);
});

export const getPlayersByTeamAndPos = onCall(async (request) => {
  if (request.data.teamId == null) {
    throw new HttpsError("invalid-argument", "Must specify a team ID.");
  }
  if (request.data.position == null) {
    throw new HttpsError("invalid-argument", "Must specify a position.");
  }

  const teamId = request.data.teamId;
  const position = request.data.position;
  return executeSql(
    "SELECT * FROM Player WHERE TeamId = ? AND Position = ?",
    [teamId, position]
  );
});

export const getGamesByTeam = onCall(async (request) => {
  if (request.data.teamId == null) {
    throw new HttpsError("invalid-argument", "Must specify a team ID.");
  }

  const teamId = request.data.teamId;
  return executeSql(`
    (
      SELECT
        Game.GameDate,
        HomeTeam.TeamLocation AS HomeTeamLocation,
        HomeTeam.Nickname AS HomeTeamNickname,
        AwayTeam.TeamLocation AS AwayTeamLocation,
        AwayTeam.Nickname AS AwayTeamNickname,
        Game.HomeTeamScore,
        Game.AwayTeamScore
      FROM Team AS HomeTeam
      JOIN Game
        ON Game.HomeTeamId = HomeTeam.TeamId
      JOIN Team AS AwayTeam
        ON Game.AwayTeamId = AwayTeam.TeamId
      WHERE HomeTeam.TeamId = ?
    )
    UNION
    (
      SELECT
        Game.GameDate,
        HomeTeam.TeamLocation AS HomeTeamLocation,
        HomeTeam.Nickname AS HomeTeamNickname,
        AwayTeam.TeamLocation AS AwayTeamLocation,
        AwayTeam.Nickname AS AwayTeamNickname,
        Game.HomeTeamScore,
        Game.AwayTeamScore
      FROM Team AS AwayTeam
      JOIN Game
        ON Game.AwayTeamId = AwayTeam.TeamId
      JOIN Team AS HomeTeam
        ON Game.HomeTeamId = HomeTeam.TeamId
      WHERE AwayTeam.TeamId = ?
    );      
  `, [teamId, teamId]);
});

export const getGamesByDate = onCall(async (request) => {
  if (request.data.date == null) {
    throw new HttpsError("invalid-argument", "Must specify a game date.");
  }

  const date = stringToDate(request.data.date.toString());
  return executeSql(`
    SELECT
      HomeTeam.TeamLocation AS HomeTeamLocation,
      HomeTeam.Nickname AS HomeTeamNickname,
      AwayTeam.TeamLocation AS AwayTeamLocation,
      AwayTeam.Nickname AS AwayTeamNickname,
      Game.HomeTeamScore,
      Game.AwayTeamScore
    FROM Game
    JOIN Team AS HomeTeam
      ON Game.HomeTeamId = HomeTeam.TeamId
    JOIN Team AS AwayTeam
      ON Game.AwayTeamId = AwayTeam.TeamId
    WHERE Game.GameDate = ?;
  `, [date]);
});
