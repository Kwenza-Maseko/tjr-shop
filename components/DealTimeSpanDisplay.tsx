"use client";

import { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DealsContext } from "./providers/DealContext";

const DealTimeSpanDisplay = () => {
  const { dealTimeSpan, expired, loading } = useContext(DealsContext);

  const pathname = usePathname();
  const isSidebarPage = pathname.startsWith("/admin");

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculation effect ONLY for countdown display
  useEffect(() => {
    if (!dealTimeSpan?.timeSpan) return;

    const target = new Date(dealTimeSpan.timeSpan).getTime();
    let interval: NodeJS.Timeout;

    const update = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) return;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [dealTimeSpan]);

  if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
  if (!dealTimeSpan) return;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-2 bg-purple-200 mb-4 fixed right-0 z-50 transition-all duration-300
      ${isSidebarPage && dealTimeSpan ? "left-[240px]" : "left-0 mt-2"}
    `}
    >
      {expired ? (
        <div className="p-2 px-6 rounded-md bg-purple-300">
          <p className="text-purple-900 font-semibold text-lg">No deal</p>
        </div>
      ) : (
        <>
          <p className="text-purple-800 text-sm mb-1">Deal Ends In</p>
          <div className="flex gap-2 text-lg font-semibold p-1 px-6 rounded-md bg-purple-300">
            <div className="flex flex-col items-center">
              <span className="text-purple-900 font-bold">{timeLeft.days}</span>
              <span className="text-xs text-purple-800">Days</span>
            </div>
            <span className="text-purple-900">:</span>

            <div className="flex flex-col items-center">
              <span className="text-purple-900 font-bold">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-purple-800">Hours</span>
            </div>
            <span className="text-purple-900">:</span>

            <div className="flex flex-col items-center">
              <span className="text-purple-900 font-bold">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-purple-800">Min</span>
            </div>
            <span className="text-purple-900">:</span>

            <div className="flex flex-col items-center">
              <span className="text-purple-900 font-bold">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-purple-800">Sec</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DealTimeSpanDisplay;
