'use client';

import { useDeals } from './providers/DealContext';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import config from "@/lib/config"
import { IKImage, ImageKitProvider } from 'imagekitio-next';
import type { Deal, DealProduct, TimeSpan, Countdown } from '@/types';

const { urlEndpoint, publicKey } = config.env.imagekit

const COLORS = [
    { accent: '#E24B4A', badge: '#FCEBEB', badgeText: '#A32D2D' },
    { accent: '#1D9E75', badge: '#E1F5EE', badgeText: '#0F6E56' },
    { accent: '#378ADD', badge: '#E6F1FB', badgeText: '#185FA5' },
    { accent: '#D85A30', badge: '#FAECE7', badgeText: '#993C1D' },
    { accent: '#D4537E', badge: '#FBEAF0', badgeText: '#993556' },
];

const pad = (n: number) => String(n).padStart(2, '0');

type DealColor = typeof COLORS[0]

const CARD_WIDTH = 160;
const CARD_GAP = 12;
const VISIBLE = 3;

const DealSlider = ({
    deal,
    color,
    countdown,
}: {
    deal: Deal
    color: DealColor
    countdown?: Countdown
}) => {
    const [offset, setOffset] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const products = deal.products ?? [];
    const maxOffset = Math.max(0, products.length - VISIBLE);

    const slide = (dir: number) => {
        setOffset(prev => Math.max(0, Math.min(prev + dir, maxOffset)));
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) slide(dx < 0 ? 1 : -1);
    };

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <span
                        className="text-[11px] font-medium px-3 py-1 rounded-full"
                        style={{ background: color.badge, color: color.badgeText }}
                    >
                        {deal.percentage}% off
                    </span>

                    {countdown && (
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 mr-1">Ends in</span>
                            {(
                                [
                                    { val: countdown.days, lbl: 'd' },
                                    { val: countdown.hours, lbl: 'h' },
                                    { val: countdown.minutes, lbl: 'm' },
                                    { val: countdown.seconds, lbl: 's' },
                                ] as const
                            ).map(({ val, lbl }, idx) => (
                                <div key={lbl} className="flex items-center gap-1">
                                    <div className="flex items-baseline gap-0.5 bg-zinc-100 rounded px-1.5 py-0.5">
                                        <span className="text-xs font-medium tabular-nums text-zinc-900">{pad(val)}</span>
                                        <span className="text-[9px] text-zinc-400">{lbl}</span>
                                    </div>
                                    {idx < 3 && <span className="text-zinc-300 text-xs">:</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-1.5">
                    <button
                        onClick={() => slide(-1)}
                        disabled={offset === 0}
                        aria-label="Previous"
                        className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => slide(1)}
                        disabled={offset >= maxOffset}
                        aria-label="Next"
                        className="w-7 h-7 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-default transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div
                className="overflow-hidden px-4 md:px-0"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
                    <div
                        ref={trackRef}
                        className="flex gap-3 transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${offset * (CARD_WIDTH + CARD_GAP)}px)` }}
                    >
                        {products.map((product: DealProduct) => {
                            if (!product.price) return null;
                            const original = parseFloat(product.price);
                            const dealP = original - (original * deal.percentage / 100);

                            return (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="flex-none w-40 border border-zinc-100 rounded-xl bg-white overflow-hidden"
                                >
                                    <div className="relative h-40 bg-zinc-50 overflow-hidden">
                                        {product.imageUrl && (
                                            <IKImage
                                                path={product.imageUrl}
                                                alt={product.productName ?? product.id}
                                                fill
                                                className="object-cover transition-transform duration-300"
                                            />
                                        )}
                                        <div
                                            className="absolute top-2 left-2 text-[10px] font-medium text-white px-1.5 py-0.5 rounded-full"
                                            style={{ background: color.accent }}
                                        >
                                            -{deal.percentage}%
                                        </div>
                                    </div>

                                    <div className="p-2.5">
                                        <p className="text-xs font-medium text-zinc-800 leading-snug line-clamp-2 mb-1.5">
                                            {product.productName}
                                        </p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-zinc-900">R{dealP.toFixed(2)}</span>
                                            <span className="text-[11px] text-zinc-400 line-through">R{original.toFixed(2)}</span>
                                        </div>
                                        {product.rating && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="text-[11px] text-zinc-400">
                                                    {parseFloat(product.rating).toFixed(1)}
                                                    {product.reviewCount != null && product.reviewCount > 0 && ` (${product.reviewCount})`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </ImageKitProvider>
            </div>

            {maxOffset > 0 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {Array.from({ length: maxOffset + 1 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setOffset(i)}
                            className={`h-1.5 rounded-full transition-all duration-200 ${
                                i === offset ? 'w-4 bg-zinc-800' : 'w-1.5 bg-zinc-300'
                            }`}
                        />
                    ))}
                </div>
            )}

            <div className="border-t border-zinc-100 mt-8" />
        </div>
    );
};

const DisplayDeals = () => {
    const { deals, loading } = useDeals();
    const [timers, setTimers] = useState<Record<string, Countdown>>({});

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];

        deals.forEach((deal: Deal) => {
            const nextTime = deal.timeSpans?.find((t: TimeSpan) =>
                t.timeSpan !== null && new Date(t.timeSpan).getTime() > Date.now()
            );
            if (!nextTime || !nextTime.timeSpan) return;

            const target = new Date(nextTime.timeSpan).getTime();

            const update = () => {
                const diff = target - Date.now();
                if (diff <= 0) return;
                setTimers(prev => ({
                    ...prev,
                    [deal.id]: {
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((diff / (1000 * 60)) % 60),
                        seconds: Math.floor((diff / 1000) % 60),
                    }
                }));
            };

            update();
            intervals.push(setInterval(update, 1000));
        });

        return () => intervals.forEach(clearInterval);
    }, [deals]);

    if (loading) {
        return (
            <div className="py-12 px-4 md:px-8">
                <div className="h-5 w-28 bg-zinc-100 rounded animate-pulse mb-6" />
                {[1, 2].map(i => (
                    <div key={i} className="mb-8">
                        <div className="flex gap-2 mb-4">
                            <div className="h-6 w-16 bg-zinc-100 rounded-full animate-pulse" />
                            <div className="h-6 w-32 bg-zinc-100 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-3">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="w-40 flex-none h-52 bg-zinc-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="py-6 px-4 md:px-8">
            <div className="flex items-baseline gap-3 mb-6">
                <h1 className="text-base tracking-widest text-zinc-900">HOT DEALS</h1>
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Limited time only</span>
            </div>

            {deals.length === 0 ? (
                <p className="text-sm text-zinc-400">No exclusive deals available right now.</p>
            ) : (
                deals.map((deal: Deal, i: number) => (
                    <DealSlider
                        key={deal.id}
                        deal={deal}
                        color={COLORS[i % COLORS.length]}
                        countdown={timers[deal.id]}
                    />
                ))
            )}
        </div>
    );
};

export default DisplayDeals;