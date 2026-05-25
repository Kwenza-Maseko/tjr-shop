import React from "react"
import {
    RotateCcw,
    CalendarDays,
    CheckCircle2
} from "lucide-react"

const Returns = () => {
    return (
            <div className="overflow-hidden mt-8">
              
                <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                            <RotateCcw className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">
                                Customer Protection
                            </p>

                            <h2 className="text-lg font-semibold">
                                Returns Policy
                            </h2>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                </div>

                {/* Body */}
                <div className="space-y-5 p-6">
                    {/* Return Notice */}
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-blue-600" />

                            <div>
                                <p className="font-medium text-zinc-900">
                                    15-Day Return Window
                                </p>

                                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                                    You may request a return within 15 days of
                                    receiving your order.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

                            <div>
                                <p className="font-medium text-zinc-900">
                                    Product Condition
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Returned items must be unused and in original packaging.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />

                            <div>
                                <p className="font-medium text-zinc-900">
                                    Easy Return Process
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Contact support to initiate your return request.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="rounded-2xl bg-zinc-900 px-5 py-4 text-sm text-zinc-300">
                        Refunds are processed after the returned product has been inspected.
                    </div>
                </div>
            </div>
    )
}

export default Returns