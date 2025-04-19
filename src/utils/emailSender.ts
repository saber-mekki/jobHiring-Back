import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration plus robuste du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // sandbox.smtp.mailtrap.io
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  secure: process.env.EMAIL_SECURE === 'true',  // false pour Mailtrap
  auth: {
    user: process.env.EMAIL_USER,     // f92ddf6d5f95b8
    pass: process.env.EMAIL_PASSWORD  // 2863ef3fdaca71
  },
  tls: {
    rejectUnauthorized: false
  },
  logger: true,
  debug: true,
  connectionTimeout: 10000, // 10 secondes
  socketTimeout: 30000 // 30 secondes
});
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    console.log(`Tentative d'envoi d'email à: ${email}`);

    const verificationUrl = `${process.env.BACKEND_URL}/api/v1/users/verify-email/${token}`;
          const mailOptions = {
      from: `"JobFinder" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Vérifiez votre adresse email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur FindJob!</h2>
          <p>Merci pour votre inscription. Veuillez vérifier votre email.</p>
          <p style="margin: 25px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; 
               text-decoration: none; border-radius: 5px;">
              Vérifier l'email
            </a>
          </p>
          <p>Lien de vérification :</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p><small>Ce lien expire dans 24 heures</small></p>
        </div>
      `,
      // Ajout d'une version texte pour les clients email qui ne supportent pas HTML
      text: `Bienvenue sur JobFinder!\n\nMerci pour votre inscription. Veuillez vérifier votre email en visitant ce lien:\n${verificationUrl}\n\nCe lien expire dans 24 heures.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message envoyé: %s', info.messageId);
    console.log('URL de prévisualisation: %s', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("Échec d'envoi d'email:", error);
    throw new Error(`Échec d'envoi de l'email de vérification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};