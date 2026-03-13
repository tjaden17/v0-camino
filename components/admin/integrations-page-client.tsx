'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Shield,
  RefreshCw,
  Settings,
  Unplug,
  Clock,
  Zap
} from 'lucide-react'

interface Integration {
  id: string
  provider: 'zoho_desk' | 'zoho_crm'
  status: 'active' | 'expired' | 'error' | 'disconnected'
  last_sync_at?: string
  last_error?: string
  created_at: string
  config: {
    data_center: string
    scopes: string[]
    account_email?: string
    org_name?: string
  }
}

const PROVIDER_INFO = {
  zoho_desk: {
    name: 'Zoho Desk',
    description: 'Connect to extract support tickets, resolution times, and customer satisfaction metrics',
    icon: '/zoho-desk-icon.svg',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    permissions: [
      { name: 'Read Tickets', description: 'Access support ticket data including status, priority, and resolution times' },
      { name: 'Read Contacts', description: 'Access customer contact information linked to tickets' },
      { name: 'Read Reports', description: 'Access pre-built analytics and performance reports' },
      { name: 'Read Agents', description: 'Access agent performance and assignment data' },
    ],
    signals: ['Average Resolution Time', 'Ticket Volume', 'Customer Satisfaction', 'Bug Impact Score']
  },
  zoho_crm: {
    name: 'Zoho CRM',
    description: 'Connect to extract deals, pipeline data, conversion rates, and customer activity',
    icon: '/zoho-crm-icon.svg',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    permissions: [
      { name: 'Read Deals', description: 'Access deal data including amounts, stages, and close dates' },
      { name: 'Read Contacts', description: 'Access customer contact and activity information' },
      { name: 'Read Accounts', description: 'Access company/account information' },
      { name: 'Read Reports', description: 'Access pre-built sales analytics and forecasts' },
    ],
    signals: ['Sales Pipeline Value', 'Conversion Rate', 'Retention Score', 'Activation Score']
  }
}

