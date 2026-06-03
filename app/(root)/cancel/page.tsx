import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-900">Payment cancelled</h1>
          <p className="text-sm text-zinc-500">
            Your payment was cancelled and nothing was charged.
            Your cart has been kept — you can try again whenever you're ready.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
          <p className="text-xs text-amber-700 font-medium mb-1">Good to know</p>
          <p className="text-sm text-amber-600">
            No order was created and no money was taken from your account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/store"
            className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-50 transition-colors text-center"
          >
            Back to store
          </Link>
          <Link
            href="/cart"
            className="flex-1 py-2.5 text-sm bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors text-center"
          >
            Return to cart
          </Link>
        </div>

      </div>
    </div>
  )
}