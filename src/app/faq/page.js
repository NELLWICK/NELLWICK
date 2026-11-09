import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Frequently Asked Questions | NELLWICK",
  description: "Answers to common questions about NELLWICK products, orders and delivery.",
};

export default function FAQPage() {
  return (
    <InfoPage
      eyebrow="A FEW HELPFUL ANSWERS"
      title={<>Good to know.<br />Before you shop.</>}
      description="A growing set of answers about our products and how NELLWICK is preparing to serve you."
      draft
      sections={[
        { title: "What is NELLWICK?", paragraphs: ["NELLWICK is an independent pet-care brand focused on thoughtful grooming and everyday essentials."] },
        { title: "How do I choose a product colour?", paragraphs: ["Open the product page and select one of the available colour options before adding the item to your cart. Availability will be confirmed again when the live stock system is connected."] },
        { title: "Can I change or cancel an order?", paragraphs: ["Ordering is not active yet. The final order-change and cancellation process will be published before checkout is enabled."] },
        { title: "How much does shipping cost and how long does it take?", paragraphs: ["Shipping costs and delivery estimates depend on the confirmed fulfilment route and destination. We will publish the available options before accepting payment; no delivery timeframe is being promised on this preview site."] },
        { title: "How do returns work?", paragraphs: ["The final returns and refund policy is still being prepared. Please review the published policy after it is completed and before placing an order."] },
        { title: "How can I track my order?", paragraphs: ["The tracking page is currently a preview. Live tracking will become available after the order and fulfilment systems are connected."] },
      ]}
    />
  );
}
