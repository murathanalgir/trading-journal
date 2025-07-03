import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "En az 3 karakter olmalı"),
  email:    z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "En az 6 karakter olmalı"),
});

export const loginSchema = z.object({
  email:    z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "En az 6 karakter olmalı"),
});

export const journalSchema = z.object({
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı YYYY-AA-GG olmalı"),
  symbol:     z.string().min(1, "Sembol boş olamaz"),
  entryPrice: z.number().positive("Entry fiyatı pozitif olmalı"),
  exitPrice:  z.number().positive("Exit fiyatı pozitif olmalı"),
  quantity:   z.number().int().positive("Adet pozitif tam sayı olmalı"),
  pnl:        z.number(),
  tags:       z.array(z.string()).optional(),
  notes:      z.string().optional(),
});
