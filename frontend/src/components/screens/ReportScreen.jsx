import React, { useEffect, useState } from 'react';
import { getResult, pdfUrl } from '../../api';
import ResultView from '../ResultView';

export default function ReportScreen({ onNavigate }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notReady, setNotReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sessionId = sessionStorage.getItem('medisense_session');

    if (!sessionId) {
      setLoading(false);
      setError('No active session. Please return to the upload screen.');
      return () => {
        cancelled = true;
      };
    }

    getResult(sessionId)
      .then((data) => {
        if (cancelled) return;
        if (!data?.type || !data?.outcome) setNotReady(true);
        else setResult(data);
        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError.message || 'Could not reach the server. Is the backend running?');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = () => {
    const sessionId = sessionStorage.getItem('medisense_session');
    if (sessionId) window.open(pdfUrl(sessionId), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-[2px] bg-[#004230]" />
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase tracking-wider font-semibold">Report</span>
        </div>
        <h1 className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] tracking-tight font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Medicine information report
        </h1>
      </div>

      {loading && <p className="font-body-md text-[15px] text-[#5a605c]">Loading your report...</p>}

      {notReady && !loading && (
        <div className="border border-[#b85c00] bg-[#fdf0e2] p-4 mb-6" style={{ borderRadius: '4px' }}>
          <p className="font-body-md text-[15px] text-[#7a3d00] mb-3">The report is not ready yet. Please return to the processing screen.</p>
          <button type="button" onClick={() => onNavigate('processing')} className="font-label-md text-[14px] text-[#7a3d00] underline bg-transparent border-0 p-0 cursor-pointer">
            Back to processing
          </button>
        </div>
      )}

      {error && (
        <div className="border border-[#ba1a1a] bg-[#ffdad6] p-4 mb-6" style={{ borderRadius: '4px' }}>
          <p className="font-body-md text-[15px] text-[#93000a] mb-3">{error}</p>
          <button type="button" onClick={() => onNavigate('upload')} className="font-label-md text-[14px] text-[#93000a] underline bg-transparent border-0 p-0 cursor-pointer">
            Back to upload
          </button>
        </div>
      )}

      {result && <ResultView result={result} />}

      {!loading && !error && !notReady && result && (
        <div className="pt-4 border-t border-[#d6d4cc] mt-6 flex items-center justify-between gap-4 no-print">
          <button type="button" onClick={handleDownload} className="bg-white border border-[#1f5a46] text-[#1f5a46] px-4 py-2.5 font-medium text-sm hover:bg-[#eef3f0] transition-colors flex items-center gap-2 cursor-pointer" style={{ borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download PDF</span>
          </button>
          <button type="button" onClick={() => onNavigate('home')} className="text-[#1f5a46] underline text-sm hover:text-[#004230] transition-colors cursor-pointer bg-transparent border-0 p-0">
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
