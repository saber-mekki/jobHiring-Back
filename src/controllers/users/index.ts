import { addUser, deleteUser, getUser } from "../../services/users";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const getUserController = async (req: Request, res: Response) => {
  const { login, password } = req.body

  try {
    const result = await getUser(login as string, password as string);
    
    if (result.length === 0) {
      	res.status(200).send({ error: true, user: [] });
		}

		const user = result[0];
		const match = await bcrypt.compare(password, user.password);

		if (match) {
      let error = result[0] === undefined ? true : false;
			res.status(200).send({ error: error, user: user });
        console.log({ user });
			return user;
    
		} else {
			res.status(200).send({ error: true, user: [] });
		}
    
  } catch (error) {
  	res.status(200).send({ error: true, user: [] });
  }
};

export const addUserController = async (req: Request, res: Response) => {
  const { login, password, phone, gender, name, registerType } = req.body;
  try {
 
    await addUser(
			login as string,
			password as string,
			phone as number,
			gender as string,
			name as string,
			registerType as string,
		);
    res.status(200).send({ error: false });
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
