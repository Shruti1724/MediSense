import React, { useState, useRef } from 'react';
import { startWithImage, confirmMedicines } from '../../api';

export default function UploadVerifyScreen({ medicines, onUpdateMedicines, onNavigate }) {
  const [showBlurryAlert, setShowBlurryAlert] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpdateMedicine = (id, field, value) => {
    const updated = medicines.map((medicine) => {
      if (medicine.id === id) {
        return { ...medicine, [field]: value };
      }
      return medicine;
    });
    onUpdateMedicines(updated);
  };

  const handleSuggestionClick = (id, medName, strength) => {
    const updated = medicines.map((medicine) => {
      if (medicine.id === id) {
        return {
          ...medicine,
          name: medName,
          strength,
          confidence: 'High',
          suggestions: [],
        };
      }
      return medicine;
    });
    onUpdateMedicines(updated);
  };

  const handleRemoveMedicine = (id) => {
    const updated = medicines.filter((medicine) => medicine.id !== id);
    onUpdateMedicines(updated);
  };

  const handleAddMedicine = () => {
    const newId = `rx-${Date.now()}`;
    const newMed = {
      id: newId,
      name: '',
      strength: '',
      timing: '',
      confidence: 'High',
    };
    onUpdateMedicines([...medicines, newMed]);
  };

  // Sends the photo to the backend and fills the table with what comes back
  const uploadFile = async (file) => {
    setUploadedImageName(file.name);
    setShowBlurryAlert(false);
    setError(null);
    setLoading(true);
    try {
      const data = await startWithImage('prescription', file);
      sessionStorage.setItem('medisense_session', data.session_id);
      if (data.is_blurry) {
        setShowBlurryAlert(true);
        onUpdateMedicines([]);
        return;
      }
      const rows = (data.extracted_medicines || []).map((m, i) => {
        const match = data.matches?.[i];
        return {
          id: `rx-${Date.now()}-${i}`,
          name: match?.matched ? match.brand : m.brand || m.raw || '',
          strength: m.strength || '',
          timing: m.frequency || '',
          confidence: m.confidence >= 0.8 ? 'High' : 'Check this',
          suggestions: !match?.matched
            ? (match?.candidates || []).map((c) => ({ name: c, strength: '' }))
            : [],
        };
      });
      onUpdateMedicines(rows);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) uploadFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) uploadFile(event.dataTransfer.files[0]);
  };

  // Sends the edited list to /confirm, then moves to the next screen
  const handleContinue = async () => {
    const sessionId = sessionStorage.getItem('medisense_session');
    if (!sessionId) {
      setError('Please upload a photo first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const list = medicines
        .filter((m) => m.name.trim())
        .map((m) => ({ raw: m.name, brand: m.name, strength: m.strength, frequency: m.timing }));
      await confirmMedicines(sessionId, list);
      onNavigate('processing');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-12">
      <p className="font-body-md text-[15px] text-[#5a605c] mb-2">Step 1 of 3: Add your photo</p>

      <h1
        className="font-headline-lg font-semibold tracking-tight text-[#1c1f1d] mb-6 text-[32px] sm:text-[36px] leading-[42px]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Upload and verify prescription
      </h1>

      {showBlurryAlert && (
        <div
          className="p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{
            border: '1px solid #8a6d00',
            backgroundColor: '#fbf3d0',
            borderRadius: '4px',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5 text-[#8a6d00]">warning</span>
            <p className="font-body-md text-[15px] text-[#8a6d00] leading-snug">
              This photo is too blurry to read. Please upload a clearer photo.
            </p>
          </div>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="whitespace-nowrap px-3 py-1.5 font-label-md text-[14px] transition-colors cursor-pointer bg-white text-[#8a6d00] border border-[#8a6d00] hover:bg-[#fff9e6]"
            style={{ borderRadius: '4px' }}
            type="button"
          >
            Upload another photo
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`py-8 px-6 text-center mb-6 bg-white transition-colors cursor-pointer group border ${
          isDragging ? 'border-[#1f5a46] bg-[#f3f4f0]' : 'border-[#d6d4cc]'
        }`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '1.5px',
          borderRadius: '4px',
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-[#5a605c] mb-2 group-hover:text-[#1f5a46] transition-colors">
            document_scanner
          </span>
          <p className="font-title-md text-[16px] text-[#1c1f1d] font-medium mb-1">
            {uploadedImageName ? `Uploaded: ${uploadedImageName}` : 'Drop a photo here or choose a file'}
          </p>
          <p className="font-body-sm text-[13px] text-[#5a605c] mb-2">
            {uploadedImageName ? 'Click to replace image' : 'JPG or PNG'}
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleAddMedicine();
            }}
            className="font-label-md text-[14px] text-[#1f5a46] underline inline-block bg-transparent border-0 cursor-pointer p-0"
          >
            Type the name instead
          </button>
        </div>
      </div>

      <div className="p-4 mb-6 bg-white border border-[#d6d4cc]" style={{ borderRadius: '4px' }}>
        <p className="font-body-md text-[15px] leading-relaxed text-[#1c1f1d]">
          Please check this list. Handwriting is hard to read, so MediSense asks you to confirm before going further.
        </p>
      </div>

      <h2
        className="font-headline-sm text-[20px] font-bold mb-3 text-[#1c1f1d]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Check what we read
      </h2>

      <div className="mb-3 text-[12px] uppercase tracking-wider text-[#5a605c] font-semibold">Sample data</div>

      <div className="w-full overflow-x-auto bg-white mb-6 border border-[#d6d4cc]" style={{ borderRadius: '4px' }}>
        <table className="w-full text-left border-collapse" style={{ minWidth: '620px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f4ef', borderBottom: '1px solid #d6d4cc' }}>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">Medicine name</th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">Strength</th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">Timing</th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d] whitespace-nowrap">Match confidence</th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d] text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d6d4cc]">
            {medicines.map((medicine) => {
              const hasSuggestions = medicine.suggestions && medicine.suggestions.length > 0;
              const isChecking = medicine.confidence === 'Check this';

              if (hasSuggestions) {
                return (
                  <tr key={medicine.id} className="align-top border-b border-[#d6d4cc] bg-[#faf9f6]">
                    <td className="p-0" colSpan={5}>
                      <div className="grid grid-cols-[1fr_112px_1fr_auto_auto] gap-0 items-start p-3 pb-2">
                        <div className="pr-3">
                          <input
                            aria-label="Medicine name"
                            type="text"
                            value={medicine.name}
                            onChange={(event) => handleUpdateMedicine(medicine.id, 'name', event.target.value)}
                            placeholder="Medicine name"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pr-3">
                          <input
                            aria-label="Strength"
                            type="text"
                            value={medicine.strength}
                            onChange={(event) => handleUpdateMedicine(medicine.id, 'strength', event.target.value)}
                            placeholder="Strength"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2 tabular-nums"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pr-3">
                          <input
                            aria-label="Timing"
                            type="text"
                            value={medicine.timing}
                            onChange={(event) => handleUpdateMedicine(medicine.id, 'timing', event.target.value)}
                            placeholder="Timing instructions"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pr-3">
                          <div className="flex items-center justify-start">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-1 text-[12px] font-semibold border ${
                                isChecking
                                  ? 'bg-[#fff5e7] border-[#d88b2b] text-[#8a6d00]'
                                  : 'bg-[#eef3f0] border-[#c2dad0] text-[#1f5a46]'
                              }`}
                              style={{ borderRadius: '4px' }}
                            >
                              {medicine.confidence}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(medicine.id)}
                            className="font-body-md text-[15px] text-[#5a605c] underline bg-transparent border-0 cursor-pointer p-0"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-[#d6d4cc] px-3 pb-3 pt-2 bg-white">
                        <p className="font-label-md text-[14px] text-[#5a605c] mb-2">Suggested matches</p>
                        <div className="flex flex-wrap gap-2">
                          {medicine.suggestions.map((suggestion) => (
                            <button
                              key={`${medicine.id}-${suggestion.name}-${suggestion.strength}`}
                              type="button"
                              onClick={() => handleSuggestionClick(medicine.id, suggestion.name, suggestion.strength)}
                              className="px-2 py-1.5 border border-[#d6d4cc] bg-white text-[#1f5a46] font-label-md text-[13px] hover:bg-[#f3f4f0] cursor-pointer"
                              style={{ borderRadius: '4px' }}
                            >
                              {suggestion.name} {suggestion.strength}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={medicine.id} className="border-b border-[#d6d4cc] align-top">
                  <td className="py-3 px-3">
                    <input
                      aria-label="Medicine name"
                      type="text"
                      value={medicine.name}
                      onChange={(event) => handleUpdateMedicine(medicine.id, 'name', event.target.value)}
                      placeholder="Medicine name"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      aria-label="Strength"
                      type="text"
                      value={medicine.strength}
                      onChange={(event) => handleUpdateMedicine(medicine.id, 'strength', event.target.value)}
                      placeholder="Strength"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2 tabular-nums"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      aria-label="Timing"
                      type="text"
                      value={medicine.timing}
                      onChange={(event) => handleUpdateMedicine(medicine.id, 'timing', event.target.value)}
                      placeholder="Timing instructions"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-start">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 text-[12px] font-semibold border ${
                          medicine.confidence === 'Check this'
                            ? 'bg-[#fff5e7] border-[#d88b2b] text-[#8a6d00]'
                            : 'bg-[#eef3f0] border-[#c2dad0] text-[#1f5a46]'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        {medicine.confidence}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(medicine.id)}
                      className="font-body-md text-[15px] text-[#5a605c] underline bg-transparent border-0 cursor-pointer p-0"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <p className="text-[#b3261e] mb-3">{error}</p>}
      {loading && <p className="text-[#5a605c] mb-3">Working...</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="inline-flex items-center justify-center font-label-md text-[14px] bg-[#1f5a46] text-white px-5 py-2.5 hover:bg-[#004230] transition-colors border border-[#1f5a46] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ borderRadius: '4px' }}
        >
          Continue to check list
        </button>
      </div>
    </div>
  );
}