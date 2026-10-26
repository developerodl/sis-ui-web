import React, { useState } from "react";
import apiClient from "../../../services/ApiClient";
import bannerImage from "/assets/banner.png";

const REGISTER_URL = "/razorpay/registrations";
const VERIFY_URL = "/razorpay/registrations/verify";

const categories = [
  "Existing SRIHER CDOE Learner",
  "Working Professional",
  "EHS Professional",
  "Doctor/ Wellness / Fitness Professional",
  "College Faculty / Academician",
  "School Teacher",
  "Student – Undergraduate",
  "Student – Postgraduate",
] as const;

const tracks = [
  "Track 1 – Data Science & Analytics",
  "Track 2 – Wellness Coaching",
  "Track 3 – Industrial Hygiene",
  "Track 4 – Organisational Behaviour Analysis",
  "Track 5 – AI-Enabled Business Management",
] as const;

interface RegistrationForm {
  full_name: string;
  email: string;
  mobile: string;
  professional_category: string;
  seminar_track: string;
  presenting_paper: boolean;
  city_district: string;
}

interface RegistrationResponse {
  registration_id: number;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

type PaymentStatus = "success" | "failure" | null;

const initialForm: RegistrationForm = {
  full_name: "",
  email: "",
  mobile: "",
  professional_category: "",
  seminar_track: "",
  presenting_paper: false,
  city_district: "",
};

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve(Boolean(window.Razorpay))
      );
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SeminarRegistration: React.FC = () => {
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(null);

  const [statusMessage, setStatusMessage] = useState("");
  const [registrationId, setRegistrationId] = useState<number | null>(
    null
  );

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again."
        );
      }

      // Create registration and payment order on the backend.
      const createResponse =
        await apiClient.post<RegistrationResponse>(
          REGISTER_URL,
          form
        );

      const registration = createResponse.data;

      setRegistrationId(registration.registration_id);

      const options: RazorpayOptions = {
        key: registration.key_id,
        amount: registration.amount,
        currency: registration.currency,
        name: "SRIHER CDOE",
        description: "Seminar Registration",
        order_id: registration.order_id,

        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.mobile,
        },

        theme: {
          color: "#105c8e",
        },

        handler: async (payment) => {
          setLoading(true);
          setError("");
          setMessage("");

          try {
            // Verify payment with the backend.
            await apiClient.post(VERIFY_URL, {
              registration_id: registration.registration_id,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });

            // Display the success attention screen.
            setStatusMessage(
              "Your payment has been verified successfully, and your seminar registration is complete. Thank you for registering!"
            );

            setPaymentStatus("success");
            setForm(initialForm);
          } catch {
            // Hide the form and show the verification failure screen.
            setStatusMessage(
              "We couldn't confirm your payment yet. Please contact support with your registration ID. If the amount was deducted, please do not make another payment until the transaction status has been checked."
            );

            setPaymentStatus("failure");
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);

            // Closing checkout does not necessarily mean payment failed.
            setMessage(
              "Payment checkout was closed. Please check your payment status before trying again."
            );
          },
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err: unknown) {
      const messageFromApi = (
        err as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        }
      )?.response?.data?.detail;

      setError(
        messageFromApi ||
          (err instanceof Error
            ? err.message
            : "Unable to start registration. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setPaymentStatus(null);
    setStatusMessage("");
    setRegistrationId(null);
    setMessage("");
    setError("");
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      {/* Banner */}
      <div className="w-full overflow-hidden">
        <img
          src={bannerImage}
          alt="Sri Ramachandra Online - Future-Ready Careers"
          className="block h-auto w-full"
        />
      </div>

      {/* Payment Success / Failure Attention */}
      {paymentStatus ? (
        <div className="flex min-h-[420px] items-center justify-center bg-white px-4 py-10 sm:px-8">
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 text-center shadow-md sm:p-10 ${
              paymentStatus === "success"
                ? "border-green-200 bg-white"
                : "border-red-200 bg-white"
            }`}
            role={paymentStatus === "success" ? "status" : "alert"}
            aria-live="polite"
          >
            {/* Status Icon */}
            <div
              className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
                paymentStatus === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {paymentStatus === "success" ? (
                <svg
                  className="h-11 w-11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="h-11 w-11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8v5m0 4h.01M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            {/* Status Heading */}
            <h2
              className={`mb-3 text-2xl font-extrabold sm:text-3xl ${
                paymentStatus === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {paymentStatus === "success"
                ? "Registration Successful!"
                : "Payment Verification Pending"}
            </h2>

            {/* Status Message */}
            <p className="mb-5 text-sm leading-7 text-gray-600 sm:text-base">
              {statusMessage}
            </p>

            {/* Registration ID */}
            {registrationId !== null && (
              <div className="mb-6 rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Registration ID
                </p>
                <p className="mt-1 text-lg font-bold text-[#105c8e]">
                  {registrationId}
                </p>
              </div>
            )}

            {/* Back to Form */}
            <button
              type="button"
              onClick={handleBackToForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#105c8e] px-6 py-3 font-semibold text-white transition hover:bg-[#0b4a73] focus:outline-none focus:ring-2 focus:ring-[#105c8e] focus:ring-offset-2 sm:w-auto"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  d="m15 18-6-6 6-6M9 12h12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Registration Form
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-2 text-2xl font-semibold text-[#105c8e]">
            Seminar Registration
          </h1>

          <p className="mb-6 text-sm text-gray-600">
            Complete the form below to register for the seminar.
          </p>

          {/* Checkout Dismissal Message */}
          {message && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"
            >
              {message}
            </div>
          )}

          {/* Registration / Order Creation Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Full name *
              </label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                maxLength={150}
                autoComplete="name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={255}
                autoComplete="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              />
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Mobile number *
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={20}
                autoComplete="tel"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              />
            </div>

            {/* Professional Category */}
            <div>
              <label
                htmlFor="professional_category"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Professional / Academic Category *
              </label>
              <select
                id="professional_category"
                name="professional_category"
                value={form.professional_category}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Seminar Track Themes */}
            <div className="my-5">
              <p className="mb-4 text-sm leading-6 text-gray-600">
                Discover the themes and sessions offered under each
                track before selecting your preferred area of
                participation.
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[#105c8e]">
                    Track 1 — Data Science & Analytics
                  </p>
                  <p className="text-sm text-gray-700">
                    Theme: AI, Data Science & Digital Transformation:
                    Shaping the Future
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#105c8e]">
                    Track 2 — Wellness Coaching
                  </p>
                  <p className="text-sm text-gray-700">
                    Theme: The Well-Being Shift: Rethinking How We Live
                    and Thrive
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#105c8e]">
                    Track 3 — Industrial Hygiene
                  </p>
                  <p className="text-sm text-gray-700">
                    Theme: Advancing Industrial Hygiene Through Online
                    Education
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#105c8e]">
                    Track 4 — Organisational Behaviour Analysis
                  </p>
                  <p className="text-sm text-gray-700">
                    Theme: Human Potential in an AI-Driven World:
                    Exploring Behaviour, Innovation and the Future of
                    Organisations
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#105c8e]">
                    Track 5 — AI-Enabled Business Management
                  </p>
                  <p className="text-sm text-gray-700">
                    Theme: AI-Enabled Business Management: Redefining
                    Leadership, Decision-Making and Innovation
                  </p>
                </div>
              </div>
            </div>

            {/* Preferred Track */}
            <div>
              <label
                htmlFor="seminar_track"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Preferred Seminar Track *
              </label>
              <select
                id="seminar_track"
                name="seminar_track"
                value={form.seminar_track}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              >
                <option value="">Select track</option>
                {tracks.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Presentation */}
            {/* <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">
                Would you like to present a paper? *
              </legend>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="presenting_paper"
                    checked={form.presenting_paper === true}
                    onChange={() =>
                      setForm((previous) => ({
                        ...previous,
                        presenting_paper: true,
                      }))
                    }
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="presenting_paper"
                    checked={form.presenting_paper === false}
                    onChange={() =>
                      setForm((previous) => ({
                        ...previous,
                        presenting_paper: false,
                      }))
                    }
                  />
                  No
                </label>
              </div>
            </fieldset> */}

            {/* City / District */}
            <div className="my-4">
              <label
                htmlFor="city_district"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                City / District *
              </label>
              <input
                id="city_district"
                name="city_district"
                value={form.city_district}
                onChange={handleChange}
                required
                maxLength={150}
                autoComplete="address-level2"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#105c8e] focus:ring-1 focus:ring-[#105c8e]"
              />
            </div>

            {/* Event Details */}
            <div className="relative mb-10 mt-10 rounded-2xl border border-[#f4dfb5] bg-gradient-to-r from-[#fffaf0] via-white to-[#fffaf0] px-4 pb-5 pt-10 shadow-sm sm:px-6 sm:pt-11">
              <div className="absolute left-4 top-0 -translate-y-1/3 rounded-xl bg-gradient-to-r from-[#e8c783] to-[#f0dba9] px-4 py-2 shadow-sm sm:left-6 sm:px-6">
                <h4 className="mb-0 whitespace-nowrap text-base font-extrabold uppercase tracking-wide text-[#432611] sm:text-lg">
                  Event Details
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">
                {/* Date */}
                <div className="flex min-w-0 items-center gap-3 sm:border-r sm:border-gray-300 sm:pr-4">
                  <svg
                    className="h-9 w-9 shrink-0 text-[#ad0928] sm:h-10 sm:w-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M7 2v6M17 2v6M3 10h18" />
                  </svg>

                  <div className="min-w-0">
                    <p className="mb-1 text-sm font-medium text-[#29456c]">
                      Date
                    </p>
                    <p className="text-sm font-bold leading-5 text-[#b5122c] sm:text-base">
                      Friday, 20 November 2026
                    </p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex min-w-0 items-center gap-3 sm:border-r sm:border-gray-300 sm:px-5">
                  <svg
                    className="h-9 w-9 shrink-0 text-[#ad0928] sm:h-10 sm:w-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 1.5a8 8 0 0 0-8 8c0 5.6 8 13 8 13s8-7.4 8-13a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>

                  <div className="min-w-0">
                    <p className="mb-1 text-sm font-medium text-[#29456c]">
                      Venue
                    </p>
                    <p className="text-sm font-bold leading-5 text-[#b5122c] sm:text-base">
                      SRIHER – SRMC Building, Porur
                    </p>
                  </div>
                </div>

                {/* Fee */}
                <div className="flex min-w-0 items-center gap-3 sm:pl-5">
                  <svg
                    className="h-9 w-9 shrink-0 text-[#ad0928] sm:h-10 sm:w-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <ellipse cx="12" cy="5" rx="8" ry="3.5" />
                    <path d="M4 8c0 4.7 16 4.7 16 0v3c0 4.7-16 4.7-16 0Zm0 6c0 4.7 16 4.7 16 0v3c0 4.7-16 4.7-16 0Z" />
                  </svg>

                  <div>
                    <p className="mb-1 text-sm font-medium text-[#29456c]">
                      Registration Fee
                    </p>
                    <p className="text-base font-extrabold text-[#b5122c] sm:text-lg">
                      ₹250
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#105c8e] px-4 py-3 font-medium text-white transition hover:bg-[#0b4a73] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Pay Now"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SeminarRegistration;
