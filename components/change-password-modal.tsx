"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
  isFirstLogin?: boolean
}

export function ChangePasswordModal({ open, onClose, isFirstLogin = false }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const supabase = createBrowserClient()

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleChangePassword = async () => {
    setError("")
    setSuccess(false)

    // Validation
    if (!isFirstLogin && !currentPassword) {
      setError("Please enter your current password")
      return
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (!isFirstLogin && currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    setIsChanging(true)

    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      // Update profile to mark password as changed
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("profiles")
          .update({
            password_changed_at: new Date().toISOString(),
            must_change_password: false,
          })
          .eq("id", user.id)
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={!isFirstLogin ? onClose : undefined}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isFirstLogin && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isFirstLogin ? "Change Your Password" : "Change Password"}</DialogTitle>
          <DialogDescription>
            {isFirstLogin
              ? "For security reasons, please change your password on first login."
              : "Update your password to keep your account secure."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isFirstLogin && (
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Password requirements:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>At least 8 characters long</li>
              <li>Contains uppercase and lowercase letters</li>
              <li>Contains at least one number</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Password changed successfully!</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          {!isFirstLogin && (
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isChanging}>
              Cancel
            </Button>
          )}
          <Button onClick={handleChangePassword} className="flex-1" disabled={isChanging}>
            {isChanging ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
