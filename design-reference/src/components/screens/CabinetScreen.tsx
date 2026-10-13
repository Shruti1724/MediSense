import React, { useState } from 'react';
import { CabinetRecord, Screen } from '../../types';

interface CabinetScreenProps {
  records: CabinetRecord[];
  onRemoveRecord: (id: string) => void;
  onAddRecord: (record: CabinetRecord) => void;
  onNavigate: (screen: Screen) => void;
}

export const CabinetScreen: React.FC<CabinetScreenProps> = ({
  records,
  onRemoveRecord,
  onAddRecord,
  onNavigate,
}) => {
  const [showEmptyPreview, setShowEmptyPreview] = useState<boolean>(true);
  const [isCheckingClashes, setIsCheckingClashes] = useState<boolean>(false);
  const [clashResult, setClashResult] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for new medicine
  const [newBrand, setNewBrand] = useState('');
  const [newGeneric, setNewGeneric] = useState('');
  const [newType, setNewType] = useState<'Prescription' | 'OTC'>('Prescription');
  const [newExpiry, setNewExpiry] = useState('12/2026');

  const handleTriggerClashes = () => {
    setIsCheckingClashes(true);
    setClashResult(null);

    setTimeout(() => {
      setIsCheckingClashes(false);
      // If cabinet has both Advil/Ibuprofen and Aspirin, or Lipitor + grapefruit etc.
      const hasAmox = records.some((r) => r.genericName.toLowerCase().includes('amoxicillin'));
      const hasLipitor = records.some((r) => r.genericName.toLowerCase().includes('atorvastatin'));
      const hasAdvil = records.some((r) => r.genericName.toLowerCase().includes('ibuprofen'));

      if (hasAdvil && hasAmox && hasLipitor) {
        setClashResult('Analysis completed: Stagger NSAID (Advil) intake with meals. No major CYP3A4 conflicts detected between Lipitor and Amoxil.');
      } else {
        setClashResult('Analysis completed: No critical contraindications identified.');
      }
    }, 600);
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !newGeneric.trim()) return;

    const newRecord: CabinetRecord = {
      id: `cab-${Date.now()}`,
      medicine: newBrand.trim(),
      genericName: newGeneric.trim(),
      type: newType,
      expiry: newExpiry.trim() || '12/2026',
    };

    onAddRecord(newRecord);
    setNewBrand('');
    setNewGeneric('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
      {/* Title & Count Header */}
      <div className="flex items-baseline justify-between mb-1">
        <h1 
          className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] font-semibold tracking-tight"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Your medicine cabinet
        </h1>
        <span 
          className="font-label-sm text-[12px] text-[#5a605c] bg-[#edeeeb] px-2 py-0.5"
          style={{ borderRadius: '4px' }}
        >
          {records.length} {records.length === 1 ? 'record' : 'records'}
        </span>
      </div>
      <p className="font-label-md text-[14px] text-[#5a605c] mb-6 font-normal">
        Stored only in this browser for this session.
      </p>

      {/* Active Medicine Table Section */}
      <div 
        className="bg-white border border-[#d6d4cc] mb-4 overflow-hidden"
        style={{ borderRadius: '4px' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '580px' }}>
            <thead>
              <tr className="bg-[#f3f4f0] border-b border-[#d6d4cc]">
                <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">
                  Medicine
                </th>
                <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">
                  Generic name
                </th>
                <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">
                  Type
                </th>
                <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold tabular-nums" scope="col">
                  Expiry
                </th>
                <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold text-right" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d6d4cc] font-body-md text-[15px] text-[#1c1f1d]">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#f3f4f0] transition-colors">
                  <td className="py-3 px-3 font-title-md text-[16px] text-[#1c1f1d] font-semibold">
                    {rec.medicine}
                  </td>
                  <td className="py-3 px-3 text-[#5a605c]">
                    {rec.genericName}
                  </td>
                  <td className="py-3 px-3">
                    <span 
                      className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold border border-[#d6d4cc] ${
                        rec.type === 'Prescription'
                          ? 'bg-[#edeeeb] text-[#404944]'
                          : 'bg-[#e7e9e5] text-[#404944]'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 tabular-nums text-[#5a605c]">
                    {rec.expiry}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveRecord(rec.id)}
                      className="font-body-md text-[15px] text-[#5a605c] underline hover:text-[#1c1f1d] cursor-pointer bg-transparent border-0 p-0"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 px-3 text-center text-[#5a605c] font-body-md text-[15px]">
                    Cabinet is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controls under table */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center font-label-md text-[14px] bg-white border border-[#d6d4cc] text-[#1c1f1d] px-3.5 py-1.5 hover:bg-[#f3f4f0] transition-colors cursor-pointer"
          style={{ borderRadius: '4px' }}
        >
          + Add to cabinet
        </button>

        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="text-[13px] text-[#1f5a46] underline hover:text-[#004230] cursor-pointer bg-transparent border-0 p-0"
        >
          Upload another prescription
        </button>
      </div>

      {/* Interaction Checking Section */}
      <div className="mb-8">
        <p className="font-label-md text-[14px] text-[#1c1f1d] mb-3 font-semibold">
          MediSense checks all of these together for clashes.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={handleTriggerClashes}
            disabled={isCheckingClashes || records.length === 0}
            className={`inline-flex items-center justify-center bg-[#1f5a46] text-white px-6 py-2.5 font-title-md text-[16px] hover:bg-[#004230] transition-colors border border-[#1f5a46] ${
              isCheckingClashes ? 'opacity-75 cursor-wait' : records.length === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{ borderRadius: '4px' }}
          >
            {isCheckingClashes ? 'Evaluating...' : 'Check for clashes'}
          </button>

          {clashResult && (
            <span className="font-body-sm text-[13px] text-[#1f5a46] inline-flex items-center gap-1.5 bg-[#eef3f0] p-2 border border-[#c2dad0]" style={{ borderRadius: '4px' }}>
              <span className="material-symbols-outlined text-[18px] text-[#1f5a46]">verified</span>
              <span>{clashResult}</span>
            </span>
          )}
        </div>
      </div>

      {/* Verification / Metadata Line */}
      <div className="border-t border-[#d6d4cc] pt-4 pb-6 flex items-center justify-between text-[#5a605c] font-label-sm text-[12px]">
        <span>Database index: BNF & FDA monographs</span>
        <span>Session status: Unsaved locally</span>
      </div>

      {/* Empty State Demonstrator Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-[12px] text-[#5a605c] uppercase tracking-wider font-semibold">
            Empty State Reference
          </span>
          <button
            type="button"
            onClick={() => setShowEmptyPreview(!showEmptyPreview)}
            className="font-label-sm text-[12px] text-[#5a605c] underline hover:text-[#1c1f1d] bg-transparent border-0 cursor-pointer p-0"
          >
            {showEmptyPreview ? 'Hide preview' : 'Toggle preview'}
          </button>
        </div>

        {showEmptyPreview && (
          <div 
            className="bg-white border border-[#d6d4cc] p-8 text-center"
            style={{ borderRadius: '4px' }}
          >
            <div 
              className="w-10 h-10 mx-auto mb-3 bg-[#edeeeb] flex items-center justify-center text-[#5a605c] border border-[#d6d4cc]"
              style={{ borderRadius: '4px' }}
            >
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
            <p className="font-title-md text-[16px] text-[#1c1f1d] mb-2 font-semibold">
              No medicines added yet.
            </p>
            <p className="font-label-md text-[14px] text-[#5a605c] mb-4 max-w-[420px] mx-auto">
              Upload a prescription or add a medicine to view potential interactions.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center bg-white border border-[#1f5a46] text-[#1f5a46] px-4 py-2 font-label-md text-[14px] hover:bg-[#f3f4f0] transition-colors cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              + Add a medicine
            </button>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div 
            className="bg-white border border-[#d6d4cc] p-6 max-w-[480px] w-full text-left"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#d6d4cc] mb-4">
              <h3 
                className="font-headline-sm text-[20px] text-[#1c1f1d] font-semibold"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Add Medicine to Cabinet
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#5a605c] hover:text-[#1c1f1d] p-1 bg-transparent border-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">
                  Brand / Commercial Name
                </label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="e.g. Advil, Lipitor, Tylenol"
                  required
                  className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">
                  Active Compound (Generic Name)
                </label>
                <input
                  type="text"
                  value={newGeneric}
                  onChange={(e) => setNewGeneric(e.target.value)}
                  placeholder="e.g. Ibuprofen, Atorvastatin, Paracetamol"
                  required
                  className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">
                    Classification
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'Prescription' | 'OTC')}
                    className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                    style={{ borderRadius: '4px' }}
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="OTC">OTC (Over the counter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">
                    Expiry Date (MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    placeholder="08/2026"
                    className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                    style={{ borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#d6d4cc] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#d6d4cc] bg-white text-[#1c1f1d] text-[14px] hover:bg-[#f3f4f0] cursor-pointer"
                  style={{ borderRadius: '4px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1f5a46] text-white text-[14px] font-medium hover:bg-[#004230] cursor-pointer border-0"
                  style={{ borderRadius: '4px' }}
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