export function IntegrationsPageClient() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'zoho_desk' | 'zoho_crm' | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadIntegrations()
    
    // Check for OAuth callback messages
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (error) {
      toast({
        title: 'Connection failed',
        description: getErrorMessage(error),
        variant: 'destructive'
      })
      router.replace('/admin/integrations')
    }

    if (success) {
      const providerName = PROVIDER_INFO[success as keyof typeof PROVIDER_INFO]?.name
      toast({
        title: 'Connected successfully!',
        description: `${providerName} has been connected. Your data will start syncing shortly.`
      })
      router.replace('/admin/integrations')
      loadIntegrations()
    }
  }, [searchParams])

  function getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'access_denied': 'You denied access to your Zoho account. Please try again if you want to connect.',
      'invalid_request': 'The connection request was invalid. Please try again.',
      'server_error': 'Zoho experienced an error. Please try again later.',
      'temporarily_unavailable': 'Zoho is temporarily unavailable. Please try again later.',
      'missing_code': 'Authorization was incomplete. Please try again.',
      'token_exchange_failed': 'Failed to complete the connection. Please try again.',
    }
    return errorMessages[error] || `Connection failed: ${error.replace(/_/g, ' ')}`
  }

  async function loadIntegrations() {
    try {
      const response = await fetch('/api/integrations')
      if (!response.ok) throw new Error('Failed to load integrations')
      
      const data = await response.json()
      setIntegrations(data.integrations || [])
    } catch (error) {
      console.error('[v0] Load integrations error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  function openConnectModal(provider: 'zoho_desk' | 'zoho_crm') {
    setSelectedProvider(provider)
    setConnectModalOpen(true)
  }

  function openDisconnectDialog(provider: 'zoho_desk' | 'zoho_crm') {
    setSelectedProvider(provider)
    setDisconnectDialogOpen(true)
  }

  async function handleConnect() {
    if (!selectedProvider) return
    
    try {
      setConnecting(selectedProvider)
      setConnectModalOpen(false)
      
      const response = await fetch('/api/integrations/zoho/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initiate connection')
      }

      const { authUrl } = await response.json()
      
      // Show redirecting state briefly
      toast({
        title: 'Redirecting to Zoho...',
        description: 'Please authorize access in the Zoho window.'
      })
      
      // Small delay for UX, then redirect
      setTimeout(() => {
        window.location.href = authUrl
      }, 500)
    } catch (error) {
      console.error('[v0] Connect error:', error)
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive'
      })
      setConnecting(null)
    }
  }

  async function handleDisconnect() {
    if (!selectedProvider) return

    try {
      const response = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider })
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      toast({
        title: 'Disconnected',
        description: `${PROVIDER_INFO[selectedProvider].name} has been disconnected from your organization.`
      })

      setDisconnectDialogOpen(false)
      setSelectedProvider(null)
      loadIntegrations()
    } catch (error) {
      console.error('[v0] Disconnect error:', error)
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive'
      })
    }
  }

  async function handleSyncNow(provider: 'zoho_desk' | 'zoho_crm') {
    try {
      setSyncing(provider)
      
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      })

      if (!response.ok) throw new Error('Failed to start sync')

      toast({
        title: 'Sync started',
        description: `${PROVIDER_INFO[provider].name} data sync has been initiated.`
      })
      
      // Refresh after a short delay
      setTimeout(() => {
        loadIntegrations()
        setSyncing(null)
      }, 2000)
    } catch (error) {
      console.error('[v0] Sync error:', error)
      toast({
        title: 'Sync failed',
        description: 'Failed to start data sync. Please try again.',
        variant: 'destructive'
      })
      setSyncing(null)
    }
  }

  function getStatusBadge(status: Integration['status']) {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'expired':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs Reconnection
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-500/10 text-red-700 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  function formatLastSync(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const providers: Array<'zoho_desk' | 'zoho_crm'> = ['zoho_desk', 'zoho_crm']

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {providers.map(provider => {
          const integration = integrations.find(i => i.provider === provider)
          const info = PROVIDER_INFO[provider]
          const isConnected = integration?.status === 'active'
          const isConnecting = connecting === provider
          const isSyncing = syncing === provider
          
          return (
            <Card 
              key={provider} 
              className={`relative overflow-hidden transition-all ${
                isConnected ? 'ring-2 ring-green-500/20' : ''
              }`}
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${info.color}`} />
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${info.bgColor} ${info.borderColor} border flex items-center justify-center`}>
                      <span className="text-2xl font-bold">
                        {provider === 'zoho_desk' ? 'ZD' : 'ZC'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{info.name}</h3>
                      {integration && getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  {info.description}
                </p>

                {/* Connected State */}
                {integration && isConnected ? (
                  <div className="space-y-4">
                    {/* Account Info */}
                    <div className={`rounded-lg p-4 ${info.bgColor} ${info.borderColor} border`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Connected Account</span>
                      </div>
                      {integration.config?.account_email && (
                        <p className="text-sm text-muted-foreground">
                          {integration.config.account_email}
                        </p>
                      )}
                      {integration.config?.org_name && (
                        <p className="text-sm text-muted-foreground">
                          {integration.config.org_name}
                        </p>
                      )}
                    </div>

                    {/* Sync Status */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last synced: {integration.last_sync_at 
                            ? formatLastSync(integration.last_sync_at) 
                            : 'Never'}
                        </span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {integration.last_error && (
                      <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-700">{integration.last_error}</p>
                      </div>
                    )}

                    {/* Available Signals */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">AVAILABLE SIGNALS</p>
                      <div className="flex flex-wrap gap-1">
                        {info.signals.map(signal => (
                          <Badge key={signal} variant="secondary" className="text-xs">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncNow(provider)}
                        disabled={isSyncing}
                        className="flex-1"
                      >
                        {isSyncing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Sync Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDisconnectDialog(provider)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Unplug className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : integration && integration.status !== 'active' ? (
                  /* Needs Reconnection State */
                  <div className="space-y-4">
                    <div className="rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">Reconnection Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your connection has expired or encountered an error. Please reconnect to resume data syncing.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => openConnectModal(provider)}
                        disabled={isConnecting}
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reconnect
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDisconnectDialog(provider)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Unplug className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Not Connected State */
                  <div className="space-y-4">
                    {/* Signals Preview */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">SIGNALS YOU CAN GENERATE</p>
                      <div className="flex flex-wrap gap-1">
                        {info.signals.map(signal => (
                          <Badge key={signal} variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => openConnectModal(provider)}
                      disabled={isConnecting}
                      className={`w-full bg-gradient-to-r ${info.color} hover:opacity-90`}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect {info.name}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pre-flight Connection Modal */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${PROVIDER_INFO[selectedProvider].bgColor} ${PROVIDER_INFO[selectedProvider].borderColor} border flex items-center justify-center`}>
                    <span className="text-sm font-bold">
                      {selectedProvider === 'zoho_desk' ? 'ZD' : 'ZC'}
                    </span>
                  </div>
                  Connect to {PROVIDER_INFO[selectedProvider].name}
                </DialogTitle>
                <DialogDescription>
                  You'll be redirected to Zoho to authorize access. Review the permissions below.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Permissions List */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Permissions Requested</span>
                  </div>
                  <div className="space-y-2">
                    {PROVIDER_INFO[selectedProvider].permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Note */}
                <div className="rounded-lg p-3 bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-700">
                    <strong>Secure Connection:</strong> Your credentials are never stored. 
                    We only receive a secure access token from Zoho.
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setConnectModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConnect}
                  className={`bg-gradient-to-r ${PROVIDER_INFO[selectedProvider].color}`}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to Zoho
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {selectedProvider && PROVIDER_INFO[selectedProvider].name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop all data syncing from this integration. Your existing signals and data will be preserved, 
              but no new data will be imported until you reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
