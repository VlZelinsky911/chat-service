import cors from "cors";

export const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
