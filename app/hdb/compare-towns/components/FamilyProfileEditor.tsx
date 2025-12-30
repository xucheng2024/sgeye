/**
 * Family Profile Editor Component
 * Sidebar editor for family profile
 */

'use client'

import { FamilyProfile } from '@/lib/decision-rules'
import { PreferenceLens } from '@/lib/hdb-data'

interface FamilyProfileEditorProps {
  isOpen: boolean
  onClose: () => void
  familyProfile: FamilyProfile | null
  onProfileChange: (profile: FamilyProfile) => void
  holdingPeriod: 'short' | 'medium' | 'long'
  onHoldingPeriodChange: (period: 'short' | 'medium' | 'long') => void
  preferenceLens: PreferenceLens
  onPreferenceLensChange: (lens: PreferenceLens) => void
}

export default function FamilyProfileEditor({
  isOpen,
  onClose,
  familyProfile,
  onProfileChange,
  holdingPeriod,
  onHoldingPeriodChange,
  preferenceLens,
  onPreferenceLensChange,
}: FamilyProfileEditorProps) {
  if (!isOpen) return null

  const defaultProfile: FamilyProfile = {
    stage: 'primary_family',
    holdingYears: 'medium',
    costVsValue: 'balanced',
    schoolSensitivity: 'neutral',
  }

  const currentProfile = familyProfile || defaultProfile

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Family Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Question 1: Family Stage */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Your family stage
            </label>
            <div className="space-y-2">
              {[
                { value: 'no_children', label: 'Young couple / No children yet' },
                { value: 'primary_family', label: 'Family with primary-school child(ren)' },
                { value: 'planning_primary', label: 'Planning for primary school soon' },
                { value: 'older_children', label: 'Older children / Long-term stability focus' }
              ].map(option => (
                <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                  currentProfile.stage === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="stage"
                    value={option.value}
                    checked={currentProfile.stage === option.value}
                    onChange={(e) => onProfileChange({
                      ...currentProfile,
                      stage: e.target.value as FamilyProfile['stage']
                    })}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2: Holding Years */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How long do you expect to stay in this home?
            </label>
            <div className="space-y-2">
              {[
                { value: 'short', label: '< 5 years' },
                { value: 'medium', label: '5–15 years' },
                { value: 'long', label: '15+ years' }
              ].map(option => (
                <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                  (currentProfile.holdingYears === option.value || (!familyProfile && holdingPeriod === option.value)) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="holdingYears"
                    value={option.value}
                    checked={currentProfile.holdingYears === option.value || (!familyProfile && holdingPeriod === option.value)}
                    onChange={(e) => {
                      const value = e.target.value as FamilyProfile['holdingYears']
                      onProfileChange({
                        ...currentProfile,
                        holdingYears: value
                      })
                      onHoldingPeriodChange(value)
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3: Cost vs Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Which matters more right now?
            </label>
            <div className="space-y-2">
              {[
                { value: 'cost', label: 'Lower upfront & monthly cost' },
                { value: 'value', label: 'Long-term value & resale safety' },
                { value: 'balanced', label: 'Balanced' }
              ].map(option => (
                <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                  (currentProfile.costVsValue === option.value || (!familyProfile && (
                    (preferenceLens === 'lower_cost' && option.value === 'cost') ||
                    (preferenceLens === 'lease_safety' && option.value === 'value') ||
                    (preferenceLens === 'balanced' && option.value === 'balanced')
                  ))) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="costVsValue"
                    value={option.value}
                    checked={currentProfile.costVsValue === option.value || (!familyProfile && (
                      (preferenceLens === 'lower_cost' && option.value === 'cost') ||
                      (preferenceLens === 'lease_safety' && option.value === 'value') ||
                      (preferenceLens === 'balanced' && option.value === 'balanced')
                    ))}
                    onChange={(e) => {
                      const value = e.target.value as FamilyProfile['costVsValue']
                      onProfileChange({
                        ...currentProfile,
                        costVsValue: value
                      })
                      // Auto-update preference lens
                      if (value === 'cost') onPreferenceLensChange('lower_cost')
                      else if (value === 'value') onPreferenceLensChange('lease_safety')
                      else onPreferenceLensChange('balanced')
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 4: School Sensitivity */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How sensitive are you to school competition?
            </label>
            <div className="space-y-2">
              {[
                { value: 'high', label: 'Very sensitive (prefer lower pressure)' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'low', label: 'Comfortable with competition' }
              ].map(option => (
                <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all ${
                  (currentProfile.schoolSensitivity === option.value || (!familyProfile && (
                    (preferenceLens === 'school_pressure' && option.value === 'high') ||
                    (!familyProfile && option.value === 'neutral')
                  ))) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="schoolSensitivity"
                    value={option.value}
                    checked={currentProfile.schoolSensitivity === option.value || (!familyProfile && (
                      (preferenceLens === 'school_pressure' && option.value === 'high') ||
                      (!familyProfile && option.value === 'neutral')
                    ))}
                    onChange={(e) => {
                      const value = e.target.value as FamilyProfile['schoolSensitivity']
                      onProfileChange({
                        ...currentProfile,
                        schoolSensitivity: value
                      })
                      // Auto-update preference lens if very sensitive
                      if (value === 'high') onPreferenceLensChange('school_pressure')
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

