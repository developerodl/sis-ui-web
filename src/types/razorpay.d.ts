
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;

  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  theme?: {
    color?: string;
  };

  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;

  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;

  on: (
    event: "payment.failed",
    callback: (response: {
      error: {
        code?: string;
        description?: string;
        metadata?: {
          order_id?: string;
          payment_id?: string;
        };
      };
    }) => void
  ) => void;
}

interface Window {
  Razorpay?: new (
    options: RazorpayOptions
  ) => RazorpayInstance;
}

export {};
