import * as Brevo from "@getbrevo/brevo";

// Singleton API instances
let transactionalEmailsApi: Brevo.TransactionalEmailsApi | null = null;
let contactsApi: Brevo.ContactsApi | null = null;

function getTransactionalEmailsApi() {
  if (!transactionalEmailsApi) {
    transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
    transactionalEmailsApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );
  }
  return transactionalEmailsApi;
}

function getContactsApi() {
  if (!contactsApi) {
    contactsApi = new Brevo.ContactsApi();
    contactsApi.setApiKey(
      Brevo.ContactsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );
  }
  return contactsApi;
}

interface SendPoliticianEmailParams {
  userName: string;
  userEmail: string;
  politicianEmail: string;
  politicianName: string;
  message: string;
}

export async function sendPoliticianEmail({
  userName,
  userEmail,
  politicianEmail,
  politicianName,
  message,
}: SendPoliticianEmailParams) {
  const api = getTransactionalEmailsApi();

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: `${userName} via ${process.env.BREVO_SENDER_NAME}`,
    email: process.env.BREVO_SENDER_EMAIL!,
  };

  sendSmtpEmail.replyTo = {
    name: userName,
    email: userEmail,
  };

  sendSmtpEmail.to = [
    {
      email: politicianEmail,
      name: politicianName,
    },
  ];

  sendSmtpEmail.subject = "Fråga om marknadshyror";

  // Convert plain text to HTML with line breaks
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">
      ${message.replace(/\n/g, "<br>")}
    </div>
  `;

  sendSmtpEmail.textContent = message;

  sendSmtpEmail.tags = ["politiker-kontakt"];

  const result = await api.sendTransacEmail(sendSmtpEmail);
  return result;
}

interface UpdateContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, string | number | boolean>;
}

export async function updateOrCreateContact({
  email,
  firstName,
  lastName,
  attributes = {},
}: UpdateContactParams) {
  const api = getContactsApi();

  const contactData: Brevo.CreateContact = {
    email,
    attributes: {
      ...attributes,
      ...(firstName && { FIRSTNAME: firstName }),
      ...(lastName && { LASTNAME: lastName }),
    },
    updateEnabled: true, // Update if contact already exists
  };

  try {
    const result = await api.createContact(contactData);
    return result;
  } catch (error: unknown) {
    // Contact might already exist with different attributes
    // In that case, try to update instead
    const err = error as { status?: number };
    if (err.status === 400) {
      const updateData = new Brevo.UpdateContact();
      updateData.attributes = contactData.attributes;
      await api.updateContact(email, updateData);
      return { updated: true };
    }
    throw error;
  }
}
