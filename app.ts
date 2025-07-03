import express from 'express';
import './connexion'; 
import soumissionRouter from './routes/auth.route';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());


app.use('/api', soumissionRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});