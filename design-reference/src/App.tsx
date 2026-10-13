import React, { useState, useEffect } from 'react';
import { Screen, MedicineEntry, CabinetRecord } from './types';
import { initialPrescriptionMeds, initialCabinetRecords } from './data/clinicalData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeScreen } from './components/screens/HomeScreen';
import { UploadVerifyScreen } from './components/screens/UploadVerifyScreen';
import { ProcessingScreen } from './components/screens/ProcessingScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { CabinetScreen } from './components/screens/CabinetScreen';
import { AskScreen } from './components/screens/AskScreen';
import { StyleGuideScreen } from './components/screens/StyleGuideScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [medicines, setMedicines] = useState<MedicineEntry[]>(initialPrescriptionMeds);
  const [cabinetRecords, setCabinetRecords] = useState<CabinetRecord[]>(initialCabinetRecords);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFlow = (_flow: 'prescription' | 'medicine') => {
    // Flow setup if needed
  };

  const handleRemoveCabinetRecord = (id: string) => {
    setCabinetRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddCabinetRecord = (record: CabinetRecord) => {
    setCabinetRecords((prev) => [record, ...prev]);
  };

  const handleSavePrescriptionToCabinet = () => {
    const newItems: CabinetRecord[] = medicines
      .filter((m) => m.name.trim() !== '')
      .map((m) => ({
        id: `cab-${Date.now()}-${m.name.toLowerCase().replace(/\s+/g, '')}`,
        medicine: m.name,
        genericName: m.name,
        type: 'Prescription' as const,
        expiry: '10/2027',
      }));

    // Avoid duplicates by genericName
    setCabinetRecords((prev) => {
      const existingNames = new Set(prev.map((p) => p.genericName.toLowerCase()));
      const toAdd = newItems.filter((item) => !existingNames.has(item.genericName.toLowerCase()));
      return [...prev, ...toAdd];
    });
  };

  return (
    <div className="bg-[#f8faf6] font-body-md text-[15px] text-[#1c1f1d] antialiased min-h-screen flex flex-col">
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        cabinetCount={cabinetRecords.length}
      />

      <main className="flex-1 w-full pt-16 bg-[#f8faf6]">
        <div className="max-w-[720px] mx-auto px-5 pt-10 pb-20">
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={handleNavigate}
              onSelectFlow={handleSelectFlow}
            />
          )}

          {currentScreen === 'upload' && (
            <UploadVerifyScreen
              medicines={medicines}
              onUpdateMedicines={setMedicines}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'processing' && (
            <ProcessingScreen
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'report' && (
            <ReportScreen
              medicines={medicines}
              onNavigate={handleNavigate}
              onSaveToCabinet={handleSavePrescriptionToCabinet}
            />
          )}

          {currentScreen === 'cabinet' && (
            <CabinetScreen
              records={cabinetRecords}
              onRemoveRecord={handleRemoveCabinetRecord}
              onAddRecord={handleAddCabinetRecord}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'ask' && (
            <AskScreen />
          )}

          {currentScreen === 'styleguide' && (
            <StyleGuideScreen />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
