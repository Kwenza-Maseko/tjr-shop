import React from "react"
import { Truck, MapPin, Clock3, ShieldCheck } from "lucide-react"

const Shipping = () => {
    return (
        <div className="w-full overflow-hidden mt-8">
            <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                        <Truck className="h-6 w-6" />
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">
                            Delivery
                        </p>

                        <h2 className="text-lg font-semibold tracking-wide">
                            PEXI Delivery
                        </h2>
                    </div>
                </div>

                {/* Glow */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="space-y-5 p-6">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-amber-600" />

                        <div>
                            <p className="font-medium text-zinc-900">
                                Delivery fee depends on your location
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                                Final shipping costs are calculated after
                                confirming your delivery address with PEXI.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Clock3 className="h-5 w-5 text-zinc-700" />
                        </div>

                        <h3 className="font-medium text-zinc-900">
                            Fast Dispatch
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Orders are processed quickly for same-day or next-day dispatch.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <Truck className="h-5 w-5 text-zinc-700" />
                        </div>

                        <h3 className="font-medium text-zinc-900">
                            Reliable Delivery
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Safe and trusted delivery service powered by PEXI logistics.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                            <ShieldCheck className="h-5 w-5 text-zinc-700" />
                        </div>

                        <h3 className="font-medium text-zinc-900">
                            Secure Handling
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                            Your order is packaged and handled carefully during transit.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-zinc-900 px-5 py-4 text-sm text-zinc-300 md:flex-row md:items-center md:justify-between">
                    <p>
                        Delivery availability may vary depending on your area.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Shipping