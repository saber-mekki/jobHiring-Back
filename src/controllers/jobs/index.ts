// controllers/jobs.ts
import { addJob, deleteJob, getJob, updateJob } from "../../services/jobs";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";

// Configuration de Multer pour enregistrer les fichiers localement
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Dossier où enregistrer les fichiers
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
  } = req.body;

  const logo = req.file ? req.file.filename : null;

  try {
    await addJob(
      email, companyName, jobTitle, location, phone, salary, deadline, jobType, 
      description, requirement, resposibilities, field, logo
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
    resposibilities, // Correction du nom de la variable
    field,
  } = req.body;

  const logo = req.file ? req.file.filename : null;

  try {
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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware pour l'upload de fichier
export const uploadMiddleware = upload.single("logo");
