import { Request, Response } from "express";
import { 
  addUser, 
  deleteUser, 
  getUser, 
  getUserById,
  updateUser, 
  verifyEmailWithToken,
  generateVerificationToken,
  createReport} from "../../services/users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { PoolClient } from "pg";
import { pool } from "../../database";
import fs from 'fs/promises';
import fsSync from 'fs';
import { extractCvText } from "../uploadController";
import { sendVerificationEmail } from "../../utils/emailSender";
import crypto from 'crypto';

dotenv.config();

// Configuration Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `cv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
};

// Email Verification Controller
export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.params;
  console.log('Verification token received:', token); // Ajoutez ce log

  
  try {
    const result = await verifyEmailWithToken(token);
    console.log('Verification result:', result); // Ajoutez ce log

    
    if (!result.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/verification-error?message=${result.message}`);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/verification-success`);
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/verification-error?message=Erreur serveur`);
  }
};


export const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    console.log(`Tentative de renvoi d'email de vérification pour: ${email}`);
    
    const result = await generateVerificationToken(email);
    const user = await getUser(email); 
    
    if (!result.success) {
      console.error('Échec de génération du token:', result.message);
      return res.status(400).json({ 
        error: true,
        message: result.message 
      });
    }

    if (result.is_verified) {
      console.log('Email déjà vérifié:', email);
      return res.status(400).json({ 
        error: true,
        message: "Email is already verified" 
      });
    }

    console.log('Envoi de l\'email de vérification...');
    await sendVerificationEmail(email, result.verification_token!);
    console.log('Email de vérification envoyé avec succès');

    res.status(200).json({ 
      success: true,
      message: "Verification email resent successfully" 
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de vérification:", error);
    res.status(500).json({ 
      error: true,
      message: error instanceof Error ? error.message : "Server error while resending verification email" 
    });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  const { login, password } = req.body;

  try {
    const user = await getUser(login);
    if (!user) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: true,
        message: "Invalid credentials" 
      });
    }

  
    if (user.registerType === 'recruiter' && !user.is_verified) {
      return res.status(403).json({ 
        error: true,
        message: "Please verify your email before logging in",
        requiresVerification: true
      });
    }

    const token = generateToken(user.id);

    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      registerType: user.registerType,
      image: user.image,
      isVerified: user.is_verified,
      ...(user.registerType === 'recruiter' ? {
        company: {
          name: user.company_name,
          website: user.company_website,
          logo: user.company_logo,
          description: user.company_description,
          industry: user.company_industry,
          size: user.company_size,
          foundedYear: user.company_founded_year,
          linkedin: user.company_linkedin,
          address: user.company_address,
          city: user.company_city,
          state: user.company_state,
          country: user.company_country,
          postalCode: user.company_postal_code
        }
      } : {
        cv: user.cv,
        skills: user.skills,
        experience: user.experience,
        education: user.education
      })
    };

    res.status(200).json({ 
      error: false,
      data: responseData,
      token 
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Convert to integer
    const id = parseInt(userId, 10);
    
    // Validate the ID
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: true,
        message: "Invalid user ID" 
      });
    }

    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      data: user 
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};
export const addUserController = async (req: Request, res: Response) => {
  let client: PoolClient | null = null;
  let cvPath: string | null = null;
  
  try {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const image = files?.image?.[0]?.filename || null;
    const cvFile = files?.cv?.[0];

    let cv = null;
    let cv_embedding = null;

    if (cvFile) {
      cv = cvFile.filename;
      cvPath = path.join(__dirname, '../../uploads', cvFile.filename);
      
      const absolutePath = path.resolve(cvPath);
      if (!fsSync.existsSync(absolutePath)) {
        throw new Error("CV file not found");
      }

      const processingResult = await extractCvText(absolutePath, "temp_user_id");
      if (!processingResult.success) {
        throw new Error(`CV processing failed: ${processingResult.error}`);
      }
      cv_embedding = processingResult.embedding;
    }

    const { 
      login, 
      password, 
      phone, 
      gender, 
      name, 
      registerType,
      company_name,
      company_website,
      company_industry,
      company_size,
      company_founded_year,
      company_linkedin,
      company_address,
      company_city,
      company_state,
      company_country,
      company_postal_code,
      company_description,
      skills, 
      experience, 
      education 
    } = req.body;

    // Validate required fields
    const requiredFields = ["login", "password", "gender", "name", "registerType"];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Missing fields: ${missingFields.join(", ")}`
      });
    }

    // Validate CV for applicants
    if (registerType === "applicant" && !cv) {
      return res.status(400).json({ 
        error: true,
        message: "CV required for applicants" 
      });
    }

    // Check for existing user
    const existingUser = await getUser(login);
    if (existingUser) {
      return res.status(400).json({ 
        error: true,
        message: "User already exists" 
      });
    }

    // Start transaction
    client = await pool.connect();
    await client.query("BEGIN");

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await addUser({
      login,
      password: hashedPassword,
      phone,
      gender,
      name,
      registerType,
      image,
      company_name,
      company_website,
      company_industry,
      company_size,
      company_founded_year,
      company_linkedin,
      company_address,
      company_city,
      company_state,
      company_country,
      company_postal_code,
      company_description,
      cv,
      cv_embedding,
      skills: skills ? JSON.parse(skills) : [],
      experience: experience ? JSON.parse(experience) : {},
      education: education ? JSON.parse(education) : {}
    }, client);

    await client.query("COMMIT");

    // Send verification email for recruiters
    if (registerType === "recruiter" && newUser.verification_token) {
      await sendVerificationEmail(login, newUser.verification_token);
    }

    const token = generateToken(newUser.userId);

    res.status(201).json({
      error: false,
      message: "User created successfully",
      userId: newUser.userId,
      token,
      isVerified: newUser.is_verified,
      requiresVerification: registerType === "recruiter"
    });

  } catch (error) {
    if (cvPath) {
      await fs.unlink(cvPath).catch(console.error);
    }

    if (client) {
      await client.query("ROLLBACK").catch(console.error);
      client.release();
    }

    const errorMessage = error instanceof Error ? error.message : "Server error";
    console.error("Error in addUserController:", error);
    res.status(500).json({ 
      error: true,
      message: errorMessage
    });
  }
};

export const updateCvController = async (req: Request, res: Response) => {
  try {
    const cvFile = req.file;
    const userId = req.user.id;

    if (!cvFile) {
      return res.status(400).json({ 
        error: true,
        message: "CV file is required" 
      });
    }

    const cvPath = path.join(__dirname, '../../uploads', cvFile.filename);
    const processingResult = await extractCvText(cvPath, userId);

    if (!processingResult.success) {
      return res.status(500).json({ 
        error: true,
        message: "CV processing failed",
        details: processingResult.error
      });
    }

    await pool.query(
      `UPDATE applicant 
       SET cv = $1, cv_embedding = $2 
       WHERE user_id = $3`,
      [cvFile.filename, processingResult.embedding, userId]
    );

    res.status(200).json({ 
      error: false,
      message: "CV updated successfully" 
    });
  } catch (error) {
    console.error("Update CV error:", error);
    res.status(500).json({ 
      error: true,
      message: error instanceof Error ? error.message : "Server error" 
    });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const { login } = req.query;

  if (!login) {
    return res.status(400).json({ 
      error: true,
      message: "Login is required" 
    });
  }

  try {
    const deletedUser = await deleteUser(login as string);
    if (!deletedUser) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    res.status(200).json({ 
      error: false,
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: true,
      message: "Server error" 
    });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const files = req.files as { [key: string]: Express.Multer.File[] };
  let client = await pool.connect();
  
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        error: true,
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await getUser(req.params.login);
    
    if (!user) {
      return res.status(404).json({ 
        error: true,
        message: "User not found" 
      });
    }

    if (user.id !== decoded.id) {
      return res.status(403).json({ 
        error: true,
        message: "Forbidden" 
      });
    }

    const updateData: any = {};

    // Handle files
    if (files?.image?.[0]) {
      updateData.image = files.image[0].filename;
    }
    if (files?.cv?.[0]) {
      updateData.cv = files.cv[0].filename;
      const result = await extractCvText(
        path.join(__dirname, "../../uploads", files.cv[0].filename), 
        user.id
      );
      if (!result.success) {
        throw new Error("CV parsing failed");
      }
      updateData.cv_embedding = result.embedding;
    }

    // Handle text fields
    const commonFields = ['password', 'phone', 'gender', 'name'];
    commonFields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    // Handle role-specific fields
    if (user.registerType === 'recruiter') {
      const recruiterFields = [
        'company_name', 'company_website', 'company_industry',
        'company_size', 'company_founded_year', 'company_linkedin',
        'company_address', 'company_city', 'company_state',
        'company_country', 'company_postal_code'
      ];
      
      recruiterFields.forEach(field => {
        if (req.body[field]) {
          updateData[field] = req.body[field];
        }
      });
    } else if (user.registerType === 'applicant') {
      ['skills', 'experience', 'education'].forEach(field => {
        if (req.body[field]) {
          try {
            updateData[field] = typeof req.body[field] === 'string' 
              ? JSON.parse(req.body[field]) 
              : req.body[field];
          } catch (err) {
            throw new Error(`${field} must be valid JSON`);
          }
        }
      });
    }

    await client.query('BEGIN');
    const result = await updateUser(req.params.login, updateData, client);
    await client.query('COMMIT');

    res.status(200).json({ 
      error: false,
      message: "User updated successfully",
      data: result.user 
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error("Update error:", err);
    res.status(500).json({ 
      error: true,
      message: err.message || "Internal server error" 
    });
  } finally {
    client.release();
  }
};
export const createReportController = async (req: Request, res: Response) => {
  try {
    const { reported_item_type, reported_item_id, reason } = req.body;
    
    // Check for required fields
    if (!reported_item_type || !reported_item_id || !reason) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields"
      });
    }
    
    // Get user ID from the authenticated user
    const reporter_id = req.user.id;
    
    const report = await createReport({
      reporter_id,
      reported_item_type,
      reported_item_id,
      reason
    });
    
    res.status(201).json({
      error: false,
      message: "Report submitted successfully",
      data: report
    });
  } catch (error) {
  if (error instanceof Error) {
    res.status(error.message.includes("already reported") ? 400 : 500).json({
      error: error.message,
    });
  } else {
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

};
