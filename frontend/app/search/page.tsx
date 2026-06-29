"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Dna, IndianRupee, Search } from "lucide-react";
import { api, type SearchResultItem } from "@/lib/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = useMemo(() => searchParams.get("q")?.trim() ?? "", [searchParams]);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    black: "#000000",
    almostBlack: "#060807",
    darkGray: "#2A2A2A",
    white: "#FFFFFF",
    lightGray: "#D1D5DB",
    mediumGray: "#8B8B8B",
    brightBlue: "#1998F4",
    emeraldGreen: "#59C975",
  };

  useEffect(() => {
    let active = true;

    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .search(query, 20)
      .then((data) => {
        if (!active) return;
        setResults(data.results);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setResults([]);
        setError(err instanceof Error ? err.message : "Could not search medicines.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <main style={{ minHeight: "100vh", background: colors.black, color: colors.white, padding: "32px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.lightGray, textDecoration: "none", marginBottom: 28 }}
        >
          <ArrowLeft size={18} />
          Back home
        </Link>

        <div style={{ marginBottom: 28 }}>
          <div style={{ color: colors.mediumGray, fontSize: 13, marginBottom: 8 }}>Search results for</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0 }}>{query ? `"${query}"` : "Search medicines"}</h1>
          {!loading && query && !error ? (
            <p style={{ color: colors.lightGray, marginTop: 10 }}>{results.length} medicine{results.length === 1 ? "" : "s"} found</p>
          ) : null}
        </div>

        {!query ? (
          <StateCard colors={colors} icon={<Search size={42} color={colors.mediumGray} />} title="No search query" text="Go back home and search for a brand name or active ingredient." />
        ) : loading ? (
          <StateCard colors={colors} icon={<Search size={42} color={colors.brightBlue} />} title="Searching medicines" text="Checking the backend for matching medicines..." />
        ) : error ? (
          <StateCard colors={colors} icon={<Search size={42} color={colors.mediumGray} />} title="Search failed" text={error} />
        ) : results.length === 0 ? (
          <StateCard colors={colors} icon={<Search size={42} color={colors.mediumGray} />} title="No medicines found" text="Try a different spelling or search by the active ingredient name." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {results.map((medicine, index) => (
              <article
                key={medicine.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 20,
                  alignItems: "center",
                  border: `1px solid ${index === 0 ? colors.emeraldGreen : colors.darkGray}`,
                  borderRadius: 8,
                  padding: 22,
                  background: colors.almostBlack,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: 20, margin: 0 }}>{medicine.brand_name}</h2>
                    {index === 0 ? <Badge color={colors.emeraldGreen} text="Best match" /> : null}
                    {medicine.is_generic ? <Badge color={colors.brightBlue} text="Generic" /> : null}
                  </div>
                  <div style={{ color: colors.lightGray, fontSize: 14, marginBottom: 8 }}>
                    {medicine.manufacturer} · {medicine.dosage_form} · {medicine.strength}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.mediumGray, fontSize: 13 }}>
                    <Dna size={16} color={colors.emeraldGreen} />
                    <span>{medicine.salt_name}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: 180 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, color: colors.emeraldGreen, fontSize: 26, fontWeight: 900 }}>
                    <IndianRupee size={20} />
                    {medicine.price.toFixed(2)}
                  </div>
                  <div style={{ color: colors.mediumGray, fontSize: 12, marginBottom: 12 }}>
                    Rs {medicine.price_per_unit.toFixed(2)} / unit
                  </div>
                  <Link
                    href={`/medicines/${medicine.id}/alternatives`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: colors.white, background: colors.brightBlue, padding: "9px 14px", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 700 }}
                  >
                    {medicine.alternatives_count} alternatives
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Badge({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ border: `1px solid ${color}`, color, borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>
      {text}
    </span>
  );
}

function StateCard({
  colors,
  icon,
  title,
  text,
}: {
  colors: { almostBlack: string; darkGray: string; white: string; lightGray: string };
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div style={{ border: `1px solid ${colors.darkGray}`, borderRadius: 8, background: colors.almostBlack, padding: 44, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: colors.white }}>{title}</h2>
      <p style={{ color: colors.lightGray }}>{text}</p>
    </div>
  );
}