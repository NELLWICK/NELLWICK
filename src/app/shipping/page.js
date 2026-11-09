import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Shipping Information | NELLWICK",
  description: "Shipping information for NELLWICK orders.",
};

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="DELIVERY INFORMATION"
      title={<>A clear journey<br />from us to you.</>}
      description="We want delivery details to be clear before you place an order. The final shipping options will be shown here once our fulfilment routes have been verified."
      draft
      sections={[
        { title: "Where we ship", paragraphs: ["Our initial launch focus is the United States, followed by the United Kingdom. The destinations we can actually serve will be confirmed before checkout is enabled."] },
        { title: "Dispatch and delivery estimates", paragraphs: ["Dispatch location, processing time and carrier delivery estimates have not yet been independently confirmed for every product and destination. We will not publish a guaranteed delivery window until those details are verified."] },
        { title: "Shipping charges and tracking", paragraphs: ["Any shipping charge and available tracking details will be displayed before payment. Final charges may depend on the destination and selected fulfilment route."] },
        { title: "Address accuracy", paragraphs: ["Customers will be responsible for entering a complete and accurate delivery address. The final process for correcting an address after an order is placed will be published before launch."] },
      ]}
    />
  );
}
