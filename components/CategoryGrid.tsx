'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
    User,
    Sparkles,
    Baby,
    Dumbbell,
    Footprints,
    Activity,
    Goal
} from "lucide-react";

const CATEGORIES = [
    { name: 'Men', slug: 'store/men/all', bg: '#EEEDFE', iconColor: '#534AB7', icon: User },
    { name: 'Women', slug: 'store/women/all', bg: '#E1F5EE', iconColor: '#0F6E56', icon: Sparkles },
    { name: 'Kids', slug: 'store/kids/all', bg: '#FBEAF0', iconColor: '#993556', icon: Baby },
    { name: 'Sport', slug: 'store/sport/all', bg: '#FAECE7', iconColor: '#993C1D', icon: Activity },
    { name: 'Running', slug: 'store/sport/running/all', bg: '#F1EFE8', iconColor: '#5F5E5A', icon: Footprints },
    { name: 'Football', slug: 'store/sport/football/all', bg: '#EAF3DE', iconColor: '#3B6D11', icon: Goal },
    { name: 'Training & Gym', slug: 'store/sport/training--gym/all', bg: '#EAJ3DE', iconColor: '#3B6D11', icon: Dumbbell },
];

const CARD_W = 130;
const GAP = 10;
const VISIBLE = 3;

export default function CategoryGrid() {
    const [offset, setOffset] = useState(0);
    const touchStartX = useRef(0);
    const maxOffset = Math.max(0, CATEGORIES.length - VISIBLE);

    const go = (n: number) => setOffset(Math.max(0, Math.min(n, maxOffset)));

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 36) go(offset + (dx < 0 ? 1 : -1));
    };

    return (
        <section className="py-5 px-0">
            <div className="flex items-center justify-between px-4 md:px-8 mb-5">
                <h2 className="text-medium mb-3 px-6 md:px-2 uppercase tracking-widest">Shop by category</h2>
            </div>

            {/* Slider */}
            <div
                className="overflow-hidden px-4 md:px-8"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                        gap: `${GAP}px`,
                        transform: `translateX(-${offset * (CARD_W + GAP)}px)`,
                    }}
                >
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/${cat.slug}`}
                                className="flex-none rounded-xl border border-zinc-100 bg-white overflow-hidden hover:border-zinc-200 transition-colors"
                                style={{ width: `${CARD_W}px` }}
                            >
                                <div
                                    className="h-[90px] flex items-center justify-center"
                                    style={{ background: cat.bg }}
                                >
                                    <Icon size={28} color={cat.iconColor} strokeWidth={2}/>
                                </div>
                                <div className="px-2.5 py-2 border-t border-zinc-100">
                                    <p className="text-xs font-medium text-zinc-800 mb-0.5">
                                        {cat.name}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: maxOffset + 1 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => go(i)}
                        aria-label={`Page ${i + 1}`}
                        className={`h-1 rounded-full transition-all duration-200 ${i === offset ? 'w-4 bg-zinc-800' : 'w-1 bg-zinc-300'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}