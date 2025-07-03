import { AnyZodObject } from "zod";
import { RequestHandler } from "express";

export const validate = (schema: AnyZodObject): RequestHandler => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err: any) {
    return res.status(400).json({ errors: err.errors });
  }
};
