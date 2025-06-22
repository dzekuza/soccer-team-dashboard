import React from "react"

interface StepperProps {
  steps: string[]
  currentStep: number
  onStepChange: (step: number) => void
  className?: string
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepChange, className }) => {
  return (
    <div className={`flex items-center justify-between w-full ${className || ''}`}>
      {steps.map((label, idx) => (
        <div key={label} className="relative flex-1 flex flex-col items-center group">
          <div className="absolute top-5 left-0 w-full border-t-2 border-dashed border-gray-600 group-first:left-1/2 group-last:right-1/2 group-last:w-1/2 group-first:w-1/2" />
          <button
            type="button"
            className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-full border-2 transition-colors font-semibold text-lg
              ${idx === currentStep
                ? 'bg-black border-black text-white'
                : 'bg-white border-gray-300 text-gray-500'
              }
            `}
            onClick={() => onStepChange(idx)}
            aria-current={idx === currentStep ? 'step' : undefined}
            aria-label={`Žingsnis ${idx + 1}: ${label}`}
          >
            {idx + 1}
          </button>
          <span className={`mt-2 text-xs sm:text-sm text-center ${idx === currentStep ? 'text-white font-bold' : 'text-gray-400'}`}>{label}</span>
        </div>
      ))}
    </div>
  )
} 