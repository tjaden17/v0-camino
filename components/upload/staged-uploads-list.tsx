"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileSpreadsheet, MoreHorizontal, Trash2, Eye, Database } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface StagedUpload {
  id: string
  fileName: string
  sourceType: string | null
  rowCount: number
  columnCount: number
  status: "staged" | "processing" | "processed" | "failed"
  uploadedAt: string | Date
}

interface StagedUploadsListProps {
  uploads: StagedUpload[]
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

export function StagedUploadsList({ uploads, onDelete, onView }: StagedUploadsListProps) {
  const getSourceTypeLabel = (sourceType: string | null): string => {
    const labels: Record<string, string> = {
      zoho_crm: "Zoho CRM",
      zoho_desk: "Zoho Desk",
      hubspot: "HubSpot",
      salesforce: "Salesforce",
      stripe: "Stripe",
      intercom: "Intercom",
      zendesk: "Zendesk",
      google_analytics: "Google Analytics",
      accounting: "Accounting",
      hr_system: "HR System",
      csv_export: "CSV Export",
    }
    return labels[sourceType || ""] || sourceType || "Unknown"
  }

  const getSourceTypeBadgeColor = (sourceType: string | null): string => {
    const colors: Record<string, string> = {
      zoho_crm: "bg-red-500/10 text-red-600 border-red-500/20",
      zoho_desk: "bg-red-500/10 text-red-600 border-red-500/20",
      hubspot: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      salesforce: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      stripe: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      intercom: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      zendesk: "bg-green-500/10 text-green-600 border-green-500/20",
      google_analytics: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      accounting: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      hr_system: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    }
    return colors[sourceType || ""] || "bg-muted text-muted-foreground"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "staged":
        return <Badge variant="outline">Staged</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      case "processed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Processed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No uploads staged yet</p>
          <p className="text-sm text-muted-foreground">Upload files to start discovering signals</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Staged Data Sources
        </CardTitle>
        <CardDescription>
          {uploads.length} file{uploads.length !== 1 ? "s" : ""} ready for signal discovery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Rows</TableHead>
              <TableHead className="text-right">Columns</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[200px]">
                      {upload.fileName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getSourceTypeBadgeColor(upload.sourceType)}>
                    {getSourceTypeLabel(upload.sourceType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {upload.rowCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {upload.columnCount}
                </TableCell>
                <TableCell>
                  {getStatusBadge(upload.status)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(upload.uploadedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(upload.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(upload.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
