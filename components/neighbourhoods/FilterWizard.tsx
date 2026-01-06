/**
 * Filter Wizard Component
 * Guides first-time users through setting up essence filters
 */

'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Home, DollarSign, Shield, Train } from 'lucide-react'
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
    title: 'Which flat size do you need?',
    tip: 'You can select more than one.',
    icon: Home,
    filterKey: 'flatType' as const,
  },
  {
    id: 2,
    title: 'What\'s your budget?',
    tip: 'You can adjust this anytime.',
    icon: DollarSign,
    filterKey: 'price' as const,
  },
  {
    id: 3,
    title: 'How long will you stay?',
    tip: 'Many buyers think about this only after moving in.',
    icon: Shield,
    filterKey: 'lease' as const,
  },
  {
    id: 4,
    title: 'How close to MRT?',
    tip: 'You can adjust this anytime.',
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
    // TEMPORARILY DISABLED FOR TESTING - uncomment below to re-enable cache
    // const completed = typeof window !== 'undefined' 
    //   ? localStorage.getItem(WIZARD_STORAGE_KEY) === 'true'
    //   : true
    
    // if (!completed) {
    //   setIsVisible(true)
    // }
    
    // Always show wizard for testing
    setIsVisible(true)
  }, [])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }
  
  // Check if current step has a selection
  const hasSelection = () => {
    switch (STEPS[currentStep].filterKey) {
      case 'flatType':
        return selectedFlatTypes.size > 0 && !(selectedFlatTypes.size === 1 && selectedFlatTypes.has('All'))
      case 'price':
        return priceTiers.size > 0
      case 'lease':
        return leaseTiers.size > 0
      case 'mrt':
        return mrtTier && mrtTier !== 'all'
      default:
        return false
    }
  }

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WIZARD_STORAGE_KEY, 'true')
    }
    setIsVisible(false)
  }

  const handleSkip = () => {
    // Move to next step without making a selection
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  if (!isVisible) return null

  const currentStepData = STEPS[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Step {currentStep + 1}</span>
                <span className="text-gray-300">|</span>
                <h2 className="text-base font-semibold text-gray-900">
                  {currentStepData.title}
                </h2>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Filter Display */}
          <div className="mb-6">
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
          
          {/* Tip */}
          {currentStepData.tip && (
            <p className="text-xs text-gray-500 mb-6">
              {currentStepData.tip}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Later
            </button>
            <div className="flex-1" />
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
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

