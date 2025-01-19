import crypto from 'crypto';
import { payfastConfig, getPayfastConfig } from '@/config/payfast';

interface PaymentRequest {
  amount: number;
  itemName: string;
  itemDescription?: string;
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
  emailAddress?: string;
  cellNumber?: string;
}

export class PayFastManager {
  private config = payfastConfig;

  constructor(environment?: 'sandbox' | 'production') {
    if (environment) {
      this.config = getPayfastConfig(environment);
    }
  }

  public generatePaymentForm(payment: PaymentRequest): { url: string; data: Record<string, string> } {
    const timestamp = new Date().toISOString();
    const data: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      amount: payment.amount.toFixed(2),
      item_name: payment.itemName,
      ...(payment.itemDescription && { item_description: payment.itemDescription }),
      ...(payment.emailAddress && { email_address: payment.emailAddress }),
      ...(payment.cellNumber && { cell_number: payment.cellNumber }),
      ...(payment.customStr1 && { custom_str1: payment.customStr1 }),
      ...(payment.customStr2 && { custom_str2: payment.customStr2 }),
      ...(payment.customStr3 && { custom_str3: payment.customStr3 }),
      ...(payment.customStr4 && { custom_str4: payment.customStr4 }),
      ...(payment.customStr5 && { custom_str5: payment.customStr5 }),
      ...(payment.customInt1 && { custom_int1: payment.customInt1.toString() }),
      ...(payment.customInt2 && { custom_int2: payment.customInt2.toString() }),
      ...(payment.customInt3 && { custom_int3: payment.customInt3.toString() }),
      ...(payment.customInt4 && { custom_int4: payment.customInt4.toString() }),
      ...(payment.customInt5 && { custom_int5: payment.customInt5.toString() }),
    };

    // Generate signature
    const signature = this.generateSignature(data);
    data.signature = signature;

    return {
      url: `${this.config.baseUrl}/eng/process`,
      data
    };
  }

  public validateCallback(data: Record<string, string>): boolean {
    const { signature: receivedSignature, ...paymentData } = data;
    const calculatedSignature = this.generateSignature(paymentData);
    return receivedSignature === calculatedSignature;
  }

  private generateSignature(data: Record<string, string>): string {
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

    // Append passphrase if set
    const finalString = this.config.passPhrase
      ? `${signatureString}&passphrase=${encodeURIComponent(this.config.passPhrase)}`
      : signatureString;

    // Generate MD5 hash
    return crypto.createHash('md5').update(finalString).digest('hex');
  }

  public async handleNotification(
    data: Record<string, string>,
    onSuccess: (data: Record<string, string>) => Promise<void>,
    onError: (error: Error) => Promise<void>
  ): Promise<void> {
    try {
      // Validate the signature
      if (!this.validateCallback(data)) {
        throw new Error('Invalid signature');
      }

      // Check payment status
      if (data.payment_status === 'COMPLETE') {
        await onSuccess(data);
      } else {
        await onError(new Error(`Payment failed with status: ${data.payment_status}`));
      }
    } catch (error) {
      await onError(error as Error);
    }
  }
}
