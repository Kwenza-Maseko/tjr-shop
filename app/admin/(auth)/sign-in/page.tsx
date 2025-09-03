'use client'
import AdminAuthForm from '@/components/AdminAuthForm'
import { adminSignInWithCredentials } from '@/lib/adminAuth/adminAuth'
import { signInSchema } from '@/lib/validation'
import React from 'react'

const SignInAdmin = () => {
    return (
        <div>
            <AdminAuthForm
                type="SIGNIN"
                schema={signInSchema}
                defaultValues={{
                    email: "",
                    password: ""
                }}
                onSubmit={adminSignInWithCredentials}
            />
        </div>
    )
}

export default SignInAdmin