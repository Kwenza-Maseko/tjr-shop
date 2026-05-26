import { Suspense } from "react"
import ResetPassword from "@/components/ResetPassword"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full md:w-[400px] p-8 text-center text-sm text-zinc-400">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  )
}