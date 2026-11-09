import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Terms and Conditions | NELLWICK",
  description: "Draft terms for using the NELLWICK website and store.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="THE IMPORTANT DETAILS"
      title={<>Simple terms.<br />Clear expectations.</>}
      description="These are the topics that will form our store terms. This draft is not ready to govern customer purchases."
      draft
      sections={[
        { title: "About the store", paragraphs: ["The final terms will identify the legal entity operating NELLWICK, its registered or business address, governing law and contact details."] },
        { title: "Product information and pricing", paragraphs: ["Product descriptions, images, prices, availability and any applicable taxes will be presented as accurately as possible. The final terms will explain how pricing and order errors are handled."] },
        { title: "Orders and payment", paragraphs: ["An order process, payment authorisation and order-acceptance rules will be published after the payment integration has been implemented and tested. This preview does not accept orders or payments."] },
        { title: "Delivery, returns and liability", paragraphs: ["The final terms will link to the approved shipping, returns and refund policies and will explain applicable consumer rights and limitations in the relevant markets."] },
        { title: "Updates and effective date", paragraphs: ["A final version date and legally reviewed terms must be added before this page is published as binding store terms."] },
      ]}
    />
  );
}
