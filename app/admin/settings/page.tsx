"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your Camino platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Demo Mode Management</h2>
          <p className="text-sm text-muted-foreground mb-4">Manage demo profiles and demo data for testing</p>
          <Link href="/profile">
            <Button variant="outline">Manage Demo Profiles</Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Database Management</h2>
          <p className="text-sm text-muted-foreground mb-4">View and manage Supabase database tables</p>
          <Button variant="outline" disabled>
            View Database Console
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Bulk Operations</h2>
          <p className="text-sm text-muted-foreground mb-4">Perform bulk actions on users and signals</p>
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">System Health</h2>
          <p className="text-sm text-muted-foreground mb-4">Monitor system performance and errors</p>
          <Button variant="outline" disabled>
            View Logs
          </Button>
        </Card>
      </div>
    </div>
  )
}
