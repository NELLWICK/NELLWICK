import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Privacy Policy | NELLWICK",
  description: "Draft privacy information for the NELLWICK website.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="YOUR INFORMATION"
      title={<>Privacy matters.<br />So should clarity.</>}
      description="This page outlines the topics our final privacy notice will cover. It is a pre-launch draft, not a complete legal privacy policy."
      draft
      sections={[
        { title: "Information we may collect", paragraphs: ["When the store is operational, information may be collected to process orders, provide customer support, prevent fraud and operate the website. The final notice will identify the exact information collected and the purposes for each use."] },
        { title: "Payments", paragraphs: ["Payment details should be handled by the selected payment provider. The final policy will explain the provider's role and what payment-related information NELLWICK receives. Do not enter payment details on this preview site."] },
        { title: "Cookies and analytics", paragraphs: ["The final notice will describe essential cookies, analytics tools, advertising or measurement technologies if used, and the choices available to visitors."] },
        { title: "Sharing, retention and your choices", paragraphs: ["The final policy will identify service providers that process information, explain retention periods and describe applicable access, correction or deletion requests."] },
        { title: "Business details and contact", paragraphs: ["The legal business identity, jurisdiction, effective date and verified privacy contact must be added before this policy is published as final."] },
      ]}
    />
  );
}
