import mysql from 'mysql2';
import { host, user, password, database, port } from './config';

const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
  port: port,
});

export default connection;