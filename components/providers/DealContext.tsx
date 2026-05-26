"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getDealsWithTimeSpan } from "@/lib/store/deals";

interface TimeSpan {
    id: string
    timeSpan: string | Date | null
}

interface DealProduct {
    id: string
    productName: string | null
    imageUrl: string | null
    price: string | null
    discountPrice: string | null
    rating: string | null
    reviewCount: number | null
}

interface Deal {
    id: string
    dealCoupon: string
    percentage: number
    timeSpans: TimeSpan[]
    products: DealProduct[]
}

interface ActiveTimeSpan extends TimeSpan {
    dealId: string
}

export type DealsContextType = {
    dealTimeSpan: ActiveTimeSpan | null
    expired: boolean
    deals: Deal[]
    loading: boolean
}

export const DealsContext = createContext<DealsContextType>({
    dealTimeSpan: null,
    expired: false,
    deals: [],
    loading: true,
});

export const DealsProvider = ({ children }: { children: React.ReactNode }) => {
    const [dealTimeSpan, setDealTimeSpan] = useState<ActiveTimeSpan | null>(null);
    const [expired, setExpired] = useState(false);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getDealsWithTimeSpan();

            if (res.success) {
                const data = (res.data ?? []) as Deal[];

                setDeals(data);

                const allTimes = data
                    .flatMap((d: Deal) =>
                        Array.isArray(d.timeSpans)
                            ? d.timeSpans.map((t: TimeSpan) => ({
                                  dealId: d.id,
                                  ...t,
                              }))
                            : []
                    )
                    .filter((t: ActiveTimeSpan) =>
                        t.timeSpan !== null &&
                        new Date(t.timeSpan).getTime() > Date.now()
                    )
                    .sort(
                        (a: ActiveTimeSpan, b: ActiveTimeSpan) =>
                            new Date(a.timeSpan!).getTime() - new Date(b.timeSpan!).getTime()
                    );

                if (allTimes.length > 0) {
                    setDealTimeSpan(allTimes[0]);
                }
            }

            setLoading(false);
        };

        fetchData();
    }, []);

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