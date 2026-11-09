/**
 * NELLWICK product catalogue.
 * Add direct image links and product video links here.
 * videoType: "mp4", "youtube" or "vimeo".
 */
export const products = [
  {
    id: "NWL-PET-001",
    slug: "nellwick-grooming-brush",
    name: "NELLWICK Self-Cleaning Grooming Brush",
    shortName: "Self-Cleaning Grooming Brush",
    category: "Grooming essentials",
    price: 19.95,
    currency: "USD",
    featured: true,
    shortDescription: "A more thoughtful way to make regular coat care part of your pet's routine.",
    description: "Keep grooming simple with the NELLWICK Self-Cleaning Grooming Brush. Designed for regular coat care, it helps lift loose hair while making the grooming routine easier to manage.",
    highlights: [
      "Designed for regular coat care",
      "Self-cleaning brush design",
      "Helps lift loose and collected hair",
      "Available in two colours",
    ],
    variants: [
      { id: "NWL-PET-001-GRY", label: "Gray", color: "#858B8A", available: true },
      { id: "NWL-PET-001-BLU", label: "Blue", color: "#477DAA", available: true },
    ],
    imageUrls: [],
    videoUrl: "",
    videoType: "mp4",
    imageAlt: "NELLWICK self-cleaning pet grooming brush",
    seo: {
      title: "Self-Cleaning Pet Grooming Brush | NELLWICK",
      description: "Discover the NELLWICK Self-Cleaning Grooming Brush, designed to make everyday pet coat care easier.",
    },
  },
  {
    id: "NWL-PET-002",
    slug: "nellwick-pet-hair-removal-glove",
    name: "NELLWICK Pet Hair-Removal Glove",
    shortName: "Pet Hair-Removal Glove",
    category: "Everyday pet care",
    price: 19.95,
    currency: "USD",
    featured: true,
    shortDescription: "An easy-to-use grooming companion for everyday loose-hair cleanup.",
    description: "Make everyday pet care a little easier with the NELLWICK Pet Hair-Removal Glove. Its reusable glove design helps collect loose hair during grooming and everyday cleanup.",
    highlights: [
      "Reusable grooming glove design",
      "Helps collect loose pet hair",
      "Useful for everyday pet-care routines",
      "Available in black",
    ],
    variants: [
      { id: "NWL-PET-002-BLK", label: "Black", color: "#252928", available: true },
    ],
    imageUrls: [],
    videoUrl: "",
    videoType: "mp4",
    imageAlt: "NELLWICK reusable pet hair-removal glove",
    seo: {
      title: "Reusable Pet Hair-Removal Glove | NELLWICK",
      description: "Explore the NELLWICK Pet Hair-Removal Glove, a reusable companion for everyday grooming and loose-hair cleanup.",
    },
  },
];

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}
