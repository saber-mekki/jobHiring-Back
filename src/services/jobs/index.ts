import { executeSQLQuery } from "../../database";

export const getJob = async () => {
    const query = `SELECT * FROM public."jobTable"`;
    const result = await executeSQLQuery(query);
    return result.rows;
};

export const addJob = async (email: string, companyName: string, jobTitle : string,location  : string, phone  : number,salary:number, deadline : string,jobType  : string) => {
    const query = `INSERT INTO public."jobTable"(email, "company-name", "job-title" ,location  ,phone , salary,deadline,"job-type") VALUES ('${email}','${companyName}','${jobTitle}','${location}','${phone}','${salary}','${deadline}','${jobType}')`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const deleteJob = async (jobTitle: string) => {
    const query = `DELETE  FROM public.postgres WHERE id='${jobTitle}' returning id`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};