import { executeSQLQuery } from "../../database";

export const getUser = async (login: string, password: string) => {
    const query = `SELECT * FROM public."userTable" WHERE login='${login}' and password='${password}'`;
    const result = await executeSQLQuery(query);
    return result.rows;
};

export const addUser = async (login: string, password: string, phone : number,gender  : string,name  : string) => {
    const query = `INSERT INTO public."userTable"(login,password ,phone,gender,name) VALUES ('${login}','${password}','${phone}','${gender}','${name}')`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const deleteUser = async (login: string) => {
    const query = `DELETE  FROM public.userDB WHERE login='${login}' returning login`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};