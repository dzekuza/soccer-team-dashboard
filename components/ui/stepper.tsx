import React from "react"

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepChange: (step: number) => void
  className?: string
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepChange, className }) => {
  return (
    <div className={`flex flex-col w-full px-2 sm:px-0 ${className || ''}`}>
      <div className="flex items-center justify-between w-full mb-6">
        {steps.map((label, idx) => (
          <div key={label} className="flex-1 flex flex-col items-center mx-2">
            <button
              type="button"
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-colors font-semibold text-lg
                ${idx < currentStep ? 'bg-[var(--main-orange)] border-[var(--main-orange)] text-white' : ''}
                ${idx === currentStep ? 'bg-black border-black text-white' : ''}
                ${idx > currentStep ? 'bg-white border-[var(--main-border)] text-gray-400' : ''}
              `}
              onClick={() => onStepChange(idx)}
              aria-current={idx === currentStep ? 'step' : undefined}
              aria-label={`Žingsnis ${idx + 1}: ${label}`}
              style={{ fontWeight: idx === currentStep ? 700 : 500 }}
            >
              <span className={idx === currentStep ? 'text-white' : idx < currentStep ? 'text-white' : 'text-gray-400'}>{idx + 1}</span>
            </button>
            <span className={`mt-2 text-xs sm:text-sm text-center ${idx === currentStep ? 'text-black font-bold' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full h-1 bg-[var(--main-border)] rounded-full relative">
        <div
          className="h-1 bg-[var(--main-orange)] rounded-full transition-all"
          style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
} 