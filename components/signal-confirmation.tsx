'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export interface SignalStatus {
  name: string
  category: string
  value: number
  status: 'complete' | 'partial' | 'incomplete'
  completenessPercent: number
  missingData?: string[]
  dataPoints?: number
  notes?: string
}

interface SignalConfirmationProps {
  signals: SignalStatus[]
  totalRows: number
  totalColumns: number
  fileName: string
  onConfirm: () => void
  isProcessing?: boolean
}

export function SignalConfirmation({
  signals,
  totalRows,
  totalColumns,
  fileName,
  onConfirm,
  isProcessing = false,
}: SignalConfirmationProps) {
  const completeSignals = signals.filter(s => s.status === 'complete')
  const partialSignals = signals.filter(s => s.status === 'partial')
  const incompleteSignals = signals.filter(s => s.status === 'incomplete')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold">Step 2b: Confirm Signals</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review detected signals from <span className="font-medium">{fileName}</span>
        </p>
      </div>

      {/* File Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">{totalRows}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Columns</p>
              <p className="text-2xl font-bold">{totalColumns}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Signals Detected</p>
              <p className="text-2xl font-bold">{signals.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Detection Status */}
      {completeSignals.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Complete Signals ({completeSignals.length})
            </CardTitle>
            <CardDescription>Ready for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completeSignals.map((signal) => (
                <div key={signal.name} className="flex items-start justify-between p-4 bg-white rounded border border-green-100">
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-green-900">{signal.name}</p>
                    <p className="text-sm text-green-700 mt-2">
                      {signal.dataPoints || 0} data points • {signal.category}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-900">{signal.value.toLocaleString()}</div>
                    <div className="w-20 h-2 bg-green-200 rounded-full mt-2">
                      <div className="w-full h-full bg-green-600 rounded-full" />
                    </div>
                    <p className="text-sm font-semibold text-green-700 mt-2">✓ Complete</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partial Signals */}
      {partialSignals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-900">
              <Clock className="h-5 w-5" />
              Partial Signals ({partialSignals.length})
            </CardTitle>
            <CardDescription>Need more data to analyze properly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partialSignals.map((signal) => (
                <div key={signal.name} className="flex items-start justify-between p-3 bg-white rounded border border-amber-100">
                  <div>
                    <p className="font-medium text-amber-900">{signal.name}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {signal.dataPoints || 0} data points • {signal.category}
                    </p>
                    {signal.missingData && signal.missingData.length > 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Missing: {signal.missingData.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-900">{signal.value}</div>
                    <div className="w-16 h-2 bg-amber-200 rounded-full mt-1">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${signal.completenessPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-amber-700 mt-1">{signal.completenessPercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incomplete Signals */}
      {incompleteSignals.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Incomplete Signals ({incompleteSignals.length})
            </CardTitle>
            <CardDescription>Insufficient data for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incompleteSignals.map((signal) => (
                <div key={signal.name} className="flex items-start justify-between p-3 bg-white rounded border border-red-100">
                  <div>
                    <p className="font-medium text-red-900">{signal.name}</p>
                    <p className="text-xs text-red-700 mt-1">{signal.notes || 'Less than 2 data points'}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-2 bg-red-200 rounded-full">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${signal.completenessPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-red-700 mt-1">{signal.completenessPercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      {(partialSignals.length > 0 || incompleteSignals.length > 0) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Upload more data for better insights</p>
              <p className="text-xs mt-1">
                Partial and incomplete signals will improve with more historical data or additional metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onConfirm} className="flex-1" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Proceed with Analysis'}
        </Button>
      </div>
    </div>
  )
}
