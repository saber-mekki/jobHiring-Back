import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  template: 'verification' | 'content-removed' | 'user-warning' | 'account-suspended' | 'generic';
  data: {
    [key: string]: any;
  };
}

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'production', // Désactivé seulement en développement
  },
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
  connectionTimeout: 10000,
  socketTimeout: 30000,
});

// Templates d'emails
const emailTemplates: Record<string, (data: any) => EmailTemplate> = {
  'verification': (data) => ({
    subject: 'Vérifiez votre adresse email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">FindJob</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #2563eb;">Bienvenue sur FindJob!</h2>
          <p>Merci pour votre inscription. Veuillez vérifier votre email en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
               text-decoration: none; border-radius: 5px; font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          
          <p>Ou copiez-collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
            ${data.verificationUrl}
          </p>
          
          <p style="font-size: 12px; color: #6b7280;">
            Ce lien expirera dans 24 heures. Si vous n'avez pas demandé cette vérification, 
            vous pouvez ignorer cet email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} FindJob. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: `Bienvenue sur FindJob!\n\nMerci pour votre inscription. Veuillez vérifier votre email en visitant ce lien :\n${data.verificationUrl}\n\nCe lien expirera dans 24 heures.`
  }),

  'content-removed': (data) => ({
    subject: `Votre ${data.itemType} a été supprimé`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Notification de modération</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #dc2626;">Contenu supprimé</h2>
          <p>Votre ${data.itemType} <strong>"${data.itemTitle}"</strong> a été supprimé par notre équipe de modération.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Raison :</h3>
            <p>${data.adminNotes}</p>
          </div>

          <p>Si vous pensez qu'il s'agit d'une erreur, vous pouvez contacter notre support à l'adresse <a href="mailto:support@findjob.com">support@findjob.com</a>.</p>
          
          <p style="font-size: 12px; color: #6b7280;">
            Ceci est une notification automatique. Veuillez ne pas répondre à cet email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} FindJob. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: `Notification de modération\n\nVotre ${data.itemType} "${data.itemTitle}" a été supprimé.\n\nRaison: ${data.adminNotes}\n\nSi vous pensez qu'il s'agit d'une erreur, contactez notre support à support@findjob.com.`
  }),

  'user-warning': (data) => ({
  subject: `Avertissement officiel`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #d97706; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Avertissement</h1>
      </div>
      
      <div style="padding: 20px;">
        <h2 style="color: #d97706;">Avertissement de modération</h2>
        ${data.itemType && data.itemTitle ? `
          <p>Votre ${data.itemType} <strong>"${data.itemTitle}"</strong> a reçu un avertissement.</p>
        ` : '<p>Vous avez reçu un avertissement officiel de notre équipe de modération.</p>'}
        
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">Détails :</h3>
          <p>${data.adminNotes}</p>
        </div>

        <p>Veuillez respecter nos <a href="${process.env.FRONTEND_URL}/terms">conditions d'utilisation</a> pour éviter des mesures supplémentaires.</p>
        
        <p style="font-size: 12px; color: #6b7280;">
          Ceci est une notification automatique. Veuillez ne pas répondre à cet email.
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} FindJob. Tous droits réservés.</p>
      </div>
    </div>
  `,
  text: data.itemType && data.itemTitle ? 
    `Avertissement de modération\n\nVotre ${data.itemType} "${data.itemTitle}" a reçu un avertissement.\n\nRaison: ${data.adminNotes}\n\nVeuillez respecter nos conditions d'utilisation disponibles à ${process.env.FRONTEND_URL}/terms.` 
    : `Avertissement de modération\n\nVous avez reçu un avertissement officiel.\n\nDétails: ${data.adminNotes}\n\nVeuillez respecter nos conditions d'utilisation disponibles à ${process.env.FRONTEND_URL}/terms.`
}),

  'account-suspended': (data) => ({
    subject: `Votre compte a été suspendu`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Suspension de compte</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #dc2626;">Compte suspendu</h2>
          <p>Votre compte FindJob a été suspendu par notre équipe de modération.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">Raison :</h3>
            <p>${data.adminNotes}</p>
          </div>

          <p>Pour faire appel de cette décision ou pour toute question, veuillez contacter notre support à l'adresse <a href="mailto:support@findjob.com">support@findjob.com</a>.</p>
          
          <p style="font-size: 12px; color: #6b7280;">
            Ceci est une notification automatique. Veuillez ne pas répondre à cet email.
          </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} FindJob. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: `Suspension de compte\n\nVotre compte FindJob a été suspendu.\n\nRaison: ${data.adminNotes}\n\nPour faire appel de cette décision, contactez notre support à support@findjob.com.`
  }),

  'generic': (data) => ({
    subject: data.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">FindJob</h1>
        </div>
        
        <div style="padding: 20px;">
          ${data.htmlContent}
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© ${new Date().getFullYear()} FindJob. Tous droits réservés.</p>
        </div>
      </div>
    `,
    text: data.textContent || data.htmlContent.replace(/<[^>]*>/g, '')
  })
};

// Fonction principale pour envoyer des emails
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!options.to || !options.template) {
      throw new Error('Destinataire et template sont requis');
    }

    const template = emailTemplates[options.template](options.data);
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"FindJob" <${from}>`,
      to: options.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Mailer': 'FindJob Mail Service',
        'X-Priority': '1'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email envoyé à ${options.to} [${options.template}] - ID: ${info.messageId}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 URL de prévisualisation:', nodemailer.getTestMessageUrl(info) || 'Non disponible');
    }

    return true;
  } catch (error) {
    console.error(`❌ Échec d'envoi d'email à ${options.to}:`, error);
    throw new Error(
      `Échec d'envoi de l'email: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.BACKEND_URL}/api/v1/users/verify-email/${token}`;
  return sendEmail({
    to: email,
    subject: 'Vérifiez votre adresse email', // Add subject
    template: 'verification',
    data: { verificationUrl }
  });
};

export const sendContentRemovedEmail = async (
  email: string,
  itemType: string,
  itemTitle: string,
  adminNotes: string
) => {
  console.log(`[sendContentRemovedEmail] Preparing email for ${email}`);
  console.log(`[sendContentRemovedEmail] Item type: ${itemType}, Title: ${itemTitle}`);
  console.log(`[sendContentRemovedEmail] Admin notes: ${adminNotes.substring(0, 50)}...`);

  try {
    const result = await sendEmail({
      to: email,
      subject: `Votre ${itemType} a été supprimé`,
      template: 'content-removed',
      data: { itemType, itemTitle, adminNotes }
    });
    console.log(`[sendContentRemovedEmail] Email sent successfully to ${email}`);
    return result;
  } catch (error) {
    console.error(`[sendContentRemovedEmail] Failed to send email to ${email}:`, error);
    throw error;
  }
};

export const sendUserWarningEmail = async (
  email: string,
  itemType: string,
  itemTitle: string,
  adminNotes: string
) => {
  return sendEmail({
    to: email,
    subject: 'Avertissement officiel', // Add subject
    template: 'user-warning',
    data: { adminNotes ,itemType, itemTitle }
  });
};

export const sendAccountSuspendedEmail = async (email: string, adminNotes: string) => {
  return sendEmail({
    to: email,
    subject: 'Votre compte a été suspendu', // Add subject
    template: 'account-suspended',
    data: { adminNotes }
  });
};

export const sendGenericEmail = async (
  email: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) => {
  return sendEmail({
    to: email,
    subject,
    template: 'generic',
    data: { subject, htmlContent, textContent }
  });
};