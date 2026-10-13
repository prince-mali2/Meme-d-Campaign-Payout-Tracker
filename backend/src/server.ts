import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const app = createApp();
const PORT = parseInt(env.PORT, 10) || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Meme'd Backend running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

start();
