'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Plug, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  Shield,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Zap,
  Clock,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FAQPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('integration-guide')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Help & FAQ</h1>
        <p className="text-muted-foreground mt-1">
          Guides and frequently asked questions to help you get the most out of Camino
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setExpandedSection('integration-guide')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Plug className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Integration Guide</h3>
              <p className="text-sm text-muted-foreground">Connect Zoho Desk & CRM</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setExpandedSection('data-upload')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Data Upload</h3>
              <p className="text-sm text-muted-foreground">Import CSV files</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setExpandedSection('signals')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Understanding Signals</h3>
              <p className="text-sm text-muted-foreground">KPIs and metrics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Guide Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Plug className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Zoho Integration Guide</h2>
          </div>
          <p className="mt-2 text-blue-100">
            Step-by-step guide to connect your Zoho Desk and CRM accounts
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Overview</h3>
            <p className="text-muted-foreground mb-4">
              Connecting your Zoho accounts allows Camino to automatically import your support tickets, 
              deals, and customer data to generate powerful business signals. The connection uses OAuth 2.0, 
              meaning your Zoho credentials are never stored - only a secure access token.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">Automatic data syncing (hourly)</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">Secure OAuth 2.0 connection</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">Read-only access to your data</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">Disconnect anytime with one click</span>
              </div>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Step-by-Step Connection Guide</h3>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-medium mb-2">Navigate to Integrations</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Go to the Integrations page in the admin panel. You'll see cards for Zoho Desk and Zoho CRM.
                  </p>
                  <Link href="/admin/integrations">
                    <Button variant="outline" size="sm">
                      Go to Integrations
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-medium mb-2">Click "Connect"</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click the "Connect Zoho Desk" or "Connect Zoho CRM" button. A modal will appear showing 
                    the permissions Camino is requesting.
                  </p>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Permissions requested:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Read tickets/deals (view only)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Read contacts and accounts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Access analytics reports
                      </li>
                    </ul>
                  </Card>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-medium mb-2">Authorize on Zoho</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    You'll be redirected to Zoho's website. If you're not logged in, enter your Zoho credentials. 
                    Then review the permissions and click "Accept" to authorize Camino.
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-700">
                      Your Zoho password is never shared with Camino. Authorization uses secure OAuth 2.0.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    4
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-medium mb-2">Return to Camino</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    After clicking "Accept", you'll be automatically redirected back to Camino. 
                    You'll see a success message confirming the connection.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <span className="text-sm text-muted-foreground">status will appear on the card</span>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                    5
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Sync Begins</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Camino will immediately begin syncing your data. The first sync may take a few minutes 
                    depending on your data volume. After that, data syncs automatically every hour.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Auto-syncs every hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      <span>Manual sync available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Signals */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Signals Generated</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold">ZD</span>
                  </div>
                  <h4 className="font-medium">Zoho Desk Signals</h4>
                </div>
                <ul className="space-y-2">
                  {['Average Resolution Time', 'Ticket Volume', 'Customer Satisfaction (CSAT)', 'Bug Impact Score', 'First Response Time'].map((signal) => (
                    <li key={signal} className="flex items-center gap-2 text-sm">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold">ZC</span>
                  </div>
                  <h4 className="font-medium">Zoho CRM Signals</h4>
                </div>
                <ul className="space-y-2">
                  {['Sales Pipeline Value', 'Conversion Rate', 'Retention Score', 'Activation Score', 'Deal Velocity'].map((signal) => (
                    <li key={signal} className="flex items-center gap-2 text-sm">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Troubleshooting</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="denied">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    I accidentally denied access
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    No problem! Simply click the "Connect" button again and you'll be redirected to Zoho 
                    to authorize. This time, click "Accept" to complete the connection.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="expired">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    My connection shows "Needs Reconnection"
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Zoho access tokens expire periodically for security. Click the "Reconnect" button 
                    and authorize again. Your existing data and signals will be preserved.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="wrong-account">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    I connected the wrong Zoho account
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Click the disconnect button (unplug icon) on the integration card, then connect again. 
                    Make sure you're logged into the correct Zoho account before authorizing.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="no-data">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Connected but no data appearing
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-2">
                    The first sync can take a few minutes. If data still doesn't appear after 15 minutes:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Try clicking "Sync Now" on the integration card</li>
                    <li>Check that your Zoho account has data in the last 90 days</li>
                    <li>Ensure you have the correct Zoho permissions in your account</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Card>

      {/* Other FAQ Sections */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-signal">
            <AccordionTrigger>What is a Signal?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                A Signal is a key business metric or KPI that Camino tracks over time. Signals are generated 
                from your connected data sources (like Zoho) or uploaded CSV files. Examples include 
                "Sales Pipeline Value", "Average Resolution Time", and "Customer Satisfaction Score".
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="data-security">
            <AccordionTrigger>How is my data secured?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use OAuth 2.0 for 
                integrations, meaning we never see or store your Zoho password. Access tokens are encrypted 
                and refreshed automatically. You can disconnect any integration at any time.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="csv-upload">
            <AccordionTrigger>Can I upload data manually instead of connecting?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground mb-2">
                Yes! You can upload CSV files directly from the Data page. This is useful for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Historical data that predates your Zoho account</li>
                <li>Data from other systems not yet supported</li>
                <li>One-time imports or testing</li>
              </ul>
              <Link href="/admin/data" className="inline-block mt-3">
                <Button variant="outline" size="sm">
                  Go to Data Upload
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sync-frequency">
            <AccordionTrigger>How often does data sync?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Connected integrations sync automatically every hour. You can also trigger a manual sync 
                at any time by clicking "Sync Now" on the integration card. The last sync time is displayed 
                on each integration.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="multiple-orgs">
            <AccordionTrigger>Can I connect multiple Zoho organizations?</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">
                Currently, each Camino organization can connect one Zoho Desk and one Zoho CRM account. 
                If you need to track multiple Zoho organizations, contact support for enterprise options.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Contact Support */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
