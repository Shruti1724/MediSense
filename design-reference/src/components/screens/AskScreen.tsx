import React, { useState } from 'react';

export const AskScreen: React.FC = () => {
  const [question, setQuestion] = useState<string>(
    'I have a persistent sinus headache and I take lisinopril for high blood pressure. Can I take this amoxicillin left over from last year?'
  );
  const [activeTriageState, setActiveTriageState] = useState<number>(0);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    // Simulate real clinical inquiry synthesis
    setTimeout(() => {
      setIsSynthesizing(false);
      // Auto-switch based on text keywords if relevant, default to 0
      const lower = question.toLowerCase();
      if (lower.includes('chest pain') || lower.includes('can\'t breathe') || lower.includes('emergency')) {
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

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      {/* Screen Title / Overline */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-[2px] bg-[#004230]"></span>
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase tracking-wider font-semibold">
            Clinical Reference & Inquiry
          </span>
        </div>
        <h1 
          className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] tracking-tight font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Ask about a medicine
        </h1>
        <p className="font-body-md text-[15px] text-[#5a605c] mt-1">
          Cross-reference active medications against personal circumstances and symptom queries.
        </p>
      </div>

      {/* Medicine Card */}
      <div 
        className="bg-white border border-[#d6d4cc] p-6 mb-6"
        style={{ borderRadius: '4px' }}
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#d6d4cc]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 
                className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Amoxicillin (Amoxil)
              </h2>
              <span 
                className="inline-flex items-center border border-[#d6d4cc] px-2 py-0.5 font-label-sm text-[12px] text-[#5a605c] bg-[#f3f4f0]"
                style={{ borderRadius: '4px' }}
              >
                Prescription only
              </span>
              <span 
                className="inline-flex items-center border border-[#d6d4cc] px-2 py-0.5 font-label-sm text-[12px] text-[#5a605c] bg-[#f3f4f0]"
                style={{ borderRadius: '4px' }}
              >
                500 mg capsule
              </span>
            </div>
            <p className="font-label-md text-[14px] text-[#5a605c] mt-1">
              Class: Aminopenicillin antibacterial agent
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-label-md text-[14px] text-[#5a605c] tabular-nums">
              Batch: #NL-4492-B
            </div>
            <div className="font-label-md text-[14px] text-[#5a605c] tabular-nums font-semibold">
              Expiry: 08/2027
            </div>
          </div>
        </div>

        {/* Comparison Warning Banner: Demonstration of Expired State */}
        <div 
          className="my-4 p-3 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] flex items-start gap-2.5"
          style={{ borderRadius: '4px' }}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-[#ba1a1a]">
            error
          </span>
          <div className="flex-1">
            <div className="font-label-md text-[14px] font-semibold text-[#ba1a1a]">
              Comparative State Alert: Expired: 01/2024. Do not ingest.
            </div>
            <div className="font-body-sm text-[13px] mt-0.5 text-[#ba1a1a] leading-relaxed">
              Chemical degradation compromises antibacterial efficacy and may induce renal stress. Dispose via approved pharmacy take-back.
            </div>
          </div>
        </div>

        {/* Medicine Structural Information Grid */}
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-[#d6d4cc]">
            <div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">
              Commonly used for
            </div>
            <div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">
              Bacterial infections of the ears, nose, throat, lower respiratory tract, or chest.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-[#d6d4cc]">
            <div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">
              Common side effects
            </div>
            <div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">
              Nausea, loose stools or diarrhea, headache, and mild skin reactions.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2">
            <div className="sm:col-span-4 font-label-md text-[14px] text-[#5a605c] font-semibold">
              Who should be careful
            </div>
            <div className="sm:col-span-8 font-body-md text-[15px] text-[#1c1f1d]">
              Individuals with known penicillin hypersensitivity, infectious mononucleosis, or severe kidney impairments.
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Card */}
      <div 
        className="bg-white border border-[#d6d4cc] p-6 mb-8"
        style={{ borderRadius: '4px' }}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label 
              className="block font-title-md text-[16px] text-[#1c1f1d] mb-1 font-semibold"
              htmlFor="situation-input"
            >
              Describe your situation
            </label>
            <textarea
              id="situation-input"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question, current symptoms, or concurrent prescriptions here..."
              className="w-full border border-[#d6d4cc] bg-white text-[#1c1f1d] p-3 font-body-md text-[15px] focus:outline-none focus:border-[#004230] resize-none transition-colors"
              style={{ borderRadius: '4px' }}
            />
            <div className="font-body-sm text-[13px] text-[#5a605c] mt-1.5">
              For example: I have a headache and I take blood pressure medicine.
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 font-label-sm text-[12px] text-[#5a605c]">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Non-diagnostic consultation ledger</span>
            </div>
            <button
              type="submit"
              disabled={isSynthesizing || !question.trim()}
              className="bg-[#004230] text-white px-6 py-2.5 font-label-md text-[14px] border border-[#004230] hover:bg-[#1f5a46] transition-colors cursor-pointer disabled:opacity-50"
              style={{ borderRadius: '4px' }}
            >
              {isSynthesizing ? 'Checking...' : 'Ask'}
            </button>
          </div>
        </form>
      </div>

      {/* Answer Card */}
      <div 
        className="bg-white border border-[#d6d4cc] p-6"
        style={{ borderRadius: '4px' }}
      >
        {/* Header & Outcome Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#d6d4cc]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004230] text-[20px]">verified</span>
              <h3 
                className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Verified Answer
              </h3>
            </div>
            <p className="font-label-sm text-[12px] text-[#5a605c] mt-0.5">
              Synthesized from indexed compendia and monographs
            </p>
          </div>

          {/* Outcome Switcher Tabs (Demo Controls for all 4 states) */}
          <div 
            className="flex items-center gap-1 bg-[#f3f4f0] p-1 border border-[#d6d4cc] overflow-x-auto"
            style={{ borderRadius: '4px' }}
          >
            {[
              { id: 0, label: 'State 1' },
              { id: 1, label: 'State 2' },
              { id: 2, label: 'State 3' },
              { id: 3, label: 'State 4' },
            ].map((tab) => {
              const isActive = activeTriageState === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTriageState(tab.id)}
                  className={`px-2 py-1 text-xs font-semibold cursor-pointer border transition-colors ${
                    isActive
                      ? 'bg-white text-[#1c1f1d] border-[#d6d4cc] shadow-xs'
                      : 'text-[#5a605c] border-transparent hover:text-[#1c1f1d]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Outcome Displays (4 Clinical Triage Outcome Styles) */}
        <div className="mt-5 space-y-4">
          {/* Outcome 1: Information Found */}
          {activeTriageState === 0 && (
            <div className="space-y-4">
              <div 
                className="p-3 border border-[#004230] bg-[#f3f4f0] border-l-4 border-l-[#004230] flex items-start gap-2.5"
                style={{ borderRadius: '4px' }}
              >
                <span className="material-symbols-outlined text-[#004230] text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <div className="font-label-md text-[14px] text-[#004230] font-semibold">
                    Information found
                  </div>
                  <div className="font-body-sm text-[13px] text-[#1c1f1d] mt-0.5">
                    Established pharmacological references exist for this inquiry.
                  </div>
                </div>
              </div>

              <div className="font-body-md text-[15px] text-[#1c1f1d] space-y-3 leading-relaxed">
                <p>
                  Amoxicillin does not demonstrate a documented pharmacokinetic interaction with angiotensin-converting enzyme (ACE) inhibitors such as lisinopril. Lisinopril operates on the renin-angiotensin-aldosterone axis to modulate arterial tension, whereas amoxicillin binds bacterial penicillin-binding proteins without directly altering systemic vascular resistance.
                </p>
                <p>
                  However, using leftover antimicrobial stock from a previous regimen presents clinical concerns. Partial courses frequently do not contain adequate quantity to eradicate active bacterial colonies, risking recrudescence and microbial resistance. Furthermore, sinus discomfort is most commonly viral in etiology, against which antibacterial agents provide no efficacy.
                </p>
              </div>
            </div>
          )}

          {/* Outcome 2: Does not match common use */}
          {activeTriageState === 1 && (
            <div className="space-y-4">
              <div 
                className="p-3 border border-[#8a6d00] bg-[#fdf9e7] border-l-4 border-l-[#8a6d00] flex items-start gap-2.5"
                style={{ borderRadius: '4px' }}
              >
                <span className="material-symbols-outlined text-[#8a6d00] text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <div className="font-label-md text-[14px] text-[#8a6d00] font-semibold">
                    Does not match the common use
                  </div>
                  <div className="font-body-sm text-[13px] text-[#1c1f1d] mt-0.5">
                    The stated symptoms do not align with verified indications for this drug class.
                  </div>
                </div>
              </div>

              <div className="font-body-md text-[15px] text-[#1c1f1d] space-y-3 leading-relaxed">
                <p>
                  Amoxicillin is indicated strictly for confirmed or highly suspected bacterial infections. It carries no analgesic, antipyretic, or decongestant properties. Using this medication primarily to alleviate acute headache pain falls outside recognized therapeutic guidelines.
                </p>
                <p>
                  Antibiotic administration without a documented bacterial origin subjects the host microbiome to needless alteration without addressing intracranial or sinus pressure pain pathways.
                </p>
              </div>
            </div>
          )}

          {/* Outcome 3: Ask a doctor or pharmacist first */}
          {activeTriageState === 2 && (
            <div className="space-y-4">
              <div 
                className="p-3 border border-[#b85c00] bg-[#fdf0e2] border-l-4 border-l-[#b85c00] flex items-start gap-2.5"
                style={{ borderRadius: '4px' }}
              >
                <span className="material-symbols-outlined text-[#b85c00] text-[18px] shrink-0 mt-0.5">
                  warning
                </span>
                <div>
                  <div className="font-label-md text-[14px] text-[#b85c00] font-semibold">
                    Ask a doctor or pharmacist first
                  </div>
                  <div className="font-body-sm text-[13px] text-[#1c1f1d] mt-0.5">
                    Potential physiological conflict or contraindication requires professional evaluation.
                  </div>
                </div>
              </div>

              <div className="font-body-md text-[15px] text-[#1c1f1d] space-y-3 leading-relaxed">
                <p>
                  While lisinopril and amoxicillin lack direct competitive metabolic pathway inhibition, impaired renal clearance must be reviewed. Both compounds undergo primary renal elimination. Patients receiving antihypertensive regimens with concurrent renal markers require calibrated antimicrobial dosing intervals.
                </p>
                <p>
                  Additionally, self-administering unverified courses complicates formal diagnosis should bacterial sinusitis require culture or alternate therapeutic targeting.
                </p>
              </div>
            </div>
          )}

          {/* Outcome 4: Get medical help now */}
          {activeTriageState === 3 && (
            <div className="space-y-4">
              <div 
                className="p-3 border border-[#b3261e] bg-[#fce8e6] border-l-4 border-l-[#b3261e] flex items-start gap-2.5"
                style={{ borderRadius: '4px' }}
              >
                <span className="material-symbols-outlined text-[#b3261e] text-[18px] shrink-0 mt-0.5">
                  emergency
                </span>
                <div>
                  <div className="font-label-md text-[14px] text-[#b3261e] font-semibold">
                    Get medical help now
                  </div>
                  <div className="font-body-sm text-[13px] text-[#1c1f1d] mt-0.5">
                    Potential critical adverse event or urgent symptom cluster detected.
                  </div>
                </div>
              </div>

              <div className="font-body-md text-[15px] text-[#1c1f1d] space-y-3 leading-relaxed">
                <p>
                  If the headache is abrupt, of unprecedented intensity, accompanied by a stiff neck, high fever, visual impairment, facial swelling, difficulty breathing, or rash following any medication ingestion, immediate emergency triage is necessary.
                </p>
                <p>
                  Severe swelling of the lips, tongue, or airway may indicate an acute IgE-mediated hypersensitivity reaction to beta-lactam antibiotics requiring prompt intramuscular epinephrine and clinical stabilization.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sources Section */}
        <div className="mt-6 pt-4 border-t border-[#d6d4cc]">
          <div className="font-body-sm text-[13px] text-[#5a605c]">
            <span className="font-semibold text-[#1c1f1d]">Sources:</span> British National Formulary (BNF), Mayo Clinic Pharmacotherapy Guide [Sample source], Clinical Pharmacology Database Rev. 2024.3.
          </div>
        </div>

        {/* Mandatory Base Disclaimer */}
        <div className="mt-4 pt-3 border-t border-[#d6d4cc] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#5a605c] text-[16px]">info</span>
          <div className="font-body-sm text-[13px] font-semibold text-[#1c1f1d]">
            Please confirm with a pharmacist.
          </div>
        </div>
      </div>

      {/* Archival Index Note */}
      <div className="mt-6 px-1 flex items-center justify-between font-label-sm text-[12px] text-[#5a605c]">
        <span>MONOGRAPH ID: 0921-AMX</span>
        <span>UPDATED: OCTOBER 2024</span>
      </div>
    </div>
  );
};
