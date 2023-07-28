import { createConnection } from "mysql2/promise"; // Create Connection with database
import { host, user, database, password, port } from "../utils/config"; // For database connection

const connectionConfig: object = {
  host: host,
  user: user,
  password: password,
  database: database,
  port: port
}

class Treinamentos {
  private connection = createConnection(connectionConfig);

  public async selectAll(table: string, start?: string, end?: string) {
    let [results, fields]: Array<any> = [];
    if (start && end == undefined)
      results = (await this.connection).execute(`SELECT * FROM \`${table}\``);
    else
      results = (await this.connection).execute(`SELECT * FROM \`${table}\` LIMIT \`${start}\`, \`${end}\``);
    
    return results;
  }
}

export default Treinamentos;
