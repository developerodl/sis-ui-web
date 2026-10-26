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
  // const [registrationId, setRegistrationId] = useState<number | null>(
  //   null
  // );

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

      // setRegistrationId(registration.registration_id);

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
    // setRegistrationId(null);
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
            className={`w-full max-w-xl rounded-2xl border p-6 text-center shadow-md sm:p-10 ${paymentStatus === "success"
              ? "border-green-200 bg-white"
              : "border-red-200 bg-white"
              }`}
            role={paymentStatus === "success" ? "status" : "alert"}
            aria-live="polite"
          >
            {/* Status Icon */}
            <div
              className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${paymentStatus === "success"
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
              className={`mb-3 text-2xl font-extrabold sm:text-3xl ${paymentStatus === "success"
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
            {/* {registrationId !== null && (
              <div className="mb-6 rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Registration ID
                </p>
                <p className="mt-1 text-lg font-bold text-[#105c8e]">
                  {registrationId}
                </p>  
              </div>
            )} */}

            <div className="mb-6 space-y-5 rounded-xl border border-green-200 bg-green-50 p-5 text-left sm:p-6">
              {/* WhatsApp Group */}
              <div className="text-center">
                <h3 className="mb-2 text-lg font-bold text-gray-800 sm:text-xl">
                  Join Our WhatsApp Group
                </h3>

                <p className="mb-4 text-base leading-7 text-gray-700">
                  Please join the WhatsApp group for seminar updates and
                  further information.
                </p>

                <a
                  href="YOUR_WHATSAPP_GROUP_LINK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.52 3.48A11.87 11.87 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.11.55 4.17 1.59 5.99L0 24l6.21-1.63a11.9 11.9 0 0 0 5.83 1.48h.01C18.64 23.85 24 18.49 24 11.9a11.83 11.83 0 0 0-3.48-8.42ZM12.05 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.69.97.99-3.6-.23-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.44 4.43-9.87 9.88-9.87a9.8 9.8 0 0 1 6.98 2.89 9.8 9.8 0 0 1 2.89 6.99c0 5.44-4.43 9.87-9.9 9.87Zm5.42-7.39c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.5 1.7.64.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                  </svg>
                  Join WhatsApp Group
                </a>
              </div>

              {/* Contact Information */}

              <div className="border-t border-green-200 pt-4">
                <h3 className="mb-3 text-center text-base font-semibold text-gray-800">
                  For Further Information
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#105c8e]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-14a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>

                      <span className="text-sm font-medium text-gray-700">
                        Mr. Chandrasekar
                      </span>
                    </div>

                    <a
                      href="tel:+919884499443"
                      className="shrink-0 text-sm font-semibold text-[#105c8e] hover:underline"
                    >
                      +91 98844 99443
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#105c8e]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      <span className="text-sm font-medium text-gray-700">
                        CDOE Support
                      </span>
                    </div>

                    <a
                      href="tel:+919940490118"
                      className="shrink-0 text-sm font-semibold text-[#105c8e] hover:underline"
                    >
                      +91 99404 90118
                    </a>
                  </div>
                </div>
              </div>

            </div>

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
            <div className="relative mb-10 mt-10 rounded-2xl border border-[#ead5a5] bg-gradient-to-br from-[#fffaf0] via-white to-[#fffaf0] px-4 pb-4 pt-10 shadow-[0_4px_18px_rgba(67,38,17,0.06)] sm:px-6 sm:pb-5 sm:pt-11">
              {/* Section Heading */}
              <div className="absolute left-4 top-0 -translate-y-1/3 sm:left-6">
                <div className="rounded-xl border border-[#e1bd72] bg-gradient-to-r from-[#e8c783] to-[#f5e4b9] px-4 py-2 shadow-sm sm:px-6">
                  <h4 className="mb-0 whitespace-nowrap text-sm font-extrabold uppercase tracking-wider text-[#432611] sm:text-base">
                    Event Details
                  </h4>
                </div>
              </div>

              {/* Event Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0">
                {/* Date */}
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/70 p-3 sm:rounded-none sm:bg-transparent sm:py-2 sm:pl-0 sm:pr-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ad0928]/[0.07]">
                    <svg
                      className="h-6 w-6 text-[#ad0928]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M7 2v6M17 2v6M3 10h18" />
                      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#29456c]/75">
                      Date
                    </p>
                    <p className="text-sm font-bold leading-5 text-[#b5122c] sm:text-base">
                      Friday, 20 November 2026
                    </p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/70 p-3 sm:rounded-none sm:border-x sm:border-gray-200 sm:bg-transparent sm:px-5 sm:py-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ad0928]/[0.07]">
                    <svg
                      className="h-6 w-6 text-[#ad0928]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#29456c]/75">
                      Venue
                    </p>
                    <p className="text-sm font-bold leading-5 text-[#b5122c] sm:text-base">
                      SRIHER – SRMC Building, Porur
                    </p>
                  </div>
                </div>

                {/* Registration Fee */}
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/70 p-3 sm:rounded-none sm:bg-transparent sm:py-2 sm:pl-5 sm:pr-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ad0928]/[0.07]">
                    <svg
                      className="h-6 w-6 text-[#ad0928]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <ellipse cx="12" cy="5" rx="8" ry="3" />
                      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                      <path d="M4 10c0 1.7 3.6 3 8 3s8-1.3 8-3M4 15c0 1.7 3.6 3 8 3s8-1.3 8-3" />
                    </svg>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#29456c]/75">
                      Registration Fee
                    </p>
                    <p className="text-xl font-extrabold leading-6 text-[#b5122c]">
                      ₹250
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mt-4 border-t border-[#ead5a5] pt-3">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 rounded-xl bg-[#fff7e5] px-3 py-3 sm:px-4">
                  <svg
                    className="h-4 w-4 shrink-0 text-[#ad0928]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.2 18a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7a2 2 0 0 1 1.76 2.04Z" />
                  </svg>

                  <span className="text-sm font-bold text-[#432611]">
                    Contact:
                  </span>

                  <a
                    href="tel:+919940490118"
                    className="text-sm font-semibold text-[#b5122c] transition-colors hover:text-[#7f1022] hover:underline"
                  >
                    +91 99404 90118
                  </a>

                  <span className="text-gray-400">|</span>

                  <a
                    href="tel:+919789989360"
                    className="text-sm font-semibold text-[#b5122c] transition-colors hover:text-[#7f1022] hover:underline"
                  >
                    +91 97899 89360
                  </a>
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
