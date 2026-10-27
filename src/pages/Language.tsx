import DemoPatient from "../components/DemoPatient";
import { useLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../context/LanguageContext";

const sample: Record<string, string> = {
  English: "Your health information can be viewed in simple language.",
  Hindi: "आपकी स्वास्थ्य जानकारी सरल भाषा में देखी जा सकती है।",
  Bengali: "আপনার স্বাস্থ্য তথ্য সহজ ভাষায় দেখা যাবে।",
  Tamil: "உங்கள் உடல்நலத் தகவலை எளிய மொழியில் பார்க்கலாம்.",
  Telugu: "మీ ఆరోగ్య సమాచారాన్ని సులభమైన భాషలో చూడవచ్చు.",
  Marathi: "तुमची आरोग्य माहिती सोप्या भाषेत पाहता येते.",
  Gujarati: "તમારી આરોગ્ય માહિતી સરળ ભાષામાં જોઈ શકાય છે.",
  Kannada: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ನೋಡಬಹುದು.",
  Malayalam: "നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ ലളിതമായ ഭാഷയിൽ കാണാം.",
  Punjabi: "ਤੁਹਾਡੀ ਸਿਹਤ ਜਾਣਕਾਰੀ ਸਧਾਰਨ ਭਾਸ਼ਾ ਵਿੱਚ ਵੇਖੀ ਜਾ ਸਕਦੀ ਹੈ।",
  Odia: "ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସୂଚନା ସରଳ ଭାଷାରେ ଦେଖିପାରିବେ।",
};

export default function Language() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <section className="page">
      <DemoPatient compact />
      <div className="page-heading">
        <span className="eyebrow">PILLAR 7 · LIVE TRANSLATION</span>
        <h2>{t("Language & Accessibility")}</h2>
        <p>
          Choose your preferred Indian language. The active dashboard, biomarker cards, and navigation
          translate instantly to empower patients and families.
        </p>
      </div>

      <div className="card">
        <div className="language-grid">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              className={`language-option ${language === l.name ? "selected" : ""}`}
              key={l.name}
              onClick={() => setLanguage(l.name)}
            >
              {l.nativeLabel}
              <small>{l.name}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="card language-preview">
        <span className="card-label">ACTIVE SELECTION PREVIEW</span>
        <h3 style={{ fontSize: "1.25rem", margin: "10px 0" }}>
          {sample[language] || sample.English}
        </h3>
        <p>
          Current active language: <strong>{language}</strong>
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <span className="badge" style={{ backgroundColor: "#10b981", color: "#fff" }}>
            ✓ Live across app
          </span>
          <span className="badge">11 Indian Languages Supported</span>
        </div>
      </div>
    </section>
  );
}