import Link from "next/link";

const ReturnPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent: string }> | undefined;
}) => {
  const payment_intent_id = (await searchParams)?.payment_intent;

  if (!payment_intent_id) {
    return <div>No session id found!</div>;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/${payment_intent_id}`
  );
  const data = await res.json();

  return (
    <div className="">
      <h1>
        Payment: {"$" + (data.amount / 100).toFixed(2) + " " + data.currency}
      </h1>
      <p>Payment status: {data.status}</p>
      <Link href="/orders">See your orders</Link>
    </div>
  );
};

export default ReturnPage;
