import { executeSQLQuery } from "../../database";

export const getJob = async (jobTitle?: string) => {
    let query;
    if (!jobTitle) {
        query = 'SELECT * FROM public."jobTable";'; // Récupérer tous les jobs
    } else {
        query = `SELECT * FROM public."jobTable" WHERE "jobTitle" = '${jobTitle}';`; // Récupérer le job par jobTitle
    }
    const result = await executeSQLQuery(query);
    return result.rows; // Retourner les résultats
};

export const addJob = async (
    email: string,
    companyName: string,
    jobTitle : string,
    location  : string,
    phone  : string,
    salary:string,
    deadline : string,
    jobType  : string ,
    description:string,
    requirement :string,
    resposibilities : string ,
    field : string) => { 
    const query = `INSERT INTO public."jobTable"(email, "companyName", "jobTitle" ,location  ,phone , salary,deadline,"jobType","description","requirement","resposibilities","field")
     VALUES ('${email}','${companyName}','${jobTitle}','${location}','${phone}','${salary}','${deadline}','${jobType}','${description}','${requirement}','${resposibilities}','${field}')`;
    
     const result = await executeSQLQuery(query);
     return result.rows[0];
};

export const deleteJob = async (jobTitle: string) => {
    const query = `DELETE  FROM public.postgres WHERE id='${jobTitle}' returning id`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};