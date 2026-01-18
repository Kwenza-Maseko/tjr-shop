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
        <div className="w-full mx-auto py-12 pt-8 px-6 md:px-8">
            <h1 className="text-lg font-bold mb-6">Exclusive Hot Deals</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {deals.length > 0 ? (
                    deals.map((deal) => {
                        const countdown = timers[deal.id];
                        const hasTime = !!countdown;

                        return (
                            <div
                                key={deal.id}
                                className="group p-6 rounded-xl bg-purple-50"
                            >
                                <h2 className="text-md font-bold mb-2">
                                    {deal.dealCoupon}
                                </h2>
                                {/* Percentage badge */}
                                <div className="text-gray-600">
                                    Up to {" "}
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white 
                                    px-2 py-1 rounded-md text-xs font-bold shadow-lg animate-pulse">
                                        {deal.percentage}% 
                                    </span>
                                    {" "} off
                                </div>

                                {/* Deal Title */}

                                {/* Countdown */}
                                {hasTime && (
                                    <div className="flex text-gray-600 rounded-md w-full mt-8 gap-2">
                                        Ends in :
                                        <div className="flex gap-2">
                                            <div className="flex bg-black rounded p-0.5 px-2">
                                                <span className="text-zinc-100 font-semibold">{countdown.days} DD</span>
                                            </div>
                                            <span className="text-gray-600">:</span>

                                            <div className="flex bg-black rounded p-0.5 px-2">
                                                <span className="text-zinc-100 font-semibold">
                                                    {countdown.hours.toString().padStart(2, "0")} HH
                                                </span>
                                            </div>
                                            <span className="text-gray-600">:</span>

                                            <div className="flex bg-black rounded p-0.5 px-2">
                                                <span className="text-zinc-100 font-semibold">
                                                    {countdown.minutes.toString().padStart(2, "0")} MIN
                                                </span>
                                            </div>
                                            <span className="text-gray-600">:</span>

                                            <div className="flex bg-black rounded p-0.5 px-2">
                                                <span className="text-zinc-100 font-semibold">
                                                    {countdown.seconds.toString().padStart(2, "0")} SEC
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-start text-gray-400 col-span-full">No exlusive deals available</p>
                )}
            </div>
        </div>
    );
};

export default DisplayDeals;
