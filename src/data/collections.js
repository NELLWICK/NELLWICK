export const collections = [
  {
    slug: "grooming-essentials",
    title: "Grooming essentials",
    eyebrow: "CARE, MADE SIMPLE",
    description: "Thoughtful tools for making regular coat care feel easier to fit into everyday life.",
    productSlugs: ["nellwick-grooming-brush"],
  },
  {
    slug: "everyday-pet-care",
    title: "Everyday pet care",
    eyebrow: "THE LITTLE EVERYDAY THINGS",
    description: "Useful companions for the small routines and inevitable loose-hair moments of living with pets.",
    productSlugs: ["nellwick-pet-hair-removal-glove"],
  },
];

export function getCollectionBySlug(slug) {
  return collections.find((collection) => collection.slug === slug);
}
