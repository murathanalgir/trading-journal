// src/app/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "./context/AuthContext";
import { api } from "./lib/api";

interface Journal {
  _id: string;
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  tags: string[];
}

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre state
  const [symbolFilter, setSymbolFilter] = useState("");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState("");

  // Verileri fetch et: hem ilk yüklemede hem de filtre değiştiğinde
  useEffect(() => {
    if (!token) {
      logout();
      return;
    }
    setLoading(true);
    // Query string oluştur
    const params = new URLSearchParams();
    if (symbolFilter) params.append("symbol", symbolFilter);
    if (startFilter) params.append("startDate", startFilter);
    if (endFilter) params.append("endDate", endFilter);
    if (tagsFilter) params.append("tags", tagsFilter);
    api<{ journals: Journal[] }>(
      `/journals?${params.toString()}`,
      "GET",
      null,
      token
    )
      .then((res) => setJournals(res.journals))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token, logout, symbolFilter, startFilter, endFilter, tagsFilter]);
  const handleDelete = async (id: string) => {
    if (!confirm("Bu girişi silmek istediğine emin misin?")) return;
    try {
      await api(`/journals/${id}`, "DELETE", null, token!);
      setJournals(prev => prev.filter(j => j._id !== id));
    } catch {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Yükleniyor ...
      </div>
    );
  }
  

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trading Journal </h1>
        <div>
          <Link
            href="/journals/import"
            className="mr-3 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            CSV İçe Aktar
          </Link>
          <Link
            href="/journals/new"
            className="mr-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Yeni Giriş
          </Link>
          <Link href="/analytics" className="hover:underline">
            Analiz
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Çıkış
          </button>
        </div>
      </header>

      {/* Filtre formu */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4  p-4 rounded">
        <input
          type="text"
          placeholder="Sembol (ör. AAPL)"
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={startFilter}
          onChange={(e) => setStartFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endFilter}
          onChange={(e) => setEndFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Etiketler (virgülle)"
          value={tagsFilter}
          onChange={(e) => setTagsFilter(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Liste */}
      {journals.length === 0 ? (
        <p className="text-center text-gray-600">Hiç giriş yok .</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="">
              {[
                "Tarih",
                "Sembol",
                "Entry",
                "Exit",
                "PnL",
                "Etiketler",
                "İşlemler",
              ].map((h) => (
                <th key={h} className="border px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {journals.map((j) => (
              <tr key={j._id} className="hover:bg-black-50">
                <td className="border px-3 py-1">
                  {new Date(j.date).toLocaleDateString("tr-TR")}
                </td>
                <td className="border px-3 py-1">{j.symbol}</td>
                <td className="border px-3 py-1">{j.entryPrice}</td>
                <td className="border px-3 py-1">{j.exitPrice}</td>
                <td
                  className={`border px-3 py-1 font-medium ${
                    j.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {j.pnl}
                </td>
                <td className="border px-3 py-1">{j.tags.join(", ")}</td>
                <td className="border px-3 gap-1 py-1">
                  <button
                  onClick={() => handleDelete(j._id)}
                  className="text-red-500 hover:underline"
                >
                  Sil
                </button>
                  <Link
                    href={`/journals/${j._id}/edit`}
                    className="text-blue-500 hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
