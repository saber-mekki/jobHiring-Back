import { addUser, deleteUser, getUser } from "../../services/users";
import { Request, Response } from "express";

export const getUserController = async (req: Request, res: Response) => {
  const { login, password } = req.body

  try {
    const result = await getUser(login as string, password as string);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const addUserController = async (req: Request, res: Response) => {
  const { login, password, phone,gender,name } = req.body
  try {
 
    await addUser(login as string, password as string,phone as number,gender  as string,name  as string);
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};


export const deleteUserController = async (req: Request, res: Response) => {
  const { login } = req.query;
  try {
    await deleteUser(login as string);
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
