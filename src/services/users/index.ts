import { executeSQLQuery } from "../../database";
import { PoolClient } from "pg";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import { sendAccountSuspendedEmail, sendContentRemovedEmail, sendEmail, sendUserWarningEmail } from "../../utils/emailSender";

const isPlainObject = (obj: any): obj is object => {
  return (
    typeof obj === 'object' && 
    !Array.isArray(obj) && 
    obj !== null
  );
};


interface ReportData {
  reporter_id: number;
  reported_item_type: 'job' | 'user' | 'blog';
  reported_item_id: number;
  reason: string;
}

interface PaginatedReportsResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedJobsResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  isAdmin?:boolean;
  adminRole?:string;

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
      u.is_banned,
      u.banned_reason,
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
      r.updated_at,
      adm.role AS admin_role
    FROM public."userTable" u
    LEFT JOIN public.applicant a ON u.id = a.user_id
    LEFT JOIN public.recruiter r ON u.id = r.user_id
    LEFT JOIN public.admin adm ON u.id = adm.user_id
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
        message: " invalid token or user is exist " 
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
      applicant: ['cv', 'experience', 'education', 'cv_embedding', 'linkedin', 'github']
    }[role];

    // Handle skills separately
    let hasSkills = false;
    let skillsValue = null;
    
    if (data.skills !== undefined) {
      hasSkills = true;
      // Make sure skills is an array
      skillsValue = Array.isArray(data.skills) ? data.skills : 
                   (typeof data.skills === 'string' ? [data.skills] : 
                   (isPlainObject(data.skills) || typeof data.skills === 'string' ? 
                    JSON.parse(data.skills) : []));
    }

    for (const field of roleFields) {
      if (data[field] !== undefined) {
        let value = data[field];
        let fieldSpec = '';
        
        if (['experience', 'education'].includes(field)) {
          value = typeof value === 'string' ? value : JSON.stringify(value);
          fieldSpec = '::jsonb';
        } else if (field === 'cv_embedding') {
          fieldSpec = '::vector';
        }

        roleUpdates.push(`"${field}" = $${j}${fieldSpec}`);
        roleValues.push(value);
        j++;
      }
    }

    // Add skills update if needed
    if (hasSkills) {
      roleUpdates.push(`"skills" = $${j}`);
      roleValues.push(skillsValue);
      j++;
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



// Ajoutez ces nouvelles fonctions à la fin du fichier

export const promoteToAdmin = async (userId: string) => {
  const query = `
    INSERT INTO public.admin (user_id, role) 
    VALUES ($1, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin'
    RETURNING id
  `;
  const result = await executeSQLQuery(query, [userId]);
  return result.rows[0];
};

export const demoteAdmin = async (userId: string) => {
  const query = `
    DELETE FROM public.admin 
    WHERE user_id = $1
    RETURNING id
  `;
  const result = await executeSQLQuery(query, [userId]);
  return result.rows[0];
};

export const banUser = async (userId: number, reason: string) => {
  const query = `
    UPDATE public."userTable" 
    SET is_banned = true, banned_reason = $2
    WHERE id = $1
    RETURNING id, is_banned
  `;
  const result = await executeSQLQuery(query, [userId, reason]);
  return result.rows[0];
};

export const unbanUser = async (userId: number) => {
  const query = `
    UPDATE public."userTable" 
    SET is_banned = false, banned_reason = NULL
    WHERE id = $1
    RETURNING id, is_banned
  `;
  const result = await executeSQLQuery(query, [userId]);
  return result.rows[0];
};

export const approveJob = async (jobId: number, adminUserId: number) => {
  // Récupérer l'ID admin depuis user_id
  const adminQuery = 'SELECT id FROM public.admin WHERE user_id = $1';
  const adminResult = await executeSQLQuery(adminQuery, [adminUserId]);
  if (adminResult.rows.length === 0) throw new Error('Admin non trouvé');
  const adminId = adminResult.rows[0].id;

  const query = `
    UPDATE public."jobTable" 
    SET is_approved = true, approved_by = $2, approved_at = NOW()
    WHERE "jobId" = $1
    RETURNING "jobId", is_approved
  `;
  const result = await executeSQLQuery(query, [jobId, adminId]);
  return result.rows[0];
};

export const rejectJob = async (jobId: number) => {
  const query = `
    UPDATE public."jobTable" 
    SET is_approved = false, approved_by = NULL, approved_at = NULL
    WHERE "jobId" = $1
    RETURNING "jobId", is_approved
  `;
  const result = await executeSQLQuery(query, [jobId]);
  return result.rows[0];
};
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<any>> => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      u.id,
      u.login AS email,
      u.name,
      u."registerType" AS role,
      u.is_verified,
      u.is_banned,
      u.banned_reason,
      u.last_login,
      u.login_count,
      adm.role AS admin_role
    FROM public."userTable" u
    LEFT JOIN public.admin adm ON u.id = adm.user_id
    ORDER BY u.id
    LIMIT $1 OFFSET $2
  `;
  const countQuery = `SELECT COUNT(*) FROM public."userTable"`;
  const [result, countResult] = await Promise.all([
    executeSQLQuery(query, [limit, offset]),
    executeSQLQuery(countQuery)
  ]);
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
  };
};

interface AdminData {
  email: string;
  password: string;
  phone:string;
  gender:string;
  name: string;
  role?: 'admin' | 'superadmin';
  invitationCode?: string;
}// Modifier createAdmin pour accepter plus de champs
export const createAdmin = async (adminData: AdminData, client?: PoolClient) => {
  const { email, password, name, phone, gender, role = 'admin' } = adminData;
  
  const executeQuery = client ? client.query.bind(client) : executeSQLQuery;

  try {
    await executeQuery('BEGIN');

    // Créer l'utilisateur
    const userResult = await executeQuery(
      `INSERT INTO public."userTable" (
        login, password, name, phone, gender, "registerType", is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [email, await bcrypt.hash(password, 12), name, phone, gender, 'admin', true]
    );

    const userId = userResult.rows[0].id;

    // Créer l'entrée admin
    await executeQuery(
      `INSERT INTO public.admin (user_id, role) 
       VALUES ($1, $2)`,
      [userId, role]
    );

    await executeQuery('COMMIT');

    return { 
      success: true,
      userId
    };
  } catch (error) {
    await executeQuery('ROLLBACK');
    console.error("Error in createAdmin:", error);
    throw error;
  }
};

