import { executeSQLQuery } from "../../database";
import bcrypt from "bcrypt";

export const getUser = async (login: string, password: string) => {
    const query = `SELECT * FROM public."userTable" WHERE login='${login}'`;
    
    const result = await executeSQLQuery(query);
    return result.rows;
};

export const addUser = async (login: string, password: string, phone : number,gender  : string,name  : string,	registerType: string) => {
      const saltRounds = 10; // You can adjust this value for stronger hashing
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			const query = `INSERT INTO public."userTable"("registerType",login,password,phone,gender,name) VALUES ('${registerType}','${login}','${hashedPassword}','${phone}','${gender}','${name}')`;
			const result = await executeSQLQuery(query);
			return result.rows[0];
};

export const deleteUser = async (login: string) => {
    const query = `DELETE  FROM public.userDB WHERE login='${login}' returning login`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};