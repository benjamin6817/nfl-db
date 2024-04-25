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
import * as logger from "firebase-functions/logger";
import mysql from "mysql2/promise";
import {Connector, IpAddressTypes} from "@google-cloud/cloud-sql-connector";

async function connect() {
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
  const [result] = await conn.query("SELECT NOW();");
  console.table(result); // prints returned time value from server

  await pool.end();
  connector.close();
}

export const helloWorld = onRequest(async (request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  await connect();
  response.send("Hello from Firebase!");
});
