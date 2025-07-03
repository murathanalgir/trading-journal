// server/src/routes/journals.ts
import express from "express";
import multer from "multer";
import { parse } from "csv-parse";
import { JournalEntry } from "../models/JournalEntry";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { Types } from "mongoose";

const router = express.Router();
// Search
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { symbol, startDate, endDate, tags } = req.query;

    // Temel filtre: sadece kendi kullanıcına ait
    const filter: any = { user: new Types.ObjectId(req.user!.id) };

    // Sembol filtresi (exact match, büyük küçük harf duyarsız)
    if (typeof symbol === "string" && symbol.trim()) {
      filter.symbol = symbol.trim().toUpperCase();
    }

    // Tarih aralığı
    if (typeof startDate === "string" || typeof endDate === "string") {
      filter.date = {};
      if (typeof startDate === "string") {
        filter.date.$gte = new Date(startDate);
      }
      if (typeof endDate === "string") {
        // endDate son günün son anına kadar dahil etmek için
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    // Tag filtresi: tüm tag’leri içermeli
    if (typeof tags === "string" && tags.trim()) {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $all: tagArray };
      }
    }

    const entries = await JournalEntry.find(filter).sort({ date: -1 });
    res.json({ journals: entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


// Analytics endpoint
router.get("/analytics", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user!.id }).sort({ date: 1 });

    // Kümülatif PnL serisi
    let cum = 0;
    const labels = entries.map((e) => e.date.toISOString().slice(0, 10));
    const data = entries.map((e) => {
      cum += e.pnl;
      return cum;
    });

    // Kazanma / kaybetme sayısı
    const wins = entries.filter((e) => e.pnl > 0).length;
    const losses = entries.filter((e) => e.pnl <= 0).length;
    const total = entries.length;
    const winRate = total ? wins / total : 0;

    // Ortalama kazanç / zarar ve risk/ödül oranı
    const avgWin =
      wins > 0
        ? entries.filter((e) => e.pnl > 0).reduce((sum, e) => sum + e.pnl, 0) / wins
        : 0;
    const avgLoss =
      losses > 0
        ? Math.abs(entries.filter((e) => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0) / losses)
        : 0;
    const rrRatio = avgLoss ? avgWin / avgLoss : null;

    res.json({
      chart: { labels, data },
      stats: { wins, losses, total, winRate, avgWin, avgLoss, rrRatio },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Create new entry
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date, symbol, entryPrice, exitPrice, quantity, pnl, tags, notes } =
      req.body;
    const entry = await JournalEntry.create({
      user: req.user!.id,
      date,
      symbol,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      tags,
      notes,
    });
    res.status(201).json({ journal: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Get all entries for current user
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user!.id }).sort({
      date: -1,
    });
    res.json({ journals: entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Get single entry by ID
router.get("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!entry) return res.status(404).json({ message: "Entry bulunamadı" });
    res.json({ journal: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Update entry
router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updated = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Entry bulunamadı" });
    res.json({ journal: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Delete entry
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deleted = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!deleted) return res.status(404).json({ message: "Entry bulunamadı" });
    res.json({ message: "Entry silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
const upload = multer({ storage: multer.memoryStorage() });

// csv import
router.post(
  "/import",
  authMiddleware,
  upload.single("file"),
  async (req: AuthRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "CSV dosyası eksik" });
    }
    const records: any[] = [];
    // buffer’ı string’e çevirip parse et
    parse(req.file.buffer.toString(), {
      columns: true, // header satırı varsa alan isimleri ile eşleştir
      trim: true,
      skip_empty_lines: true,
    })
      .on("readable", function () {
        let record;
        while ((record = this.read())) {
          records.push(record);
        }
      })
      .on("error", (err) => {
        console.error("CSV parse hatası:", err);
        res.status(400).json({ message: "CSV parse hatası" });
      })
      .on("end", async () => {
        try {
          // records içindeki her satırı JournalEntry’e çevir
          const toInsert = records.map((r) => ({
            user: req.user!.id,
            date: new Date(r.date),
            symbol: r.symbol,
            entryPrice: Number(r.entryPrice),
            exitPrice: Number(r.exitPrice),
            quantity: Number(r.quantity),
            pnl: Number(r.pnl),
            tags: r.tags ? r.tags.split(",").map((t: string) => t.trim()) : [],
            notes: r.notes || "",
          }));
          const inserted = await JournalEntry.insertMany(toInsert);
          res
            .status(201)
            .json({ importedCount: inserted.length, journals: inserted });
        } catch (err) {
          console.error("DB insert hatası:", err);
          res.status(500).json({ message: "Sunucu hatası" });
        }
      });
  }
);
export default router;
