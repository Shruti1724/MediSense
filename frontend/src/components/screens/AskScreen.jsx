import React, { useState } from 'react';

export default function AskScreen() {
  const [question, setQuestion] = useState('I have a persistent sinus headache and I take lisinopril for high blood pressure. Can I take this amoxicillin left over from last year?');
  const [activeTriageState, setActiveTriageState] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      const lower = question.toLowerCase();
      if (lower.includes('chest pain') || lower.includes("can't breathe") || lower.includes('emergency')) {
        setActiveTriageState(3);
      } else if (lower.includes('headache') && lower.includes('amoxicillin')) {
        setActiveTriageState(0);
      } else if (lower.includes('cold') || lower.includes('flu') || lower.includes('painkiller')) {
        setActiveTriageState(1);
      } else {
        setActiveTriageState(0);
      }
    }, 450);
  };

  const outcomes = [
    {
      title: 'Information found',
      icon: 'check_circle',
      color: '#004230',
      background: '#f3f4f0',
      border: '#004230',
      subline: 'Information was found in the sources listed below.',
      body: 'Sample answer text. The real answer is written from the retrieved source text.',
    },
    {
      title: 'Does not match the common use',
      icon: 'info',
      color: '#8a6d00',
      background: '#fdf9e7',
      border: '#8a6d00',
      subline: 'The symptoms you described do not match what this medicine is commonly used for.',
      body: 'Sample answer text. The real answer says what the medicine is commonly used for.',
    },
    {
      title: 'Ask a doctor or pharmacist first',
      icon: 'warning',
      color: '#b85c00',
      background: '#fdf0e2',
      border: '#b85c00',
      subline: 'Please check with a doctor or pharmacist before taking this.',
      body: 'Sample answer text. The real answer explains why a professional should check first.',
    },
    {
      title: 'Get medical help now',
      icon: 'emergency',
      color: '#b3261e',
      background: '#fce8e6',
      border: '#b3261e',
      subline: 'These symptoms can be serious.',
      body: 'If you have trouble breathing, swelling of the face, lips or throat, chest pain or other severe symptoms, get medical help immediately.',
    },
  ];

  const activeOutcome = outcomes[activeTriageState];

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
            <button type="submit" disabled={isSynthesizing || !question.trim()} className="bg-[#004230] text-white px-6 py-2.5 font-label-md text-[14px] border border-[#004230] hover:bg-[#1f5a46] transition-colors cursor-pointer disabled:opacity-50" style={{ borderRadius: '4px' }}>{isSynthesizing ? 'Checking...' : 'Ask'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-[#d6d4cc] p-6" style={{ borderRadius: '4px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#d6d4cc]">
          <div>
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#004230] text-[20px]">verified</span><h3 className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>Answer</h3></div>
            <p className="font-label-sm text-[12px] text-[#5a605c] mt-0.5">Sample answer, not real medical information</p>
          </div>
          <div className="flex items-center gap-1 bg-[#f3f4f0] p-1 border border-[#d6d4cc] overflow-x-auto" style={{ borderRadius: '4px' }}>
            {[0, 1, 2, 3].map((id) => {
              const isActive = activeTriageState === id;
              return <button key={id} type="button" onClick={() => setActiveTriageState(id)} className={`px-2 py-1 text-xs font-semibold cursor-pointer border transition-colors ${isActive ? 'bg-white text-[#1c1f1d] border-[#d6d4cc] shadow-xs' : 'text-[#5a605c] border-transparent hover:text-[#1c1f1d]'}`} style={{ borderRadius: '4px' }}>State {id + 1}</button>;
            })}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3 border border-l-4 flex items-start gap-2.5" style={{ borderColor: activeOutcome.border, backgroundColor: activeOutcome.background, borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: activeOutcome.color }}>{activeOutcome.icon}</span>
            <div><div className="font-label-md text-[14px] font-semibold" style={{ color: activeOutcome.color }}>{activeOutcome.title}</div><div className="font-body-sm text-[13px] text-[#1c1f1d] mt-0.5">{activeOutcome.subline}</div></div>
          </div>
          <div className="font-body-md text-[15px] text-[#1c1f1d] leading-relaxed"><p>{activeOutcome.body}</p></div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#d6d4cc]"><div className="font-body-sm text-[13px] text-[#5a605c]"><span className="font-semibold text-[#1c1f1d]">Sources:</span> Sample source (not real)</div></div>
        <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center gap-2"><span className="material-symbols-outlined text-[#5a605c] text-[16px]">info</span><div className="font-body-sm text-[13px] font-semibold text-[#1c1f1d]">Please confirm with a pharmacist.</div></div>
      </div>
    </div>
  );
}
