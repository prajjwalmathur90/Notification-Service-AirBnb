import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { internalServerError } from "../utils/errors/app.error";

export async function renderMailTemplate(
  templateId: string,
  params: Record<string, any>,
): Promise<string> {
  const templatePath = path.join(__dirname, "mailer", `${templateId}.hbs`);

  try {
    const content = await fs.readFile(templatePath, "utf-8");
    const finalContent = Handlebars.compile(content);
    return finalContent(params);
  } catch (error) {
    throw internalServerError("Template not found!");
  }
}
