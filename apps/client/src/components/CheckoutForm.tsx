"use client";

import { ShippingFormInputs } from "@repo/types";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function CheckoutForm({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/order/success`,
        payment_method_data: {
          billing_details: {
            name: shippingForm.name,
            address: {
              line1: shippingForm.address,
              city: shippingForm.city,
              postal_code: "",
              country: "",
            },
          },
        },
      },
    });

    if (error) setError(error.message ?? "An unexpected error occurred.");
    setLoading(false);
    return;
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
}
