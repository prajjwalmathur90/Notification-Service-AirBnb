import { serverConfig } from "../config";
import logger from "../config/logger.config";
import transporter from "../config/mailer.config";
import { internalServerError } from "../utils/errors/app.error";

export async function sendMail(to: string, subject: string, body: string) {
  try {
    transporter.sendMail({
      from: serverConfig.MAIL_USER,
      to,
      subject,
      html: body,
    });

    logger.info(`Email sent successfully to : ${to} with subject : ${subject}`);
  } catch (error) {
    throw internalServerError("Failed to send email");
  }
}
