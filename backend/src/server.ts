import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import protectedRoutes from '../src/routes/protected';
import authentocationRoutes from './modules/authentication/authentication.routes';
import { errorHandler } from "./middlewares/error.middleware";

import http from "http";
import { verifyToken } from './utils/verifyToken';
import { registerSocketEvents } from './socket/events';
import { initSocket } from './socket';
import * as cookie from "cookie";

dotenv.config();

const PORT = Number(process.env.PORT) || 5006;

const app = express();

// create HTTP server
const server = http.createServer(app);

// initialize socket
const io = initSocket(server);

// allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_LAN_URL,
].filter(Boolean) as string[];

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

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

// routes
app.use('/authentication', authentocationRoutes);
app.use('/api', protectedRoutes);

// error handler
app.use(errorHandler);

io.use((socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("No cookies found"));
    }

    const parsed = cookie.parse(rawCookie);
    const token = parsed.access_token;

    if (!token) {
      return next(new Error("No token found"));
    }

    const user = verifyToken(token);

    if (!user) {
      return next(new Error("Invalid token"));
    }

    socket.data.user = user;

    next();
  } catch (err) {
    console.log("Socket auth failed:", err);
    next(new Error("Authentication error"));
  }
});

registerSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});