/**
 * AltRx API Service
 * Centralised fetch wrappers for all backend endpoints.
 * Replace BASE_URL via NEXT_PUBLIC_API_URL env var.
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

// ─── Types ────────────────────────────────────────────────────────────────
export interface SafetyWarning {
  safe: boolean | null;
  note: string;
}

export interface SafetyWarnings {
  pregnancy?: SafetyWarning;
  alcohol?: SafetyWarning;
  driving?: SafetyWarning;
  liver?: SafetyWarning;
  kidneys?: SafetyWarning;
  breastfeed?: SafetyWarning;
  [key: string]: SafetyWarning | undefined;
}

export interface MedicineSummary {
  id: number;
  brand_name: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  pack_size: number;
  pack_unit: string;
  price: number;
  price_per_unit: number;
  is_generic: boolean;
  is_otc: boolean;
  salt_name: string;
  drug_class?: string;
  savings_percentage: number;
  is_cheaper: boolean;
}

export interface MedicineDetail extends MedicineSummary {
  prescription_required: boolean;
  salt_id: number;
  iupac_name?: string;
  primary_uses: string[];
  mechanism?: string;
  side_effects: string[];
  safety_warnings: SafetyWarnings;
  schedule?: string;
}

export interface SearchResultItem {
  id: number;
  brand_name: string;
  manufacturer: string;
  dosage_form: string;
  strength: string;
  price: number;
  price_per_unit: number;
  salt_name: string;
  is_generic: boolean;
  match_score: number;
  alternatives_count: number;
}

export interface SearchResponse {
  query: string;
  results_count: number;
  results: SearchResultItem[];
}

export interface PrescriptionRecognitionResponse {
  success: boolean;
  recognizedMedicines: string[];
  matchedMedicines: SearchResultItem[];
  unmatchedMedicines: string[];
}

export interface AlternativeResponse {
  target: MedicineDetail;
  alternatives_count: number;
  max_savings_percentage: number;
  alternatives: MedicineSummary[];
}

export interface HomeRemedyItem {
  name: string;
  instructions: string;
  why_it_may_help: string;
  precautions: string;
  who_should_avoid: string;
  scientific_explanation: string;
  evidence_summary: string;
  sources: string[];
}

export interface HomeRemedyResponse {
  possible_condition: string;
  explanation: string;
  remedies: HomeRemedyItem[];
  disclaimer: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfileUpdate {
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  const res = await fetch(`${BASE_URL}${cleanPath}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

async function apiFormFetch<T>(path: string, formData: FormData): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${BASE_URL}${cleanPath}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null) as { detail?: string } | null;
    throw new Error(payload?.detail ?? "Unable to analyze this prescription.");
  }
  return res.json() as Promise<T>;
}
// ─── API calls ────────────────────────────────────────────────────────────
export const api = {
  search: (query: string, limit = 10, form?: string): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (form) params.set("form", form);
    return apiFetch<SearchResponse>(`/api/search?${params}`);
  },

  getMedicine: (id: number): Promise<MedicineDetail> =>
    apiFetch<MedicineDetail>(`/api/medicines/${id}`),

  getAlternatives: (id: number, form?: string): Promise<AlternativeResponse> => {
    const params = new URLSearchParams();
    if (form) params.set("form", form);
    return apiFetch<AlternativeResponse>(`/api/medicines/${id}/alternatives?${params}`);
  },

  getPopular: (): Promise<{ suggestions: string[] }> =>
    apiFetch<{ suggestions: string[] }>(`/api/popular`),

  askHomeRemedies: (symptoms: string, region: string): Promise<HomeRemedyResponse> =>
    apiFetch<HomeRemedyResponse>("/api/home-remedies/chat", {
      method: "POST",
      body: JSON.stringify({ symptoms, region }),
    }),

  recognizePrescription: (file: File): Promise<PrescriptionRecognitionResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFormFetch<PrescriptionRecognitionResponse>("/api/prescriptions/recognize", formData);
  },

  // ─── Auth endpoints ─────────────────────────────────────────────────────
  signup: (payload: SignUpPayload): Promise<AuthTokenResponse> =>
    apiFetch<AuthTokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload): Promise<AuthTokenResponse> =>
    apiFetch<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCurrentUser: (token: string): Promise<UserProfile> =>
    apiFetch<UserProfile>("/api/auth/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),

  updateCurrentUser: (token: string, payload: UserProfileUpdate): Promise<UserProfile> =>
    apiFetch<UserProfile>("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
};
