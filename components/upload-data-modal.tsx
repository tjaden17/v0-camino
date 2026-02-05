"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Upload, FileText } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  description: string
  uploadDate: string
}

interface UploadDataModalProps {
  onUpload: (file: UploadedFile) => void
  onClose: () => void
}

export function UploadDataModal({ onUpload, onClose }: UploadDataModalProps) {
  const [fileName, setFileName] = useState("")
  const [description, setDescription] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    setFileName(file.name)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = () => {
    if (fileName && description) {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: fileName,
        description,
        uploadDate: new Date().toISOString().split("T")[0],
      }
      onUpload(newFile)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Upload Data File</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>

          {/* File Name */}
          {fileName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected: {fileName}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>File Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this data contains and how it should be used..."
              className="min-h-20 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!fileName || !description} className="flex-1">
              Upload File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
