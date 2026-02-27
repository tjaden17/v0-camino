"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAllSignals, deleteSignal } from "@/lib/admin-service"
import { Search, Trash2, AlertTriangle, Activity, Filter, RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

export default function AdminSignalsPage() {
  const [signals, setSignals] = useState<any[]>([])
  const [filteredSignals, setFilteredSignals] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState<any>(null)
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    const getCurrentUserOrg = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const masterAdmin = user.email === "admin@admin.com"
      setIsMasterAdmin(masterAdmin)

      if (!masterAdmin) {
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()

        setCurrentOrgId(profile?.organization_id || null)
      }
    }

    getCurrentUserOrg()
  }, [supabase])

  useEffect(() => {
    if (currentOrgId !== null || isMasterAdmin) {
      loadSignals()
    }
  }, [currentOrgId, isMasterAdmin])

  const loadSignals = async () => {
    try {
      const data = await getAllSignals(currentOrgId, isMasterAdmin)
      setSignals(data)
      setFilteredSignals(data)
    } catch (error) {
      console.error("Error loading signals:", error)
      toast({
        title: "Error",
        description: "Failed to load signals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(signals.map((s) => s.category).filter(Boolean))).sort() as string[]

  useEffect(() => {
    const filtered = signals.filter((signal) => {
      const matchesSearch =
        !searchQuery ||
        signal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.owner_email?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || signal.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    setFilteredSignals(filtered)
  }, [searchQuery, categoryFilter, signals])

  async function handleDeleteSignal() {
    if (!selectedSignal) return

    try {
      await deleteSignal(selectedSignal.id, currentOrgId, isMasterAdmin)

      toast({
        title: "Success",
        description: "Signal and all associated data points deleted successfully",
      })

      setDeleteDialogOpen(false)
      setSelectedSignal(null)
      loadSignals()
    } catch (error) {
      console.error("Error deleting signal:", error)
      toast({
        title: "Error",
        description: "Failed to delete signal",
        variant: "destructive",
      })
    }
  }

  async function handleBulkDelete() {
    try {
      await Promise.all(Array.from(selectedSignals).map((id) => deleteSignal(id, currentOrgId, isMasterAdmin)))

      toast({
        title: "Success",
        description: `${selectedSignals.size} signal(s) deleted successfully`,
      })

      setBulkDeleteDialogOpen(false)
      setSelectedSignals(new Set())
      loadSignals()
    } catch (error) {
      console.error("Error deleting signals:", error)
      toast({
        title: "Error",
        description: "Failed to delete some signals",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteAll() {
    try {
      await Promise.all(signals.map((signal) => deleteSignal(signal.id, currentOrgId, isMasterAdmin)))

      toast({
        title: "Success",
        description: `All ${signals.length} signal(s) deleted successfully`,
      })

      setDeleteAllDialogOpen(false)
      loadSignals()
    } catch (error) {
      console.error("Error deleting all signals:", error)
      toast({
        title: "Error",
        description: "Failed to delete some signals",
        variant: "destructive",
      })
    }
  }

  function toggleSignalSelection(signalId: string) {
    const newSelected = new Set(selectedSignals)
    if (newSelected.has(signalId)) {
      newSelected.delete(signalId)
    } else {
      newSelected.add(signalId)
    }
    setSelectedSignals(newSelected)
  }

  function toggleSelectAll() {
    if (selectedSignals.size === filteredSignals.length && filteredSignals.length > 0) {
      setSelectedSignals(new Set())
    } else {
      setSelectedSignals(new Set(filteredSignals.map((s) => s.id)))
    }
  }

  async function handleRecalculate() {
    if (!currentOrgId) {
      toast({ title: "No organization", description: "Select an organization to recalculate signals.", variant: "destructive" })
      return
    }
    setRecalculating(true)
    try {
      const res = await fetch("/api/upload/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: currentOrgId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ title: "Recalculate failed", description: data?.error ?? "Could not recalculate", variant: "destructive" })
        return
      }
      toast({
        title: "Signals recalculated",
        description: data.signalsUpdated != null ? `${data.signalsUpdated} signal(s) updated` : data.message ?? "Recalculated from latest uploads.",
      })
      loadSignals()
    } catch (e) {
      toast({ title: "Recalculate failed", description: e instanceof Error ? e.message : "Please try again", variant: "destructive" })
    } finally {
      setRecalculating(false)
    }
  }

  const totalDataPoints = signals.reduce((sum, signal) => sum + (signal.data_points_count || 0), 0)

  if (loading || (currentOrgId === null && !isMasterAdmin)) {
    return <div className="text-center py-12">Loading signals...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Signal Management</h1>
          <p className="text-muted-foreground mt-1">
            {isMasterAdmin
              ? "View and manage all signals across all organizations"
              : "View and manage signals for your organization"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={!currentOrgId || recalculating}
            className="gap-2"
            title={!currentOrgId ? "Select an organization to recalculate" : "Re-run calculations from latest uploads (e.g. after formula changes)"}
          >
            <RefreshCw className={`h-4 w-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Recalculating…" : "Recalculate"}
          </Button>
          {selectedSignals.size > 0 ? (
            <Button variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete {selectedSignals.size} Signal{selectedSignals.size > 1 ? "s" : ""}
            </Button>
          ) : (
            signals.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setDeleteAllDialogOpen(true)}
                className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete All Signals
              </Button>
            )
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Signals</p>
              <p className="text-2xl font-bold">{signals.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Data Points</p>
              <p className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and category filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Signals Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedSignals.size === filteredSignals.length && filteredSignals.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-sm">Signal Name</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-left p-4 font-medium text-sm">Owner</th>
                <th className="text-left p-4 font-medium text-sm">Data Points</th>
                <th className="text-left p-4 font-medium text-sm">Latest Value</th>
                <th className="text-left p-4 font-medium text-sm">Last Updated</th>
                <th className="text-left p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "No signals found matching your search." : "No signals created yet."}
                  </td>
                </tr>
              ) : (
                filteredSignals.map((signal) => (
                  <tr
                    key={signal.id}
                    className={`border-b border-border hover:bg-muted/30 ${selectedSignals.has(signal.id) ? "bg-accent/50" : ""}`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={selectedSignals.has(signal.id)}
                        onCheckedChange={() => toggleSignalSelection(signal.id)}
                      />
                    </td>
                    <td className="p-4 text-sm font-medium">{signal.name}</td>
                    <td className="p-4 text-sm">{signal.category}</td>
                    <td className="p-4 text-sm">{signal.owner_email}</td>
                    <td className="p-4 text-sm">{signal.data_points_count}</td>
                    <td className="p-4 text-sm">
                      {signal.latest_value !== null ? signal.latest_value.toFixed(2) : "-"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {signal.latest_date ? new Date(signal.latest_date).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedSignal(signal)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Single Signal Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Signal
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Are you sure you want to delete this signal?</p>
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <p className="font-medium">{selectedSignal?.name}</p>
                <p className="text-muted-foreground">Category: {selectedSignal?.category}</p>
                <p className="text-muted-foreground">Owner: {selectedSignal?.owner_email}</p>
                <p className="text-muted-foreground">Data Points: {selectedSignal?.data_points_count}</p>
              </div>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">This action cannot be undone.</span>
                  <br />
                  All {selectedSignal?.data_points_count || 0} data points associated with this signal will be
                  permanently deleted.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSignal} className="bg-destructive hover:bg-destructive/90">
              Delete Signal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Multiple Signals Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Multiple Signals
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Are you sure you want to delete {selectedSignals.size} signal{selectedSignals.size > 1 ? "s" : ""}?
              </p>
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">This action cannot be undone.</span>
                  <br />
                  All data points associated with these signals will be permanently deleted.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSignals(new Set())}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
              Delete {selectedSignals.size} Signal{selectedSignals.size > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Signals Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Signals
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="text-base font-medium">
                Are you sure you want to delete ALL {signals.length} signal{signals.length > 1 ? "s" : ""}{" "}
                {isMasterAdmin ? "in the system" : "in your organization"}?
              </div>
              <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                <div className="font-medium">This will permanently delete:</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    {signals.length} signal{signals.length > 1 ? "s" : ""}
                  </li>
                  <li>{totalDataPoints.toLocaleString()} data points</li>
                  <li>All associated signal configurations and relationships</li>
                </ul>
              </div>
              <div className="flex items-start gap-2 p-4 bg-destructive/10 rounded-md border-2 border-destructive/30">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-2">
                  <div className="font-bold text-destructive">WARNING: THIS ACTION CANNOT BE UNDONE</div>
                  <div>
                    {isMasterAdmin
                      ? "This will delete all signals and data points across ALL organizations and users. Only proceed if you are absolutely certain you want to clear all signal data from the system."
                      : "This will delete all signals and data points in your organization. This action is permanent and cannot be reversed."}
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive hover:bg-destructive/90">
              Yes, Delete All {signals.length} Signals
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
