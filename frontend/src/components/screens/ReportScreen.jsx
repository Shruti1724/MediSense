import React, { useState } from 'react';

export default function ReportScreen({ medicines, onNavigate, onSaveToCabinet }) {
  const [activeOutcome, setActiveOutcome] = useState('emergency');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSaveToCabinet();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-[#d6d4cc] mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1f5a46]" />
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase tracking-wider font-semibold">
            Sample data, not real medical information
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h1
          className="font-headline-lg text-[#1c1f1d] tracking-tight text-[32px] sm:text-[36px] leading-[42px] font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Medicine Information Report
        </h1>
        <p className="font-body-md text-[15px] text-[#5a605c] mt-2">
          General information from the sources listed under each section, to discuss with your pharmacist or doctor.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="font-label-md text-[14px] text-[#1c1f1d] font-semibold">
            Preview a result type (sample data)
          </label>
          <span className="font-body-sm text-[13px] text-[#5a605c]">Result types</span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-[#edeeeb] mb-3" style={{ borderRadius: '4px' }}>
          {[
            { key: 'emergency', label: 'Emergency' },
            { key: 'found', label: 'Found' },
            { key: 'ask', label: 'Ask Doctor' },
            { key: 'mismatch', label: 'Uncommon Use' },
            { key: 'unverified', label: 'Cannot Verify' },
          ].map((tab) => {
            const isActive = activeOutcome === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveOutcome(tab.key)}
                className={`px-2.5 py-1 text-xs transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-white text-[#1c1f1d] border-[#d6d4cc] font-semibold shadow-xs'
                    : 'text-[#5a605c] border-transparent font-medium hover:text-[#1c1f1d] hover:bg-[#f3f4f0]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeOutcome === 'emergency' && (
          <div className="p-4 border-2 border-[#ba1a1a] bg-[#ffdad6] text-[#93000a] text-base flex items-start gap-3" style={{ borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0">warning</span>
            <div>
              <div className="font-bold text-base text-[#ba1a1a]">Get medical help now</div>
              <div className="font-normal text-sm text-[#ba1a1a] mt-0.5">If this is an emergency, call your local emergency number.</div>
            </div>
          </div>
        )}

        {activeOutcome === 'found' && (
          <div className="p-3 border border-[#1f5a46] bg-[#f3f4f0] text-[#1f5a46] text-sm font-medium flex items-center justify-between" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1f5a46] text-[18px]">verified</span>
              <span className="font-semibold">Information found</span>
            </div>
            <span className="text-xs text-[#5a605c] font-normal">Information found in the sources listed below.</span>
          </div>
        )}

        {activeOutcome === 'ask' && (
          <div className="p-3 border border-[#b85c00] bg-[#fdf0e2] text-[#b85c00] text-sm font-medium flex items-center gap-2" style={{ borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[#b85c00] text-[18px]">contact_support</span>
            <span className="font-semibold">Ask a doctor or pharmacist first</span>
          </div>
        )}

        {activeOutcome === 'mismatch' && (
          <div className="p-3 border border-[#8a6d00] bg-[#fbf3d0] text-[#8a6d00] text-sm font-medium flex items-center gap-2" style={{ borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[#8a6d00] text-[18px]">info</span>
            <span className="font-semibold">Does not match the common use</span>
          </div>
        )}

        {activeOutcome === 'unverified' && (
          <div className="p-3 border border-[#8a6d00] bg-[#fbf3d0] text-[#8a6d00] text-sm font-medium flex items-center gap-2" style={{ borderRadius: '4px' }}>
            <span className="material-symbols-outlined text-[#8a6d00] text-[18px]">help_outline</span>
            <span className="font-semibold">MediSense cannot verify this medicine. Please ask a pharmacist.</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Interaction & Safety Warnings</h2>
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase font-semibold">Tiered Severities</span>
        </div>

        <div className="p-4 mb-3 border-2 border-[#ba1a1a] bg-[#fce8e6] text-[#b3261e]" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-1.5 mb-1 font-bold text-sm tracking-wide uppercase">
            <span className="material-symbols-outlined text-[16px]">report</span>
            <span>Major Precaution</span>
          </div>
          <p className="font-bold text-sm leading-snug">Two of these medicines can raise the risk of bleeding when taken together. Ask your doctor or pharmacist before the next dose.</p>
        </div>

        <div className="p-3 mb-3 border border-[#b85c00] bg-[#fdf0e2] text-[#b85c00]" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[15px]">priority_high</span>
            <span>Moderate Interaction</span>
          </div>
          <p className="text-sm font-normal leading-snug">Ask your pharmacist about taking aspirin and ibuprofen together.</p>
        </div>

        <div className="p-3 mb-4 border border-[#8a6d00] bg-[#fbf3d0] text-[#8a6d00]" style={{ borderRadius: '4px' }}>
          <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[15px]">notification_important</span>
            <span>Minor Advisory</span>
          </div>
          <p className="text-sm font-normal leading-snug">Some medicines can upset the stomach. Read the leaflet or ask a pharmacist.</p>
        </div>
      </div>

      <div className="bg-white border border-[#d6d4cc] p-4 mb-6" style={{ borderRadius: '4px' }}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#5a605c] text-[20px] mt-0.5 shrink-0">psychology_alt</span>
          <div>
            <div className="text-[14px] font-medium text-[#1c1f1d]">Commonly used for (an inference, not a diagnosis)</div>
            <p className="font-body-sm text-[13px] text-[#5a605c] mt-1 leading-relaxed">This is what these medicines are commonly used for. It is an inference from the medicine names, not a diagnosis.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-white border border-[#d6d4cc] p-5" style={{ borderRadius: '4px' }}>
          <div className="border-b border-[#d6d4cc] pb-3 mb-4 flex items-center justify-between">
            <h3 className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">What each medicine is commonly used for</h3>
            <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">Sample data</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><span className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Amoxicillin</span><span className="px-1.5 py-0.5 text-xs bg-[#edeeeb] text-[#5a605c]" style={{ borderRadius: '4px' }}>Antibiotic</span></div>
              <p className="font-body-md text-[15px] text-[#404944] leading-relaxed">Commonly used for bacterial infections.</p>
            </div>
            <div className="border-t border-[#d6d4cc] pt-3">
              <div className="flex items-center gap-2 mb-1"><span className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Atorvastatin</span><span className="px-1.5 py-0.5 text-xs bg-[#edeeeb] text-[#5a605c]" style={{ borderRadius: '4px' }}>Statin</span></div>
              <p className="font-body-md text-[15px] text-[#404944] leading-relaxed">Commonly used to help control cholesterol.</p>
            </div>
            {medicines.some((medicine) => medicine.name.toLowerCase().includes('metformin')) && (
              <div className="border-t border-[#d6d4cc] pt-3">
                <div className="flex items-center gap-2 mb-1"><span className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Metformin</span><span className="px-1.5 py-0.5 text-xs bg-[#edeeeb] text-[#5a605c]" style={{ borderRadius: '4px' }}>Antidiabetic</span></div>
                <p className="font-body-md text-[15px] text-[#404944] leading-relaxed">Commonly used to help control blood sugar.</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center justify-between text-[13px] text-[#5a605c]"><span>Sources: Sample source (not real)</span><span className="material-symbols-outlined text-[#5a605c] text-[16px]">menu_book</span></div>
        </div>

        <div className="bg-white border border-[#d6d4cc] p-5" style={{ borderRadius: '4px' }}>
          <div className="border-b border-[#d6d4cc] pb-3 mb-3 flex items-center justify-between"><h3 className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Who should be careful</h3><span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">Sample data</span></div>
          <ul className="space-y-2.5 font-body-md text-[15px] text-[#404944]">
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5a605c] mt-2 shrink-0" /><span>People with kidney problems should ask a doctor or pharmacist first.</span></li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5a605c] mt-2 shrink-0" /><span>If you are pregnant or breastfeeding, ask a doctor or pharmacist first.</span></li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#5a605c] mt-2 shrink-0" /><span>If you are allergic to penicillin, ask a doctor or pharmacist first.</span></li>
          </ul>
          <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center justify-between text-[13px] text-[#5a605c]"><span>Sources: Sample source (not real)</span><span className="material-symbols-outlined text-[#5a605c] text-[16px]">verified_user</span></div>
        </div>

        <div className="bg-white border border-[#d6d4cc] p-5" style={{ borderRadius: '4px' }}>
          <div className="border-b border-[#d6d4cc] pb-3 mb-3 flex items-center justify-between"><h3 className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Common side effects</h3><span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">Sample data</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
            <div className="p-3 bg-[#f8faf6] border border-[#d6d4cc]" style={{ borderRadius: '4px' }}><div className="font-title-md text-[16px] text-[#1c1f1d] mb-0.5 font-semibold">Nausea</div><div className="font-body-sm text-[13px] text-[#5a605c]">Stomach upset can happen.</div></div>
            <div className="p-3 bg-[#f8faf6] border border-[#d6d4cc]" style={{ borderRadius: '4px' }}><div className="font-title-md text-[16px] text-[#1c1f1d] mb-0.5 font-semibold">Headache</div><div className="font-body-sm text-[13px] text-[#5a605c]">Headache can happen.</div></div>
            <div className="p-3 bg-[#f8faf6] border border-[#d6d4cc]" style={{ borderRadius: '4px' }}><div className="font-title-md text-[16px] text-[#1c1f1d] mb-0.5 font-semibold">Mild rash</div><div className="font-body-sm text-[13px] text-[#5a605c]">A mild rash can happen. Tell a doctor if it spreads.</div></div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center justify-between text-[13px] text-[#5a605c]"><span>Sources: Sample source (not real)</span><span className="material-symbols-outlined text-[#5a605c] text-[16px]">clinical_notes</span></div>
        </div>

        <div className="bg-white border border-[#d6d4cc] p-5" style={{ borderRadius: '4px' }}>
          <div className="border-b border-[#d6d4cc] pb-3 mb-3 flex items-center justify-between"><h3 className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Diet and lifestyle</h3><span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">Sample data</span></div>
          <div className="space-y-3 font-body-md text-[15px] text-[#404944]">
            <div className="flex items-start gap-2.5"><span className="material-symbols-outlined text-[#5a605c] text-[18px] mt-0.5 shrink-0">no_food</span><div><span className="font-semibold text-[#1c1f1d]">Grapefruit avoidance:</span><span className="ml-1">Avoid drinking grapefruit juice or eating grapefruit when taking Atorvastatin, as it raises blood levels of the active compound.</span></div></div>
            <div className="flex items-start gap-2.5"><span className="material-symbols-outlined text-[#5a605c] text-[18px] mt-0.5 shrink-0">event_repeat</span><div><span className="font-semibold text-[#1c1f1d]">Course completion:</span><span className="ml-1">Finish the full antibiotic course even if feeling fully recovered before completion.</span></div></div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center justify-between text-[13px] text-[#5a605c]"><span>Sources: Sample source (not real)</span><span className="material-symbols-outlined text-[#5a605c] text-[16px]">local_pharmacy</span></div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#d6d4cc] flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handlePrint} className="bg-white border border-[#1f5a46] text-[#1f5a46] px-4 py-2.5 font-medium text-sm hover:bg-[#eef3f0] transition-colors flex items-center gap-2 cursor-pointer" style={{ borderRadius: '4px' }}><span className="material-symbols-outlined text-[18px]">download</span><span>Download PDF</span></button>
          <button type="button" onClick={handleSave} className="bg-[#1f5a46] border border-[#1f5a46] text-white px-4 py-2.5 font-medium text-sm hover:bg-[#004230] transition-colors flex items-center gap-2 cursor-pointer" style={{ borderRadius: '4px' }}><span className="material-symbols-outlined text-[18px]">inventory_2</span><span>Save to Cabinet</span></button>
          {savedSuccess && <span className="text-[13px] text-[#1f5a46] font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span>Added to cabinet!</span>}
        </div>
        <button type="button" onClick={() => onNavigate('home')} className="text-[#1f5a46] underline text-sm hover:text-[#004230] transition-colors cursor-pointer bg-transparent border-0 p-0">Start over</button>
      </div>
    </div>
  );
}
