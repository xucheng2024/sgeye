/**
 * Family Profile Display Component
 * Shows the current family profile with edit button
 */

import { FamilyProfile } from '@/lib/decision-rules'
import { Edit2 } from 'lucide-react'

interface FamilyProfileDisplayProps {
  profile: FamilyProfile
  onEdit: () => void
}

export default function FamilyProfileDisplay({ profile, onEdit }: FamilyProfileDisplayProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm rounded-xl border-2 border-blue-200 shadow-md p-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍👩‍👧</span>
            <span className="text-base font-bold text-gray-900">Family profile:</span>
          </div>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold border border-blue-200">
            {profile.stage === 'no_children' ? 'Young couple / No children yet' :
             profile.stage === 'primary_family' ? 'Primary school family' :
             profile.stage === 'planning_primary' ? 'Planning for primary school soon' :
             'Older children / Long-term stability'}
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-semibold border border-green-200">
            {profile.holdingYears === 'short' ? '< 5 years' :
             profile.holdingYears === 'medium' ? '5–15 years' :
             '15+ years'}
          </span>
          <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold border border-purple-200">
            {profile.costVsValue === 'cost' ? 'Cost-focused' :
             profile.costVsValue === 'value' ? 'Value-focused' :
             'Balanced'}
          </span>
          <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold border border-amber-200">
            {profile.schoolSensitivity === 'high' ? 'Low school pressure' :
             profile.schoolSensitivity === 'low' ? 'Comfortable with competition' :
             'Neutral'}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg active:scale-95"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  )
}

