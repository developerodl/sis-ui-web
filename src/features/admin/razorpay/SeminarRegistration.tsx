
import React, { useState } from "react";
import apiClient from "../../../services/ApiClient";

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
  amount: number; // Amount in paise
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

      // Create registration and order on the backend.
      const createResponse =
        await apiClient.post<RegistrationResponse>(
          REGISTER_URL,
          form
        );

      const registration = createResponse.data;

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
            await apiClient.post(VERIFY_URL, {
              registration_id: registration.registration_id,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });

            setMessage(
              "Payment verified successfully. Your seminar registration is complete."
            );
            setForm(initialForm);
          } catch {
            setError(
              "We couldn't confirm your payment yet. Please contact support with your registration ID: " +
                registration.registration_id
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err: unknown) {
      const messageFromApi =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail;

      setError(
        messageFromApi ||
          (err instanceof Error
            ? err.message
            : "Unable to start registration. Please try again.")
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-2xl font-semibold text-[#105c8e]">
          Seminar Registration
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Complete the form below to register for the seminar.
        </p>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-md bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <fieldset>
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
          </fieldset>

          <div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#105c8e] px-4 py-3 font-medium text-white transition hover:bg-[#0b4a73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Register & Pay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SeminarRegistration;
