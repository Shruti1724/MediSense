import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [selectedFlow, setSelectedFlow] = useState('prescription');
  const [hasConsent, setHasConsent] = useState(false);

  const handleContinue = () => {
    if (!hasConsent) return;

    const mode = selectedFlow === 'prescription' ? 'prescription' : 'home';
    navigate('/upload', { state: { mode } });
  };

  return (
    <div className="w-full max-w-[720px] mx-auto">
      <div className="mb-8">
        <h1
          className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] tracking-tight mb-2 font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          MediSense
        </h1>
        <p className="font-title-md text-[16px] text-[#5a605c]">
          Understand a prescription or a medicine you have at home, using verified sources.
        </p>
      </div>

      <div className="mb-3">
        <span className="font-label-sm text-[12px] uppercase tracking-wider text-[#5a605c] font-semibold">
          Choose one
        </span>
      </div>

      <div className="space-y-3 mb-2">
        <label
          onClick={() => setSelectedFlow('prescription')}
          className={`block cursor-pointer p-5 transition-colors border ${
            selectedFlow === 'prescription'
              ? 'bg-[#f3f4f0] border-[#d6d4cc] border-l-4 border-l-[#1f5a46]'
              : 'bg-white border-[#d6d4cc] hover:bg-[#f3f4f0]'
          }`}
          style={{ borderRadius: '4px' }}
        >
          <div className="flex items-start gap-4">
            <div className="pt-0.5">
              <input
                type="radio"
                name="medisense-flow"
                value="prescription"
                checked={selectedFlow === 'prescription'}
                onChange={() => setSelectedFlow('prescription')}
                className="w-4 h-4 text-[#1f5a46] accent-[#1f5a46] border-[#d6d4cc] focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className="font-title-md text-[16px] text-[#1c1f1d] block mb-1 font-semibold">
                I have a prescription
              </span>
              <span className="font-body-md text-[15px] text-[#5a605c] block">
                Upload a photo of a prescription and get each medicine explained.
              </span>
            </div>
          </div>
        </label>

        <label
          onClick={() => setSelectedFlow('medicine')}
          className={`block cursor-pointer p-5 transition-colors border ${
            selectedFlow === 'medicine'
              ? 'bg-[#f3f4f0] border-[#d6d4cc] border-l-4 border-l-[#1f5a46]'
              : 'bg-white border-[#d6d4cc] hover:bg-[#f3f4f0]'
          }`}
          style={{ borderRadius: '4px' }}
        >
          <div className="flex items-start gap-4">
            <div className="pt-0.5">
              <input
                type="radio"
                name="medisense-flow"
                value="medicine"
                checked={selectedFlow === 'medicine'}
                onChange={() => setSelectedFlow('medicine')}
                className="w-4 h-4 text-[#1f5a46] accent-[#1f5a46] border-[#d6d4cc] focus:ring-0 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <span className="font-title-md text-[16px] text-[#1c1f1d] block mb-1 font-semibold">
                I have a medicine at home
              </span>
              <span className="font-body-md text-[15px] text-[#5a605c] block">
                Photo of a strip or box, or type the name, and check what it is commonly used for.
              </span>
            </div>
          </div>
        </label>
      </div>

      <div className="mb-6">
        <button
          onClick={() => navigate('/ask', { state: { mode: 'ask' } })}
          className="font-label-md text-[14px] text-[#1f5a46] underline hover:text-[#004230] inline-block bg-transparent border-0 p-0 cursor-pointer text-left"
        >
          Just asking a question
        </button>
      </div>

      <div className="pt-2 pb-6 border-t border-[#d6d4cc]">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(event) => setHasConsent(event.target.checked)}
            className="w-4 h-4 rounded text-[#1f5a46] accent-[#1f5a46] border-[#d6d4cc] focus:ring-0 focus:outline-none cursor-pointer"
          />
          <span className="font-label-md text-[14px] text-[#1c1f1d]">
            I agree that my photo is processed locally and not saved.
          </span>
        </label>
      </div>

      <div className="space-y-3 mb-10">
        <button
          onClick={handleContinue}
          disabled={!hasConsent}
          className={`w-full sm:w-auto inline-flex items-center justify-center font-label-md text-[14px] px-6 py-3 border transition-colors ${
            hasConsent
              ? 'bg-[#1f5a46] text-white border-[#1f5a46] hover:bg-[#004230] cursor-pointer'
              : 'bg-[#bfc9c2] text-[#5a605c] border-[#bfc9c2] cursor-not-allowed opacity-90'
          }`}
          style={{ borderRadius: '4px' }}
        >
          Continue
        </button>

        {!hasConsent && (
          <div className="pt-1">
            <span className="text-[13px] text-[#5a605c]">Tick the box to continue.</span>
          </div>
        )}
      </div>

      <section className="border-t border-[#d6d4cc] pt-6">
        <h2
          className="font-headline-sm text-[20px] text-[#1c1f1d] mb-4 font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          How it works
        </h2>
        <ol className="space-y-3 font-body-md text-[15px] text-[#1c1f1d]">
          <li className="flex items-start gap-3">
            <span className="font-label-md text-[14px] text-[#5a605c] shrink-0 pt-0.5 font-semibold">1.</span>
            <span>Upload a photo or type the medicine name.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-label-md text-[14px] text-[#5a605c] shrink-0 pt-0.5 font-semibold">2.</span>
            <span>Check and correct what MediSense read before anything else happens.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-label-md text-[14px] text-[#5a605c] shrink-0 pt-0.5 font-semibold">3.</span>
            <span>Read the explanation, with the source shown under every section.</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
