import { useState } from 'react';

export default function Footer() {
  const [modalType, setModalType] = useState(null);

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

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#d6d4cc] rounded p-6 max-w-[560px] w-full text-left" style={{ borderRadius: '4px' }}>
            <div className="flex items-center justify-between pb-3 border-b border-[#d6d4cc] mb-4">
              <h3 className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {modalType === 'privacy' ? 'Privacy' : 'Terms'}
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
                    <strong>1. Photos:</strong> Photos are processed on this computer and are not saved.
                  </p>
                  <p>
                    <strong>2. No account:</strong> MediSense has no sign-in and does not ask for your name, address or any ID.
                  </p>
                  <p>
                    <strong>3. Cabinet:</strong> Your medicine cabinet is kept in this browser for the current session only.
                  </p>
                  <p>
                    <strong>4. Sources:</strong> Answers come from saved drug label data and public health sources. The sources are shown under each answer.
                  </p>
                  <p>This is a short summary. A full privacy page will replace it.</p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. General information:</strong> MediSense gives general information. It is not medical advice, not a diagnosis, and does not replace a doctor or pharmacist.
                  </p>
                  <p>
                    <strong>2. Emergencies:</strong> If someone has trouble breathing, swelling of the face or throat, chest pain or other severe symptoms, get medical help immediately.
                  </p>
                  <p>
                    <strong>3. Check first:</strong> Confirm with a pharmacist or doctor before you start, stop or change any medicine.
                  </p>
                  <p>This is a short summary. Full terms will replace it.</p>
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
}
