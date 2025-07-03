// app/not-found.js
'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h1>
      <p className="mb-6">Üzgünüm, aradığın sayfa yok gibi görünüyor.</p>
      <button
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Anasayfaya Git
      </button>
    </div>
  );
}
