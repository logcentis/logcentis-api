import { env } from '@/common/utils/envConfig';
import logger from '@/common/utils/logger';
import app from '@/server';
import fs from 'fs';
import https from 'https';
import path from 'path';

// TODO: Test purpose only, remove later
if (env.isDevelopment) {
  const key = fs.readFileSync(path.join(__dirname, '../certs/server.key'));
  const cert = fs.readFileSync(path.join(__dirname, '../certs/server.cert'));

  https.createServer({ key, cert }, app).listen(env.PORT + 1, () => {
    const { NODE_ENV, HOST, PORT } = env;
    logger.info(
      `HTTPS Server (${NODE_ENV}) running on port https://${HOST}:${PORT + 1}`
    );
  });
}

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
