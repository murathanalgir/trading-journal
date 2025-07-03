// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

interface JwtPayload { id: string; }

export interface AuthRequest extends Request {
  user?: { id: string; username: string; email: string };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token bulunamadı" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token geçersiz" });
  }
};
