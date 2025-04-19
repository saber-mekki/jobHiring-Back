import { addInterview, getInterview} from "../../services/interview";
import { Request, Response } from "express";

export const getInterviewController = async (req: Request, res: Response) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const pageSize: number = parseInt(req.query.pageSize as string) || 10;
  const jobId: number | undefined = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;

  try {
      if (jobId && isNaN(jobId)) {
          return res.status(400).json({ error: "Invalid jobId format" });
      }
      const result = await getInterview(jobId);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedInterviews = result.slice(startIndex, endIndex);

      res.status(200).json({
          data: paginatedInterviews,
          total: result.length,
          page,
          pageSize
      });
  } catch (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const addInterviewController = async (req: Request, res: Response) => {
  const {
    jobId,
    firstName,
    lastName,
    email,
    nationality,
    seekedSalary,
    phone,
    jobType,
    description,
    
  } = req.body;

  try {
    await addInterview(
        jobId,
        firstName,
        lastName,
        email,
        nationality,
        seekedSalary,
        phone,
        jobType,
        description
    );
    res.status(200).send("Interview added successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};
