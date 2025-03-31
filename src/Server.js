import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/usersRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guestsRoutes from './routes/guestsRoutes.js';
import { PORT } from './environments/index.js';
import './settings/cloudinary.js';
import './settings/database.js';

class Server {
  app = express();

  async start() {
    try {
      this.config();
      this.route();

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
  }
}

export default Server;
