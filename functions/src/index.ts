/* eslint-disable require-jsdoc */
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import mysql from "mysql2/promise";
import {Connector, IpAddressTypes} from "@google-cloud/cloud-sql-connector";

interface DatabaseCallback {
  (connection: mysql.PoolConnection): Promise<void>;
}

async function connect(fn: DatabaseCallback) {
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
  await fn(conn);
  await pool.end();
  connector.close();
}

function stringToDate(str: string): Date {
  const [yearStr, monthStr, dayStr] = str.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  return new Date(year, month - 1, day);
}

export const addGame = onRequest(async (request, response) => {
  if (request.body.date == null) {
    response.send({error: "Must specify a game date."});
    return;
  }
  if (request.body.homeTeamId == null) {
    response.send({error: "Must specify a home team."});
    return;
  }
  if (request.body.awayTeamId == null) {
    response.send({error: "Must specify an away team."});
    return;
  }
  if (request.body.homeTeamScore == null) {
    response.send({error: "Must specify a home team score."});
    return;
  }
  if (request.body.awayTeamScore == null) {
    response.send({error: "Must specify an away team score."});
    return;
  }

  const date = stringToDate(request.body.date);
  const homeTeamId = parseInt(request.body.homeTeamId.toString());
  const awayTeamId = parseInt(request.body.awayTeamId.toString());
  const homeTeamScore = parseInt(request.body.homeTeamScore.toString());
  const awayTeamScore = parseInt(request.body.awayTeamScore.toString());

  await connect(async (conn) => {
    const stmt = await conn.prepare(`
      INSERT INTO Game
        (GameDate, HomeTeamId, AwayTeamId, HomeTeamScore, AwayTeamScore)
      VALUES (?, ?, ?, ?, ?)
    `);
    const [result] = await stmt.execute([date, homeTeamId, awayTeamId,
      homeTeamScore, awayTeamScore]);
    response.send(result);
  });
});

export const addPlayer = onRequest(async (request, response) => {
  if (request.body.teamId == null) {
    response.send({error: "Must specify a game date."});
    return;
  }
  if (request.body.playerName == null) {
    response.send({error: "Must specify a home team."});
    return;
  }
  if (request.body.position == null) {
    response.send({error: "Must specify an away team."});
    return;
  }

  console.log(request.body);
  const teamId = parseInt(request.body.teamId.toString());
  const playerName = request.body.playerName;
  const position = request.body.position;

  await connect(async (conn) => {
    const stmt = await conn.prepare(
      "INSERT INTO Player (TeamId, PlayerName, Position) VALUES (?, ?, ?)"
    );
    const [result] = await stmt.execute([teamId, playerName, position]);
    response.send(result);
  });
});

export const getPlayersOnTeam = onRequest(async (request, response) => {
  if (request.query.teamId == null) {
    response.send({error: "Must specify a team ID."});
    return;
  }

  const teamId = parseInt(request.query.teamId.toString());
  await connect(async (conn) => {
    const stmt = await conn.prepare("SELECT * FROM Player WHERE TeamId = ?");
    const [players] = await stmt.execute([teamId]);
    response.send(players);
  });
});

export const getPlayersByTeamAndPos = onRequest(async (request, response) => {
  if (request.query.teamId == null) {
    response.send({error: "Must specify a team ID."});
    return;
  }
  if (request.query.position == null) {
    response.send({error: "Must specify a position."});
    return;
  }

  const teamId = parseInt(request.query.teamId.toString());
  const position = request.query.position;
  await connect(async (conn) => {
    const stmt = await conn.prepare(
      "SELECT * FROM Player WHERE TeamId = ? AND Position = ?"
    );
    const [players] = await stmt.execute([teamId, position]);
    response.send(players);
  });
});

export const getGamesByTeam = onRequest(async (request, response) => {
  if (request.query.teamId == null) {
    response.send({error: "Must specify a team ID."});
    return;
  }

  const teamId = parseInt(request.query.teamId.toString());
  await connect(async (conn) => {
    const stmt = await conn.prepare(`
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
    `);
    const [players] = await stmt.execute([teamId, teamId]);
    response.send(players);
  });
});

export const getGamesByDate = onRequest(async (request, response) => {
  if (request.query.date == null) {
    response.send({error: "Must specify a game date."});
    return;
  }

  const date = stringToDate(request.query.date.toString());
  await connect(async (conn) => {
    const stmt = await conn.prepare(`
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
    `);
    const [players] = await stmt.execute([date]);
    response.send(players);
  });
});
