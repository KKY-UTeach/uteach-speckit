import React from 'react';
import { SupportedLanguage, translations } from '../i18n';

interface ProgressBarProps {
  currentStep: number;
  language: SupportedLanguage;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, language }) => {
  const steps = translations[language].progressSteps;
  return (
    <div className="w-full py-6 px-4 md:px-12">
      <div className="flex justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-100 rounded-full -z-10"></div>
        <div 
          className="absolute top-5 left-0 h-1.5 bg-blue-600 rounded-full -z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black border-4 transition-all duration-300
                ${index + 1 <= currentStep
                  ? 'bg-blue-600 text-white border-blue-100 shadow-md' 
                  : 'bg-white text-gray-300 border-gray-50'}`}
            >
              {index + 1}
            </div>
            <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300
              ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-300'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
