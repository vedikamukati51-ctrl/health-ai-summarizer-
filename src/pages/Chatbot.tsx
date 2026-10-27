import { useMemo, useState, useEffect, useRef } from "react";
import DemoPatient from "../components/DemoPatient";
import { useProfile } from "../context/ProfileContext";
import { useHealthData } from "../context/HealthDataContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";

interface ChatMessage {
  from: "user" | "assistant";
  text: string;
  sources?: Array<{ fileName: string; reportDate?: string; similarity?: number }>;
  provider?: string;
}

export default function Chatbot() {
  const { profile } = useProfile();
  const { activePatientName, anomalies, hasReports } = useHealthData();
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "assistant",
      text: `Hello ${activePatientName || profile.fullName || "there"}! I am your AI Health Assistant powered by clinical RAG (Retrieval-Augmented Generation). I can explain your blood tests, lab ranges, and provide safe dietary lifestyle guidance grounded on your actual medical reports. How can I help you today?`,
      provider: "Health AI Assistant (Pillar 5)",
    },
  ]);

  const dynamicPrompts = useMemo(() => {
    if (anomalies.length > 0) {
      const anomalyPrompts = anomalies.slice(0, 3).map(
        (a) => `Why is my ${a.paramName} at ${a.patientValue} and what foods help?`
      );
      return [...anomalyPrompts, "Which specialist doctor should I consult for my reports?"];
    }
    return [
      "What key biomarkers are evaluated in a routine health check?",
      "How can I prepare before my upcoming blood test?",
      "What are normal fasting blood glucose and creatinine levels?",
      "Which specialist doctor should I consult for general wellness?",
    ];
  }, [anomalies]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        from: "assistant",
        text: `Hello ${activePatientName || profile.fullName || "there"}! I am your AI Health Assistant powered by clinical RAG. I can explain lab tests and dietary guidance grounded on your medical reports. How can I help you today?`,
        provider: "Health AI Assistant (Pillar 5)",
      },
    ]);
  }, [activePatientName]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Add user message
    const userMsg: ChatMessage = { from: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.from === "user" ? "user" : "model",
        content: m.text,
      }));

      const res = await api.chat(query, historyPayload);

      const assistantMsg: ChatMessage = {
        from: "assistant",
        text: res.reply,
        sources: res.sources || [],
        provider: res.provider || "Clinical Medical NLP Engine",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          from: "assistant",
          text: "I experienced a temporary communication glitch with the health server. Please try asking your question again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">{t("PILLAR 5 · AI/LLM & CLINICAL RAG")}</span>
        <h2>{t("Health Assistant")}</h2>
        <p>
          {t("Plain-language health education grounded on your stored lab reports using semantic vector embeddings and clinical NLP. It is non-diagnostic and never recommends prescription medicine.")}
        </p>
      </div>

      {/* Suggested prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted, #64748b)", alignSelf: "center" }}>
          {t("Questions to Ask Your Doctor")}:
        </span>
        {dynamicPrompts.map((prompt) => (
          <button
            key={prompt}
            className="secondary-button"
            style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: 16 }}
            onClick={() => handleSend(prompt)}
            disabled={loading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-card">
        <div className="chat-messages" style={{ minHeight: 340, maxHeight: 520, overflowY: "auto", padding: 16 }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.from === "user" ? "you" : "assistant"}`}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed rgba(0,0,0,0.1)", fontSize: "0.75rem", opacity: 0.85 }}>
                  <strong>Citations & Retrieved Context:</strong>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {m.sources.map((s, sIdx) => (
                      <li key={sIdx}>
                        📄 {s.fileName} ({s.reportDate || "Recent"}) {s.similarity ? `· Match: ${Math.round(s.similarity * 100)}%` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {m.provider && (
                <div style={{ fontSize: "0.7rem", marginTop: 6, opacity: 0.65, textAlign: "right" }}>
                  ⚡ {m.provider}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble assistant" style={{ fontStyle: "italic", opacity: 0.75 }}>
              {t("Updating clinical analysis…")}
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        <div className="chat-input" style={{ display: "flex", gap: 8, padding: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("Ask a question about your reports...")}
            disabled={loading}
          />
          <button className="primary-button" onClick={() => handleSend()} disabled={loading || !input.trim()}>
            {loading ? "..." : t("Send")}
          </button>
        </div>
      </div>

      <div className="disclaimer card">
        <strong>{t("Important Medical Notice:")}</strong> {t("This summary is informational and educational. It does not provide a definitive clinical diagnosis or replace a qualified healthcare professional.")}
      </div>
    </section>
  );
}