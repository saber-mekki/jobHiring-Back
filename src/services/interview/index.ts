import { executeSQLQuery } from "../../database";
export const getInterview = async (jobId?: number) => {
    const query = `SELECT * FROM public."interviewTable" WHERE "jobId" = ${jobId};`;
    const result = await executeSQLQuery(query);
    return result.rows; // Retourner les résultats
};
export const addInterview = async (
    jobId:number,
    firstName : string,
    lastName  : string,
    email  : string , 
    nationality : string,
    seekedSalary: string,
    phone : string,
    jobType  : string,
    description  : string ) => {
        const query = `INSERT INTO public."interviewTable"
        ("jobId", "firstName", "lastName", "email", "nationality", "seekedSalary", "phone", "jobType", "description") 
        VALUES (${jobId}, '${firstName}', '${lastName}', '${email}', '${nationality}', '${seekedSalary}', '${phone}', '${jobType}', '${description}')
        RETURNING "interviewId";`;
        
    const result = await executeSQLQuery(query);
    return result.rows[0];
};