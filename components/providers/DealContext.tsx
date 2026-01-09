"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getDealsWithTimeSpan } from "@/lib/store/deals";

export type DealsContextType = {
    dealTimeSpan: any | null;
    expired: boolean;
    deals: any[];
    loading: boolean;
};

export const DealsContext = createContext<DealsContextType>({
    dealTimeSpan: null,
    expired: false,
    deals: [],
    loading: true,
});

export const DealsProvider = ({ children }: { children: React.ReactNode }) => {
    const [dealTimeSpan, setDealTimeSpan] = useState<any | null>(null);
    const [expired, setExpired] = useState(false);
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getDealsWithTimeSpan();

            if (res.success) {
                // TS SAFE
                const data = res.data ?? [];

                setDeals(data);

                // extract all future timespans
                const allTimes = data
                    .flatMap((d: any) =>
                        Array.isArray(d.timeSpans)
                            ? d.timeSpans.map((t: any) => ({
                                  dealId: d.id,
                                  ...t,
                              }))
                            : []
                    )
                    .filter((t: any) => new Date(t.timeSpan).getTime() > Date.now())
                    .sort(
                        (a, b) =>
                            new Date(a.timeSpan).getTime() - new Date(b.timeSpan).getTime()
                    );

                if (allTimes.length > 0) {
                    setDealTimeSpan(allTimes[0]);
                }
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    // countdown watcher
    useEffect(() => {
        if (!dealTimeSpan?.timeSpan) return;

        const target = new Date(dealTimeSpan.timeSpan).getTime();

        const interval = setInterval(() => {
            if (target - Date.now() <= 0) {
                setExpired(true);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dealTimeSpan]);

    return (
        <DealsContext.Provider value={{ dealTimeSpan, expired, deals, loading }}>
            {children}
        </DealsContext.Provider>
    );
};

export const useDeals = () => useContext(DealsContext);
