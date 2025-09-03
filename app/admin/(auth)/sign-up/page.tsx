'use client'
import AdminAuthForm from '@/components/AdminAuthForm'
import { adminSignUp } from '@/lib/adminAuth/adminAuth'
import { signUpSchema } from '@/lib/validation'
import React from 'react'

const SignUpAdmin = () => {
  return (
    <div>
      <AdminAuthForm
        type="SIGNUP"
        schema={signUpSchema}
        defaultValues={{
          fullName: "",
          email: "",
          password: "",
        }}
        onSubmit={adminSignUp}
      />
    </div>
  )
}

export default SignUpAdmin