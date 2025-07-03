"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { api } from "../lib/api";

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Başta tüm tag’leri yükle
  useEffect(() => {
    api<{ tags: string[] }>("/journals/tags", "GET")
      .then((res) => setAllTags(res.tags))
      .catch(() => {});
  }, []);

  // Input’a göre öneri filtrele
  useEffect(() => {
    const filtered = allTags
      .filter((t) =>
        t.toLowerCase().includes(input.toLowerCase()) && !selected.includes(t)
      )
      .slice(0, 5);
    setSuggestions(filtered);
  }, [input, allTags, selected]);

  const addTag = (tag: string) => {
    onChange([...selected, tag]);
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-1">
        {selected.map((t) => (
          <span
            key={t}
            className="flex items-center bg-gray-200 px-2 py-1 rounded"
          >
            {t}
            <button
              onClick={() => removeTag(t)}
              className="ml-1 text-red-500 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Tag ekle…"
        className="w-full p-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-32 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s}
              onClick={() => addTag(s)}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
