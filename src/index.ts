import "dotenv/config";
import app from "./app";
import logger from "#configs/logger";

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`, { port });
});
