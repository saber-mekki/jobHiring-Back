import { Pool, QueryResult } from "pg";
import env from "dotenv";

env.config();

export const pool = new Pool({
	connectionString:
		"postgres://postgres:0000@148.113.182.116:5432/postgres",
});
export const pool1 = new Pool({
	connectionString:
		"postgres://postgres:0000@148.113.182.116:5432/postgres",

});


export async function executeSQLQuery(SQL: string): Promise<QueryResult<any>> {
  return new Promise<QueryResult>((resolve, reject) => {
    pool.query(SQL, (error, result) => {
      if (error) {
        return reject(error);
      } else {
        resolve(result);
      }
    });
  });
}


