import InfoPage from "@/components/InfoPage";

export const metadata = {
  title: "Our Story | NELLWICK",
  description: "The thinking behind NELLWICK and our approach to everyday pet care.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="A LITTLE ABOUT US"
      title={<>For the moments<br />that make them family.</>}
      description="Life with pets is made up of ordinary moments that never feel quite ordinary. NELLWICK is being built around the small things that make caring for them feel more considered."
      sections={[
        { title: "A thoughtful beginning", paragraphs: ["NELLWICK began with a simple idea: everyday pet-care essentials should be useful, considered and easy to live with.", "We are starting with a focused range of grooming and care products rather than filling a shop with things that do not need to be there."] },
        { title: "Useful over unnecessary", paragraphs: ["We look for products that have a clear purpose in a real pet owner's routine. The details matter: how something is used, how easy it is to care for, and whether it genuinely earns its place at home."] },
        { title: "Growing with care", paragraphs: ["NELLWICK is an evolving independent brand. As the collection grows, our aim is to keep the same thoughtful approach: clear product information, honest service details and a better everyday experience for pets and the people who love them."] },
      ]}
    />
  );
}
