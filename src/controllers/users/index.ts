import { addUser, deleteUser, getUser } from "../../services/users";
import { Request, Response } from "express";

export const getUserController = async (req: Request, res: Response) => {
  const { login, password  } = req.body

  try {
    const result = await getUser(login, password);
      if (result.length > 0) {
        res.status(200).send({ error: false, data: result });
      }
      else {
        res.status(404).send({ error: true, message: "User not found" });
      }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const addUserController = async (req: Request, res: Response) => {
  const { login, password, phone,gender,name ,registerType} = req.body
  try {
 
    await addUser(login as string, password as string,phone as string,gender  as string,name  as string , registerType as string);
    res.status(200).json({
      error: false,
      message: "User added successfully",
    });
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
