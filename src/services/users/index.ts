import { executeSQLQuery } from "../../database";
import { PoolClient } from "pg";
import bcrypt from "bcryptjs";
import crypto from 'crypto';

const isPlainObject = (obj: any): obj is object => {
  return (
    typeof obj === 'object' && 
    !Array.isArray(obj) && 
    obj !== null
  );
};

export interface UserData {
  login: string;
  password: string;
  phone: string;
  gender: string;
  name: string;
  registerType: string;
  image?: string | null;
  company_name?: string;
  company_website?: string;
  company_logo?: string;
  company_description?: string;
  company_industry?: string;
  company_size?: string;
  company_founded_year?: number;
  company_linkedin?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_country?: string;
  company_postal_code?: string;
  cv?: string | null;
  skills?: string[];
  experience?: object;
  education?: object;
  cv_embedding?: number[] | null;
  is_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
}

export interface VerificationResult {
  success: boolean;
  message?: string;
  is_verified?: boolean;
  verification_token?: string;
}

export const getUser = async (login: string) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.gender,
      u."registerType",
      u.login AS email,
      u.password,
      u.phone,
      u.image,
      u.is_verified,
      u.verification_token,
      u.verification_token_expires,
      a.cv,
      a.skills,
      a.experience,
      a.education,
      a.cv_embedding,
      r.company_name,
      r.company_website,
      r.company_logo,
      r.company_description,
      r.company_industry,
      r.company_size,
      r.company_founded_year,
      r.company_linkedin,
      r.company_address,
      r.company_city,
      r.company_state,
      r.company_country,
      r.company_postal_code,
      r.verification_date,
      r.created_at,
      r.updated_at
    FROM public."userTable" u
    LEFT JOIN public.applicant a ON u.id = a.user_id
    LEFT JOIN public.recruiter r ON u.id = r.user_id
    WHERE u.login = $1
  `;
  
  const result = await executeSQLQuery(query, [login]);
  return result.rows[0] || null;
};

export const verifyEmailWithToken = async (token: string): Promise<VerificationResult> => {
  try {
    console.log(`Verification attempt for token: ${token}`);
    const query = `
      SELECT id, verification_token_expires 
      FROM public."userTable" 
      WHERE verification_token = $1 AND is_verified = false
    `;
    const result = await executeSQLQuery(query, [token]);

    if (result.rows.length === 0) {
      return { 
        success: false,
        message: "Token invalide ou utilisateur déjà vérifié" 
      };
    }

    const user = result.rows[0];
    const now = new Date();

    if (user.verification_token_expires < now) {
      return { 
        success: false,
        message: "Token expiré" 
      };
    }

    const updateQuery = `
      UPDATE public."userTable" 
      SET is_verified = true, 
          verification_token = NULL, 
          verification_token_expires = NULL 
      WHERE id = $1
      RETURNING is_verified
    `;
    const updateResult = await executeSQLQuery(updateQuery, [user.id]);

    return { 
      success: true,
      is_verified: updateResult.rows[0].is_verified 
    };
  } catch (error) {
    console.error("Erreur dans verifyEmailWithToken:", error);
    throw new Error("Erreur serveur lors de la vérification");
  }
};

export const generateVerificationToken = async (email: string): Promise<VerificationResult> => {
  try {
    const user = await getUser(email);
    if (!user) {
      return { 
        success: false,
        message: "Utilisateur non trouvé" 
      };
    }

    if (user.is_verified) {
      return { 
        success: true,
        is_verified: true,
        message: "L'email est déjà vérifié" 
      };
    }

    const verification_token = crypto.randomBytes(20).toString('hex');
    const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const updateQuery = `
      UPDATE public."userTable" 
      SET verification_token = $1, 
          verification_token_expires = $2 
      WHERE id = $3
    `;
    await executeSQLQuery(updateQuery, [verification_token, verification_token_expires, user.id]);

    return { 
      success: true,
      is_verified: false,
      verification_token,
      message: "Token généré avec succès" 
    };
  } catch (error) {
    console.error("Erreur dans generateVerificationToken:", error);
    throw new Error("Erreur serveur lors de la génération du token");
  }
};

export const checkVerificationStatus = async (userId: string): Promise<VerificationResult> => {
  try {
    const query = `
      SELECT is_verified 
      FROM public."userTable" 
      WHERE id = $1
    `;
    const result = await executeSQLQuery(query, [userId]);

    if (result.rows.length === 0) {
      return { 
        success: false,
        message: "Utilisateur non trouvé" 
      };
    }

    return { 
      success: true,
      is_verified: result.rows[0].is_verified 
    };
  } catch (error) {
    console.error("Erreur dans checkVerificationStatus:", error);
    throw new Error("Erreur serveur lors de la vérification du statut");
  }
};

export const addUser = async (userData: UserData, client?: PoolClient) => {
  const {
    login,
    password,
    phone,
    gender,
    name,
    registerType,
    image,
    company_name,
    company_website,
    company_logo,
    company_description,
    company_industry,
    company_size,
    company_founded_year,
    company_linkedin,
    company_address,
    company_city,
    company_state,
    company_country,
    company_postal_code,
    cv,
    skills,
    experience,
    education,
    cv_embedding
  } = userData;

  const executeQuery = client ? client.query.bind(client) : executeSQLQuery;

  try {
    // Generate verification data
    const verification_token = crypto.randomBytes(20).toString('hex') ;
    
    const verification_token_expires =new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const is_verified = registerType === "applicant" ? true : false;
    // Insert user
    const userQuery = `
      INSERT INTO public."userTable" (
        login, password, phone, gender, name, "registerType", image,
        verification_token, verification_token_expires, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    const userValues = [
      login, 
      password, 
      phone, 
      gender, 
      name, 
      registerType, 
      image,
      verification_token, 
      verification_token_expires, 
      is_verified
    ];
    
    const userResult = await executeQuery(userQuery, userValues);

    if (userResult.rows.length === 0) {
      throw new Error("User insertion failed");
    }

    const userId = userResult.rows[0].id;

    // Insert role-specific data
    if (registerType === "recruiter") {
      const recruiterQuery = `
        INSERT INTO public.recruiter (
          user_id, company_name, company_website, company_logo,
          company_description, company_industry, company_size,
          company_founded_year, company_linkedin, company_address,
          company_city, company_state, company_country, company_postal_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;
      
      await executeQuery(recruiterQuery, [
        userId, company_name, company_website, company_logo,
        company_description, company_industry, company_size,
        company_founded_year, company_linkedin, company_address,
        company_city, company_state, company_country, company_postal_code
      ]);
    } 
    else if (registerType === "applicant") {
      const applicantQuery = `
        INSERT INTO public.applicant (
          user_id, cv, skills, experience, education, cv_embedding
        ) VALUES ($1, $2, $3, $4, $5, $6::vector)
      `;
      
      const embeddingParam = cv_embedding 
        ? JSON.stringify(cv_embedding).replace(/"/g, '') 
        : null;
      
      await executeQuery(applicantQuery, [
        userId,
        cv,
        skills,
        JSON.stringify(experience),
        JSON.stringify(education),
        embeddingParam
      ]);
    }

    return { 
      success: true,
      userId,
      verification_token,
      is_verified 
    };
  } catch (error) {
    console.error("Error in addUser:", error);
    throw error;
  }
};

export const deleteUser = async (login: string) => {
  const query = `
    DELETE FROM public."userTable" 
    WHERE login = $1 
    RETURNING id, login
  `;
  const result = await executeSQLQuery(query, [login]);
  return result.rows[0];
};

export const updateUser = async (
  login: string,
  data: any,
  client?: PoolClient
) => {
  const execute = client ? client.query.bind(client) : executeSQLQuery;
  const existing = await getUser(login);
  
  if (!existing) {
    throw new Error("User not found");
  }

  await execute('BEGIN');

  try {
    // Update userTable
    const userUpdates: string[] = [];
    const userValues: any[] = [];
    let i = 1;

    const userFields = ['password', 'phone', 'gender', 'name', 'image'];
    for (const field of userFields) {
      if (data[field] !== undefined) {
        userUpdates.push(`"${field}" = $${i}`);
        userValues.push(
          field === 'password' 
            ? await bcrypt.hash(data[field], 12) 
            : data[field]
        );
        i++;
      }
    }

    if (userUpdates.length > 0) {
      await execute(
        `UPDATE public."userTable" SET ${userUpdates.join(", ")} WHERE login = $${i}`,
        [...userValues, login]
      );
    }

    // Update role-specific table
    const role = existing.registerType === 'recruiter' ? 'recruiter' : 'applicant';
    const roleUpdates: string[] = [];
    const roleValues: any[] = [];
    let j = 1;

    const roleFields = {
      recruiter: [
        'company_name', 'company_website', 'company_logo', 
        'company_description', 'company_industry', 'company_size',
        'company_founded_year', 'company_linkedin', 'company_address',
        'company_city', 'company_state', 'company_country', 'company_postal_code'
      ],
      applicant: ['cv', 'skills', 'experience', 'education', 'cv_embedding']
    }[role];

    for (const field of roleFields) {
      if (data[field] !== undefined) {
        let value = data[field];
        let fieldSpec = '';
        
        if (['skills', 'experience', 'education'].includes(field)) {
          value = JSON.stringify(value);
          fieldSpec = '::jsonb';
        } else if (field === 'cv_embedding') {
          fieldSpec = '::vector';
        }

        roleUpdates.push(`"${field}" = $${j}${fieldSpec}`);
        roleValues.push(value);
        j++;
      }
    }

    if (roleUpdates.length > 0) {
      await execute(
        `UPDATE public."${role}" SET ${roleUpdates.join(", ")} WHERE user_id = $${j}`,
        [...roleValues, existing.id]
      );
    }

    // Sync common fields for applicants
    if (existing.registerType === 'applicant') {
      const syncUpdates: string[] = [];
      const syncValues: any[] = [];
      let k = 1;

      const syncFields = ['name', 'phone', 'gender'];
      for (const field of syncFields) {
        if (data[field] !== undefined) {
          syncUpdates.push(`"${field}" = $${k}`);
          syncValues.push(data[field]);
          k++;
        }
      }

      if (syncUpdates.length > 0) {
        await execute(
          `UPDATE public."userTable" SET ${syncUpdates.join(", ")} WHERE id = $${k}`,
          [...syncValues, existing.id]
        );
      }
    }

    await execute('COMMIT');

    const updatedUser = await getUser(login);
    return { user: updatedUser };
  } catch (error) {
    await execute('ROLLBACK');
    console.error("Error in updateUser:", error);
    throw error;
  }
};