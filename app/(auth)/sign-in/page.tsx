'use client'
import AuthForm from '@/components/Authform'
import { signInWithCredentials } from '@/lib/auth/auth'
import { signInSchema } from '@/lib/validation'
import React from 'react'

const SignIn = () => {
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

export default SignIn