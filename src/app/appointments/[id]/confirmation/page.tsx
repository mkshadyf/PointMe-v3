import { PaymentConfirmation } from '@/components/payment/PaymentConfirmation'

export default function PaymentConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { payment_id?: string }
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        {searchParams.payment_id ? (
          <PaymentConfirmation
            paymentId={searchParams.payment_id}
            appointmentId={params.id}
          />
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Payment ID not found</h1>
            <p className="text-muted-foreground mt-2">
              Please try making the payment again
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
