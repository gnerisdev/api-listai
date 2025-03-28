import express from 'express';
import cors from 'cors';
import routeUsers from './routes/users/main.js';
import routeAdmin from './routes/admin/main.js';
import routGuests from './routes/guests/main.js';
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
    this.app.use('/api/admin', routeAdmin);
    this.app.use('/api/users', routeUsers);
    this.app.use('/api/guests', routGuests);
  }
}

export default Server;
