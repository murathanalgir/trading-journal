"use client"; // ← BUNU EKLE

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../lib/api";
import TagSelector from "@/app/components/TagSelector";


export default function NewEntryPage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [form, setForm] = useState({
    date: "",
    symbol: "",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    pnl: "",
    tags: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const body = {
        date: form.date,
        symbol: form.symbol,
        entryPrice: Number(form.entryPrice),
        exitPrice: Number(form.exitPrice),
        quantity: Number(form.quantity),
        pnl: Number(form.pnl),
        tags: form.tags.split(",").map((t) => t.trim()),
        notes: form.notes,
      };
      await api("/journals", "POST", body, token!);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Kaydetme sırasında hata oldu");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-4 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Yeni Journal Girişi </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Sembol"
          value={form.symbol}
          onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Entry Price"
          value={form.entryPrice}
          onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Exit Price"
          value={form.exitPrice}
          onChange={(e) => setForm({ ...form, exitPrice: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="PnL"
          value={form.pnl}
          onChange={(e) => setForm({ ...form, pnl: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Tags (virgülle ayır)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <div>
          <label className="block mb-1">Etiketler</label>
          <TagSelector selected={tags} onChange={setTags} />
        </div>
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
