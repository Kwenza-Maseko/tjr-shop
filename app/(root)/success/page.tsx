import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-900">Payment successful</h1>
          <p className="text-sm text-zinc-500">
            Thank you for your order. We've received your payment and will
            start processing your order shortly.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs text-zinc-500">What happens next?</p>
          <ul className="space-y-1.5">
            {[
              "You'll receive a confirmation email shortly",
              "Your order will be prepared and packed",
              "You'll be notified once it's on its way",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 text-[10px] flex items-center justify-center flex-none mt-0.5 font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/store"
            className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-50 transition-colors text-center"
          >
            Back to store
          </Link>
          <Link
            href="/account/track"
            className="flex-1 py-2.5 text-sm bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors text-center"
          >
            View my orders
          </Link>
        </div>

      </div>
    </div>
  )
}