import { Job, Worker } from "bullmq";
import { NotificationDto } from "../dtos/notification.dto";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnectionObj } from "../config/redis.config";
import { MAILER_PAYLOAD } from "../producers/email.producer";
import { renderMailTemplate } from "../templates/templates.handler";
import { sendMail } from "../services/mailer.service";
import logger from "../config/logger.config";

export const setupMailerWorker = () => {
  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job: Job) => {
      if (job.name !== MAILER_PAYLOAD) {
        throw new Error("Invalid job");
      }

      const payload = job.data;

      const emailContent = await renderMailTemplate(
        payload.templateId,
        payload.params,
      );

      await sendMail(payload.to, payload.subject, emailContent);

      logger.info(
        `Email to ${payload.to} processed successfully with subject : ${payload.subject}`,
      );
    },
    {
      connection: getRedisConnectionObj(),
    },
  );

  emailProcessor.on("failed", () => {
    console.log("Email processing failed");
  });

  emailProcessor.on("completed", () => {
    console.log("Email processed successfully");
  });
};
