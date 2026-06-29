"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Dna, IndianRupee, ShieldCheck } from "lucide-react";
import { api, type AlternativeResponse } from "@/lib/api";

export default function AlternativesPage() {
  const params = useParams<{ id: string }>();
  const medicineId = Number(params.id);
  const [data, setData] = useState<AlternativeResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

    if (!Number.isFinite(medicineId)) {
      setError("Invalid medicine id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .getAlternatives(medicineId)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load alternatives.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [medicineId]);

  return (
    <main style={{ minHeight: "100vh", background: colors.black, color: colors.white, padding: "32px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.lightGray, textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={18} />
          Back home
        </Link>

        {loading ? (
          <StateCard colors={colors} title="Loading alternatives" text="Checking medicines with the same active salt..." />
        ) : error ? (
          <StateCard colors={colors} title="Could not load alternatives" text={error} />
        ) : data ? (
          <>
            <section style={{ border: `1px solid ${colors.darkGray}`, borderRadius: 8, padding: 24, background: colors.almostBlack, marginBottom: 24 }}>
              <div style={{ color: colors.mediumGray, fontSize: 13, marginBottom: 8 }}>Alternatives for</div>
              <h1 style={{ fontSize: 36, margin: 0, fontWeight: 900 }}>{data.target.brand_name}</h1>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", color: colors.lightGray, marginTop: 12, fontSize: 14 }}>
                <span>{data.target.manufacturer}</span>
                <span>{data.target.dosage_form} · {data.target.strength}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Dna size={16} color={colors.emeraldGreen} />{data.target.salt_name}</span>
              </div>
              <div style={{ color: colors.emeraldGreen, marginTop: 16, fontWeight: 800 }}>
                Max savings: {data.max_savings_percentage.toFixed(1)}%
              </div>
            </section>

            {data.alternatives.length === 0 ? (
              <StateCard colors={colors} title="No alternatives found" text="The backend did not return alternatives for this medicine yet." />
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {data.alternatives.map((medicine) => (
                  <article key={medicine.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center", border: `1px solid ${colors.darkGray}`, borderRadius: 8, padding: 22, background: colors.almostBlack }}>
                    <div>
                      <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>{medicine.brand_name}</h2>
                      <div style={{ color: colors.lightGray, fontSize: 14, marginBottom: 8 }}>{medicine.manufacturer} · {medicine.dosage_form} · {medicine.strength}</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", color: colors.mediumGray, fontSize: 13 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ShieldCheck size={16} color={colors.emeraldGreen} />{medicine.is_generic ? "Generic" : "Branded"}</span>
                        <span>{medicine.pack_size} {medicine.pack_unit}</span>
                        {medicine.is_cheaper ? <span style={{ color: colors.emeraldGreen }}>{medicine.savings_percentage.toFixed(1)}% cheaper</span> : null}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, color: colors.emeraldGreen, fontSize: 26, fontWeight: 900 }}>
                        <IndianRupee size={20} />
                        {medicine.price.toFixed(2)}
                      </div>
                      <div style={{ color: colors.mediumGray, fontSize: 12 }}>Rs {medicine.price_per_unit.toFixed(2)} / unit</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

function StateCard({
  colors,
  title,
  text,
}: {
  colors: { almostBlack: string; darkGray: string; white: string; lightGray: string };
  title: string;
  text: string;
}) {
  return (
    <div style={{ border: `1px solid ${colors.darkGray}`, borderRadius: 8, background: colors.almostBlack, padding: 44, textAlign: "center" }}>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: colors.white }}>{title}</h2>
      <p style={{ color: colors.lightGray }}>{text}</p>
    </div>
  );
}