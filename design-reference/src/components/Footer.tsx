import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="w-full bg-[#ffffff] border-t border-[#d6d4cc] py-8 mt-auto">
        <div className="max-w-[720px] mx-auto px-5 text-center">
          <p className="font-body-sm text-[13px] text-[#5a605c] mb-2 leading-relaxed">
            MediSense gives general information from verified sources. It is not medical advice and does not replace a doctor or pharmacist.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModalType('privacy')}
              className="font-body-sm text-[13px] text-[#5a605c] hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              Privacy
            </button>
            <span className="font-body-sm text-[13px] text-[#5a605c]">·</span>
            <button
              onClick={() => setModalType('terms')}
              className="font-body-sm text-[13px] text-[#5a605c] hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              Terms
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Dialog */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#d6d4cc] rounded p-6 max-w-[560px] w-full text-left" style={{ borderRadius: '4px' }}>
            <div className="flex items-center justify-between pb-3 border-b border-[#d6d4cc] mb-4">
              <h3 className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {modalType === 'privacy' ? 'Privacy Policy & Local Processing Guarantee' : 'Terms of Use & Clinical Disclaimer'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-[#5a605c] hover:text-[#1c1f1d] p-1 cursor-pointer bg-transparent border-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-[14px] text-[#404944] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Ephemeral Client-Side Processing:</strong> Prescriptions and medication packages uploaded to MediSense are processed purely within the user's active browser session memory. No uploaded images are permanently archived, indexed, or shared with third-party advertising brokers.
                  </p>
                  <p>
                    <strong>2. Zero Personal Health Information (PHI) Logging:</strong> No patient identification numbers, clinical names, addresses, or medical record identifiers are harvested.
                  </p>
                  <p>
                    <strong>3. Verified Compendia:</strong> Pharmacology cross-referencing relies upon curated open-access formularies (including the British National Formulary and US FDA package monographs).
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Non-Diagnostic Information Service:</strong> MediSense is an informational pharmacology companion designed to facilitate informed discussions between individuals and their healthcare providers. It is not an automated medical diagnostic engine.
                  </p>
                  <p>
                    <strong>2. Emergency Situations:</strong> If you or someone you care for is experiencing an acute allergic reaction, chest discomfort, shortness of breath, or potential poisoning, seek emergency clinical aid immediately or call emergency services.
                  </p>
                  <p>
                    <strong>3. Pharmacist Verification:</strong> Always verify dosing instructions, contraindications, and course durations with a registered pharmacist prior to altering any prescription schedule.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-[#d6d4cc] flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-[#1f5a46] text-white text-[14px] font-medium rounded hover:bg-[#004230] transition-colors cursor-pointer border-0"
                style={{ borderRadius: '4px' }}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
