import { useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './components/screens/HomeScreen';
import UploadVerifyScreen from './components/screens/UploadVerifyScreen';
import ProcessingScreen from './components/screens/ProcessingScreen';
import CabinetScreen from './components/screens/CabinetScreen';
import ReportScreen from './components/screens/ReportScreen';
import AskScreen from './components/screens/AskScreen';
import { SCREEN_PATHS } from './navigation';
import { initialCabinetRecords, initialPrescriptionMeds } from './data/clinicalData';
import ResultPage from './pages/ResultPage';

function PlaceholderScreen() {
  return <p className="text-[15px] text-[#1c1f1d]">This screen is added in the next step.</p>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [medicines, setMedicines] = useState(initialPrescriptionMeds);
  const [cabinetRecords, setCabinetRecords] = useState(initialCabinetRecords);

  const currentScreen = Object.entries(SCREEN_PATHS).find(([, path]) => path === location.pathname)?.[0] ?? 'home';

  const handleNavigate = (screen) => {
    navigate(SCREEN_PATHS[screen]);
    window.scrollTo(0, 0);
  };

  const handleSelectFlow = () => {
    // Flow setup if needed.
  };

  const handleRemoveCabinetRecord = (id) => {
    setCabinetRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const handleAddCabinetRecord = (record) => {
    setCabinetRecords((prev) => [record, ...prev]);
  };

  const handleSavePrescriptionToCabinet = () => {
    const newItems = medicines
      .filter((medicine) => medicine.name.trim() !== '')
      .map((medicine) => ({
        id: `cab-${Date.now()}-${medicine.name.toLowerCase().replace(/\s+/g, '')}`,
        medicine: medicine.name,
        genericName: medicine.name,
        type: 'Prescription',
        expiry: 'Not set',
      }));

    setCabinetRecords((prev) => {
      const existingNames = new Set(prev.map((record) => record.genericName.toLowerCase()));
      const toAdd = newItems.filter((item) => !existingNames.has(item.genericName.toLowerCase()));
      return [...prev, ...toAdd];
    });
  };

  return (
    <div className="bg-[#f8faf6] font-body-md text-[15px] text-[#1c1f1d] antialiased min-h-screen flex flex-col">
      <Header currentScreen={currentScreen} onNavigate={handleNavigate} cabinetCount={cabinetRecords.length} />

      <main className="flex-1 w-full pt-16 bg-[#f8faf6]">
        <div className="max-w-[720px] mx-auto px-5 pt-10 pb-20">
          <Routes>
            <Route path={SCREEN_PATHS.home} element={<HomeScreen />} />
            <Route
              path={SCREEN_PATHS.upload}
              element={
                <UploadVerifyScreen
                  medicines={medicines}
                  onUpdateMedicines={setMedicines}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route path={SCREEN_PATHS.processing} element={<ProcessingScreen onNavigate={handleNavigate} />} />
            <Route
              path={SCREEN_PATHS.report}
              element={
                <ReportScreen
                  medicines={medicines}
                  onNavigate={handleNavigate}
                  onSaveToCabinet={handleSavePrescriptionToCabinet}
                />
              }
            />
            <Route
              path={SCREEN_PATHS.cabinet}
              element={
                <CabinetScreen
                  records={cabinetRecords}
                  onRemoveRecord={handleRemoveCabinetRecord}
                  onAddRecord={handleAddCabinetRecord}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route path={SCREEN_PATHS.ask} element={<AskScreen />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
