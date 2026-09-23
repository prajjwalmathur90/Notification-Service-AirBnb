import z from "zod";

export const notificationSchema = z.object({
  to: z.string(),
  subject: z.string(),
  templateId: z.string(),
  params: z.record(z.string(), z.any()),
});

export type NotificationDto = z.infer<typeof notificationSchema>;
