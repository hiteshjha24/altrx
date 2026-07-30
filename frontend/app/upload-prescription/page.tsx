"use client";

import React, { useState } from "react";
const UploadPrescription = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    // TODO: Connect to your prescription processing / OCR API endpoint here
    setTimeout(() => {
      setIsUploading(false);
      alert('Prescription uploaded successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white px-8 py-12 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
            Upload Your <span className="text-[#00e599]">Prescription</span>
          </h1>
          <p className="text-gray-400">
            Upload a clear image or PDF of your prescription to find alternate medicines with exact active ingredients.
          </p>
        </div>

        {/* Upload Form Area */}
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-gray-700 hover:border-[#00e599] transition-colors rounded-xl p-8 text-center bg-[#121212] cursor-pointer relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-gray-900 rounded-full text-[#00e599]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop to Upload'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG or PDF (Max 10MB)</p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {previewUrl && selectedFile && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg flex items-center justify-between border border-gray-800">
              <span className="text-sm text-gray-300 truncate max-w-xs">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-200 shadow-lg ${
              !selectedFile || isUploading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-[#00e599] hover:bg-[#00c784] text-black shadow-[#00e599]/20'
            }`}
          >
            {isUploading ? 'Processing Prescription...' : 'Upload & Analyze'}
          </button>
        </form>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-around text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="text-[#00e599]">✓</span> 100% Secure & Private
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00e599]">✓</span> AI-Powered Detection
          </span>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;