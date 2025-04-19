import { executeSQLQuery } from "../../database";
import { spawn } from 'child_process';
import path from 'path';


const generateJobEmbedding = async (text: string): Promise<number[] | null> => {
  return new Promise((resolve, reject) => {
    if (!text) {
      resolve(null);
      return;
    }

    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ai/embeddingService.py'),
      text
    ]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderrData}`));
        return;
      }

      try {
        const result = JSON.parse(stdoutData);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(new Error('Failed to parse embedding result'));
      }
    });
  });
};
  
  // Mettre à jour les embeddings lors de l'ajout/modification
  const updateJobEmbedding = async (jobId: number, text: string) => {
    const embedding = await generateJobEmbedding(text);
    await executeSQLQuery(
      `UPDATE public."jobTable" SET job_embedding = $1 WHERE "jobId" = $2`,
      [embedding, jobId]
    );
  };



export const getJob = async (jobId?: number) => {
    const query = jobId
        ? `SELECT * FROM public."jobTable" WHERE "jobId" = $1;`
        : `SELECT * FROM public."jobTable";`;

    const result = await executeSQLQuery(query, jobId ? [jobId] : []);
    return result.rows;
};



export const addJob = async (
  email: string, companyName: string, jobTitle: string, location: string,
  phone: string, salary: string, deadline: string, jobType: string,
  description: string, requirement: string, resposibilities: string, 
  field: string, logo: string | null
) => {
  const query = `
    INSERT INTO public."jobTable" (
      email, "companyName", "jobTitle", location, phone, salary, 
      deadline, "jobType", description, requirement, 
      resposibilities, field, logo, job_embedding
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  // Combine relevant fields for embedding
  const jobText = `${jobTitle} ${description} ${requirement} ${resposibilities}`;
  console.log(jobText)
  const embedding = await generateJobEmbedding(jobText);


   // Convert embedding to a format pgvector understands
   const embeddingParam = embedding ? 
   JSON.stringify(embedding).replace(/"/g, '') : null;
 
 console.log('[SERVICE] Final embedding param:', embeddingParam?.substring(0, 50) + '...');

  const result = await executeSQLQuery(query, [
    email, companyName, jobTitle, location, phone, salary, deadline,
    jobType, description, requirement, resposibilities, field, logo, 
    embeddingParam
  ]);
  
  return result.rows[0];
};

export const updateJob = async (
  jobId: number, email: string, companyName: string, jobTitle: string,
  location: string, phone: string, salary: string, deadline: string,
  jobType: string, description: string, requirement: string,
  resposibilities: string, field: string, logo: string | null,
) => {
  const query = `
    UPDATE public."jobTable"
    SET email=$1, "companyName"=$2, "jobTitle"=$3, location=$4, phone=$5, 
        salary=$6, deadline=$7, "jobType"=$8, description=$9, 
        requirement=$10, resposibilities=$11, field=$12, logo=$13
    WHERE "jobId"=$14
    RETURNING *;
  `;
  
  const result = await executeSQLQuery(query, [
    email, companyName, jobTitle, location, phone, salary, deadline,
    jobType, description, requirement, resposibilities, field, logo, jobId
  ]);

  // Update embedding if relevant fields changed
  const jobText = `${jobTitle} ${description} ${requirement} ${field}`;
  const embedding = await generateJobEmbedding(jobText);
  
  if (embedding) {
    await executeSQLQuery(
      `UPDATE public."jobTable" SET job_embedding = $1 WHERE "jobId" = $2`,
      [embedding, jobId]
    );
  }
  
  return result.rows[0];
};
export const deleteJob = async (jobId: number) => {
  const query = `DELETE FROM public."jobTable" WHERE "jobId" = $1 RETURNING "jobId";`;
  const result = await executeSQLQuery(query, [jobId]);
  return result.rows[0];
};
