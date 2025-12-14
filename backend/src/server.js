import * as dotenv from 'dotenv'

dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import groupRoutes from './routes/group.route.js';
import participantRoutes from './routes/participant.route.js';
import { connectDB } from './utils/db.util.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_URL, "https://localhost:5173"], // TODO: Remove localhost
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/participants", participantRoutes);
app.use("/api/groups", groupRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
