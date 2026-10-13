import React, { useState } from 'react';
import { askQuestion } from '../../api';
import ResultView from '../ResultView';

export default function AskScreen({ medicines = [] }) {
  const [question, setQuestion] = useState('I have a persistent sinus headache and I take lisinopril for high blood pressure. Can I take this amoxicillin left over from last year?');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setLoading(true);
    setError(null);
    setResult(null);
    const sessionId = sessionStorage.getItem('medisense_session') || 'no-session';
    const medicineNames = medicines.map((medicine) => medicine.name).filter(Boolean);

    try {
      const response = await askQuestion(sessionId, trimmedQuestion, '', medicineNames);
      setResult(response);
    } catch (requestError) {
      setError(requestError.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-[2px] bg-[#004230]" />
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase tracking-wider font-semibold">Ask</span>
        </div>
        <h1 className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] tracking-tight font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Ask about a medicine</h1>
        <p className="font-body-md text-[15px] text-[#5a605c] mt-1">Cross-reference active medications against personal circumstances and symptom queries.</p>
      </div>

      <div className="mb-3 text-[12px] uppercase tracking-wider text-[#5a605c] font-semibold">Sample data</div>

      <div className="bg-white border border-[#d6d4cc] p-6 mb-6" style={{ borderRadius: '4px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#d6d4cc]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Amoxicillin (Amoxil)</h2>
              <span className="inline-flex items-center border border-[#d6d4cc] px-2 py-0.5 font-label-sm text-[12px] text-[#5a605c] bg-[#f3f4f0]" style={{ borderRadius: '4px' }}>Prescription only</span>
              <span className="inline-flex items-center border border-[#d6d4cc] px-2 py-0.5 font-label-sm text-[12px] text-[#5a605c] bg-[#f3f4f0]" style={{ borderRadius: '4px' }}>Capsule</span>
            </div>
            <p className="font-label-md text-[14px] text-[#5a605c] mt-1">Class: Antibiotic</p>
          </div>
          <div className="text-left sm:text-right"><div className="font-label-md text-[14px] text-[#5a605c] tabular-nums font-semibold">Expiry: 08/2027</div></div>
        </div>

        <div className="my-4 p-3 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] flex items-start gap-2.5" style={{ borderRadius: '4px' }}>
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-[#ba1a1a]">error</span>
          <div className="flex-1">
            <div className="font-label-md text-[14px] font-semibold text-[#ba1a1a]">Expired: 01/2024. Do not use this medicine.</div>
            <div className="font-body-sm text-[13px] mt-0.5 text-[#ba1a1a] leading-relaxed">Ask a pharmacist how to dispose of it.</div>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-[#d6d4cc]"><div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">Commonly used for</div><div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">Bacterial infections.</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-[#d6d4cc]"><div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">Common side effects</div><div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">Nausea, loose stools, headache and mild skin reactions.</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2"><div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">Who should be careful</div><div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">People allergic to penicillin. Ask a doctor or pharmacist if you have kidney problems.</div></div>
        </div>
      </div>

      <div className="bg-white border border-[#d6d4cc] p-6 mb-8" style={{ borderRadius: '4px' }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-title-md text-[16px] text-[#1c1f1d] mb-1 font-semibold" htmlFor="situation-input">Describe your situation</label>
            <textarea id="situation-input" rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type your question, current symptoms, or concurrent prescriptions here..." className="w-full border border-[#d6d4cc] bg-white text-[#1c1f1d] p-3 font-body-md text-[15px] focus:outline-none focus:border-[#004230] resize-none transition-colors" style={{ borderRadius: '4px' }} />
            <div className="font-body-sm text-[13px] text-[#5a605c] mt-1.5">For example: I have a headache and I take blood pressure medicine.</div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 font-label-sm text-[12px] text-[#5a605c]"><span className="material-symbols-outlined text-[16px]">lock</span><span>Not a diagnosis</span></div>
            <button type="submit" disabled={loading || !question.trim()} className="bg-[#004230] text-white px-6 py-2.5 font-label-md text-[14px] border border-[#004230] hover:bg-[#1f5a46] transition-colors cursor-pointer disabled:opacity-50" style={{ borderRadius: '4px' }}>{loading ? 'Checking...' : 'Ask'}</button>
          </div>
        </form>
      </div>

      {loading && <p className="font-body-md text-[15px] text-[#5a605c]">Loading your answer...</p>}
      {error && <div className="border border-[#ba1a1a] bg-[#ffdad6] p-4 mb-6" style={{ borderRadius: '4px' }}><p className="font-body-md text-[15px] text-[#93000a]">{error}</p></div>}
      {result && <ResultView result={result} />}
    </div>
  );
}
