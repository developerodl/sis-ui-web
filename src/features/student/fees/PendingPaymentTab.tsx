
import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";

import CardComponent from "../../../components/card/Card";
import { apiRequest } from "../../../utils/ApiRequest";
import { ApiRoutes } from "../../../constants/ApiConstants";

interface Props {
  data: any;
  studentId: string | number;
  onPaymentStatusRefresh: () => Promise<void>;
}

// Razorpay success response
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay failure response
interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

// Razorpay checkout options
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

// Local checkout instance type
interface RazorpayCheckoutInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayFailureResponse) => void
  ) => void;
}

// Load Razorpay Checkout script
const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    const existing =
      document.querySelector<HTMLScriptElement>(
        `script[src="${scriptUrl}"]`
      );

    if (existing) {
      existing.addEventListener(
        "load",
        () => resolve(Boolean(window.Razorpay)),
        { once: true }
      );

      existing.addEventListener(
        "error",
        () => resolve(false),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;

    script.onload = () =>
      resolve(Boolean(window.Razorpay));

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

export default function PendingPaymentTab({
  data,
  studentId,
  onPaymentStatusRefresh,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const startPayment = async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      // Create pending payment order from backend
      const payment = await apiRequest({
        url: `${ApiRoutes.PAYPENDINGSTUDENT}/${studentId}/pending-payment/pay`,
        method: "post",
      });

      // Hosted checkout URL support
      const checkoutUrl =
        payment?.payment_link ||
        payment?.payment_url ||
        payment?.checkout_url ||
        payment?.redirect_url;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      // Get Razorpay order details
      const orderId =
        payment?.order_id ||
        payment?.razorpay_order_id;

      const key =
        payment?.key_id ||
        payment?.key;

      if (!orderId || !key) {
        throw new Error(
          payment?.message ||
            "The payment service did not return checkout details."
        );
      }

      // Load Razorpay script
      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again."
        );
      }

      // Amount must be in paise
      const amount =
        payment?.amount != null
          ? Number(payment.amount)
          : Number(
              payment?.pending_payment_amount ??
                data?.pending_payment_amount
            ) * 100;

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid payment amount received.");
      }

      // Explicit local constructor typing
      const RazorpayConstructor = window.Razorpay as unknown as new (
        options: RazorpayOptions
      ) => RazorpayCheckoutInstance;

      const options: RazorpayOptions = {
        key,
        amount,
        currency: payment?.currency || "INR",
        name: "SRIHER CDOE",
        description: `Pending ${data?.semester || ""} payment`,
        order_id: orderId,

        prefill: {
          name: data?.student_name || "",
          email: data?.email || "",
          contact: data?.mobile_number || "",
        },

        theme: {
          color: "#105c8e",
        },

        // Razorpay payment success callback
        handler: async (
          response: RazorpaySuccessResponse
        ) => {
          try {
            setNotice(
              "Payment received. Checking the latest payment status..."
            );

            // Refresh latest payment status from backend.
            // Backend must verify the Razorpay signature.
            await onPaymentStatusRefresh();

            setNotice(
              "Payment status has been refreshed successfully."
            );
            console.log(response);
            
          } catch {
            setError(
              "Payment was submitted, but the latest payment status could not be retrieved. Please refresh and check before attempting another payment."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setNotice(
              "Checkout was closed. Please check your payment status before trying again."
            );
          },
        },
      };

      const checkout = new RazorpayConstructor(options);

      // Razorpay payment failure callback
      checkout.on(
        "payment.failed",
        (response: RazorpayFailureResponse) => {
          setLoading(false);

          setError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      // Open Razorpay Checkout
      checkout.open();
    } catch (cause: any) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          cause?.detail ||
          cause?.message ||
          "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  const isPending =
    data?.pending_payment_status?.toLowerCase() === "pending";

  return (
    <CardComponent
      sx={{
        maxWidth: 650,
        mx: "auto",
        mt: 4,
        p: 4,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <PaymentIcon
          sx={{
            fontSize: 32,
            color: "error.main",
          }}
        />

        <Typography variant="h6" fontWeight={700}>
          Pending payment
        </Typography>
      </Stack>

      {/* Student details */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Student
          </Typography>
          <Typography fontWeight={600}>
            {data?.student_name || "Student"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Program
          </Typography>
          <Typography fontWeight={600}>
            {data?.program_name || "—"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Semester
          </Typography>
          <Typography fontWeight={600}>
            {data?.semester || "—"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Due date
          </Typography>
          <Typography fontWeight={600}>
            {data?.payment_due_date || "—"}
          </Typography>
        </Box>
      </Box>

      {/* Pending amount */}
      <Typography
        variant="h4"
        fontWeight={800}
        color="error.main"
        sx={{ mt: 3 }}
      >
        ₹
        {Number(
          data?.pending_payment_amount || 0
        ).toLocaleString("en-IN")}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Complete the pending payment securely through Razorpay.
      </Typography>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Information message */}
      {notice && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {notice}
        </Alert>
      )}

      {/* Pay button */}
      <Button
        variant="contained"
        color="error"
        size="large"
        startIcon={
          loading ? (
            <CircularProgress
              size={18}
              color="inherit"
            />
          ) : (
            <PaymentIcon />
          )
        }
        sx={{
          mt: 4,
          px: 4,
          py: 1.2,
          fontWeight: 700,
          borderRadius: 2,
        }}
        onClick={startPayment}
        disabled={loading || !isPending}
      >
        {loading
          ? "Processing payment..."
          : isPending
            ? "Pay now"
            : "Payment complete"}
      </Button>
    </CardComponent>
  );
}
