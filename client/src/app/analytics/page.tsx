// src/app/analytics/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { AuthContext } from "../context/AuthContext";
import { api } from "../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsResponse {
  chart: { labels: string[]; data: number[] };
  stats: {
    wins: number;
    losses: number;
    total: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    rrRatio: number | null;
  };
}

export default function AnalyticsPage() {
  const { token, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { logout(); return; }
    api<AnalyticsResponse>("/journals/analytics", "GET", null, token)
      .then(setAnalytics)
      .catch((err) => {
        console.error(err);
        setError("Analiz verisi alınamadı");
      });
  }, [token, logout]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!analytics) return <p>Yükleniyor    ...</p>;

  const { chart, stats } = analytics;

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      <h1 className="text-2xl font-bold">Grafikli Analiz    </h1>

      {/* 1. Kümülatif PnL */}
      <section>
        <h2 className="text-xl mb-2">Kümülatif PnL Zaman Serisi</h2>
        <Line
          data={{
            labels: chart.labels,
            datasets: [
              {
                label: "Kümülatif PnL",
                data: chart.data,
                tension: 0.3,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: "top" } } }}
        />
      </section>

      {/* 2. Win/Loss Oranları */}
      <section>
        <h2 className="text-xl mb-2">Kazanma / Kaybetme Oranı</h2>
        <Pie
          data={{
            labels: ["Kazananlar", "Kaybedenler"],
            datasets: [
              {
                data: [stats.wins, stats.losses],
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
        />
        <p className="mt-2">
          Win Rate: {(stats.winRate * 100).toFixed(1)}% | Avg Win:{" "}
          {stats.avgWin.toFixed(2)} | Avg Loss: {stats.avgLoss.toFixed(2)} | R/R:{" "}
          {stats.rrRatio !== null ? stats.rrRatio.toFixed(2) : "-"}
        </p>
      </section>
    </div>
  );
}
