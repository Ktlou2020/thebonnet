"use client";
import { useState, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";

interface Props {
  onUpload: (url: string) => void;
  folder: string;
  label?: string;
  currentUrl?: string;
}

export function ImageUpload({
  onUpload,
  folder,
  label = "Upload photo",
  currentUrl,
}: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, folder }),
        });
        if (res.status === 503) {
          setError("Photo uploads not available yet.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Upload failed. Try again.");
          setLoading(false);
          return;
        }
        const { url } = (await res.json()) as { url: string };
        setPreview(url);
        onUpload(url);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Upload failed.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition hover:border-fire/40 hover:bg-fire/5"
      >
        {preview ? (
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded-xl object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-fire" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
            <span className="text-sm">
              {loading ? "Uploading…" : "Click or drag to upload"}
            </span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
