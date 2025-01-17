export interface PaymentIntent {
  id: string
  amount: number
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded'
  clientSecret: string
}

export interface CreatePaymentIntentInput {
  amount: number
  currency: string
}

export interface PaymentSettings {
  acceptsCash: boolean;
  acceptsCard: boolean;
  stripeConnected?: boolean;
  paypalConnected?: boolean;
  depositRequired?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  cancellationFee?: number;
  taxRate?: number;
  acceptOnlinePayments: boolean;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  currency: string;
  paymentMethods: string[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  appointmentId: string;
  customerId: string;
  businessId: string;
  transactionId?: string;
  refundId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  amount: number;
  currency: string;
  method: string;
  appointmentId: string;
  customerId: string;
  businessId: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentInput {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  refundId?: string;
  metadata?: Record<string, any>;
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason?: string;
}
