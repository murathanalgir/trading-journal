import mongoose, { Document, Schema, Types } from "mongoose";

export interface IJournalEntry extends Document {
  user: Types.ObjectId;
  date: Date;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  tags: string[];
  notes: string;
  createdAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  user:       { type: Schema.Types.ObjectId, ref: "User", required: true },
  date:       { type: Date,   required: true },
  symbol:     { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice:  { type: Number, required: true },
  quantity:   { type: Number, required: true },
  pnl:        { type: Number, required: true },
  tags:       { type: [String], default: [] },
  notes:      { type: String, default: "" },
  createdAt:  { type: Date,     default: Date.now }
});

export const JournalEntry = mongoose.model<IJournalEntry>("JournalEntry", JournalEntrySchema);
