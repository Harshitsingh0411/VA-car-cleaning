// Data dictionary for dynamic SEO landing pages

// Data dictionary for dynamic SEO landing pages

export interface SeoLocation {
  name: string;
  slug: string;
  type: "locality" | "city";
  description?: string;
}

export const seoLocations: SeoLocation[] = [
  // User Requested Kanpur Localities
  { name: "Kakadeo", slug: "kakadeo", type: "locality" },
  { name: "Kidwai Nagar", slug: "kidwai-nagar", type: "locality" },
  { name: "Barra", slug: "barra", type: "locality" },
  { name: "Govind Nagar", slug: "govind-nagar", type: "locality" },
  { name: "Swaroop Nagar", slug: "swaroop-nagar", type: "locality" },
  { name: "Kalyanpur", slug: "kalyanpur", type: "locality" },
  { name: "Shyam Nagar", slug: "shyam-nagar", type: "locality" },
  { name: "Civil Lines", slug: "civil-lines", type: "locality" },
  { name: "Tilak Nagar", slug: "tilak-nagar", type: "locality" },
  { name: "Arya Nagar", slug: "arya-nagar", type: "locality" },
  { name: "Azad Nagar", slug: "azad-nagar", type: "locality" },
  { name: "Ratan Lal Nagar", slug: "ratan-lal-nagar", type: "locality" },
  { name: "Indiranagar", slug: "indiranagar", type: "locality" },
  { name: "Indira Nagar", slug: "indira-nagar", type: "locality" },
  { name: "Panki", slug: "panki", type: "locality" },
  { name: "Moti Jheel", slug: "moti-jheel", type: "locality" },
  { name: "Saket Nagar", slug: "saket-nagar", type: "locality" },
  { name: "Kaushal Puri", slug: "kaushal-puri", type: "locality" },
  { name: "Harsh Nagar", slug: "harsh-nagar", type: "locality" },
  { name: "Navsheel Dham", slug: "navsheel-dham", type: "locality" },
  { name: "Awas Vikas", slug: "awas-vikas", type: "locality" },
  { name: "Yashoda Nagar", slug: "yashoda-nagar", type: "locality" },
  { name: "Rawatpur", slug: "rawatpur", type: "locality" },
  { name: "Naubasta", slug: "naubasta", type: "locality" },
  { name: "Bithoor", slug: "bithoor", type: "locality" },
  { name: "Keshav Puram", slug: "keshav-puram", type: "locality" },
  { name: "Kamla Nagar", slug: "kamla-nagar", type: "locality" },
  { name: "Swarupnagar", slug: "swarupnagar", type: "locality" },
  { name: "Gadiyana", slug: "gadiyana", type: "locality" },
  { name: "Shivpuri", slug: "shivpuri", type: "locality" },

  // Additional Kanpur Localities
  { name: "Juhi", slug: "juhi", type: "locality" },
  { name: "Ashok Nagar", slug: "ashok-nagar", type: "locality" },
  { name: "Gumti", slug: "gumti", type: "locality" },
  { name: "Jajmau", slug: "jajmau", type: "locality" },
  { name: "Chakeri", slug: "chakeri", type: "locality" },
  { name: "Nawabganj", slug: "nawabganj", type: "locality" }
];

export const seoServices: Array<{ name: string; slug: string; description: string; price: string; image: string }> = [
  {
    name: "Foam Car Wash",
    slug: "foam-car-wash",
    description: "Deep exterior pressure wash with pH-neutral snow foam & streak-free glass cleaning at your doorstep.",
    price: "499",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Interior Deep Cleaning",
    slug: "interior-deep-cleaning",
    description: "Complete interior vacuuming, upholstery steam cleaning, dashboard conditioning & odor elimination.",
    price: "999",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Full Car Detailing",
    slug: "full-car-detailing",
    description: "Comprehensive package including foam wash, interior deep clean, tire shine & liquid wax coat.",
    price: "1499",
    image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Ceramic Coating",
    slug: "ceramic-coating",
    description: "High-grade nano-ceramic shield offering multi-year paint protection, hydrophobic gloss & UV shield.",
    price: "4999",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Bike Wash & Polish",
    slug: "bike-wash-polish",
    description: "Specialized pressure wash for two-wheelers with engine degreasing, chain lubrication & body wax polish.",
    price: "199",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Monthly Car Wash Subscription",
    slug: "monthly-subscription",
    description: "Hassle-free daily/weekly doorstep car cleaning subscription with dedicated technician.",
    price: "1299",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
  }
];

