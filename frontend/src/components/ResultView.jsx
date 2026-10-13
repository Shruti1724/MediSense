import "./ResultView.css";

const outcomeLabels = {
  ok: "Information found",
  needs_doctor: "Ask a doctor or pharmacist first",
  not_matching: "Does not match the common use",
  emergency: "Get medical help now",
  cannot_verify: "Cannot verify"
};

export default function ResultView({ result }) {
  if (!result) {
    return null;
  }

  const bannerRole = result.outcome === "emergency" ? "alert" : undefined;
  const warnings = [...(result.warnings || [])].sort((first, second) => {
    const order = { major: 0, moderate: 1, minor: 2 };
    return (order[first.level] ?? 3) - (order[second.level] ?? 3);
  });

  return (
    <main className="result-view">
      <div className={`result-banner result-banner-${result.outcome}`} role={bannerRole}>
        <h1>{outcomeLabels[result.outcome]}</h1>
      </div>

      {warnings.length > 0 && (
        <section className="warnings-section" aria-label="Warnings">
          <h2>Warnings</h2>
          <ul className="warning-list">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.level}-${index}`}
                className={`warning warning-${warning.level}`}
              >
                <strong>
                  {warning.level === "major"
                    ? "Major warning"
                    : warning.level === "moderate"
                      ? "Moderate warning"
                      : "Minor warning"}
                </strong>
                <span>{warning.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.sections && result.sections.length > 0 && (
        <section className="sections" aria-label="Information sections">
          {result.sections.map((section, index) => (
            <article key={`${section.title}-${index}`} className="result-section">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <h3>Sources</h3>
              <ul className="source-list">
                {(section.sources || []).map((source, sourceIndex) => (
                  <li key={`${source}-${sourceIndex}`}>{source}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      <p className="result-disclaimer">{result.disclaimer}</p>
    </main>
  );
}