const verifyInvitationCode = async (code: string) => {
  // Implémentez votre logique de vérification ici
  // Par exemple, vérification dans une table dédiée
  return code === process.env.SUPERADMIN_INVITE_CODE; // Solution basique
};

export const adminLogin = async (email: string, password: string) => {
  try {
    const userQuery = `
      SELECT 
        u.id, u.password, u.is_banned, u.banned_reason,
        a.role AS admin_role
      FROM public."userTable" u
      JOIN public.admin a ON u.id = a.user_id
      WHERE u.login = $1
    `;
    
    const result = await executeSQLQuery(userQuery, [email]);
    
    if (result.rows.length === 0) {
      throw new Error('Identifiants incorrects');
    }

    const user = result.rows[0];

    // Vérifier si le compte est banni
    if (user.is_banned) {
      throw new Error(`Compte suspendu: ${user.banned_reason}`);
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Identifiants incorrects');
    }

    return {
      id: user.id,
      role: user.admin_role,
      isAdmin: true
    };
  } catch (error) {
    console.error("Error in adminLogin:", error);
    throw error;
  }
};
export const getUserById = async (id: string | number) => {
  // Ensure id is converted to an integer
  const userId = typeof id === 'string' ? parseInt(id, 10) : id;

  // Check if the conversion is valid
  if (isNaN(userId)) {
    console.error(`Invalid user ID: ${id}`);
    return null;
  }

  const query = `
    SELECT 
      u.id,
      u.name,
      u.gender,
      u."registerType",
      u.login AS email,
      u.phone,
      u.image,
      u.is_verified,
      u.is_banned,
      u.banned_reason,
      a.cv,
      a.skills,
      a.experience,
      a.education,
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
      adm.role AS admin_role
    FROM public."userTable" u
    LEFT JOIN public.applicant a ON u.id = a.user_id
    LEFT JOIN public.recruiter r ON u.id = r.user_id
    LEFT JOIN public.admin adm ON u.id = adm.user_id
    WHERE u.id = $1
  `;
  
  try {
    console.log(`Fetching user with ID: ${userId}, Type: ${typeof userId}`);
    
    const result = await executeSQLQuery(query, [userId]);
    
    console.log('Query result rows:', result.rows);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};// Ajoutez cette fonction à la fin du fichier index.ts
export const GetAdminStats = async () => {
  try {
    // Requêtes SQL pour les statistiques
    const queries = {
      totalUsers: `SELECT COUNT(*) FROM public."userTable"`,
      totalJobs: `SELECT COUNT(*) FROM public."jobTable"`,
      activeJobs: `SELECT COUNT(*) FROM public."jobTable" WHERE is_approved = true`,
      bannedUsers: `SELECT COUNT(*) FROM public."userTable" WHERE is_banned = true`,
      totalAdmins: `SELECT COUNT(*) FROM public.admin`
    };

    // Exécution parallèle des requêtes
    const [
      usersResult,
      jobsResult,
      activeJobsResult,
      bannedUsersResult,
      adminsResult
    ] = await Promise.all([
      executeSQLQuery(queries.totalUsers),
      executeSQLQuery(queries.totalJobs),
      executeSQLQuery(queries.activeJobs),
      executeSQLQuery(queries.bannedUsers),
      executeSQLQuery(queries.totalAdmins)
    ]);

    // Transformation des résultats
    return {
      totalUsers: parseInt(usersResult.rows[0].count, 10),
      totalJobs: parseInt(jobsResult.rows[0].count, 10),
      activeJobs: parseInt(activeJobsResult.rows[0].count, 10),
      bannedUsers: parseInt(bannedUsersResult.rows[0].count, 10),
      totalAdmins: parseInt(adminsResult.rows[0].count, 10)
    };

  } catch (error) {
    console.error("Error in getAdminStats service:", error);
    throw new Error("Failed to fetch admin statistics");
  }
};

export const GetAllJobs = async (
  page: number = 1,
  limit: number = 20,
  approved?: boolean
): Promise<PaginatedJobsResult> => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      j."jobId" AS id,
      j."jobTitle" AS title,
      j."companyName" AS company,
      j."jobType" AS type,
      j.location,
      j.salary,
      j."createdAt" AS created_at,
      j.is_approved,
      j.approved_at,
      u.login AS posted_by,
      adm.login AS approved_by
    FROM public."jobTable" j
    JOIN public."userTable" u ON j.email = u.login
    LEFT JOIN public.admin a ON j.approved_by = a.id
    LEFT JOIN public."userTable" adm ON a.user_id = adm.id
  `;

  const conditions: string[] = [];
  const params: any[] = [];

  if (approved !== undefined) {
    conditions.push(`j.is_approved = $${params.length + 1}`);
    params.push(approved);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += `
    ORDER BY j."createdAt" DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
  params.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) 
    FROM public."jobTable" j
    ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
  `;

  const [jobsResult, countResult] = await Promise.all([
    executeSQLQuery(query, params),
    executeSQLQuery(countQuery, params.slice(0, -2))
  ]);

  return {
    data: jobsResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
  };
};
// Ajoutez cette fonction dans votre fichier index.ts
export const GetJobDetails = async (jobId: string): Promise<any> => {
  const query = `
    SELECT 
      j."jobId" AS id,
      j."jobTitle" AS title,
      j."companyName" AS company,
      j."jobType" AS type,
      j.location,
      j.salary,
      j.description,
      j.requirement,
      j.resposibilities,
      j.field,
      j.deadline,
      j."createdAt" AS created_at,
      j."updatedAt" AS updated_at,
      j.is_approved,
      j.approved_at,
      j."experienceLevel" AS experience_level,
      j.email,
      j.phone,
      j.logo,
      u.id AS user_id,
      u.name AS posted_by_name,
      u.login AS posted_by_email,
      adm.login AS approved_by_email
    FROM public."jobTable" j
    JOIN public."userTable" u ON j.email = u.login
    LEFT JOIN public.admin a ON j.approved_by = a.id
    LEFT JOIN public."userTable" adm ON a.user_id = adm.id
    WHERE j."jobId" = $1
  `;
  
  const result = await executeSQLQuery(query, [jobId]);
  return result.rows[0] || null;
};



export const createReport = async (reportData: ReportData) => {
  const { reporter_id, reported_item_type, reported_item_id, reason } = reportData;
  
  // Validate report type
  if (!['job', 'user', 'blog'].includes(reported_item_type)) {
    throw new Error("Invalid report type");
  }
  
  // Check if item exists
  let itemExistsQuery = '';
  switch (reported_item_type) {
    case 'job':
      itemExistsQuery = 'SELECT "jobId" FROM public."jobTable" WHERE "jobId" = $1';
      break;
    case 'user':
      itemExistsQuery = 'SELECT id FROM public."userTable" WHERE id = $1';
      break;
    case 'blog':
      itemExistsQuery = 'SELECT "blogId" FROM public."blogTable" WHERE "blogId" = $1';
      break;
  }
  
  const itemResult = await executeSQLQuery(itemExistsQuery, [reported_item_id]);
  if (itemResult.rows.length === 0) {
    throw new Error(`Reported ${reported_item_type} not found`);
  }
  
  // Check if user already reported this item
  const existingReportQuery = `
    SELECT report_id FROM public.report 
    WHERE reporter_id = $1 
    AND reported_item_type = $2 
    AND reported_item_id = $3
    AND status != 'resolved'
  `;
  
  const existingReport = await executeSQLQuery(existingReportQuery, [
    reporter_id, 
    reported_item_type, 
    reported_item_id
  ]);
  
  if (existingReport.rows.length > 0) {
    throw new Error("You have already reported this item");
  }
  
  // Create report
  const query = `
    INSERT INTO public.report (
      reporter_id, 
      reported_item_type, 
      reported_item_id, 
      reason, 
      status
    ) VALUES ($1, $2, $3, $4, 'pending')
    RETURNING report_id
  `;
  
  const result = await executeSQLQuery(query, [
    reporter_id, 
    reported_item_type, 
    reported_item_id, 
    reason
  ]);
  
  return result.rows[0];
};

export const getReportDetails = async (reportId: number) => {
  const query = `
    SELECT 
      r.report_id,
      r.reported_item_type,
      r.reported_item_id,
      r.reason,
      r.status,
      r.created_at,
      r.admin_notes,
      r.action_taken,
      reporter.id AS reporter_id,
      reporter.name AS reporter_name,
      reporter.login AS reporter_email
    FROM public.report r
    JOIN public."userTable" reporter ON r.reporter_id = reporter.id
    WHERE r.report_id = $1
  `;
  
  const result = await executeSQLQuery(query, [reportId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const report = result.rows[0];
  
  // Get additional details based on the reported item type
  let itemDetails = null;
  
  switch (report.reported_item_type) {
    case 'job': {
      const jobQuery = `
        SELECT 
          j."jobId", 
          j."jobTitle",
          j."companyName",
          j.email AS poster_email,
          u.id AS poster_id,
          u.name AS poster_name
        FROM public."jobTable" j
        JOIN public."userTable" u ON j.email = u.login
        WHERE j."jobId" = $1
      `;
      const jobResult = await executeSQLQuery(jobQuery, [report.reported_item_id]);
      if (jobResult.rows.length > 0) {
        itemDetails = jobResult.rows[0];
      }
      break;
    }
    case 'user': {
      const userQuery = `
        SELECT 
          id,
          name,
          login AS email,
          "registerType",
          is_verified
        FROM public."userTable"
        WHERE id = $1
      `;
      const userResult = await executeSQLQuery(userQuery, [report.reported_item_id]);
      if (userResult.rows.length > 0) {
        itemDetails = userResult.rows[0];
      }
      break;
    }
    case 'blog': {
      const blogQuery = `
        SELECT 
          "blogId",
          "blogTitle",
          "blogAuthor"
        FROM public."blogTable"
        WHERE "blogId" = $1
      `;
      const blogResult = await executeSQLQuery(blogQuery, [report.reported_item_id]);
      if (blogResult.rows.length > 0) {
        itemDetails = blogResult.rows[0];
      }
      break;
    }
  }
  
  return {
    ...report,
    item_details: itemDetails
  };
};

export const updateReportStatus = async (
  reportId: number, 
  status: 'pending' | 'resolved' | 'under_review',
  adminNotes?: string,
  actionTaken?: string
) => {
  const query = `
    UPDATE public.report
    SET 
      status = $2,
      admin_notes = COALESCE($3, admin_notes),
      action_taken = COALESCE($4, action_taken)
    WHERE report_id = $1
    RETURNING report_id, status, admin_notes, action_taken
  `;
  
  const result = await executeSQLQuery(query, [
    reportId,
    status,
    adminNotes || null,
    actionTaken || null
  ]);
  
  return result.rows[0];
};

export const getAllReports = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  itemType?: string
): Promise<PaginatedReportsResult> => {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      r.report_id,
      r.reported_item_type,
      r.reported_item_id,
      r.reason,
      r.status,
      r.created_at,
      r.action_taken,
      u.name AS reporter_name,
      u.login AS reporter_email
    FROM public.report r
    JOIN public."userTable" u ON r.reporter_id = u.id
  `;
  
  const conditions: string[] = [];
  const params: any[] = [];
  
  if (status) {
    conditions.push(`r.status = $${params.length + 1}`);
    params.push(status);
  }
  
  if (itemType) {
    conditions.push(`r.reported_item_type = $${params.length + 1}`);
    params.push(itemType);
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  query += `
    ORDER BY 
      CASE WHEN r.status = 'pending' THEN 0
           WHEN r.status = 'under_review' THEN 1
           ELSE 2
      END,
      r.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  const countQuery = `
    SELECT COUNT(*) 
    FROM public.report r
    ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
  `;
  
  params.push(limit, offset);
  
  const [reportsResult, countResult] = await Promise.all([
    executeSQLQuery(query, params),
    executeSQLQuery(countQuery, params.slice(0, -2))
  ]);
  
  return {
    data: reportsResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit)
  };
};



export const handleContentRemoval = async (report: any, adminNotes: string) => {
  try {
    console.log(`[handleContentRemoval] Starting content removal for report:`, report);
    
    // Get the item title and creator email BEFORE deleting content
    let itemTitle = '';
    let creatorEmail = null;
    
    if (report.reported_item_type === 'blog') {
      console.log(`[handleContentRemoval] Fetching blog details for ID: ${report.reported_item_id}`);
      const blog = await executeSQLQuery(
        'SELECT "blogTitle", "authorId" FROM public."blogTable" WHERE "blogId" = $1',
        [report.reported_item_id]
      );
      if (blog.rows[0]) {
        itemTitle = blog.rows[0].blogTitle;
        console.log(`[handleContentRemoval] Found blog title: ${itemTitle}`);
        
        // Get author email
        const author = await executeSQLQuery(
          'SELECT login FROM public."userTable" WHERE id = $1',
          [blog.rows[0].authorId]
        );
        creatorEmail = author.rows[0]?.login;
        console.log(`[handleContentRemoval] Found blog author email: ${creatorEmail}`);
      }
    } else if (report.reported_item_type === 'job') {
      console.log(`[handleContentRemoval] Fetching job details for ID: ${report.reported_item_id}`);
      const job = await executeSQLQuery(
        'SELECT "jobTitle", email FROM public."jobTable" WHERE "jobId" = $1',
        [report.reported_item_id]
      );
      if (job.rows[0]) {
        itemTitle = job.rows[0].jobTitle;
        creatorEmail = job.rows[0].email;
        console.log(`[handleContentRemoval] Found job title: ${itemTitle}, creator email: ${creatorEmail}`);
      }
    }

    if (!creatorEmail) {
      console.error(`[handleContentRemoval] No creator email found for ${report.reported_item_type} ID: ${report.reported_item_id}`);
    }

    // Now delete the content
    console.log(`[handleContentRemoval] Deleting ${report.reported_item_type} with ID: ${report.reported_item_id}`);
    switch (report.reported_item_type) {
      case 'blog':
        await executeSQLQuery(
          'DELETE FROM public."blogTable" WHERE "blogId" = $1',
          [report.reported_item_id]
        );
        break;

      case 'job':
        await executeSQLQuery(
          'DELETE FROM public."jobTable" WHERE "jobId" = $1',
          [report.reported_item_id]
        );
        break;
    }

    // Send notification to creator if email was found
    if (creatorEmail) {
      console.log(`[handleContentRemoval] Sending content removed email to: ${creatorEmail}`);
      try {
        await sendContentRemovedEmail(
          creatorEmail,
          report.reported_item_type,
          itemTitle,
          adminNotes
        );
        console.log(`[handleContentRemoval] Email sent successfully to ${creatorEmail}`);
      } catch (emailError) {
        console.error(`[handleContentRemoval] Failed to send email to ${creatorEmail}:`, emailError);
      }
    } else {
      console.warn('[handleContentRemoval] No creator email available, skipping notification');
    }
  } catch (error) {
    console.error("[handleContentRemoval] Error during content removal:", error);
    throw new Error("Échec de la suppression du contenu");
  }
}
export const handleUserWarning = async (report: any, adminNotes: string) => {
  try {
    console.log(`[handleUserWarning] Starting user warning for report:`, report);
    
    
    let itemTitle = '';
    let creatorEmail = null;
    let itemType = '';

    if (report.reported_item_type === 'blog') {
      const blog = await executeSQLQuery(
        'SELECT "blogTitle", "authorId" FROM public."blogTable" WHERE "blogId" = $1',
        [report.reported_item_id]
      );
      if (blog.rows[0]) {
        itemTitle = blog.rows[0].blogTitle;
        itemType = 'publication'; // Modification ici
        const author = await executeSQLQuery(
          'SELECT login FROM public."userTable" WHERE id = $1',
          [blog.rows[0].authorId]
        );
        creatorEmail = author.rows[0]?.login;
      }
    } 
    else if (report.reported_item_type === 'job') {
      const job = await executeSQLQuery(
        'SELECT "jobTitle", email FROM public."jobTable" WHERE "jobId" = $1',
        [report.reported_item_id]
      );
      if (job.rows[0]) {
        itemTitle = job.rows[0].jobTitle;
        itemType = 'offre d\'emploi'; // Modification ici
        creatorEmail = job.rows[0].email;
      }
    }
    else if (report.reported_item_type === 'user') {
      console.log(`[handleUserWarning] Fetching user details for ID: ${report.reported_item_id}`);
      const user = await executeSQLQuery(
        'SELECT login FROM public."userTable" WHERE id = $1',
        [report.reported_item_id]
      );
      if (user.rows[0]) {
        creatorEmail = user.rows[0].login;
        itemType = 'user';
        console.log(`[handleUserWarning] Found user email: ${creatorEmail}`);
      }
    }

    if (!creatorEmail) {
      console.error(`[handleUserWarning] No creator email found for ${report.reported_item_type} ID: ${report.reported_item_id}`);
      return;
    }

    // Send warning email
    console.log(`[handleUserWarning] Sending warning email to: ${creatorEmail}`);
    try {
      await sendUserWarningEmail(
        creatorEmail,
        itemType,
        itemTitle,
        adminNotes
      );
      console.log(`[handleUserWarning] Warning email sent successfully to ${creatorEmail}`);
    } catch (emailError) {
      console.error(`[handleUserWarning] Failed to send email to ${creatorEmail}:`, emailError);
    }
  } catch (error) {
    console.error("[handleUserWarning] Error during user warning:", error);
    throw new Error("Échec de l'envoi de l'avertissement");
  }
}
export const handleAccountSuspension = async (report: any, adminNotes: string, adminId: number) => {
  if (report.reported_item_type !== 'user') return;

  // Bannissement de l'utilisateur
  await executeSQLQuery(
    'UPDATE public."userTable" SET is_banned = true, banned_reason = $1 WHERE id = $2',
    [adminNotes, report.reported_item_id]
  );


  // Notification
  const user = await executeSQLQuery(
    'SELECT login FROM public."userTable" WHERE id = $1',
    [report.reported_item_id]
  );

  if (user.rows[0]?.login) {
    await sendAccountSuspendedEmail(
      user.rows[0].login,
      adminNotes
    );
  }
}
export const getCreatorEmail = async (itemType: string, itemId: number): Promise<string | null> => {
  try {
    console.log(`[getCreatorEmail] Getting creator email for ${itemType} ID: ${itemId}`);
    
    let query: string;
    let params: any[] = [itemId];
    
    switch (itemType) {
      case 'blog':
        query = `
          SELECT u.login 
          FROM public."blogTable" b
          JOIN public."userTable" u ON b."authorId" = u.id
          WHERE b."blogId" = $1
        `;
        break;

      case 'job':
        query = `
          SELECT j.email, u.login AS user_email
          FROM public."jobTable" j
          LEFT JOIN public."userTable" u ON j.email = u.login
          WHERE j."jobId" = $1
        `;
        break;

      default:
        console.log(`[getCreatorEmail] Unsupported item type: ${itemType}`);
        return null;
    }

    const result = await executeSQLQuery(query, params);
    
    if (itemType === 'job' && result.rows[0]) {
      // Prioriser l'email du user s'il existe, sinon utiliser l'email direct du job
      const email = result.rows[0].user_email || result.rows[0].email;
      console.log(`[getCreatorEmail] Found job creator email: ${email}`);
      return email;
    }
    
    const email = result.rows[0]?.login || null;
    console.log(`[getCreatorEmail] Found ${itemType} creator email: ${email}`);
    return email;
  } catch (error) {
    console.error("[getCreatorEmail] Error fetching creator email:", error);
    return null;
  }
}