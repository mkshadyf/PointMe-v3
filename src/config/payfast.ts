interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passPhrase: string;
  baseUrl: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

const SANDBOX_CONFIG: PayFastConfig = {
  merchantId: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  baseUrl: 'https://sandbox.payfast.co.za',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
  notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`,
};

const PRODUCTION_CONFIG: PayFastConfig = {
  merchantId: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID!,
  merchantKey: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY!,
  passPhrase: process.env.PAYFAST_PASSPHRASE!,
  baseUrl: 'https://www.payfast.co.za',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
  notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/notify`,
};

export const payfastConfig = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_CONFIG 
  : SANDBOX_CONFIG;

export const getPayfastConfig = (forceEnvironment?: 'sandbox' | 'production'): PayFastConfig => {
  if (forceEnvironment === 'sandbox') return SANDBOX_CONFIG;
  if (forceEnvironment === 'production') return PRODUCTION_CONFIG;
  return payfastConfig;
};
