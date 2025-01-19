import { supabase } from '@/lib/supabase';
import { PayFastManager } from '@/lib/payments/PayFastManager';

interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  emailAddress?: string;
  cellNumber?: string;
  customStr1?: string;
  customStr2?: string;
  customStr3?: string;
  customStr4?: string;
  customStr5?: string;
  customInt1?: number;
  customInt2?: number;
  customInt3?: number;
  customInt4?: number;
  customInt5?: number;
}

interface PaymentResponse {
  url: string;
  data: Record<string, string>;
}

// Initialize PayFast with environment-based configuration
const payFast = new PayFastManager();

export const paymentService = {
  async createPayment(input: CreatePaymentRequest): Promise<PaymentResponse> {
    // Store payment intent in database
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        appointment_id: input.appointmentId,
        amount: input.amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Add payment ID as custom string for reference
    const paymentData = {
      ...input,
      customStr1: payment.id, // Store payment ID for reference
      customStr2: input.appointmentId, // Store appointment ID for reference
    };

    // Generate PayFast payment form
    return payFast.generatePaymentForm(paymentData);
  },

  async handlePaymentNotification(data: Record<string, string>) {
    return new Promise((resolve, reject) => {
      payFast.handleNotification(
        data,
        async (paymentData) => {
          try {
            // Update payment status in database
            const { error: paymentError } = await supabase
              .from('payments')
              .update({
                status: 'completed',
                transaction_id: paymentData.pf_payment_id,
                updated_at: new Date().toISOString(),
                metadata: paymentData,
              })
              .eq('id', paymentData.custom_str1);

            if (paymentError) throw paymentError;

            // Update appointment status
            const { error: appointmentError } = await supabase
              .from('appointments')
              .update({
                status: 'confirmed',
                is_paid: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', paymentData.custom_str2);

            if (appointmentError) throw appointmentError;

            resolve(paymentData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  },
};
