
'use client'
import { items } from "@/constants";
import { useState } from "react";
const FeatureCategory = () => {
    const [showAll, setShowAll] = useState(false);

    const visibleItems = showAll ? items : items.slice(0, 4);

    return (
        <div className="space-y-4 px-6 md:px-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Featured Categories</p>

                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-gray-600 hover:underline"
                >
                    {showAll ? "View Less" : "View All"}
                </button>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleItems.map((item) => (
                    <div
                        key={item.id}
                        className={`${item.colorHex} rounded-4xl overflow-hidden p-4`}
                    >
                        {/* Image */}
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-40 object-cover rounded-2xl"
                        />

                        {/* Name */}
                        <div className="p-2 text-center">
                            <p className="text-sm font-medium">{item.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default FeatureCategory