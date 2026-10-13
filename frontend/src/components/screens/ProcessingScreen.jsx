import React, { useState, useEffect } from 'react';
import { initialPipelineSteps } from '../../data/clinicalData';

export default function ProcessingScreen({ onNavigate }) {
  const [steps, setSteps] = useState(initialPipelineSteps);
  const [completedCount, setCompletedCount] = useState(3);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let timer1;
    let timer2;

    if (isSimulating) {
      timer1 = setTimeout(() => {
        setSteps((previous) =>
          previous.map((step) => {
            if (step.id === 4) return { ...step, status: 'Done' };
            if (step.id === 5) return { ...step, status: 'In progress' };
            return step;
          })
        );
        setCompletedCount(4);
      }, 1200);

      timer2 = setTimeout(() => {
        setSteps((previous) => previous.map((step) => ({ ...step, status: 'Done' })));
        setCompletedCount(5);
        setIsSimulating(false);
      }, 2400);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isSimulating]);

  const handleRunFullCheck = () => {
    setIsSimulating(true);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto pb-12">
      <div
        className="inline-block bg-white text-[#5a605c] font-label-sm text-[12px] px-2 py-0.5 border border-[#d6d4cc] mb-4"
        style={{ borderRadius: '4px' }}
      >
        Sample data
      </div>

      <h1
        className="font-headline-lg text-[32px] sm:text-[36px] text-[#1c1f1d] font-semibold tracking-tight mb-2"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        Working on it
      </h1>
      <p className="font-body-md text-[15px] text-[#5a605c] mb-8">
        Checking each medicine against the saved medicine data.
      </p>

      <div className="bg-white border border-[#d6d4cc] p-6 mb-6" style={{ borderRadius: '4px' }}>
        <div className="text-[12px] font-semibold text-[#5a605c] uppercase tracking-wider mb-4 pb-2 border-b border-[#d6d4cc] flex items-center justify-between">
          <span>Steps</span>
          <span>Status</span>
        </div>

        <div className="flex flex-col space-y-1">
          {steps.map((step) => {
            const isInProgress = step.status === 'In progress';
            const isDone = step.status === 'Done';
            const isWaiting = step.status === 'Waiting';

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between py-2.5 px-3 transition-colors ${
                  isInProgress
                    ? 'bg-[#fdf0e2] border-l-[3px] border-[#b85c00]'
                    : isWaiting
                      ? 'opacity-75 hover:bg-[#f3f4f0]'
                      : 'hover:bg-[#f3f4f0]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span
                    className={`font-body-sm text-[13px] tabular-nums select-none ${
                      isInProgress ? 'text-[#b85c00]' : 'text-[#5a605c]'
                    }`}
                  >
                    {step.time}
                  </span>
                  <span
                    className={`font-body-md text-[15px] truncate ${
                      isInProgress
                        ? 'text-[#1c1f1d] font-medium'
                        : isWaiting
                          ? 'text-[#5a605c]'
                          : 'text-[#1c1f1d]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                <div className="flex items-center space-x-2 pl-4 shrink-0">
                  {isDone && (
                    <>
                      <div className="w-2 h-2 bg-[#1f5a46] shrink-0" />
                      <span className="font-body-sm text-[13px] text-[#1f5a46] font-semibold">Done</span>
                    </>
                  )}
                  {isInProgress && (
                    <>
                      <div className="w-2 h-2 bg-[#b85c00] shrink-0 animate-pulse" />
                      <span className="font-body-sm text-[13px] text-[#b85c00] font-semibold">In progress</span>
                    </>
                  )}
                  {isWaiting && (
                    <>
                      <div className="w-2 h-2 bg-[#5a605c] shrink-0" />
                      <span className="font-body-sm text-[13px] text-[#5a605c]">Waiting</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#d6d4cc] flex items-center justify-between font-body-sm text-[13px] text-[#5a605c]">
          <span className="tabular-nums font-medium">{completedCount} of 5 steps completed</span>
        </div>
      </div>

      <div
        className="border border-[#d6d4cc] bg-white p-4 mb-6"
        style={{ borderRadius: '4px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#5a605c] mt-2 shrink-0" />
            <div>
              <div className="font-title-md text-[16px] text-[#1c1f1d] font-semibold">Verification checkpoint</div>
              <div className="font-body-md text-[15px] text-[#5a605c]">
                Waiting for you. Please confirm the list above to continue.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:self-center">
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="inline-flex items-center justify-center font-label-md text-[14px] text-[#1f5a46] bg-white border border-[#1f5a46] hover:bg-[#eef3f0] px-4 py-2 transition-colors whitespace-nowrap cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              Review list
            </button>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="inline-flex items-center justify-center font-label-md text-[14px] text-white bg-[#1f5a46] hover:bg-[#004230] px-4 py-2 transition-colors whitespace-nowrap cursor-pointer border-0"
              style={{ borderRadius: '4px' }}
            >
              View Report →
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        <button
          type="button"
          onClick={handleRunFullCheck}
          disabled={isSimulating || completedCount === 5}
          className="text-[13px] text-[#1f5a46] underline hover:text-[#004230] bg-transparent border-0 cursor-pointer p-0"
        >
          {completedCount === 5 ? 'All 5 ingestion steps finalized' : 'Run automated remaining checks'}
        </button>
      </div>
    </div>
  );
}
