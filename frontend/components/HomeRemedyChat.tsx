"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, RotateCcw, SendHorizonal, ShieldAlert, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  isError?: boolean;
  createdAt: number;
}

export default function HomeRemedyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I’m here to help with temporary relief suggestions while you arrange proper medical care. Tell me about your symptoms and which state or region you’re in so I can tailor general guidance.",
      createdAt: Date.now(),
    },
  ]);
  const [symptoms, setSymptoms] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const timer = window.setInterval(() => setIsPulsing((value) => !value), 1400);
    return () => window.clearInterval(timer);
  }, []);

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hello! I’m here to help with temporary relief suggestions while you arrange proper medical care. Tell me about your symptoms and which state or region you’re in so I can tailor general guidance.",
        createdAt: Date.now(),
      },
    ]);
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedSymptoms = symptoms.trim();
    const trimmedRegion = region.trim();
    if (!trimmedSymptoms || !trimmedRegion) {
      setError("Please share both your symptoms and your state or region so I can offer relevant guidance.");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: `Symptoms: ${trimmedSymptoms}\nRegion: ${trimmedRegion}`,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSymptoms("");
    setRegion("");
    setError(null);
    setLoading(true);

    try {
      const response = await api.askHomeRemedies(trimmedSymptoms, trimmedRegion);
      const formattedContent = [
        "## 🌿 Gentle guidance",
        "",
        `**Possible condition (not a diagnosis):** ${response.possible_condition}`,
        "",
        `**What this may mean:** ${response.explanation}`,
        "",
        "### 💧 Temporary relief suggestions",
        ...response.remedies.map((remedy, index) => {
          const sources = remedy.sources.map((source) => `[${source}](${source})`).join(" • ");
          return [
            `**${index + 1}. ${remedy.name}**`,
            "",
            `- **How to use:** ${remedy.instructions}`,
            `- **Why it may help:** ${remedy.why_it_may_help}`,
            `- **Precautions:** ${remedy.precautions}`,
            `- **Who should avoid it:** ${remedy.who_should_avoid}`,
            `- **Science:** ${remedy.scientific_explanation}`,
            `- **Evidence summary:** ${remedy.evidence_summary}`,
            `- **Trusted sources:** ${sources}`,
          ].join("\n");
        }),
        "",
        "### ⚠️ Important medical disclaimer",
        response.disclaimer,
      ].join("\n\n");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: formattedContent,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "I’m sorry, I couldn’t prepare a response right now. Please try again in a moment and seek medical care promptly if your symptoms are severe or worsening.",
          isError: true,
          createdAt: Date.now(),
        },
      ]);
      setError(err instanceof Error ? err.message : "Unable to reach the assistant right now.");
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents = {
    h1: ({ children }: { children?: React.ReactNode }) => <h1 style={{ color: "#59C975", fontSize: 18, margin: "10px 0 4px", fontWeight: 800 }}>{children}</h1>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 style={{ color: "#68C795", fontSize: 16, margin: "10px 0 4px", fontWeight: 800 }}>{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 style={{ color: "#1998F4", fontSize: 14, margin: "10px 0 4px", fontWeight: 700 }}>{children}</h3>,
    p: ({ children }: { children?: React.ReactNode }) => <p style={{ margin: "6px 0", lineHeight: 1.65, color: "#F8FAFC" }}>{children}</p>,
    strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ color: "#59C975", fontWeight: 700 }}>{children}</strong>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul style={{ paddingLeft: 18, margin: "8px 0", color: "#E5E7EB" }}>{children}</ul>,
    li: ({ children }: { children?: React.ReactNode }) => <li style={{ marginBottom: 6, lineHeight: 1.55 }}>{children}</li>,
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "#68C795", textDecoration: "underline" }}>
        {children}
      </a>
    ),
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1200,
          border: "none",
          background: "linear-gradient(135deg, #1998F4 0%, #59C975 100%)",
          color: "#FFFFFF",
          borderRadius: 999,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: isPulsing ? "0 0 0 0 rgba(89, 201, 117, 0.45), 0 18px 45px rgba(25, 152, 244, 0.3)" : "0 18px 45px rgba(25, 152, 244, 0.3)",
          cursor: "pointer",
          transform: isPulsing ? "scale(1.01)" : "scale(1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 999, background: "rgba(6, 8, 7, 0.22)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.18)" }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: "radial-gradient(circle at 30% 30%, #ffffff, #1998F4 60%, #0b3d5c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={16} color="#060807" />
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>Assistance</span>
      </button>

      {isOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 1300,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            padding: 20,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(92vw, 460px)",
              maxHeight: "85vh",
              borderRadius: 24,
              border: "1px solid #2A2A2A",
              background: "linear-gradient(135deg, #060807 0%, #101510 100%)",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #2A2A2A", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "linear-gradient(135deg, #1998F4, #59C975)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>AltRx Care Assistant</div>
                  <div style={{ fontSize: 12, color: "#D1D5DB" }}>Gentle guidance • professional care encouraged</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={resetChat} title="Start a new chat" style={{ border: "none", background: "rgba(255,255,255,0.08)", color: "#D1D5DB", borderRadius: 999, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close chat" style={{ border: "none", background: "rgba(255,255,255,0.08)", color: "#FFFFFF", borderRadius: 999, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 10px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((message) => (
                <div key={message.id} style={{ display: "flex", flexDirection: "column", alignItems: message.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "100%",
                      padding: "12px 14px",
                      borderRadius: 16,
                      borderTopRightRadius: message.role === "user" ? 4 : 16,
                      borderTopLeftRadius: message.role === "user" ? 16 : 4,
                      background: message.role === "user" ? "linear-gradient(135deg, #1998F4, #2F959E)" : "rgba(255,255,255,0.07)",
                      color: message.role === "user" ? "#FFFFFF" : "#F8FAFC",
                      border: message.isError ? "1px solid rgba(248, 113, 113, 0.35)" : `1px solid ${message.role === "user" ? "rgba(25, 152, 244, 0.25)" : "#2A2A2A"}`,
                      boxShadow: message.role === "assistant" ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    {message.role === "assistant" ? (
                      <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>{message.content}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4, padding: "0 4px" }}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}

              {loading ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: "linear-gradient(135deg, #1998F4, #59C975)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={15} />
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      borderTopLeftRadius: 4,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid #2A2A2A",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: "#68C795",
                          display: "inline-block",
                          animation: `bounce 1.2s ease-in-out ${dot * 0.18}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FCA5A5", fontSize: 13 }}>
                  <ShieldAlert size={15} />
                  {error}
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "12px 14px 14px", borderTop: "1px solid #2A2A2A", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "grid", gap: 10 }}>
                <textarea
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  rows={3}
                  placeholder="Describe your symptoms"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #2A2A2A",
                    background: "#060807",
                    color: "#FFFFFF",
                    padding: "10px 12px",
                    fontSize: 14,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
                <input
                  type="text"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="State / region"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #2A2A2A",
                    background: "#060807",
                    color: "#FFFFFF",
                    padding: "10px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !symptoms.trim() || !region.trim()}
                  style={{
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 14px",
                    background: loading || !symptoms.trim() || !region.trim()
                      ? "rgba(89, 201, 117, 0.25)"
                      : "linear-gradient(135deg, #1998F4, #59C975)",
                    color: loading || !symptoms.trim() || !region.trim() ? "#8B8B8B" : "#FFFFFF",
                    fontWeight: 700,
                    cursor: loading || !symptoms.trim() || !region.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                >
                  <SendHorizonal size={16} />
                  {loading ? "Thinking" : "Ask assistant"}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8B8B8B", fontSize: 12, marginTop: 10 }}>
                <Sparkles size={14} />
                Low-risk guidance only • professional care still matters.
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
