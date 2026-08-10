import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import employeeRoutes from './routes/employeeRoutes';
import challanRoutes from './routes/challanRoutes';
import productRoutes from './routes/productRoutes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
