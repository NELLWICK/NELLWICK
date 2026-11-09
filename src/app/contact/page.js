import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Contact | NELLWICK",
  description: "Find out how to get in touch with NELLWICK.",
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="WE ARE HERE TO HELP"
      title={<>A question?<br />Let's make it easy.</>}
      description="Whether you have a question about a product, an order or the store, we want your experience with NELLWICK to feel straightforward."
      draft
      sections={[
        { title: "Customer support", paragraphs: ["Our customer-support email address and contact process will be published here before the store opens for orders. We will not display an unmonitored or unverified contact address."] },
        { title: "Order questions", paragraphs: ["When ordering is enabled, please have your order number ready when contacting support. Never send full card details, passwords or other sensitive payment information by email."] },
        { title: "Before launch", paragraphs: ["The contact channel is not connected yet. Please do not treat this page as a working message form or assume a message has been received."] },
      ]}
    />
  );
}
