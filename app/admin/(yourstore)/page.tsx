import { auth } from '@/adminAuth'
import OrderChart from '@/components/Shop/OrderChart';
import SalesChart from '@/components/Shop/SalesChart';
import VisitedUsersChart from '@/components/Shop/VisitedUsersChart';
import { redirect } from 'next/navigation';
import { eq, sql, count, sum, avg } from 'drizzle-orm';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    Package,
    RefreshCw,
    BarChart2,
} from 'lucide-react';
import { db } from '@/database/drizzle';
import { ordersTable, userTable } from '@/database/schema';

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getDashboardStats() {
    const [
        revenueResult,
        ordersResult,
        customersResult,
        productsSoldResult,
        refundsResult,
        aovResult,
    ] = await Promise.all([

        // Total revenue — sum of paid orders
        db
            .select({ value: sum(ordersTable.total) })
            .from(ordersTable)
            .where(eq(ordersTable.paymentStatus, 'COMPLETE')),

        // Total orders
        db
            .select({ value: count() })
            .from(ordersTable),

        // Total unique customers
        db
            .select({ value: count() })
            .from(userTable),

        // Products sold — sum of quantities across all paid orders
        db
            .select({
                value: sql<number>`coalesce(sum((item->>'quantity')::int), 0)`
            })
            .from(ordersTable)
            .leftJoin(
                sql`jsonb_array_elements(${ordersTable.items}) as item`,
                sql`true`
            )
            .where(eq(ordersTable.paymentStatus, 'COMPLETE')),

        // Refunds / returns
        db
            .select({ value: count() })
            .from(ordersTable)
            .where(eq(ordersTable.status, 'REFUNDED')),

        // Average order value
        db
            .select({ value: avg(ordersTable.total) })
            .from(ordersTable)
            .where(eq(ordersTable.paymentStatus, 'COMPLETE')),
    ])

    const revenue = Number(revenueResult[0]?.value ?? 0)
    const orders = Number(ordersResult[0]?.value ?? 0)
    const customers = Number(customersResult[0]?.value ?? 0)
    const productsSold = Number(productsSoldResult[0]?.value ?? 0)
    const refunds = Number(refundsResult[0]?.value ?? 0)
    const aov = Number(aovResult[0]?.value ?? 0)

    return { revenue, orders, customers, productsSold, refunds, aov }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
    return 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtNumber(n: number) {
    return n.toLocaleString('en-ZA')
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string
    value: string
    sub: string
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    accentClass: string
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, accentClass }: StatCardProps) {
    return (
        <div className="relative flex flex-col gap-4 bg-white border border-black/5 rounded-xl p-5 overflow-hidden flex-1 min-w-[240px]">
            {/* Top accent strip */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentClass}`} />

            <div className="flex items-start justify-between">
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{label}</p>
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg, color: iconColor }}
                >
                    {icon}
                </div>
            </div>

            <div>
                <p className="text-2xl font-medium leading-none">{value}</p>
                <p className="text-[11px] text-gray-400 mt-1.5">{sub}</p>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Overview = async () => {
    const session = await auth()
    if (!session) redirect('/admin/login')

    const { revenue, orders, customers, productsSold, refunds, aov } = await getDashboardStats()

    const stats: StatCardProps[] = [
        {
            label: 'Total Revenue',
            value: fmtCurrency(revenue),
            sub: 'From completed payments',
            icon: <TrendingUp className="w-4 h-4" />,
            iconBg: '#E1F5EE',
            iconColor: '#085041',
            accentClass: 'bg-gradient-to-r from-teal-400 to-green-400',
        },
        {
            label: 'Total Orders',
            value: fmtNumber(orders),
            sub: 'All time',
            icon: <ShoppingBag className="w-4 h-4" />,
            iconBg: '#FAEEDA',
            iconColor: '#633806',
            accentClass: 'bg-gradient-to-r from-amber-400 to-yellow-300',
        },
        {
            label: 'Total Customers',
            value: fmtNumber(customers),
            sub: 'Registered users',
            icon: <Users className="w-4 h-4" />,
            iconBg: '#EEEDFE',
            iconColor: '#3C3489',
            accentClass: 'bg-gradient-to-r from-purple-400 to-indigo-400',
        },
        {
            label: 'Products Sold',
            value: fmtNumber(productsSold),
            sub: 'Units across paid orders',
            icon: <Package className="w-4 h-4" />,
            iconBg: '#E6F1FB',
            iconColor: '#0C447C',
            accentClass: 'bg-gradient-to-r from-blue-400 to-sky-300',
        },
        {
            label: 'Refunds / Returns',
            value: fmtNumber(refunds),
            sub: 'Refunded orders',
            icon: <RefreshCw className="w-4 h-4" />,
            iconBg: '#FCEBEB',
            iconColor: '#791F1F',
            accentClass: 'bg-gradient-to-r from-red-400 to-rose-300',
        },
        {
            label: 'Avg Order Value',
            value: fmtCurrency(aov),
            sub: 'Per completed order',
            icon: <BarChart2 className="w-4 h-4" />,
            iconBg: '#EAF3DE',
            iconColor: '#27500A',
            accentClass: 'bg-gradient-to-r from-green-400 to-lime-300',
        },
    ]

    return (
        <div className="p-4 space-y-8">

            {/* Stat cards */}
            <div className="flex flex-wrap gap-3">
                {stats.map((s) => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            {/* Visited users chart */}
            <div className="w-full bg-white border border-black/5 rounded-xl p-5">
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Logged In Users</p>
                <VisitedUsersChart />
            </div>

            {/* Order + Sales charts 
            <div className="flex md:flex-row flex-col gap-6">
                <div className="w-full bg-white border border-black/5 rounded-xl p-5">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Orders</p>
                    <OrderChart />
                </div>
                <div className="w-full bg-white border border-black/5 rounded-xl p-5">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Sales</p>
                    <SalesChart />
                </div>
            </div>
*/}
        </div>
    )
}

export default Overview