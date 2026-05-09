'use client'

import React, { useEffect, useState } from 'react'
import { IKImage, ImageKitProvider } from 'imagekitio-next'
import config from '@/lib/config'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const { urlEndpoint, publicKey } = config.env.imagekit

interface OrderItem {
  productId: string
  productName: string
  imageUrl?: string
  quantity: number
  priceSnapshot: number
  discountSnapshot?: number | null
}

interface Order {
  id: string
  mPaymentId: string
  paymentStatus: string
  status: string
  shippingMethod: 'PICKUP' | 'DELIVERY'
  subtotal: string
  total: string
  items: OrderItem[]
  deliveryStreetAddress?: string
  deliverySuburb?: string
  deliveryCity?: string
  deliveryProvince?: string
  deliveryPostalCode?: string
  paidAt?: string
  createdAt: string
}

// ─── Status pipeline ──────────────────────────────────────────────────────────

const PIPELINE = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

const STATUS_META: Record<string, {
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  description: string
}> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    description: 'Awaiting payment confirmation.',
  },
  PAID: {
    label: 'Paid',
    icon: <CreditCard className="w-4 h-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Payment received. Your order is being prepared.',
  },
  PROCESSING: {
    label: 'Processing',
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Your order is being packed and prepared for dispatch.',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: <Truck className="w-4 h-4" />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'Your order is on its way!',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: 'Your order has been delivered. Enjoy!',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'This order has been cancelled.',
  },
  REFUNDED: {
    label: 'Refunded',
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    description: 'Your refund has been processed.',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number | string) {
  return 'R ' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function StatusPipeline({ status }: { status: string }) {
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED'
  const currentIndex = PIPELINE.indexOf(status as typeof PIPELINE[number])

  if (isCancelled) {
    const meta = STATUS_META[status]
    return (
      <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border ${meta.bg} ${meta.color} ${meta.border}`}>
        {meta.icon}
        {meta.label} — {meta.description}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-black z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (PIPELINE.length - 1)) * 100}%` }}
        />

        {PIPELINE.map((step, i) => {
          const done = i <= currentIndex
          const active = i === currentIndex
          const meta = STATUS_META[step]
          return (
            <div key={step} className="flex flex-col items-center z-10 gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${done
                  ? 'bg-black border-black text-white'
                  : 'bg-white border-zinc-300 text-zinc-400'}`}>
                {meta.icon}
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wide
                ${active ? 'text-black' : done ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* current step description */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {STATUS_META[status]?.description}
      </p>
    </div>
  )
}

// ─── Single order card ────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false)
  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">

      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${meta.bg} ${meta.color} ${meta.border}`}>
            {order.shippingMethod === 'DELIVERY'
              ? <Truck className="w-4 h-4" />
              : <Package className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              Order · <span className="font-mono text-xs text-muted-foreground">{order.mPaymentId}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{fmtDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border font-medium ${meta.bg} ${meta.color} ${meta.border}`}>
            {meta.icon}
            {meta.label}
          </div>
          <span className="text-sm font-semibold">{fmtPrice(order.total)}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-5">

          {/* Progress */}
          <StatusPipeline status={order.status} />

          <div className="border-t border-border" />

          {/* Items */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                    {item.imageUrl ? (
                      <IKImage
                        path={item.imageUrl}
                        alt={item.productName}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      x{item.quantity}
                      {item.discountSnapshot ? ` · −${item.discountSnapshot}%` : ''}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums flex-shrink-0">
                    {fmtPrice(item.priceSnapshot * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/40 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{fmtPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shippingMethod === 'DELIVERY' ? 'Delivery' : 'Pick Up'}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border">
              <span>Total</span>
              <span>{fmtPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          {order.shippingMethod === 'DELIVERY' && order.deliveryStreetAddress && (
            <div className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-black" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Delivery Address</p>
                <p>{order.deliveryStreetAddress}</p>
                {order.deliverySuburb && <p>{order.deliverySuburb}</p>}
                <p>{[order.deliveryCity, order.deliveryProvince, order.deliveryPostalCode].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Track = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const res = await fetch('/api/orders/my-orders')
        const json = await res.json()
        if (json.success) setOrders(json.data)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Loading your orders…
      </div>
    )
  }

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      <div className="p-4 max-w-2xl mx-auto space-y-4 pt-10">

        <div className='text-center'>
          <h1 className="text-xl font-semibold tracking-tight">My Orders</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
            Track your order status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            You have no orders yet.
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}

      </div>
    </ImageKitProvider>
  )
}

export default Track