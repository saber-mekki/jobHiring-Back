// controllers/applications/index.ts
import { Request, Response } from "express";
import {
  applyToJob,
  getApplicationsByApplicant,
  getApplicationsByJob,
  updateApplicationStatus,
  checkJobOwnership
} from "../../services/applications";
import { pool } from "../../database";

export const applyToJobController = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user.id;

  try {
    // 1) Vérifier l'existence du candidat (applicant) correspondant à cet utilisateur
    const applicantResult = await pool.query(
      'SELECT id FROM public.applicant WHERE user_id = $1',
      [userId]
    );
    if (applicantResult.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Profil candidat introuvable"
      });
    }
    const applicantId = applicantResult.rows[0].id;
    
    // Vérifier si le job existe
    const jobCheck = await pool.query(
      'SELECT "jobId" FROM public."jobTable" WHERE "jobId" = $1',
      [jobId]
    );
    
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: true,
        message: "Job introuvable" 
      });
    }

    // Appliquer au job (le match score sera calculé automatiquement dans le service)
    const result = await applyToJob({
      applicant_id: applicantId,
      job_id: parseInt(jobId, 10)
    });

    res.status(201).json({
      error: false,
      data: result.rows[0],
      message: "Candidature envoyée avec succès",
      match_score: result.rows[0].match_score
    });

  } catch (error: any) {
    if (error.message.includes("déjà existante")) {
      return res.status(409).json({
        error: true,
        message: "Vous avez déjà postulé à cette offre"
      });
    }
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};

export const getMyApplicationsController = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    // Récupérer l'ID du profil applicant de l'utilisateur
    const applicantResult = await pool.query(
      'SELECT id FROM public.applicant WHERE user_id = $1',
      [userId]
    );
    
    if (applicantResult.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Profil candidat introuvable"
      });
    }
    
    const applicantId = applicantResult.rows[0].id;
    const applications = await getApplicationsByApplicant(applicantId);
    
    res.status(200).json({
      error: false,
      data: applications
    });

  } catch (error: any) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};

export const getJobApplicationsController = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const recruiterId = req.user.id;

  try {
    // Vérification de propriété
    await checkJobOwnership(parseInt(jobId), recruiterId);
    
    const applications = await getApplicationsByJob(parseInt(jobId));
    
    res.status(200).json({
      error: false,
      data: applications
    });

  } catch (error: any) {
    if (error.message.includes("Non autorisé")) {
      return res.status(403).json({
        error: true,
        message: "Accès refusé : Vous n'êtes pas le propriétaire de cette offre"
      });
    }
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};

export const updateApplicationStatusController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const recruiterId = req.user.id;
  
  try {
    // Récupérer le job associé
    const jobQuery = `
      SELECT j."jobId" 
      FROM public.applications a
      JOIN public."jobTable" j ON a.job_id = j."jobId"
      WHERE a.application_id = $1
    `;
    const jobResult = await pool.query(jobQuery, [id]);
    
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ 
        error: true,
        message: "Candidature introuvable" 
      });
    }

    // Vérifier la propriété
    await checkJobOwnership(jobResult.rows[0].jobId, recruiterId);

    // Mettre à jour le statut
    const updated = await updateApplicationStatus(
      parseInt(id), 
      status as 'accepted' | 'rejected' | 'pending'
    );

    res.status(200).json({
      error: false,
      data: updated.rows[0],
      message: "Statut mis à jour"
    });
    
  } catch (error: any) {
    if (error.message.includes("Non autorisé")) {
      return res.status(403).json({
        error: true,
        message: "Action non autorisée"
      });
    }
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};