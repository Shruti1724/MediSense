import { useState } from "react";
import "../components/ResultView.css";
import ResultView from "../components/ResultView";
import { mockResults } from "../mock/mockResult";

export default function ResultPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const result = mockResults[selectedIndex];

  return (
    <div className="result-page">
      <p className="sample-banner">Sample data, not real medical information</p>

      <div className="sample-buttons" aria-label="Sample result choices">
        {mockResults.map((item, index) => (
          <button
            key={`${item.type}-${index}`}
            type="button"
            className={index === selectedIndex ? "sample-button sample-button-active" : "sample-button"}
            onClick={() => setSelectedIndex(index)}
            aria-pressed={index === selectedIndex}
          >
            Sample {index + 1}
          </button>
        ))}
      </div>

      <ResultView result={result} />
    </div>
  );
}
