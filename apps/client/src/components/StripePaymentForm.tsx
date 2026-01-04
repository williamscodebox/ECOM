"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ShippingFormInputs } from "@repo/types";
import useCartStore from "@/stores/cartStore";
import CheckoutForm from "./CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";

const stripe = loadStripe(
  "pk_test_51QunjMRooq0PhrP732KqMZpEWJlGKRk0h8177o4WQDHqG4GiWxGQQAnSEp1LJbyX2PwdY9oNQhvUpkffbEHgl6aJ00VnjlTE8H"
);

// const fetchClientSecret = async (cart: CartItemsType, token: string) => {
//   return fetch(
//     `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
//     {
//       method: "POST",
//       body: JSON.stringify({
//         cart,
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//     .then((response) => response.json())
//     .then((json) => json.checkoutSessionClientSecret);
// };

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    (async () => {
      const token = await getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart }),
        }
      );
      const json = await res.json();
      setClientSecret(json.clientSecret ?? null);
    })();
  }, [cart, getToken]);

  if (!clientSecret) {
    return <div className="">Loading...</div>;
  }

  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </Elements>
  );
};

export default StripePaymentForm;
