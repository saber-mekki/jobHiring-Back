// controllers/jobs.ts
import { addJob, deleteJob, getJob, updateJob } from "../../services/jobs";
import * as savedJobService from "../../services/jobs";
import { getSimilarJobs } from "../../services/ai/matching";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";


// Configuration de Multer pour enregistrer les fichiers localement
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/"); // Dossier où enregistrer les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

const upload = multer({ storage: storage });

export const getJobController = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;

  if (jobId && isNaN(jobId)) {
    return res.status(400).json({ error: "Invalid jobId format" });
  }

  try {
    const result = await getJob(jobId);
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = result.slice(startIndex, startIndex + pageSize);

    res.status(200).json({
      data: paginatedJobs,
      total: result.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addJobController = async (req: Request, res: Response) => {
  const {
    email,
    companyName,
    jobTitle,
    location,
    phone,
    salary,
    deadline,
    jobType,
    description,
    requirement,
    resposibilities, // Correction du nom de la variable
    field,
    created_by
  } = req.body;

  const logo = req.file ? req.file.filename : null;

  try {
    await addJob(
      email, companyName, jobTitle, location, phone, salary, deadline, jobType, 
      description, requirement, resposibilities, field, logo,created_by
    );
    res.status(200).json({ message: "Job added successfully." });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteJobController = async (req: Request, res: Response) => {
  const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;

  if (!jobId || isNaN(jobId)) {
    return res.status(400).json({ error: "Invalid or missing jobId" });
  }

  try {
    const deletedJob = await deleteJob(jobId);
    if (!deletedJob) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully." });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateJobController = async (req: Request, res: Response) => {
  try {
    console.log("Update job request body:", req.body);
    console.log("Update job request file:", req.file);
    
    const jobId = parseInt(req.body.jobId);
    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid or missing jobId" });
    }

    const {
      email,
      companyName,
      jobTitle,
      location,
      phone,
      salary,
      deadline,
      jobType,
      description,
      requirement,
      resposibilities, // Orthographe correspondant au service
      field,
    } = req.body;

    // Valider les champs obligatoires
    if (!email || !jobTitle || !companyName) {
      return res.status(400).json({ 
        error: "Required fields missing",
        missingFields: ['email', 'jobTitle', 'companyName'].filter(
          field => !req.body[field]
        )
      });
    }

    const logo = req.file ? req.file.filename : null;

    const updatedJob = await updateJob(
      jobId, email, companyName, jobTitle, location, phone, salary, 
      deadline, jobType, description, requirement, resposibilities, field, logo
    );
    
    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.status(200).json({ message: "Job updated successfully", data: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Internal server error", details: error });
  }
};
// Middleware pour l'upload de fichier
export const uploadMiddleware = upload.single("logo");


// Corriger la fonction saveJobController
export const saveJob = async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.body.jobId);
    const userId = (req as any).user.id;
    
    // Vérifier si le job existe déjà
    const existing = await savedJobService.getSavedJobsByUser(userId);
    if (existing.rows.some((j: any) => j.jobId === jobId)) {
      return res.status(400).json({ error: "Job déjà sauvegardé" });
    }

    const result = await savedJobService.saveJobForUser(userId, jobId);
    res.status(201).json({ error: false, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await savedJobService.getSavedJobsByUser(userId);
    res.status(200).json({ error: false, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error });
  }
};

export const removeSavedJob = async (req: Request, res: Response) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const userId = (req as any).user.id;

    await savedJobService.removeSavedJob(userId, jobId);
    res.status(200).json({ error: false, message: "Job removed from saved" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error });
  }
};


export const getSimilarJobsController = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 2;
    
    const similarJobs = await getSimilarJobs(parseInt(jobId), limit);
    
    res.status(200).json({
      error: false,
      message: 'Similar jobs fetched successfully',
      data: similarJobs
    });
  } catch (error) {
    console.error('Error fetching similar jobs:', error);
        res.status(500).json({ error: "Failed to fetch similar jobs", details: error });
  }
};