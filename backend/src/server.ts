import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import protectedRoutes from '../src/routes/protected';
import authentocationRoutes from './modules/authentication/authentication.routes';
import { errorHandler } from "./middlewares/error.middleware";

const PORT = Number(process.env.PORT) || 5000;

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_LAN_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools (Postman)

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/authentication', authentocationRoutes);

// protected routes
app.use('/api', protectedRoutes);

app.use(errorHandler);

app.listen(5006, () => {
  console.log('Server running on port 5006');
});