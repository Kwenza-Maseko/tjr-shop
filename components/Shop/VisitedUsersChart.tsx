"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";

export const description = "An interactive area chart"

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    mobile: {
        label: "Website Logins ",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig


interface Users {
    id: string;
    fullName: string;
    email: string;
    role: string;
    phoneNumber: string | null;
    createdAt: Date | null;
    lastLogin: Date | null;
}

const VisitedUsersChart = () => {
    const [timeRange, setTimeRange] = React.useState("90d")
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Users[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                const data = await res.json();

                if (!data.success) {
                    toast.error(data.message || "Failed to fetch users");
                    setLoading(false);
                    return;
                }
                setUsers(data.data);
            } catch (error) {
                console.error(error);
                toast.error("Error fetching users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const buildChartData = (users: Users[], days: number) => {
        const today = new Date();
        const result: { date: string; mobile: number }[] = [];

        // Create map for counting
        const counts: Record<string, number> = {};

        users.forEach((user) => {
            if (!user.lastLogin) return;

            const date = new Date(user.lastLogin);
            const key = date.toISOString().split("T")[0]; // YYYY-MM-DD

            counts[key] = (counts[key] || 0) + 1;
        });

        // Build last X days (backwards from today)
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);

            const key = d.toISOString().split("T")[0];

            result.push({
                date: key,
                mobile: counts[key] || 0,
            });
        }

        return result;
    };

    const [chartData, setChartData] = useState<{ date: string; mobile: number }[]>([]);

    useEffect(() => {
        let days = 90;

        if (timeRange === "30d") days = 30;
        if (timeRange === "7d") days = 7;

        const data = buildChartData(users, days);
        setChartData(data);
    }, [users, timeRange]);

    return (
        <Card className="pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Area Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-mobile)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="url(#fillMobile)"
                            stroke="var(--color-mobile)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default VisitedUsersChart;