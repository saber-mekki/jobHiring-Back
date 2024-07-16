import { executeSQLQuery } from "../../database";

export const getUser = async (login: string, password: string) => {
    const query = `SELECT * FROM public.users WHERE login='${login}' and password='${password}'`;
    const result = await executeSQLQuery(query);
    return result.rows;
};

export const addUser = async (login: string, password: string) => {
    const query = `INSERT INTO public.users(login,password) VALUES ('${login}','${password}')`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const deleteUser = async (login: string) => {
    const query = `DELETE  FROM public.users WHERE login='${login}' returning login`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};