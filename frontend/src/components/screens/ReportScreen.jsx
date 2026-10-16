import React, { useEffect, useState } from 'react';
import { getResult, pdfUrl, askQuestion } from '../../api';
import ResultView from '../ResultView';

export default function ReportScreen({
  medicines = [],
  cabinetRecords = [],
  onNavigate,
  onSaveToCabinet,
}) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notReady, setNotReady] = useState(false);
  const [isAddingCabinet, setIsAddingCabinet] = useState(false);
  const [isCheckingClashes, setIsCheckingClashes] = useState(false);
  const [cabinetFeedback, setCabinetFeedback] = useState(null);

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

  const getPrescriptionMedicines = () => {
    // 1. Try from medicines prop
    const fromProps = (medicines || [])
      .map((m) => (typeof m === 'string' ? m.trim() : (m.name || m.brand || '').trim()))
      .filter(Boolean);
    if (fromProps.length > 0) return fromProps;

    // 2. Fallback: parse from result sections
    if (result && Array.isArray(result.sections)) {
      const fromSections = result.sections
        .filter((s) => s.title && s.title.startsWith('Medicine: '))
        .map((s) => {
          const cleaned = s.title.replace(/^Medicine:\s*/, '');
          const brandPart = cleaned.split('(')[0].trim();
          return brandPart;
        })
        .filter(Boolean);
      if (fromSections.length > 0) return fromSections;
    }

    return [];
  };

  const handleAddToCabinet = async () => {
    const medsToAdd = getPrescriptionMedicines();
    if (medsToAdd.length === 0) {
      setCabinetFeedback({
        type: 'warning',
        message: 'No medicines were found in this report to add to your cabinet.',
      });
      return;
    }

    setIsAddingCabinet(true);
    setIsCheckingClashes(true);
    setCabinetFeedback(null);

    // Save medicines to personal cabinet
    if (onSaveToCabinet) {
      onSaveToCabinet(medsToAdd);
    }

    // Check for medicine clashes across all cabinet medicines
    try {
      const existingMeds = (cabinetRecords || [])
        .map((r) => r.genericName || r.medicine)
        .filter(Boolean);
      const combinedMeds = Array.from(new Set([...existingMeds, ...medsToAdd]));

      if (combinedMeds.length < 2) {
        setCabinetFeedback({
          type: 'success',
          message: `Saved ${medsToAdd.join(', ')} to your medicine cabinet. At least 2 medicines are needed to evaluate potential clashes.`,
        });
      } else {
        const sessionId = sessionStorage.getItem('medisense_session') || 'cabinet-clash-check';
        const clashData = await askQuestion(
          sessionId,
          'Check for clashes between cabinet medicines',
          '',
          combinedMeds
        );

        const warnings = clashData?.warnings || [];
        const clashWarnings = warnings.filter((w) => {
          const t = (w.text || '').toLowerCase();
          return (
            t.includes('clash') ||
            t.includes('taking these medicines together') ||
            t.includes('more than one of these') ||
            t.includes('cannot be taken')
          );
        });

        if (clashWarnings.length > 0) {
          setCabinetFeedback({
            type: 'warning',
            title: `Detected ${clashWarnings.length} Medicine Clash${clashWarnings.length > 1 ? 'es' : ''}`,
            items: clashWarnings.map((w) => w.text),
            message: clashWarnings.map((w) => w.text).join('\n\n'),
            medicines: medsToAdd,
          });
        } else {
          setCabinetFeedback({
            type: 'success',
            message: `Successfully saved ${medsToAdd.join(', ')} to your medicine cabinet. No harmful medicine clashes were detected in our verified clinical database.`,
            medicines: medsToAdd,
          });
        }
      }
    } catch {
      setCabinetFeedback({
        type: 'warning',
        message: `Saved ${medsToAdd.length} medicine(s) to cabinet, but clash verification check could not be completed at this time.`,
      });
    } finally {
      setIsAddingCabinet(false);
      setIsCheckingClashes(false);
    }
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
        <div className="pt-6 border-t border-[#d6d4cc] mt-8 no-print space-y-5">
          {/* Add to Cabinet & Clash Check Section */}
          <div className="bg-[#f0f4f1] border border-[#c1d0c7] p-5 rounded-[6px] transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#1c1f1d] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1f5a46]">medical_services</span>
                  Add to Medicine Cabinet
                </h3>
                <p className="text-[14px] text-[#5a605c] mt-0.5">
                  Save these medicines to your personal medicine cabinet and automatically check for harmful interactions.
                </p>
              </div>
              <button
                type="button"
                id="btn-add-to-cabinet"
                disabled={isAddingCabinet || isCheckingClashes}
                onClick={handleAddToCabinet}
                className="bg-[#1f5a46] hover:bg-[#164233] text-white px-5 py-2.5 font-medium text-sm rounded-[4px] shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAddingCabinet || isCheckingClashes ? 'sync' : 'library_add'}
                </span>
                <span>
                  {isAddingCabinet || isCheckingClashes ? 'Checking clashes...' : 'Add to cabinet'}
                </span>
              </button>
            </div>

            {/* Clash / Cabinet Status Feedback */}
            {cabinetFeedback && (
              <div
                className={`mt-4 p-4 rounded-[4px] border transition-all ${
                  cabinetFeedback.type === 'warning'
                    ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#410002]'
                    : 'border-[#1f5a46] bg-[#eef6f2] text-[#0f382a]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined text-[22px] flex-shrink-0 ${
                      cabinetFeedback.type === 'warning' ? 'text-[#ba1a1a]' : 'text-[#1f5a46]'
                    }`}
                  >
                    {cabinetFeedback.type === 'warning' ? 'warning' : 'check_circle'}
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold">
                      {cabinetFeedback.type === 'warning'
                        ? cabinetFeedback.title || 'Medicine Clash Warning Detected'
                        : 'Saved to Cabinet Successfully'}
                    </p>

                    {cabinetFeedback.items && cabinetFeedback.items.length > 0 ? (
                      <div className="mt-2.5 space-y-2">
                        {cabinetFeedback.items.map((itemText, idx) => {
                          const match = itemText.match(/^CLASH WARNING:\s*([^:]+):\s*(.+)$/i);
                          if (match) {
                            return (
                              <div
                                key={idx}
                                className="bg-white/90 p-3 rounded-[4px] border border-[#ba1a1a33] text-[13px] leading-relaxed shadow-sm"
                              >
                                <div className="font-bold text-[#ba1a1a] flex items-center gap-1.5 mb-1">
                                  <span className="material-symbols-outlined text-[16px]">dangerous</span>
                                  <span>Clashed Pair {idx + 1}: {match[1]}</span>
                                </div>
                                <p className="text-[#1c1f1d]">{match[2]}</p>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={idx}
                              className="bg-white/90 p-3 rounded-[4px] border border-[#ba1a1a33] text-[13px] leading-relaxed text-[#1c1f1d] shadow-sm"
                            >
                              {itemText}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed">
                        {cabinetFeedback.message}
                      </p>
                    )}

                    {cabinetFeedback.type === 'warning' && (
                      <div className="mt-2.5 text-[12px] font-medium text-[#93000a] bg-white/70 p-2.5 rounded border border-[#ba1a1a44]">
                        ⚠️ <strong>Clinical Safety Alert:</strong> When two medicines clash or duplicate active ingredients, taking them together on the same day can lead to accidental overdose, excessive sedation, or adverse reactions. Please consult your prescribing physician or pharmacist before taking these together.
                      </div>
                    )}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => onNavigate('cabinet')}
                        className="text-xs font-semibold underline cursor-pointer hover:opacity-80 inline-flex items-center gap-1"
                      >
                        <span>View medicine cabinet</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Standard Navigation / Download Buttons */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              type="button"
              id="btn-download-pdf"
              onClick={handleDownload}
              className="bg-white border border-[#1f5a46] text-[#1f5a46] px-4 py-2.5 font-medium text-sm hover:bg-[#eef3f0] transition-colors flex items-center gap-2 cursor-pointer rounded-[4px]"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              id="btn-start-over"
              onClick={() => onNavigate('home')}
              className="text-[#1f5a46] underline text-sm hover:text-[#004230] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
