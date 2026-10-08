import React from 'react';

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Capture' },
  { id: 2, name: 'Transcribe' },
  { id: 3, name: 'Summarize' },
  { id: 4, name: 'Export' },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-4 md:px-12">
      <div className="flex justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-100 rounded-full -z-10"></div>
        <div 
          className="absolute top-5 left-0 h-1.5 bg-blue-600 rounded-full -z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border-4 transition-all duration-300
                ${step.id <= currentStep 
                  ? 'bg-blue-600 text-white border-blue-100 shadow-md' 
                  : 'bg-white text-gray-300 border-gray-50'}`}
            >
              {step.id}
            </div>
            <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300
              ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-300'}`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
