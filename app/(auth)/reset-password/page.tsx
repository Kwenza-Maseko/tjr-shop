"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const ResetPassword = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!token || !email) {
      toast.error("Invalid or expired reset link")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Password reset successfully")
        router.push("/sign-in")
      } else {
        toast.error(data.error || "Failed to reset password")
      }
    } catch (err) {
      toast.error(`Network error. Please try again.", ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full md:w-[400px] p-8">
      <h2 className="text-xl font-semibold mb-5 text-center">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div>
          <Label htmlFor="password"
          className="mb-2">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="bg-[#edededed] py-5"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword"
          className="mb-2">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="bg-[#edededed] py-5"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  )
}

export default ResetPassword
