/**
 * Filter Wizard Component
 * Guides first-time users through setting up essence filters
 */

'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, Home, DollarSign, Shield, Train } from 'lucide-react'
import { FlatTypeFilter } from './FlatTypeFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import { LeaseSafetyFilter } from './LeaseSafetyFilter'
import { MRTDistanceFilter } from './MRTDistanceFilter'

const WIZARD_STORAGE_KEY = 'filter_wizard_completed'

interface FilterWizardProps {
  selectedFlatTypes: Set<string>
  onFlatTypesChange: (flatTypes: Set<string>) => void
  priceTiers: Set<string>
  onPriceTiersChange: (tiers: Set<string>) => void
  leaseTiers: Set<string>
  onLeaseTiersChange: (tiers: Set<string>) => void
  mrtTier: string
  onMrtTierChange: (tier: string) => void
}

const STEPS = [
  {
    id: 1,
    title: 'Choose your flat size',
    description: 'Select the flat types you\'re considering. This helps narrow down options that match your family size and needs.',
    icon: Home,
    filterKey: 'flatType' as const,
  },
  {
    id: 2,
    title: 'Set your budget range',
    description: 'Filter by price range to focus on neighbourhoods within your budget. You can select multiple ranges.',
    icon: DollarSign,
    filterKey: 'price' as const,
  },
  {
    id: 3,
    title: 'Consider lease safety',
    description: 'Remaining lease affects long-term value and financing. Choose your comfort level with lease length.',
    icon: Shield,
    filterKey: 'lease' as const,
  },
  {
    id: 4,
    title: 'Set MRT distance preference',
    description: 'How close do you want to be to MRT? This affects daily commute convenience.',
    icon: Train,
    filterKey: 'mrt' as const,
  },
]

export function FilterWizard({
  selectedFlatTypes,
  onFlatTypesChange,
  priceTiers,
  onPriceTiersChange,
  leaseTiers,
  onLeaseTiersChange,
  mrtTier,
  onMrtTierChange,
}: FilterWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if wizard has been completed
    const completed = typeof window !== 'undefined' 
      ? localStorage.getItem(WIZARD_STORAGE_KEY) === 'true'
      : true
    
    if (!completed) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WIZARD_STORAGE_KEY, 'true')
    }
    setIsVisible(false)
  }

  const handleDismiss = () => {
    handleComplete()
  }

  if (!isVisible) return null

  const currentStepData = STEPS[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </h2>
              <p className="text-xs text-gray-500">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-gray-600 mb-6">
            {currentStepData.description}
          </p>

          {/* Filter Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {currentStepData.filterKey === 'flatType' && (
              <FlatTypeFilter
                selectedFlatTypes={selectedFlatTypes}
                onFlatTypesChange={onFlatTypesChange}
              />
            )}
            {currentStepData.filterKey === 'price' && (
              <PriceRangeFilter
                priceTiers={priceTiers}
                onPriceTiersChange={onPriceTiersChange}
              />
            )}
            {currentStepData.filterKey === 'lease' && (
              <LeaseSafetyFilter
                leaseTiers={leaseTiers}
                onLeaseTiersChange={onLeaseTiersChange}
              />
            )}
            {currentStepData.filterKey === 'mrt' && (
              <MRTDistanceFilter
                mrtTier={mrtTier}
                onMrtTierChange={onMrtTierChange}
              />
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              💡 Tip
            </p>
            {currentStep === 0 && (
              <p className="text-xs text-blue-800">
                You can select multiple flat types. The results will show neighbourhoods with any of your selected types.
              </p>
            )}
            {currentStep === 1 && (
              <p className="text-xs text-blue-800">
                Selecting multiple price ranges will show neighbourhoods in any of those ranges. Start broad and narrow down later.
              </p>
            )}
            {currentStep === 2 && (
              <p className="text-xs text-blue-800">
                Shorter leases may have better prices but face resale constraints. Consider your long-term plans.
              </p>
            )}
            {currentStep === 3 && (
              <p className="text-xs text-blue-800">
                Closer MRT access often means higher prices. Balance convenience with your budget.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip wizard
          </button>
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

