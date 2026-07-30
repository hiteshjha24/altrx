'use client';
import React, { useState, useEffect } from 'react';
import { Suspense } from "react";
import SearchContent from "./SearchContent";

interface Medicine {
  id?: string;
  name?: string;
  medicine_name?: string;
  price?: number | string;
  manufacturer?: string;
  brand?: string;
  composition?: string;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}