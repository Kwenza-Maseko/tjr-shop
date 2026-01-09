'use client';

import { useDeals } from './providers/DealContext';
import { useEffect, useState } from 'react';

const DisplayDeals = () => {
    const { deals, loading } = useDeals();

    // Store countdown for each dealId
    const [timers, setTimers] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];

        deals.forEach((deal: any) => {
            const nextTime = deal.timeSpans?.find((t: any) => {
                return new Date(t.timeSpan).getTime() > Date.now();
            });

            if (!nextTime) return; // no countdown for this deal

            const target = new Date(nextTime.timeSpan).getTime();

            const update = () => {
                const now = Date.now();
                const diff = target - now;

                if (diff <= 0) return;

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                setTimers((prev) => ({
                    ...prev,
                    [deal.id]: { days, hours, minutes, seconds }
                }));
            };

            update();
            const interval = setInterval(update, 1000);
            intervals.push(interval);
        });

        return () => intervals.forEach(clearInterval);
    }, [deals]);

    if (loading) {
        return (
            <div className="text-center text-gray-400 py-10">
                Loading deals...
            </div>
        );
    }

    return (
        <div className="w-full mx-auto py-12 pt-8 px-4">
            <h1 className="text-2xl md:text-3xl font-medium text-center mb-10">
                🔥 Today’s Exclusive Hot Deals
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {deals.length > 0 ? (
                    deals.map((deal) => {
                        const countdown = timers[deal.id];
                        const hasTime = !!countdown;

                        return (
                            <div
                                key={deal.id}
                                className="group relative bg-gradient-to-br from-[#1b1b2f] to-[#2d1b3d]
                                           p-6 rounded-3xl border border-white/10 shadow-xl"
                            >
                                {/* Percentage badge */}
                                <div className="absolute top-6 right-6 z-10">
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white 
                                    px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                                        {deal.percentage}% OFF
                                    </span>
                                </div>

                                {/* Deal Title */}
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {deal.dealCoupon}
                                </h2>

                                {/* Countdown */}
                                {hasTime ? (
                                    <div className="flex justify-center font-semibold p-1 px-6 rounded-md w-full bg-white/40 mt-4">
                                        <div className="flex gap-2 text-lg">
                                            <div className="flex flex-col items-center">
                                                <span className="text-zinc-100 font-bold">{countdown.days}</span>
                                                <span className="text-xs text-white">Days</span>
                                            </div>
                                            <span className="text-zinc-100">:</span>

                                            <div className="flex flex-col items-center">
                                                <span className="text-zinc-100 font-bold">
                                                    {countdown.hours.toString().padStart(2, "0")}
                                                </span>
                                                <span className="text-xs text-white">Hours</span>
                                            </div>
                                            <span className="text-zinc-100">:</span>

                                            <div className="flex flex-col items-center">
                                                <span className="text-zinc-100 font-bold">
                                                    {countdown.minutes.toString().padStart(2, "0")}
                                                </span>
                                                <span className="text-xs text-white">Min</span>
                                            </div>
                                            <span className="text-zinc-100">:</span>

                                            <div className="flex flex-col items-center">
                                                <span className="text-zinc-100 font-bold">
                                                    {countdown.seconds.toString().padStart(2, "0")}
                                                </span>
                                                <span className="text-xs text-white">Sec</span>
                                            </div>
                                        </div>
                                    </div>

                                ) : (
                                    <div className="flex justify-center font-semibold p-1 px-6 rounded-md w-full bg-white/40 mt-4 py-4">
                                        ⏳ <span className="font-semibold text-zinc-100">
                                            This deal has no time span
                                        </span>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <div className="mt-6">
                                    <button className="
                                        w-full py-2 rounded-xl text-center text-sm font-semibold
                                        bg-white/20 text-white border border-white/30
                                        group-hover:bg-white/30 transition-all duration-300
                                    ">
                                        Grab Deal 🔥
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-400 col-span-full">No deals available</p>
                )}
            </div>
        </div>
    );
};

export default DisplayDeals;
