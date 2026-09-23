import { Job, Worker } from "bullmq";
import { NotificationDto } from "../dtos/notification.dto";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnectionObj } from "../config/redis.config";
import { MAILER_PAYLOAD } from "../producers/email.producer";

export const setupMailerWorker = () => {
  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job: Job) => {
      if (job.name !== MAILER_PAYLOAD) {
        throw new Error("Invalid job");
      }

      // call the service layer from here
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
