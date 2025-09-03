"use client"

import { z, ZodType } from "zod"
import { useForm, UseFormReturn, DefaultValues, SubmitHandler, FieldValues, Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react" // Optional: loading icon

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { useState } from 'react'
import { FIELD_NAMES, FIELD_TYPE } from '@/constants'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

type AuthResponse = {
    success: boolean;
    error?: string;
    accessGranted?: string;
};


interface Props<T extends FieldValues> {
    schema: ZodType<T>;
    defaultValues: T;
    onSubmit: (data: T) => Promise<AuthResponse>
    type: "SIGNIN" | "SIGNUP";

}

const AdminAuthForm = <T extends FieldValues>({
    type,
    schema,
    defaultValues,
    onSubmit
}: Props<T>) => {
    const isSignedIn = type === "SIGNIN";
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form: UseFormReturn<T> = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<T>,
    });

    const handleSubmit: SubmitHandler<T> = async (data) => {
        setLoading(true);
        const result = await onSubmit(data);
        setLoading(false);

        if (result.success) {
            toast(isSignedIn ? "Successfull Signed in" : "Successfull Signed up");

            if (result.accessGranted === "NOT GRANTED") {
                router.push(`/waiting-for-access`);
            } else {
                router.push("/admin/dashboard");
            }
        } else {
            toast(
                `Error ${isSignedIn ? "Signing in" : "Signing up"}`);
        }
    }

    return (
        <div className='w-[400px]  p-8 flex flex-col items-center gap-8'>

            <div className='flex flex-col gap-2 text-center'>
                <h3 className='font-bold text-xl text-gray-500'>Admin Auth</h3>

                <p className='text-center text-gray-500'>{isSignedIn ? "Sign in to TJR Shop Panel" : "Create a new account an wait to be granted access"} </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 w-full">

                    {Object.keys(defaultValues).map((field) => (
                        <FormField
                            key={field}
                            name={field as Path<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between w-full">
                                        <FormLabel className='capitalize'>{FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}</FormLabel>
                                        {isSignedIn && field.name === "password" && (
                                            <Link href={"/forgot-password"} className="text-blue-500 cursor-pointer">Forgot password?</Link>
                                        )}
                                    </div>

                                    <FormControl>
                                        <Input
                                            required
                                            {...field}
                                            type={FIELD_TYPE[field.name as keyof typeof FIELD_TYPE]}
                                            className='bg-[#edededed]  py-5'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}

                    <Button
                        type="submit"
                        className="w-full font-bold py-5 cursor-pointer "
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                {isSignedIn ? "Signing in..." : "Signing up..."}
                            </div>
                        ) : (
                            isSignedIn ? "Sign in" : "Sign Up"
                        )}
                    </Button>

                </form>
            </Form>


            {isSignedIn ? <div className="flex gap-1 text-gray-600 text-sm">
                <p>You don't have an account?</p>
                <Link
                    href={"/admin/sign-up"}
                    className='text-gray-400 underline'
                >
                    Sign up
                </Link></div> : <div className="flex gap-1 text-gray-600 text-sm">
                <p>Already have an account?</p>
                <Link
                    href={"/admin/sign-in"}
                    className='text-gray-400 underline'
                >
                    Sign in
                </Link></div>
            }

        </div>
    )
}

export default AdminAuthForm