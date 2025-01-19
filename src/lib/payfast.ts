import crypto from 'crypto';

interface PayFastFormData {
  amount: number;
  itemName: string;
  email: string;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export class PayFastManager {
  private static readonly merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '';
  private static readonly merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '';
  private static readonly passPhrase = process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || '';
  private static readonly paymentUrl = process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';

  static createPaymentForm(data: PayFastFormData): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.paymentUrl;
    form.style.display = 'none';

    const formData = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: data.returnUrl,
      cancel_url: data.cancelUrl,
      notify_url: data.notifyUrl,
      name_first: '',
      name_last: '',
      email_address: data.email,
      m_payment_id: data.orderId,
      amount: data.amount.toFixed(2),
      item_name: data.itemName,
      item_description: `Payment for ${data.itemName}`,
      custom_str1: data.orderId,
    };

    // Add all inputs to the form
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Generate signature
    const signature = this.generateSignature(formData);
    const signatureInput = document.createElement('input');
    signatureInput.type = 'hidden';
    signatureInput.name = 'signature';
    signatureInput.value = signature;
    form.appendChild(signatureInput);

    return form;
  }

  private static generateSignature(data: Record<string, string>): string {
    // Sort the object by key
    const sortedData = Object.keys(data)
      .sort()
      .reduce((acc: Record<string, string>, key: string) => {
        acc[key] = data[key];
        return acc;
      }, {});

    // Create the signature string
    const signatureString = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
      .join('&');

    // Add the passphrase if it exists
    const finalString = this.passPhrase
      ? `${signatureString}&passphrase=${encodeURIComponent(this.passPhrase.trim())}`
      : signatureString;

    // Generate MD5 hash
    return crypto.createHash('md5').update(finalString).digest('hex');
  }

  static validateCallback(data: any, signature: string): boolean {
    const { signature: _, ...dataWithoutSignature } = data;
    const calculatedSignature = this.generateSignature(dataWithoutSignature);
    return calculatedSignature === signature;
  }
}
