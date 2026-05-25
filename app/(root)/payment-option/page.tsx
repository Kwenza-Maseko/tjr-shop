import React from "react"
import {
    CreditCard,
    ShieldCheck,
    Wallet,
} from "lucide-react"

const Payments = () => {
    return (
            <div className="overflow-hidden mt-8">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <Wallet className="h-6 w-6" />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">
                                Secure Checkout
                            </p>

                            <h2 className="text-lg font-semibold">
                                Payment Options
                            </h2>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
                </div>

                {/* Body */}
                <div className="space-y-5 p-6">
                    {/* PayFast */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="mt-0.5 h-5 w-5 text-emerald-600" />

                            <div>
                                <p className="font-medium text-zinc-900">
                                    Powered by PayFast
                                </p>

                                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                                    We use PayFast for safe and secure online
                                    payments across South Africa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment methods */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                <CreditCard className="h-5 w-5 text-zinc-700" />
                            </div>

                            <h3 className="font-medium text-zinc-900">
                                Card Payments
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                                Pay using Visa, Mastercard, or other supported cards.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                <ShieldCheck className="h-5 w-5 text-zinc-700" />
                            </div>

                            <h3 className="font-medium text-zinc-900">
                                Secure Transactions
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                                All payments are encrypted and securely processed.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="rounded-2xl bg-zinc-900 px-5 py-4 text-sm text-zinc-300">
                        Payments are verified instantly to ensure smooth order processing.
                    </div>
                </div>
            </div>
    )
}

export default Payments