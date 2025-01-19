'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PayFastManager } from "@/lib/payfast";
import { appointmentService } from "@/services/appointmentService";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentStatus } from "@/types/appointment";

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: appointment, error } = useSWR(
    params?.id ? `/api/appointments/${params.id}` : null,
    () => params?.id ? appointmentService.getAppointmentById(params.id) : null
  );

  useEffect(() => {
    if (appointment) {
      const paymentForm = PayFastManager.createPaymentForm({
        amount: appointment.service?.price || 0,
        itemName: appointment.service?.name || "Service Appointment",
        email: appointment.customerEmail || "",
        orderId: appointment.id,
        returnUrl: `${window.location.origin}/appointments/${appointment.id}/confirmation`,
        cancelUrl: `${window.location.origin}/appointments/${appointment.id}/cancel`,
        notifyUrl: `${window.location.origin}/api/payments/notify`,
      });

      document.body.appendChild(paymentForm);
      paymentForm.submit();
    }
  }, [appointment]);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load appointment details",
      variant: "destructive",
    });
    return null;
  }

  if (!appointment) {
    return <div>Loading...</div>;
  }

  if (appointment.status === AppointmentStatus.PAID) {
    router.push(`/appointments/${appointment.id}/confirmation`);
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Processing Payment
        </h1>
        <div className="text-center">
          <p className="text-gray-600">
            Service: {appointment.service?.name}
          </p>
          <p className="text-gray-600">
            Amount: R{appointment.service?.price}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <p className="text-sm text-center text-gray-500">
          Please wait while we redirect you to the payment gateway...
        </p>
      </div>
    </div>
  );
}
