import React, { useState } from 'react';

export const StyleGuideScreen: React.FC = () => {
  const [sampleInput, setSampleInput] = useState('');
  const [sampleNotes, setSampleNotes] = useState('');
  const [ageVerified, setAgeVerified] = useState(true);
  const [noHepatic, setNoHepatic] = useState(false);
  const [adminRoute, setAdminRoute] = useState<'oral' | 'sublingual'>('oral');

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      {/* Header Block */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-label-sm text-[12px] uppercase tracking-wider text-[#5a605c] font-semibold">
            Document Ref. MDS-DS-2025
          </span>
          <span className="text-[#5a605c] text-[13px]">/</span>
          <span className="font-label-sm text-[12px] uppercase tracking-wider text-[#004230] font-semibold">
            Version 2.4.1 Validated
          </span>
        </div>
        <h1 
          className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] mb-2 font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          MediSense UI Components & Style Guide
        </h1>
        <p className="font-body-md text-[15px] text-[#5a605c]">
          A standardized design library for clinical-editorial readability and public health publishing.
        </p>
      </header>

      {/* Component Panel 1: Buttons & Interactive Links */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              1. Actions & Links
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              Standard interactive tap targets with rigid 4px perimeter geometry.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Primary Action */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-[12px] text-[#5a605c] uppercase font-semibold">
              Primary Action
            </span>
            <button 
              type="button"
              className="w-full text-center bg-[#1f5a46] text-white font-label-md text-[14px] px-4 py-2 hover:bg-[#004230] transition-colors focus:outline-none cursor-pointer border-0"
              style={{ borderRadius: '4px' }}
            >
              Confirm Prescription
            </button>
          </div>

          {/* Secondary Action */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-[12px] text-[#5a605c] uppercase font-semibold">
              Secondary Outlined
            </span>
            <button 
              type="button"
              className="w-full text-center bg-white text-[#1f5a46] font-label-md text-[14px] px-4 py-2 border border-[#d6d4cc] hover:bg-[#f3f4f0] transition-colors focus:outline-none cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              Review Counter-Indications
            </button>
          </div>

          {/* Disabled Action */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-[12px] text-[#5a605c] uppercase font-semibold">
              Disabled State
            </span>
            <button 
              type="button"
              disabled
              className="w-full text-center bg-[#d9dad7] text-[#5a605c] font-label-md text-[14px] px-4 py-2 cursor-not-allowed border-0"
              style={{ borderRadius: '4px' }}
            >
              Dosage Locked
            </button>
          </div>

          {/* Text Link */}
          <div className="flex flex-col gap-2">
            <span className="font-label-sm text-[12px] text-[#5a605c] uppercase font-semibold">
              Editorial Text Link
            </span>
            <div className="h-10 flex items-center">
              <a 
                href="#mod01" 
                onClick={(e) => e.preventDefault()}
                className="font-label-md text-[14px] text-[#1f5a46] underline hover:text-[#004230] transition-colors"
              >
                View full monograph in National Formulary →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Component Panel 2: Form Inputs & Selection Controls */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              2. Form Inputs & Selection
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              Controlled data collection patterns calibrated for high clinical accuracy.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.02
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Text Input */}
          <div>
            <label className="block font-label-md text-[14px] text-[#1c1f1d] mb-1 font-semibold" htmlFor="med-search">
              Generic compound or INN name
            </label>
            <input 
              id="med-search"
              type="text"
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              placeholder="e.g., Amoxicillin trihydrate or Paracetamol"
              className="w-full h-10 px-3 py-2 bg-white border border-[#d6d4cc] text-[#1c1f1d] font-body-md text-[15px] placeholder-[#5a605c] focus:outline-none focus:border-[#1f5a46]"
              style={{ borderRadius: '4px' }}
            />
            <span className="block mt-1 font-body-sm text-[13px] text-[#5a605c]">
              Use non-proprietary international names where available.
            </span>
          </div>

          {/* Textarea */}
          <div>
            <label className="block font-label-md text-[14px] text-[#1c1f1d] mb-1 font-semibold" htmlFor="clinical-notes">
              Reported patient contraindications or observed symptoms
            </label>
            <textarea 
              id="clinical-notes"
              rows={3}
              value={sampleNotes}
              onChange={(e) => setSampleNotes(e.target.value)}
              placeholder="Specify onset, duration, previous adverse reactions, or concurrent OTC supplementation..."
              className="w-full px-3 py-2 bg-white border border-[#d6d4cc] text-[#1c1f1d] font-body-md text-[15px] placeholder-[#5a605c] focus:outline-none focus:border-[#1f5a46]"
              style={{ borderRadius: '4px' }}
            />
          </div>

          {/* Checkboxes */}
          <div>
            <span className="block font-label-md text-[14px] text-[#1c1f1d] mb-2 font-semibold">
              Safety Verification Flags
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className="flex items-center gap-3 p-3 bg-[#f3f4f0] border border-[#d6d4cc] cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                <input 
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => setAgeVerified(e.target.checked)}
                  className="w-4 h-4 accent-[#1f5a46] cursor-pointer"
                  style={{ borderRadius: '4px' }}
                />
                <span className="font-body-md text-[15px] text-[#1c1f1d]">
                  Age bracket verified (18 to 64 years)
                </span>
              </label>

              <label 
                className="flex items-center gap-3 p-3 bg-[#f3f4f0] border border-[#d6d4cc] cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                <input 
                  type="checkbox"
                  checked={noHepatic}
                  onChange={(e) => setNoHepatic(e.target.checked)}
                  className="w-4 h-4 accent-[#1f5a46] cursor-pointer"
                  style={{ borderRadius: '4px' }}
                />
                <span className="font-body-md text-[15px] text-[#1c1f1d]">
                  No known hepatic impairment
                </span>
              </label>
            </div>
          </div>

          {/* Radio Cards */}
          <div>
            <span className="block font-label-md text-[14px] text-[#1c1f1d] mb-2 font-semibold">
              Administration Route
            </span>
            <div className="flex flex-col gap-2">
              <label 
                onClick={() => setAdminRoute('oral')}
                className={`flex items-start justify-between p-3 border cursor-pointer transition-colors ${
                  adminRoute === 'oral' ? 'bg-[#f3f4f0] border-[#1f5a46]' : 'bg-white border-[#d6d4cc]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <div className="flex items-start gap-3">
                  <input 
                    type="radio" 
                    name="style-route" 
                    value="oral"
                    checked={adminRoute === 'oral'}
                    onChange={() => setAdminRoute('oral')}
                    className="mt-1 w-4 h-4 accent-[#1f5a46]"
                  />
                  <div>
                    <p className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Oral Suspension or Solid Dose</p>
                    <p className="font-body-sm text-[13px] text-[#5a605c]">Standard systemic uptake, recommended with water postprandial.</p>
                  </div>
                </div>
                <span 
                  className="font-label-sm text-[12px] text-[#1f5a46] px-2 py-0.5 bg-[#edeeeb] border border-[#d6d4cc] font-semibold"
                  style={{ borderRadius: '4px' }}
                >
                  Default
                </span>
              </label>

              <label 
                onClick={() => setAdminRoute('sublingual')}
                className={`flex items-start justify-between p-3 border cursor-pointer transition-colors ${
                  adminRoute === 'sublingual' ? 'bg-[#f3f4f0] border-[#1f5a46]' : 'bg-white border-[#d6d4cc]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <div className="flex items-start gap-3">
                  <input 
                    type="radio" 
                    name="style-route" 
                    value="sublingual"
                    checked={adminRoute === 'sublingual'}
                    onChange={() => setAdminRoute('sublingual')}
                    className="mt-1 w-4 h-4 accent-[#1f5a46]"
                  />
                  <div>
                    <p className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Sublingual / Buccal Fast Dissolve</p>
                    <p className="font-body-sm text-[13px] text-[#5a605c]">Bypasses hepatic first-pass metabolism for immediate onset.</p>
                  </div>
                </div>
                <span 
                  className="font-label-sm text-[12px] text-[#5a605c] px-2 py-0.5 bg-[#edeeeb] border border-[#d6d4cc] font-semibold"
                  style={{ borderRadius: '4px' }}
                >
                  Alternative
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Component Panel 3: Notice & Warning Protocol (4 Tiers) */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              3. Notice & Warning Protocol (4 Tiers)
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              Triage indicators engineered for high-consequence risk differentiation.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.03
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Tier 1: Emergency */}
          <div 
            className="p-4 bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#ba1a1a]">dangerous</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-title-md text-[16px] text-[#ba1a1a] font-bold">
                    Emergency / Major Interaction
                  </h3>
                  <span 
                    className="font-label-sm text-[11px] px-1.5 py-0.5 bg-[#ba1a1a] text-white uppercase font-bold"
                    style={{ borderRadius: '4px' }}
                  >
                    Immediate Action
                  </span>
                </div>
                <p className="font-body-md text-[15px] text-[#ba1a1a]">
                  Severe synergistic central nervous system depression risk. Do not co-administer with tranquilizers or ethanol. Seek emergency clinical guidance if ingested simultaneously.
                </p>
              </div>
            </div>
          </div>

          {/* Tier 2: Warning */}
          <div 
            className="p-4 bg-[#fdf0e2] text-[#b85c00] border border-[#f8cfab]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#b85c00]">warning</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-title-md text-[16px] text-[#b85c00] font-semibold">
                    Warning / Moderate Advisory
                  </h3>
                  <span 
                    className="font-label-sm text-[11px] px-1.5 py-0.5 bg-[#b85c00] text-white uppercase font-semibold"
                    style={{ borderRadius: '4px' }}
                  >
                    Monitor
                  </span>
                </div>
                <p className="font-body-md text-[15px] text-[#b85c00]">
                  Concomitant use may diminish therapeutic bioavailability by up to 35 percent. Space dosage interval by at least 4 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Tier 3: Caution */}
          <div 
            className="p-4 bg-[#fbf3d0] text-[#8a6d00] border border-[#ebd999]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#8a6d00]">report_problem</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-title-md text-[16px] text-[#8a6d00] font-semibold">
                    Caution / Minor Advisory
                  </h3>
                  <span 
                    className="font-label-sm text-[11px] px-1.5 py-0.5 bg-[#8a6d00] text-white uppercase font-semibold"
                    style={{ borderRadius: '4px' }}
                  >
                    Notice
                  </span>
                </div>
                <p className="font-body-md text-[15px] text-[#8a6d00]">
                  May cause mild xerostomia (dry mouth) or transient drowsiness during initial 48 hours of treatment regime.
                </p>
              </div>
            </div>
          </div>

          {/* Tier 4: Info */}
          <div 
            className="p-4 bg-[#eef3f0] text-[#1f5a46] border border-[#c2dad0]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#1f5a46]">check_circle</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-title-md text-[16px] text-[#1f5a46] font-semibold">
                    Info / Validated Regimen
                  </h3>
                  <span 
                    className="font-label-sm text-[11px] px-1.5 py-0.5 bg-[#1f5a46] text-white uppercase font-semibold"
                    style={{ borderRadius: '4px' }}
                  >
                    Confirmed
                  </span>
                </div>
                <p className="font-body-md text-[15px] text-[#1f5a46]">
                  No documented clinical cross-reactivity with selected profile. Verified across primary medical monographs and clinical registries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Component Panel 4: Badges, Tags & Confidence Signals */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              4. Badges, Tags & Confidence Signals
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              System metadata indicators and validation confidence metrics.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Confidence Badges */}
          <div 
            className="p-4 bg-[#f3f4f0] border border-[#d6d4cc]"
            style={{ borderRadius: '4px' }}
          >
            <span className="block font-label-sm text-[12px] text-[#5a605c] uppercase mb-3 font-semibold">
              System Confidence
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <span 
                className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-[#1f5a46] text-white font-label-sm text-[12px] font-semibold"
                style={{ borderRadius: '4px' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                High Confidence
              </span>
              <span 
                className="inline-flex items-center gap-1.5 h-6 px-2.5 bg-[#b85c00] text-white font-label-sm text-[12px] font-semibold"
                style={{ borderRadius: '4px' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                Check this
              </span>
            </div>
          </div>

          {/* Regulatory Classification Tags */}
          <div 
            className="p-4 bg-[#f3f4f0] border border-[#d6d4cc]"
            style={{ borderRadius: '4px' }}
          >
            <span className="block font-label-sm text-[12px] text-[#5a605c] uppercase mb-3 font-semibold">
              Regulatory Schedule
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <span 
                className="inline-flex items-center h-6 px-2.5 bg-[#edeeeb] text-[#1c1f1d] border border-[#d6d4cc] font-label-sm text-[12px] font-semibold"
                style={{ borderRadius: '4px' }}
              >
                OTC
              </span>
              <span 
                className="inline-flex items-center h-6 px-2.5 bg-[#e7e9e5] text-[#1c1f1d] border border-[#d6d4cc] font-label-sm text-[12px] font-semibold"
                style={{ borderRadius: '4px' }}
              >
                Prescription only
              </span>
              <span 
                className="inline-flex items-center h-6 px-2 bg-[#edeeeb] text-[#5a605c] border border-[#d6d4cc] font-label-sm text-[12px]"
                style={{ borderRadius: '4px' }}
              >
                Schedule II
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Component Panel 5: Decision & Outcome Banners */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              5. Decision & Outcome Banners
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              Exhaustive standard outputs from algorithmic interaction lookups.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.05
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* 1. Information found */}
          <div 
            className="flex items-center justify-between p-3 bg-[#f3f4f0] border border-[#c2dad0]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#1f5a46]">verified</span>
              <span className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Information found</span>
            </div>
            <span 
              className="font-label-sm text-[12px] text-[#1f5a46] px-2 py-0.5 bg-[#eef3f0] border border-[#c2dad0] font-semibold"
              style={{ borderRadius: '4px' }}
            >
              Documented
            </span>
          </div>

          {/* 2. Ask a doctor or pharmacist first */}
          <div 
            className="flex items-center justify-between p-3 bg-[#fdf0e2] border border-[#f8cfab]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#b85c00]">contact_support</span>
              <span className="font-title-md text-[16px] text-[#b85c00] font-semibold">Ask a doctor or pharmacist first</span>
            </div>
            <span 
              className="font-label-sm text-[12px] text-[#b85c00] px-2 py-0.5 bg-white border border-[#f8cfab] font-semibold"
              style={{ borderRadius: '4px' }}
            >
              Advisory
            </span>
          </div>

          {/* 3. Does not match the common use */}
          <div 
            className="flex items-center justify-between p-3 bg-[#fbf3d0] border border-[#ebd999]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#8a6d00]">info</span>
              <span className="font-title-md text-[16px] text-[#8a6d00] font-semibold">Does not match the common use</span>
            </div>
            <span 
              className="font-label-sm text-[12px] text-[#8a6d00] px-2 py-0.5 bg-white border border-[#ebd999] font-semibold"
              style={{ borderRadius: '4px' }}
            >
              Atypical
            </span>
          </div>

          {/* 4. Get medical help now */}
          <div 
            className="flex items-center justify-between p-3 bg-[#ffdad6] border border-[#ba1a1a]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">emergency</span>
              <span className="font-title-md text-[16px] text-[#ba1a1a] font-bold">Get medical help now</span>
            </div>
            <span 
              className="font-label-sm text-[12px] text-[#ba1a1a] px-2 py-0.5 bg-white border border-[#ba1a1a] font-bold uppercase"
              style={{ borderRadius: '4px' }}
            >
              Critical
            </span>
          </div>

          {/* 5. Cannot verify */}
          <div 
            className="flex items-center justify-between p-3 bg-[#edeeeb] border border-[#d6d4cc]"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-[#5a605c]">help_outline</span>
              <span className="font-title-md text-[16px] text-[#5a605c] font-semibold">Cannot verify</span>
            </div>
            <span 
              className="font-label-sm text-[12px] text-[#5a605c] px-2 py-0.5 bg-white border border-[#d6d4cc] font-semibold"
              style={{ borderRadius: '4px' }}
            >
              Insufficient Data
            </span>
          </div>
        </div>
      </section>

      {/* Component Panel 6: Source Citation Block */}
      <section 
        className="bg-white p-6 mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#d6d4cc]">
          <div>
            <h2 
              className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              6. Source Citation Block
            </h2>
            <p className="font-body-sm text-[13px] text-[#5a605c]">
              Institutional provenance records required for clinical audit trails.
            </p>
          </div>
          <span className="font-label-sm text-[12px] text-[#5a605c] font-semibold">
            MOD.06
          </span>
        </div>

        <div 
          className="p-4 bg-[#f3f4f0] border border-[#d6d4cc]"
          style={{ borderRadius: '4px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[16px] text-[#5a605c]">menu_book</span>
            <span className="font-label-sm text-[12px] uppercase tracking-wider text-[#5a605c] font-semibold">
              Institutional Records
            </span>
          </div>
          <p className="font-body-md text-[15px] text-[#1c1f1d] mb-3 leading-relaxed">
            Sources: British National Formulary (BNF), US FDA Package Insert [Sample source]
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body-sm text-[13px] text-[#5a605c]">
            <span>Curated: Oct 2024</span>
            <span>•</span>
            <span>Peer Review: Royal College Pharmacologists</span>
            <span>•</span>
            <a 
              href="#doi" 
              onClick={(e) => e.preventDefault()}
              className="text-[#1f5a46] underline hover:text-[#004230]"
            >
              Verify Digital Object Identifier (DOI)
            </a>
          </div>
        </div>
      </section>

      {/* Style Governance Metadata */}
      <aside 
        className="p-4 bg-[#f3f4f0] border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[#5a605c]">
          <span className="font-label-sm text-[12px] font-semibold">
            Standard: MediSense High-Trust Health Schema v2
          </span>
          <span className="font-label-sm text-[12px]">
            Geometry: Strict 4px radius | Planar surface
          </span>
        </div>
      </aside>
    </div>
  );
};
