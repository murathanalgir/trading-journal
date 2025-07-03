"use client";

import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold hover:underline">
            Journal
          </Link>
          <Link href="/journals/new" className="hover:underline">
            Yeni Giriş
          </Link>
          <Link href="/analytics" className="hover:underline">
            Analiz
          </Link>
          <Link href="/journals/import" className="hover:underline">
            CSV İçe Aktar
          </Link>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Çıkış
        </button>
      </div>
    </nav>
  );
}
