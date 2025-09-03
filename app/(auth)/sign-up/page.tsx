'use client'
import AuthForm from '@/components/Authform'
import { signUp } from '@/lib/auth/auth'
import { signUpSchema } from '@/lib/validation'
import React from 'react'


const SignUp = () => {
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

export default SignUp