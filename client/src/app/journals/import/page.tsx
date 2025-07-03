import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";

export default function ImportCsvPage() {
  const { token, logout } = useContext(AuthContext);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Lütfen bir CSV dosyası seç   ");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/journals/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSuccess(`Başarıyla ${data.importedCount} giriş yüklendi   !`);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      if (err.message.includes("401")) logout();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-4 shadow rounded">
      <h2 className="text-xl font-bold mb-4">CSV İçe Aktar   </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "CSV Yükle"}
        </button>
      </form>
    </div>
  );
}