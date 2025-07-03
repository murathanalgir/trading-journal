// src/app/register/page.tsx
"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { AuthContext } from "../context/AuthContext";
import { api } from "../lib/api";

export default function RegisterPage() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { token, user } = await api<{ token: string; user: any }>(
        "/auth/register",
        "POST",
        form
      );
      login(token, user);
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4 shadow-lg rounded">
      <h1 className="text-2xl font-bold mb-4 text-center">Kayıt Ol  </h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Kayıt Ol  
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Zaten üyeysen{" "}
        <Link href="/login" className="text-blue-500 hover:underline">
          Giriş Yap  
        </Link>
      </p>
    </div>
  );
}
