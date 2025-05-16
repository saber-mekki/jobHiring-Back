import { executeSQLQuery } from "../../database";
import pgvector from 'pgvector';


// services/ai/matchingService.ts
const cleanEmbedding = (raw: any): number[] => {
  const arr = Array.isArray(raw)
    ? raw
    : raw.toString().replace(/[{}]/g, "").split(",").map(Number); // Convert string to array

  return arr.map((val: any) => {
    const num = Number(val);

    if (isNaN(num)) return 0;
    if (num > 1) return 1;
    if (num < -1) return -1;

    return num;
  });
};

export const getJobRecommendations = async (applicantId: number, limit: number = 10) => {
  const applicantResult = await executeSQLQuery(
    'SELECT cv_embedding FROM applicant WHERE user_id = $1',
    [applicantId]
  );

  const rawEmbedding = applicantResult.rows[0]?.cv_embedding;
  console.log('Raw embedding type:', typeof rawEmbedding, 'value:', rawEmbedding);

  if (!rawEmbedding) {
    throw new Error('Applicant CV embedding not found');
  }

  const cvEmbedding = cleanEmbedding(rawEmbedding); 
  console.log('Processed embedding:', cvEmbedding);

  const result = await executeSQLQuery(
    `SELECT "jobId", "jobTitle", "companyName", description,logo,location,"jobType",field,
      (job_embedding <=> $1) as similarity_score
     FROM public."jobTable"
     ORDER BY similarity_score ASC
     LIMIT $2`,
    [pgvector.toSql(cvEmbedding), limit]
  );

  return result.rows.map(row => ({
    ...row,
    match_score: Math.round((1 - row.similarity_score) * 100)
  }));
};

export const getApplicantRanking = async (jobId: number, limit: number = 50) => {
  const jobResult = await executeSQLQuery(
    'SELECT job_embedding FROM public."jobTable" WHERE "jobId" = $1',
    [jobId]
  );

  const rawEmbedding = jobResult.rows[0]?.job_embedding;
  console.log('Raw job embedding type:', typeof rawEmbedding, 'value:', rawEmbedding);

  if (!rawEmbedding) {
    throw new Error('Job embedding not found');
  }

  const jobEmbedding = cleanEmbedding(rawEmbedding); 
  console.log('Processed embedding:', jobEmbedding);

  const result = await executeSQLQuery(
    `SELECT a.user_id, u.name, a.cv,
      (a.cv_embedding <=> $1) as similarity_score
     FROM applicant a
     JOIN public."userTable" u ON a.user_id = u.id
     ORDER BY similarity_score ASC
     LIMIT $2`,
    [pgvector.toSql(jobEmbedding), limit]
  );

  return result.rows.map(row => ({
    ...row,
    match_score: Math.round((1 - row.similarity_score) * 100)
  }));
};
export const getSimilarJobs = async (jobId: number, limit: number = 2) => {
  const jobResult = await executeSQLQuery(
    'SELECT job_embedding FROM public."jobTable" WHERE "jobId" = $1',
    [jobId]
  );

  const rawEmbedding = jobResult.rows[0]?.job_embedding;

  if (!rawEmbedding) {
    throw new Error('Job embedding not found');
  }

  const jobEmbedding = cleanEmbedding(rawEmbedding);

  const result = await executeSQLQuery(
    `SELECT "jobId", "jobTitle", "companyName", description, logo, location, "jobType", field,
      (job_embedding <=> $1) as similarity_score
     FROM public."jobTable"
     WHERE "jobId" != $2
     ORDER BY similarity_score ASC
     LIMIT $3`,
    [pgvector.toSql(jobEmbedding), jobId, limit]
  );

  return result.rows.map(row => ({
    ...row,
    match_score: Math.round((1 - row.similarity_score) * 100)
  }));
};