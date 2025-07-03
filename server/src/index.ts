// server/src/index.ts
import express from "express";  
import cors from "cors";  
import mongoose from "mongoose";  
import dotenv from "dotenv";  
import "./models/User";
import "./models/JournalEntry";
import authRouter from "./routes/auth";
import journalsRouter from "./routes/journals";


dotenv.config();  

const app = express();  
const PORT = process.env.PORT || 5000;  
const MONGODB_URI = process.env.MONGODB_URI!;  

// Middleware  
app.use(cors({ origin: process.env.CORS_ORIGIN }));  
app.use(express.json());
app.use("/api/auth", authRouter);  
app.use("/api/journals", journalsRouter);


// MongoDB bağlantısı  
mongoose.connect(MONGODB_URI)  
  .then(() => console.log("🗄️ MongoDB’ye bağlandı  "))  
  .catch(err => console.error("❌ MongoDB bağlantı hatası:", err));  

// Basit health-check endpoint  
app.get("/api/health", (_req, res) => {  
  res.json({ status: "OK", timestamp: new Date() });  
});  

app.listen(PORT, () => {  
  console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}  `);  
});  
