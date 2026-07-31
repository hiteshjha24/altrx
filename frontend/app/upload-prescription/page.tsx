"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Dna, IndianRupee, LoaderCircle, ScanLine, Search } from "lucide-react";
import { api, type PrescriptionRecognitionResponse } from "@/lib/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function UploadPrescription() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<PrescriptionRecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    setResult(null);
    clearFile();

    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Choose a JPG, JPEG, PNG, or WebP image. PDF prescriptions are not supported yet.");
      event.target.value = "";
      return;
    }
    if (file.size === 0) {
      setError("Choose a non-empty prescription image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Prescription images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.recognizePrescription(selectedFile));
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to analyze this prescription.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          <ArrowLeft size={17} /> Back home
        </Link>

        <section className="rounded-2xl border border-gray-800 bg-[#0a0a0a] p-6 shadow-2xl sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
              Upload Your <span className="text-[#00e599]">Prescription</span>
            </h1>
            <p className="text-gray-400">Upload a clear prescription image and we’ll find matching medicines in the AltRx catalogue.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-700 bg-[#121212] p-8 text-center transition-colors hover:border-[#00e599]">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-gray-900 p-4 text-[#00e599]">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedFile ? selectedFile.name : "Click or drag an image here"}</p>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, or WebP (max 10 MB)</p>
                </div>
              </div>
            </div>

            {previewUrl && selectedFile ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-800 bg-gray-900 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={previewUrl} alt="Prescription preview" className="h-12 w-12 rounded object-cover" />
                  <span className="truncate text-sm text-gray-300">{selectedFile.name}</span>
                </div>
                <button type="button" onClick={clearFile} disabled={isUploading} className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50">Remove</button>
              </div>
            ) : null}

            {error ? <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{error}</p> : null}

            {isUploading ? (
              <div
                role="status"
                aria-live="polite"
                className="overflow-hidden rounded-xl border border-[#00e599]/40 bg-[#00e599]/5 p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00e599]/50 bg-black text-[#00e599]">
                    <span className="absolute inset-0 rounded-full border-2 border-[#00e599]/30 animate-ping" />
                    <ScanLine size={23} className="animate-pulse" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-bold text-white">
                      Analyzing your prescription
                      <LoaderCircle size={17} className="animate-spin text-[#00e599]" aria-hidden="true" />
                    </p>
                    <p className="mt-1 text-sm text-gray-400">Our AI is reading the image and matching medicines. This usually takes 10–15 seconds.</p>
                  </div>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-gray-800" aria-hidden="true">
                  <div className="h-full w-2/3 rounded-full bg-[#00e599] animate-pulse" />
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className={`w-full rounded-xl px-6 py-3.5 font-bold shadow-lg transition-all duration-200 ${
                !selectedFile || isUploading
                  ? "cursor-not-allowed bg-gray-800 text-gray-500"
                  : "bg-[#00e599] text-black shadow-[#00e599]/20 hover:bg-[#00c784]"
              }`}
            >
              {isUploading ? "Reading prescription and searching medicines..." : "Upload & Analyze"}
            </button>
          </form>

          <div className="mt-8 flex justify-around border-t border-gray-800 pt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="text-[#00e599]">✓</span> Processed in memory</span>
            <span className="flex items-center gap-1.5"><span className="text-[#00e599]">✓</span> AI-powered detection</span>
          </div>
        </section>

        {result ? <RecognitionResults result={result} /> : null}
      </div>
    </main>
  );
}

function RecognitionResults({ result }: { result: PrescriptionRecognitionResponse }) {
  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-xl border border-gray-800 bg-[#0a0a0a] p-5">
        <h2 className="font-bold text-white">Recognized medicine names</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.recognizedMedicines.map((medicine) => (
            <span key={medicine} className="rounded-full border border-[#00e599]/40 bg-[#00e599]/10 px-3 py-1 text-sm text-[#8cf3ca]">{medicine}</span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-2xl font-extrabold">Matched medicines</h2>
        {result.matchedMedicines.length === 0 ? (
          <p className="rounded-xl border border-gray-800 bg-[#0a0a0a] p-5 text-gray-400">No catalogue matches were found for the recognized medicines.</p>
        ) : (
          <div className="grid gap-4">
            {result.matchedMedicines.map((medicine) => (
              <article key={medicine.id} className="grid gap-4 rounded-xl border border-gray-800 bg-[#0a0a0a] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h3 className="text-lg font-bold">{medicine.brand_name}</h3>
                  <p className="mt-1 text-sm text-gray-300">{medicine.manufacturer} · {medicine.dosage_form} · {medicine.strength}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-gray-400"><Dna size={16} className="text-[#00e599]" />{medicine.salt_name}</p>
                </div>
                <div className="sm:text-right">
                  <p className="inline-flex items-center text-xl font-black text-[#00e599]"><IndianRupee size={17} />{medicine.price.toFixed(2)}</p>
                  <Link href={`/medicines/${medicine.id}/alternatives`} className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#1998F4] px-3 py-2 text-sm font-bold text-white hover:bg-[#147dc8]">
                    View alternatives <Search size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {result.unmatchedMedicines.length > 0 ? (
        <div className="rounded-xl border border-amber-900/70 bg-amber-950/30 p-5">
          <h2 className="font-bold text-amber-200">Medicines not found</h2>
          <p className="mt-1 text-sm text-amber-100/70">These names were read from the prescription but have no current catalogue match.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.unmatchedMedicines.map((medicine) => <span key={medicine} className="rounded-full border border-amber-700 px-3 py-1 text-sm text-amber-100">{medicine}</span>)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
