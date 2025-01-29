import { addJob, deleteJob, getJob } from "../../services/jobs";
import { Request, Response } from "express";

export const getJobController = async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string) || 1; // Assurez-vous que 'page' est un nombre
    const pageSize: number = parseInt(req.query.pageSize as string) || 10; // 'pageSize' est aussi un nombre
    const jobTitle: string | undefined = typeof req.query.jobTitle === 'string' 
        ? req.query.jobTitle.trim().toLowerCase() // Normaliser si c'est une chaîne de caractères
        : undefined;

    try {
        // Récupérer les résultats de la base de données (tous les jobs ou filtrés par jobTitle)
        const result = await getJob(jobTitle);
        
        // Calculer l'index de début et de fin pour la pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Appliquer la pagination
        const paginatedJobs = result.slice(startIndex, endIndex);
        
        // Réponse avec les jobs paginés
        res.status(200).json({
            data: paginatedJobs,
            total: result.length,
            page,
            pageSize
        });
    } catch (error) {
        console.error("Error fetching jobs:", error); // Ajout d'un log pour les erreurs
        return res.status(500).json({
            error: "Internal server error" // Message d'erreur générique
        });
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
    resposibilities,
    field,
  } = req.body;

  try {
    await addJob(
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
      resposibilities,
      field
    );
    res.status(200).send("Job added successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const deleteJobController = async (req: Request, res: Response) => {
  const { jobTitle } = req.query;
  try {
    await deleteJob(jobTitle as string );
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
