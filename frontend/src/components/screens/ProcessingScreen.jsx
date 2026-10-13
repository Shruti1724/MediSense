import React, { useEffect, useState } from 'react';
import { getSteps } from '../../api';

export default function ProcessingScreen({ onNavigate }) {
  const [steps, setSteps] = useState([]);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    getSteps(sessionId)
      .then((data) => {
        if (cancelled) return;
        setSteps(data.steps || []);
        setVisibleSteps([]);
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

  useEffect(() => {
    if (loading || error || visibleSteps.length >= steps.length) return undefined;

    const timer = window.setTimeout(() => {
      setVisibleSteps((previous) => [...previous, steps[previous.length]]);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [error, loading, steps, visibleSteps.length]);

  const isComplete = !loading && !error && visibleSteps.length === steps.length;

  return (
    <div className="w-full max-w-[720px] mx-auto pb-12">
      <div
        className="inline-block bg-white text-[#5a605c] font-label-sm text-[12px] px-2 py-0.5 border border-[#d6d4cc] mb-4"
        style={{ borderRadius: '4px' }}
      >
        Sample data
      </div>

      <h1
        className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] font-semibold tracking-tight mb-2"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Working on it
      </h1>
      <p className="font-body-md text-[15px] text-[#5a605c] mb-8">Checking each medicine against the saved medicine data.</p>

      {loading && <p className="font-body-md text-[15px] text-[#5a605c]">Loading steps...</p>}

      {error && (
        <div className="border border-[#ba1a1a] bg-[#ffdad6] p-4 mb-6" style={{ borderRadius: '4px' }}>
          <p className="font-body-md text-[15px] text-[#93000a] mb-3">{error}</p>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="font-label-md text-[14px] text-[#93000a] underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Back to upload
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-[#d6d4cc] p-6 mb-6" style={{ borderRadius: '4px' }}>
        <div className="text-[12px] font-semibold text-[#5a605c] uppercase tracking-wider mb-4 pb-2 border-b border-[#d6d4cc] flex items-center justify-between">
          <span>Steps</span>
          <span>Status</span>
        </div>

        <div className="flex flex-col space-y-1">
          {visibleSteps.map((step, index) => {
            return (
              <div
                key={`${step.time}-${index}`}
                className="flex items-center justify-between py-2.5 px-3 hover:bg-[#f3f4f0]"
                style={{ borderRadius: '4px' }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="font-body-sm text-[13px] text-[#5a605c] tabular-nums select-none">{step.time}</span>
                  <span className="font-body-md text-[15px] text-[#1c1f1d] truncate">{step.action}</span>
                </div>
                <span className="font-body-sm text-[13px] text-[#5a605c] pl-4 shrink-0">{step.agent}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#d6d4cc] flex items-center justify-between font-body-sm text-[13px] text-[#5a605c]">
          <span className="tabular-nums font-medium">{visibleSteps.length} of {steps.length} steps completed</span>
        </div>
        </div>
      )}

      {isComplete && (
      <div
        className="border border-[#d6d4cc] bg-white p-4 mb-6"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#5a605c] mt-2 shrink-0" />
            <div>
              <div className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Check complete</div>
              <div className="font-body-md text-[15px] text-[#5a605c]">
                The confirmed medicine list has finished processing.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:self-center">
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center justify-center font-label-md text-[14px] text-[#1f5a46] bg-white border border-[#1f5a46] hover:bg-[#eef3f0] px-4 py-2 transition-colors whitespace-nowrap cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              Review list
            </button>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="inline-flex items-center justify-center font-label-md text-[14px] text-white bg-[#1f5a46] hover:bg-[#004230] px-4 py-2 transition-colors whitespace-nowrap cursor-pointer border-0"
              style={{ borderRadius: '4px' }}
            >
              View Report
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
