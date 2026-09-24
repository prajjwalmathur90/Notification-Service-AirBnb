import express from "express";
import { serverConfig } from "./config";
import v1Router from "./routers/v1/index.router";
import v2Router from "./routers/v2/index.router";
import { genericErrorHandler } from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { routeNotFound } from "./middlewares/route-not-found.middleware";
import { setupMailerWorker } from "./processors/email.processor";
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

/**
 * Add the error handler middleware
 */
app.use(routeNotFound);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  setupMailerWorker();
  logger.info("Mailer worker has been initialized");
});
