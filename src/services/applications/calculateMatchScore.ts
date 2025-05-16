// services/applications/calculateMatchScore.ts
import { pool } from "../../database";
import pgvector from 'pgvector';

/**
 * Nettoie et normalise un embedding (vecteur) pour le calcul de similarité
 * Cette fonction duplique la logique de cleanEmbedding de matching.ts
 * sans modifier le fichier original
 */
const processEmbedding = (raw: any): number[] => {
  const arr = Array.isArray(raw)
    ? raw
    : raw.toString().replace(/[{}]/g, "").split(",").map(Number);

  return arr.map((val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 0;
    if (num > 1) return 1;
    if (num < -1) return -1;
    return num;
  });
};

/**
 * Calcule le score de correspondance entre un candidat et une offre d'emploi
 * @param applicantId ID du candidat dans la table applicant
 * @param jobId ID de l'offre d'emploi dans la table jobTable
 * @returns Score de correspondance entre 0-100
 */
export const calculateMatchScore = async (applicantId: number, jobId: number): Promise<number> => {
  try {
    // Récupérer l'embedding du CV du candidat
    const applicantResult = await pool.query(
      'SELECT cv_embedding FROM applicant WHERE id = $1',
      [applicantId]
    );
    
    const cvEmbedding = applicantResult.rows[0]?.cv_embedding;
    if (!cvEmbedding) {
      console.warn(`Aucun embedding de CV trouvé pour l'ID candidat ${applicantId}`);
      return 0;
    }
    
    // Récupérer l'embedding de l'offre d'emploi
    const jobResult = await pool.query(
      'SELECT job_embedding FROM public."jobTable" WHERE "jobId" = $1',
      [jobId]
    );
    
    const jobEmbedding = jobResult.rows[0]?.job_embedding;
    if (!jobEmbedding) {
      console.warn(`Aucun embedding trouvé pour l'offre d'emploi ID ${jobId}`);
      return 0;
    }
    
    // Traiter les embeddings
    const processedCvEmbedding = processEmbedding(cvEmbedding);
    const processedJobEmbedding = processEmbedding(jobEmbedding);
    
    // Calculer la distance vectorielle en utilisant l'opérateur <=> de PostgreSQL/pgvector
    const distanceResult = await pool.query(
      'SELECT ($1::vector <=> $2::vector) as similarity',
      [pgvector.toSql(processedCvEmbedding), pgvector.toSql(processedJobEmbedding)]
    );
    
    const similarityScore = distanceResult.rows[0]?.similarity || 1;
    
    // Convertir la distance en score de correspondance (échelle 0-100)
    // Plus la distance est petite, plus le score est élevé
    const matchScore = Math.round((1 - similarityScore) * 100);
    
    console.log(`Match score calculé pour candidat ${applicantId} et job ${jobId}: ${matchScore}`);
    return matchScore;
  } catch (error) {
    console.error("Erreur lors du calcul du score de correspondance:", error);
    return 0; // Par défaut à 0 en cas d'erreur
  }
};