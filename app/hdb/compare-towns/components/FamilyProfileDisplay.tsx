/**
 * Family Profile Display Component
 * Shows the current family profile with edit button
 */

import { FamilyProfile } from '@/lib/decision-rules'

interface FamilyProfileDisplayProps {
  profile: FamilyProfile
  onEdit: () => void
}

export default function FamilyProfileDisplay({ profile, onEdit }: FamilyProfileDisplayProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">👨‍👩‍👧 Family profile:</span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
            {profile.stage === 'no_children' ? 'Young couple / No children yet' :
             profile.stage === 'primary_family' ? 'Primary school family' :
             profile.stage === 'planning_primary' ? 'Planning for primary school soon' :
             'Older children / Long-term stability'}
          </span>
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
            {profile.holdingYears === 'short' ? '< 5 years' :
             profile.holdingYears === 'medium' ? '5–15 years' :
             '15+ years'}
          </span>
          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
            {profile.costVsValue === 'cost' ? 'Cost-focused' :
             profile.costVsValue === 'value' ? 'Value-focused' :
             'Balanced'}
          </span>
          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
            {profile.schoolSensitivity === 'high' ? 'Low school pressure' :
             profile.schoolSensitivity === 'low' ? 'Comfortable with competition' :
             'Neutral'}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          (Edit)
        </button>
      </div>
    </div>
  )
}

