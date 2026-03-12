'use client'

import { CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react'

export interface ServiceStep {
  name: string
  description: string
  status: 'pending' | 'loading' | 'complete' | 'error'
  timestamp?: string
}

interface ServiceFlowProps {
  steps: ServiceStep[]
  isActive: boolean
}

export function ServiceFlow({ steps, isActive }: ServiceFlowProps) {
  if (!isActive) return null

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Live Service Flow</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 pt-1">
              {step.status === 'complete' && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {step.status === 'loading' && (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              {step.status === 'error' && (
                <Circle className="w-5 h-5 text-red-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{step.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
              {step.timestamp && (
                <p className="text-xs text-slate-500 mt-1">{step.timestamp}</p>
              )}
            </div>

            {/* Arrow (except for last item) */}
            {index < steps.length - 1 && (
              <div className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-600">
          {steps.filter(s => s.status === 'complete').length} of {steps.length} steps complete
        </div>
      </div>
    </div>
  )
}
