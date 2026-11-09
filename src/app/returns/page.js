import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Returns and Refunds | NELLWICK",
  description: "Returns and refund information for NELLWICK customers.",
};

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="RETURNS & REFUNDS"
      title={<>We believe in<br />clear expectations.</>}
      description="A fair returns experience starts with a policy that is easy to understand. We are finalising the details before taking orders."
      draft
      sections={[
        { title: "Return eligibility", paragraphs: ["The return window, eligible product conditions and any exclusions have not yet been approved. These details will be stated clearly before checkout becomes available."] },
        { title: "Damaged, incorrect or missing items", paragraphs: ["We are preparing a process for reporting an item that arrives damaged, incorrect or incomplete. The final instructions and evidence requirements will be published before launch."] },
        { title: "Refunds", paragraphs: ["Refund timing, payment-method handling and any applicable deductions will be confirmed in the final policy. No refund timeframe is promised by this draft page."] },
        { title: "How to request help", paragraphs: ["Our verified customer-support contact details will appear on the Contact page before ordering is enabled."] },
      ]}
    />
  );
}
