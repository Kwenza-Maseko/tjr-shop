'use client'
import AuthForm from '@/components/Authform'
import { signUp } from '@/lib/auth/auth'
import { signUpSchema } from '@/lib/validation'
import { Suspense } from 'react'


const SignUpContent = () => {
  return ( 
    <div>
        <AuthForm
        type="SIGNUP"
        schema={signUpSchema}
        defaultValues={{
          fullName: "",
          email: "",
          password: "",
        }}
        onSubmit={signUp}
      />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}