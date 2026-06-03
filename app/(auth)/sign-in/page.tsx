'use client'
import { Suspense } from "react"
import AuthForm from '@/components/Authform'
import { signInWithCredentials } from '@/lib/auth/auth'
import { signInSchema } from '@/lib/validation'

function SignInContent() {
  return (
    <div>
      <AuthForm
        type="SIGNIN"
        schema={signInSchema}
        defaultValues={{
          email: "",
          password: ""
        }}
        onSubmit={signInWithCredentials}
      />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}