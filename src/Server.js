import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/usersRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guestsRoutes from './routes/guestsRoutes.js';
import webhooksRoutes from './routes/webhooksRoutes.js';
import { startAllJobs } from './jobs/index.js';
import { PORT } from './environments/index.js';

class Server {
  constructor() {
    this.app = express();
  }

  async start() {
    try {
      this.config();
      this.route();

      startAllJobs();
      
      this.app.listen(PORT, () => console.log(`Serve on: ${PORT}`));
    } catch (error) {
      console.error('Erro server:', error);
    }
  }

  config() {
    this.app.use(express.json({ extended: false }));
    this.app.use(cors());
  }

  route() {
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/guests', guestsRoutes);
    this.app.use('/api/webhook', webhooksRoutes);
  }
}

export default Server;
