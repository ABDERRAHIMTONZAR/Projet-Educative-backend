import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Connexion à ta base de données
import './connexion';

// Importation des routes (ex: /api/login, etc.)
import soumissionRouter from './routes/auth.route';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Route d'accueil
app.get('/', (req: Request, res: Response) => {
  res.send('✅ Backend éducatif TypeScript + Express opérationnel !');
});

// Route API principale
app.use('/api', soumissionRouter);

// Lancement du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
