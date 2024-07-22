import { addJob, deleteJob, getJob } from "../../services/jobs";
import { Request, Response } from "express";

export const getJobController = async (req: Request, res: Response) => {

  const { jobId } = req.body;

  try {
    const result = await getJob(jobId);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const addJobController = async (req: Request, res: Response) => {
  const { email, companyName, jobTitle,location,phone, salary, deadline , jobType } = req.body
  try {
 
    await addJob(email as string, companyName as string, jobTitle as string,location  as string, phone  as number,salary as number, deadline as string,jobType  as  string);
   
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
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
