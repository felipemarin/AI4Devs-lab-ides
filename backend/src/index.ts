import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import candidateRoutes from './routes/candidate.routes';
import path from 'path';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/candidates', candidateRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const port = process.env.PORT || 3010;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
