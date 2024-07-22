import { addJob, deleteJob, getJob } from "../../services/jobs";
import { Request, Response } from "express";

export const getJobController = async (req: any, res: Response) => {
  const page:any = parseInt(req.query.page) || 1;
	const pageSize = parseInt(req.query.pageSize) || 10;
   const jobId:any = parseInt(req.query.jobId) ||undefined
   
  try {
        const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
    const result = await getJob(jobId);
     const paginatedJobs = result.slice(startIndex, endIndex);
    res
			.status(200)
			.json({ data: paginatedJobs, total: result.length, page, pageSize });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const addJobController = async (req: Request, res: Response) => {
  const { email, companyName, jobTitle,location,phone, salary, deadline , jobType,description,recuirement,resposibilities } = req.body
  try {
 
    await addJob(email as string, companyName as string, jobTitle as string,location  as string, phone  as number,salary as number, deadline as string,jobType  as  string , description as string ,recuirement as string, resposibilities as string);
   
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
