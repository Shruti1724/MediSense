import React, { useState } from 'react';
import { askQuestion } from '../../api';


const isValidExpiryDate = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^\d{2}\/\d{4}$/.test(trimmed)) return false;
  const [monthPart, yearPart] = trimmed.split('/');
  const month = Number(monthPart);
  const year = Number(yearPart);
  if (!Number.isInteger(month) || !Number.isInteger(year)) return false;
  return month >= 1 && month <= 12;
};

const isExpiredDate = (value) => {
  if (!isValidExpiryDate(value)) return false;
  const [monthPart, yearPart] = value.trim().split('/');
  const month = Number(monthPart);
  const year = Number(yearPart);
  const expiryDate = new Date(year, month - 1, 1);
  const currentDate = new Date();
  const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  return expiryDate < currentMonthDate;
};

export default function CabinetScreen({ records, onRemoveRecord, onAddRecord, onNavigate }) {
  const [isCheckingClashes, setIsCheckingClashes] = useState(false);
  const [clashResult, setClashResult] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newGeneric, setNewGeneric] = useState('');
  const [newType, setNewType] = useState('Prescription');
  const [newExpiry, setNewExpiry] = useState('');

  const handleTriggerClashes = async () => {
    setIsCheckingClashes(true);
    setClashResult(null);

    try {
      const medList = records.map((r) => r.medicine || r.genericName).filter(Boolean);
      if (medList.length < 2) {
        setClashResult({
          type: 'info',
          message: 'At least 2 medicines are needed to evaluate potential clashes.',
        });
        setIsCheckingClashes(false);
        return;
      }
      const data = await askQuestion('cabinet-check', 'Check for clashes between cabinet medicines', '', medList);
      if (data && data.warnings && data.warnings.length > 0) {
        const clashWarnings = data.warnings.filter((w) => {
          const t = (w.text || '').toLowerCase();
          return (
            t.includes('clash') ||
            t.includes('contain') ||
            t.includes('together') ||
            t.includes('overdose') ||
            t.includes('bleeding')
          );
        });
        const warningsToShow = clashWarnings.length > 0 ? clashWarnings : data.warnings;

        setClashResult({
          type: 'warning',
          title: `Detected ${warningsToShow.length} Medicine Clash${warningsToShow.length > 1 ? 'es' : ''}`,
          items: warningsToShow.map((w) => w.text),
          message: warningsToShow.map((w) => w.text).join('\n\n'),
        });
      } else {
        setClashResult({
          type: 'success',
          message: 'No clashes detected between your cabinet medicines in our verified database.',
        });
      }
    } catch {
      setClashResult({
        type: 'error',
        message: 'Unable to check clashes at this time. Please ensure backend is running.',
      });
    } finally {
      setIsCheckingClashes(false);
    }
  };


  const handleAddNewSubmit = (event) => {
    event.preventDefault();
    if (!newBrand.trim() || !newGeneric.trim()) return;

    const newRecord = {
      id: `cab-${Date.now()}`,
      medicine: newBrand.trim(),
      genericName: newGeneric.trim(),
      type: newType,
      expiry: newExpiry.trim() || 'Not set',
    };

    onAddRecord(newRecord);
    setNewBrand('');
    setNewGeneric('');
    setNewType('Prescription');
    setNewExpiry('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-16">
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

      {records.length > 0 ? (
        <>
          <div className="bg-white border border-[#d6d4cc] mb-4 overflow-hidden" style={{ borderRadius: '4px' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: '580px' }}>
                <thead>
                  <tr className="bg-[#f3f4f0] border-b border-[#d6d4cc]">
                    <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">Medicine</th>
                    <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">Generic name</th>
                    <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold" scope="col">Type</th>
                    <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold tabular-nums" scope="col">Expiry</th>
                    <th className="py-2.5 px-3 font-label-md text-[14px] text-[#1c1f1d] font-semibold text-right" scope="col">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d6d4cc] font-body-md text-[15px] text-[#1c1f1d]">
                  {records.map((record) => {
                    const rawExpiry = record.expiry && record.expiry.trim() !== '' ? record.expiry.trim() : 'Not set';
                    const expiryClasses = rawExpiry === 'Not set'
                      ? 'text-[#5a605c]'
                      : isExpiredDate(rawExpiry)
                        ? 'text-[#ba1a1a] font-semibold'
                        : 'text-[#5a605c]';

                    return (
                      <tr key={record.id} className="hover:bg-[#f3f4f0] transition-colors">
                        <td className="py-3 px-3 font-title-md text-[16px] text-[#1c1f1d] font-semibold">{record.medicine}</td>
                        <td className="py-3 px-3 text-[#5a605c]">{record.genericName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold border border-[#d6d4cc] ${
                              record.type === 'Prescription' ? 'bg-[#edeeeb] text-[#404944]' : 'bg-[#e7e9e5] text-[#404944]'
                            }`}
                            style={{ borderRadius: '4px' }}
                          >
                            {record.type}
                          </span>
                        </td>
                        <td className={`py-3 px-3 tabular-nums ${expiryClasses}`}>{rawExpiry}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onRemoveRecord(record.id)}
                            className="font-body-md text-[15px] text-[#5a605c] underline hover:text-[#1c1f1d] cursor-pointer bg-transparent border-0 p-0"
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
          </div>

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

          <div className="mb-8">
            <p className="font-label-md text-[14px] text-[#1c1f1d] mb-3 font-semibold">
              MediSense checks all of these together for clashes.
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <button
                  type="button"
                  id="btn-check-cabinet-clashes"
                  onClick={handleTriggerClashes}
                  disabled={isCheckingClashes || records.length === 0}
                  className={`inline-flex items-center justify-center bg-[#1f5a46] text-white px-6 py-2.5 font-title-md text-[16px] hover:bg-[#004230] transition-colors border border-[#1f5a46] ${
                    isCheckingClashes ? 'opacity-75 cursor-wait' : records.length === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">
                    {isCheckingClashes ? 'sync' : 'health_and_safety'}
                  </span>
                  <span>{isCheckingClashes ? 'Evaluating clashes...' : 'Check for clashes'}</span>
                </button>
              </div>

              {clashResult && (
                <div
                  id="cabinet-clash-result"
                  className={`w-full p-4 border rounded-[4px] transition-all ${
                    clashResult.type === 'warning' || clashResult.type === 'error'
                      ? 'text-[#410002] bg-[#ffdad6] border-[#ffb4ab]'
                      : clashResult.type === 'info'
                      ? 'text-[#44474e] bg-[#e7e8ee] border-[#c4c6d0]'
                      : 'text-[#004230] bg-[#eef3f0] border-[#c2dad0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[24px] flex-shrink-0 mt-0.5">
                      {clashResult.type === 'warning' || clashResult.type === 'error'
                        ? 'warning'
                        : clashResult.type === 'info'
                        ? 'info'
                        : 'verified'}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[15px]">
                        {clashResult.type === 'warning'
                          ? clashResult.title || 'Medicine Clashes Detected'
                          : clashResult.type === 'error'
                          ? 'Error'
                          : clashResult.type === 'info'
                          ? 'Notice'
                          : 'No Clashes Detected'}
                      </p>

                      {clashResult.items && clashResult.items.length > 0 ? (
                        <div className="mt-3 space-y-2.5">
                          {clashResult.items.map((itemText, idx) => {
                            const match = itemText.match(/^CLASH WARNING:\s*([^:]+):\s*(.+)$/i);
                            if (match) {
                              return (
                                <div
                                  key={idx}
                                  className="bg-white/90 p-3 rounded-[4px] border border-[#ba1a1a33] text-[13px] leading-relaxed shadow-sm"
                                >
                                  <div className="font-bold text-[#ba1a1a] flex items-center gap-1.5 mb-1">
                                    <span className="material-symbols-outlined text-[16px]">dangerous</span>
                                    <span>Clashed Pair {idx + 1}: {match[1]}</span>
                                  </div>
                                  <p className="text-[#1c1f1d]">{match[2]}</p>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={idx}
                                className="bg-white/90 p-3 rounded-[4px] border border-[#ba1a1a33] text-[13px] leading-relaxed text-[#1c1f1d] shadow-sm"
                              >
                                {itemText}
                              </div>
                            );
                          })}
                          <div className="text-[12px] font-medium text-[#93000a] bg-white/70 p-2.5 rounded border border-[#ba1a1a33] mt-2">
                            ⚠️ <strong>Clinical Safety Advice:</strong> When two medicines clash or duplicate active ingredients, taking them together on the same day can lead to accidental overdose, excessive sedation, or adverse reactions. Please consult your prescribing doctor or pharmacist before taking both.
                          </div>
                        </div>
                      ) : (
                        <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed">
                          {typeof clashResult === 'string' ? clashResult : clashResult.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-[#d6d4cc] p-8 text-center" style={{ borderRadius: '4px' }}>
          <div
            className="w-10 h-10 mx-auto mb-3 bg-[#edeeeb] flex items-center justify-center text-[#5a605c] border border-[#d6d4cc]"
            style={{ borderRadius: '4px' }}
          >
            <span className="material-symbols-outlined text-[20px]">medication</span>
          </div>
          <p className="font-title-md text-[16px] text-[#1c1f1d] mb-2 font-semibold">No medicines added yet.</p>
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#d6d4cc] p-6 max-w-[480px] w-full text-left" style={{ borderRadius: '4px' }}>
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
                <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">Brand / Commercial Name</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(event) => setNewBrand(event.target.value)}
                  placeholder="e.g. Dolo 650"
                  required
                  className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">Active Compound (Generic Name)</label>
                <input
                  type="text"
                  value={newGeneric}
                  onChange={(event) => setNewGeneric(event.target.value)}
                  placeholder="e.g. paracetamol"
                  required
                  className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">Classification</label>
                  <select
                    value={newType}
                    onChange={(event) => setNewType(event.target.value)}
                    className="w-full bg-white border border-[#d6d4cc] p-2 text-[14px] rounded focus:ring-1 focus:ring-[#1f5a46] focus:outline-none"
                    style={{ borderRadius: '4px' }}
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="OTC">OTC (Over the counter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1c1f1d] mb-1">Expiry Date (MM/YYYY)</label>
                  <input
                    type="text"
                    value={newExpiry}
                    onChange={(event) => setNewExpiry(event.target.value)}
                    placeholder="MM/YYYY"
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
}
