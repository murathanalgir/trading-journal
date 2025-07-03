"use client";  // ← Mutlaka en üstte olsun

import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../../context/AuthContext";
import { api } from "../../../lib/api";

export default function EditEntryPage() {
  const { id } = useParams();
  const { token, logout } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState<any>({
    date: "",
    symbol: "",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    pnl: "",
    tags: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      logout();
      return;
    }
    api<{ journal: any }>(`/journals/${id}`, "GET", null, token)
      .then(res => {
        const j = res.journal;
        setForm({
          date: j.date.slice(0,10),
          symbol: j.symbol,
          entryPrice: j.entryPrice.toString(),
          exitPrice: j.exitPrice.toString(),
          quantity: j.quantity.toString(),
          pnl: j.pnl.toString(),
          tags: j.tags.join(","),
          notes: j.notes
        });
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id, token, logout, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api(
        `/journals/${id}`,
        "PUT",
        {
          date: form.date,
          symbol: form.symbol,
          entryPrice: Number(form.entryPrice),
          exitPrice: Number(form.exitPrice),
          quantity: Number(form.quantity),
          pnl: Number(form.pnl),
          tags: form.tags.split(",").map(t => t.trim()),
          notes: form.notes
        },
        token!
      );
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Güncelleme sırasında hata oldu");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor   ...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-4 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Girişi Düzenle   </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Sembol"
          value={form.symbol}
          onChange={e => setForm({ ...form, symbol: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        {/* Diğer alanlar aynı şekilde */}
        <button
          type="submit"
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Güncelle   
        </button>
      </form>
    </div>
  );
}