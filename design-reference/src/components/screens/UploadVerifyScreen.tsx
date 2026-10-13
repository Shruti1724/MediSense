import React, { useState, useRef } from 'react';
import { MedicineEntry, Screen } from '../../types';

interface UploadVerifyScreenProps {
  medicines: MedicineEntry[];
  onUpdateMedicines: (meds: MedicineEntry[]) => void;
  onNavigate: (screen: Screen) => void;
}

export const UploadVerifyScreen: React.FC<UploadVerifyScreenProps> = ({
  medicines,
  onUpdateMedicines,
  onNavigate,
}) => {
  const [showBlurryAlert, setShowBlurryAlert] = useState<boolean>(true);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateMedicine = (id: string, field: keyof MedicineEntry, value: string) => {
    const updated = medicines.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onUpdateMedicines(updated);
  };

  const handleSuggestionClick = (id: string, medName: string, strength: string) => {
    const updated = medicines.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          name: medName,
          strength: strength,
          confidence: 'High' as const,
        };
      }
      return m;
    });
    onUpdateMedicines(updated);
  };

  const handleRemoveMedicine = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    onUpdateMedicines(updated);
  };

  const handleAddMedicine = () => {
    const newId = `rx-${Date.now()}`;
    const newMed: MedicineEntry = {
      id: newId,
      name: '',
      strength: '',
      timing: '',
      confidence: 'High',
    };
    onUpdateMedicines([...medicines, newMed]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImageName(file.name);
      setShowBlurryAlert(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedImageName(file.name);
      setShowBlurryAlert(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-12">
      {/* Step Indicator */}
      <p className="font-body-md text-[15px] text-[#5a605c] mb-2">
        Step 1 of 3: Add your photo
      </p>

      {/* Page Title */}
      <h1 
        className="font-headline-lg font-semibold tracking-tight text-[#1c1f1d] mb-6 text-[32px] sm:text-[36px] leading-[42px]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Upload and verify prescription
      </h1>

      {/* Blurry-photo State Box Demo */}
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

      {/* Dashed-border Drop Zone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
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
            onClick={(e) => {
              e.stopPropagation();
              handleAddMedicine();
            }}
            className="font-label-md text-[14px] text-[#1f5a46] underline inline-block bg-transparent border-0 cursor-pointer p-0"
          >
            Type the name instead
          </button>
        </div>
      </div>

      {/* Bordered Notice Above Table */}
      <div 
        className="p-4 mb-6 bg-white border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <p className="font-body-md text-[15px] leading-relaxed text-[#1c1f1d]">
          Please check this list. Handwriting is hard to read, so MediSense asks you to confirm before going further.
        </p>
      </div>

      {/* Section Heading */}
      <h2 
        className="font-headline-sm text-[20px] font-bold mb-3 text-[#1c1f1d]"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Check what we read
      </h2>

      {/* Table Container */}
      <div 
        className="w-full overflow-x-auto bg-white mb-6 border border-[#d6d4cc]"
        style={{ borderRadius: '4px' }}
      >
        <table className="w-full text-left border-collapse" style={{ minWidth: '620px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f4ef', borderBottom: '1px solid #d6d4cc' }}>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">
                Medicine name
              </th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">
                Strength
              </th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d]">
                Timing
              </th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d] whitespace-nowrap">
                Match confidence
              </th>
              <th className="py-3 px-3 font-title-md text-[14px] font-semibold text-[#1c1f1d] text-right">
                Remove
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d6d4cc]">
            {medicines.map((med) => {
              const hasSuggestions = med.suggestions && med.suggestions.length > 0;
              const isChecking = med.confidence === 'Check this';

              if (hasSuggestions) {
                return (
                  <tr 
                    key={med.id} 
                    className="align-top border-b border-[#d6d4cc] bg-[#faf9f6]"
                  >
                    <td className="p-0" colSpan={5}>
                      <div className="grid grid-cols-[1fr_112px_1fr_auto_auto] gap-0 items-start p-3 pb-2">
                        <div className="pr-3">
                          <input
                            aria-label="Medicine name"
                            type="text"
                            value={med.name}
                            onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                            placeholder="Medicine name"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pr-3">
                          <input
                            aria-label="Strength"
                            type="text"
                            value={med.strength}
                            onChange={(e) => handleUpdateMedicine(med.id, 'strength', e.target.value)}
                            placeholder="Strength"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2 tabular-nums"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pr-3">
                          <input
                            aria-label="Timing"
                            type="text"
                            value={med.timing}
                            onChange={(e) => handleUpdateMedicine(med.id, 'timing', e.target.value)}
                            placeholder="Timing instructions"
                            className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                        <div className="pt-2 whitespace-nowrap pr-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 font-label-sm font-semibold text-[12px]"
                            style={{
                              color: '#b85c00',
                              backgroundColor: '#fdf0e2',
                              border: '1px solid #b85c00',
                              borderRadius: '4px',
                            }}
                          >
                            Check this
                          </span>
                        </div>
                        <div className="pt-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="underline text-sm font-medium text-[#5a605c] hover:text-[#1c1f1d] cursor-pointer bg-transparent border-0 p-0"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Suggestions row */}
                      <div className="px-3 pb-3 pt-1 flex flex-wrap items-center gap-2">
                        <span className="font-body-sm text-[13px] text-[#5a605c] font-medium">
                          Did you mean:
                        </span>
                        {med.suggestions?.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSuggestionClick(med.id, sug.name, sug.strength)}
                            className="font-label-sm text-[12px] bg-white border border-[#d6d4cc] text-[#1c1f1d] px-2 py-1 hover:bg-[#eef3f0] hover:border-[#1f5a46] transition-colors cursor-pointer"
                            style={{ borderRadius: '4px' }}
                          >
                            {sug.name} {sug.strength}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={med.id} className="align-top border-b border-[#d6d4cc]">
                  <td className="p-3">
                    <input
                      aria-label="Medicine name"
                      type="text"
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                      placeholder="e.g. Amoxicillin"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="p-3 w-28">
                    <input
                      aria-label="Strength"
                      type="text"
                      value={med.strength}
                      onChange={(e) => handleUpdateMedicine(med.id, 'strength', e.target.value)}
                      placeholder="500 mg"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2 tabular-nums"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      aria-label="Timing"
                      type="text"
                      value={med.timing}
                      onChange={(e) => handleUpdateMedicine(med.id, 'timing', e.target.value)}
                      placeholder="e.g. Twice daily"
                      className="w-full bg-white text-[#1c1f1d] font-body-md text-[15px] focus:outline-none focus:ring-1 focus:ring-[#1f5a46] border border-[#d6d4cc] p-2"
                      style={{ borderRadius: '4px' }}
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap pt-4">
                    <span
                      className="inline-flex items-center px-2 py-0.5 font-label-sm font-semibold text-[12px]"
                      style={{
                        color: isChecking ? '#b85c00' : '#1f5a46',
                        backgroundColor: isChecking ? '#fdf0e2' : '#eef3f0',
                        border: `1px solid ${isChecking ? '#b85c00' : '#1f5a46'}`,
                        borderRadius: '4px',
                      }}
                    >
                      {med.confidence}
                    </span>
                  </td>
                  <td className="p-3 text-right pt-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(med.id)}
                      className="underline text-sm font-medium text-[#5a605c] hover:text-[#1c1f1d] cursor-pointer bg-transparent border-0 p-0"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}

            {medicines.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#5a605c] text-[14px]">
                  No medicines listed yet. Click "+ Add a medicine" to enter items manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Below Table Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 mb-8">
        <div>
          <button
            type="button"
            onClick={handleAddMedicine}
            className="inline-flex items-center font-label-md text-[14px] bg-white border border-[#d6d4cc] text-[#1c1f1d] px-4 py-2 hover:bg-[#f5f4ef] transition-colors cursor-pointer"
            style={{ borderRadius: '4px' }}
          >
            + Add a medicine
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => onNavigate('processing')}
            disabled={medicines.length === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center font-label-md text-[14px] font-medium text-white px-6 py-3 transition-colors ${
              medicines.length === 0
                ? 'bg-[#bfc9c2] cursor-not-allowed'
                : 'bg-[#1f5a46] hover:bg-[#004230] cursor-pointer'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Confirm this list
          </button>
        </div>
      </div>
    </div>
  );
};
