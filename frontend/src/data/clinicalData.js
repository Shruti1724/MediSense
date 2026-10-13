export const initialPrescriptionMeds = [
  {
    id: 'rx-1',
    name: 'Amoxicillin',
    strength: '500 mg',
    timing: 'Morning and night (original: 1-0-1)',
    confidence: 'High',
  },
  {
    id: 'rx-2',
    name: 'Atorvastatin',
    strength: '20 mg',
    timing: 'Night only (original: 0-0-1)',
    confidence: 'Check this',
    suggestions: [
      { name: 'Atorvastatin', strength: '20 mg' },
      { name: 'Rosuvastatin', strength: '20 mg' },
      { name: 'Azithromycin', strength: '250 mg' },
    ],
  },
  {
    id: 'rx-3',
    name: 'Metformin',
    strength: '850 mg',
    timing: 'With meals twice daily (original: 1-0-1)',
    confidence: 'High',
  },
];

export const initialCabinetRecords = [];

export const defaultInteractionWarnings = [
  {
    severity: 'major',
    title: 'Major Precaution',
    body: 'Two of these medicines can raise the risk of bleeding when taken together. Ask your doctor or pharmacist before the next dose.',
  },
  {
    severity: 'moderate',
    title: 'Moderate Interaction',
    body: 'Moderate interaction noted between Aspirin and Ibuprofen. Stagger intake or consult your pharmacist.',
  },
  {
    severity: 'minor',
    title: 'Minor Advisory',
    body: 'Take with food to minimize mild stomach irritation.',
  },
];

export const initialPipelineSteps = [
  { id: 1, time: '[10:14:02]', label: 'Checking image quality', status: 'Done' },
  { id: 2, time: '[10:14:04]', label: 'Reading medicine names', status: 'Done' },
  { id: 3, time: '[10:14:07]', label: 'Matching names to the medicine list', status: 'Done' },
  { id: 4, time: '[10:14:10]', label: 'Looking up each medicine', status: 'In progress' },
  { id: 5, time: '[10:14:12]', label: 'Checking combinations', status: 'Waiting' },
];
