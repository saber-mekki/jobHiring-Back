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
  field: string, logo: string | null,created_by:number
) => {
  const query = `
    INSERT INTO public."jobTable" (
      email, "companyName", "jobTitle", location, phone, salary, 
      deadline, "jobType", description, requirement, 
      resposibilities, field, logo, job_embedding,created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15)
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
    embeddingParam,created_by
  ]);
  
  return result.rows[0];
};


export const updateJob = async (
  jobId: number, email: string, companyName: string, jobTitle: string,
  location: string, phone: string, salary: string, deadline: string,
  jobType: string, description: string, requirement: string,
  resposibilities: string, field: string, logo: string | null,
) => {
  try {
    // 1. D'abord, mettre à jour les informations de base de l'emploi
    const query = `
      UPDATE public."jobTable"
      SET email=$1, "companyName"=$2, "jobTitle"=$3, location=$4, phone=$5, 
          salary=$6, deadline=$7, "jobType"=$8, description=$9, 
          requirement=$10, resposibilities=$11, field=$12
          ${logo ? ', logo=$13' : ''}
      WHERE "jobId"=${logo ? '$14' : '$13'}
      RETURNING *;
    `;
    
    // Préparer les paramètres
    const params :(string|number)[] = [
      email, companyName, jobTitle, location, phone, salary, deadline,
      jobType, description, requirement, resposibilities, field
    ];
    
    // Ajouter le logo aux paramètres s'il existe
    if (logo) {
      params.push(logo);
    }
    
    // Ajouter jobId comme dernier paramètre
    params.push(jobId);
    
    console.log("Executing update query with params:", params);
    const result = await executeSQLQuery(query, params);
    
    // 2. Ensuite, essayer de mettre à jour l'embedding séparément
    try {
      const jobText = `${jobTitle} ${description} ${requirement} ${resposibilities}`;
      console.log("Generating embedding for text:", jobText);
      const embedding = await generateJobEmbedding(jobText);
      
      if (embedding) {
        // Convertir l'embedding au format compatible avec pgvector
        const embeddingParam = embedding ? 
          JSON.stringify(embedding).replace(/"/g, '') : null;
        
        console.log("Updating job embedding for jobId:", jobId);
        await executeSQLQuery(
          `UPDATE public."jobTable" SET job_embedding = $1 WHERE "jobId" = $2`,
          [embeddingParam, jobId]
        );
      }
    } catch (embeddingError) {
      // Journaliser l'erreur d'embedding mais ne pas faire échouer toute l'opération
      console.error("Error updating job embedding:", embeddingError);
      // On peut toujours retourner l'emploi mis à jour sans embedding
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Error in updateJob service:", error);
    throw error; // Re-lancer pour être géré par le contrôleur
  }
};

export const deleteJob = async (jobId: number) => {
  const query = `DELETE FROM public."jobTable" WHERE "jobId" = $1 RETURNING "jobId";`;
  const result = await executeSQLQuery(query, [jobId]);
  return result.rows[0];
};

export const saveJobForUser = async (userId: number, jobId: number) => {
  const query = `
    INSERT INTO public.saved_jobs (user_id, job_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  return await executeSQLQuery(query, [userId, jobId]);
};



export const removeSavedJob = async (userId: number, jobId: number) => {
  const query = `
    DELETE FROM public.saved_jobs 
    WHERE user_id = $1 AND job_id = $2
    RETURNING *;
  `;
  return await executeSQLQuery(query, [userId, jobId]);
};
// Modifier getSavedJobsByUser dans services/jobs.ts
export const getSavedJobsByUser = async (userId: number) => {
  const query = `
    SELECT 
      sj.id, 
      sj.job_id,
      sj.created_at,
      j."jobId",
      j."jobTitle",
      j."companyName",
      j.location,
      j."jobType",
      j.salary,
      j.is_approved
    FROM public.saved_jobs sj
    JOIN public."jobTable" j ON sj.job_id = j."jobId"
    WHERE sj.user_id = $1;
  `;
  return await executeSQLQuery(query, [userId]);
};