// services/applications.ts
import { pool } from "../../database";
import { calculateMatchScore } from "./calculateMatchScore";

interface ApplicationData {
  applicant_id: number;
  job_id: number;
}

export const applyToJob = async (data: ApplicationData) => {
  // Vérifier si une candidature existe déjà
  const existingResult = await pool.query(
    'SELECT application_id FROM applications WHERE applicant_id = $1 AND job_id = $2',
    [data.applicant_id, data.job_id]
  );
  
  if (existingResult.rows.length > 0) {
    throw new Error("Candidature déjà existante");
  }
  
  // Calculer le score de correspondance avec notre nouvelle fonction
  const matchScore = await calculateMatchScore(data.applicant_id, data.job_id);
  console.log(`Score de correspondance calculé: ${matchScore}`);
  
  // Insérer la candidature avec le score de correspondance
  const result = await pool.query(
    `INSERT INTO applications 
      (applicant_id, job_id, status, applied_at, match_score) 
     VALUES 
      ($1, $2, 'pending', NOW(), $3) 
     RETURNING *`,
    [
      data.applicant_id, 
      data.job_id, 
      matchScore // Inclure le score de correspondance dans l'insertion
    ]
  );
  
  return result;
};

export const getApplicationsByApplicant = async (applicantId: number) => {
  const result = await pool.query(
    `SELECT 
      a.application_id,
      a.job_id,
      j."jobTitle" as job_title,
      j."companyName" as company_name,
      a.applied_at,
      a.status,
      a.match_score
     FROM 
      applications a
     JOIN 
      public."jobTable" j ON a.job_id = j."jobId"
     WHERE 
      a.applicant_id = $1
     ORDER BY 
      a.applied_at DESC`,
    [applicantId]
  );
  
  return result.rows;
};

export const getApplicationsByJob = async (jobId: number) => {
  const result = await pool.query(
    `SELECT 
      a.application_id,
      a.applicant_id,
      u.name as applicant_name,
      u.login as applicant_email,
      a.applied_at,
      a.status,
      a.match_score,
      ap.user_id,
      ap.cv
     FROM 
      applications a
     JOIN 
      applicant ap ON a.applicant_id = ap.id
     JOIN 
      public."userTable" u ON ap.user_id = u.id
     WHERE 
      a.job_id = $1
     ORDER BY 
      a.match_score DESC, a.applied_at DESC`,
    [jobId]
  );
  
  return result.rows;
};

export const updateApplicationStatus = async (
  applicationId: number, 
  status: 'accepted' | 'rejected' | 'pending'
) => {
  const result = await pool.query(
    `UPDATE applications 
     SET status = $1 
     WHERE application_id = $2 
     RETURNING *`,
    [status, applicationId]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Candidature introuvable");
  }
  
  return result;
};

export const checkJobOwnership = async (jobId: number, userId: number) => {
  const result = await pool.query(
    `SELECT "jobId" 
     FROM public."jobTable" 
     WHERE "jobId" = $1 AND created_by = $2`,
    [jobId, userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Non autorisé: Cette offre ne vous appartient pas");
  }
  
  return true;
};