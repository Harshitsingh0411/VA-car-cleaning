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
  { name: "Indira Nagar", slug: "indira-nagar", type: "locality" },
  { name: "Panki", slug: "panki", type: "locality" },
  { name: "Moti Jheel", slug: "moti-jheel", type: "locality" },
  { name: "Saket Nagar", slug: "saket-nagar", type: "locality" },
  { name: "Kaushal Puri", slug: "kaushal-puri", type: "locality" },
  { name: "Harsh Nagar", slug: "harsh-nagar", type: "locality" },
  { name: "Navsheel Dham", slug: "navsheel-dham", type: "locality" },
  { name: "Awas Vikas", slug: "awas-vikas", type: "locality" },
  { name: "Yashoda Nagar", slug: "yashoda-nagar", type: "locality" },
  { name: "Bithoor", slug: "bithoor", type: "locality" },
  { name: "Keshav Puram", slug: "keshav-puram", type: "locality" },
  { name: "Kamla Nagar", slug: "kamla-nagar", type: "locality" },
  { name: "Gadiyana", slug: "gadiyana", type: "locality" },
  { name: "Shivpuri", slug: "shivpuri", type: "locality" },
  { name: "Rawatpur", slug: "rawatpur", type: "locality" },
  { name: "Naubasta", slug: "naubasta", type: "locality" },
  { name: "Juhi", slug: "juhi", type: "locality" },
  { name: "Ashok Nagar", slug: "ashok-nagar", type: "locality" },
  { name: "Gumti", slug: "gumti", type: "locality" },
  { name: "Jajmau", slug: "jajmau", type: "locality" },
  { name: "Chakeri", slug: "chakeri", type: "locality" },
  { name: "Nawabganj", slug: "nawabganj", type: "locality" }
];

export const seoServices: Array<{ name: string; slug: string; description: string; price: string; image: string }> = [];
