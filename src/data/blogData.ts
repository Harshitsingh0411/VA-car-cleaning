export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  coverImage: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "top-10-car-maintenance-tips",
    title: "Top 10 Car Maintenance Tips for Longevity",
    excerpt: "Discover the essential car maintenance routines you need to follow to keep your vehicle running smoothly and looking brand new for years.",
    content: `
      <h2>1. Regularly Check Engine Oil</h2>
      <p>Your car's engine is its heart, and oil is its lifeblood. Check your oil levels every month and change it every 5,000 to 7,500 miles.</p>
      
      <h2>2. Keep Tires Properly Inflated</h2>
      <p>Under-inflated tires wear out faster and decrease fuel efficiency. Always adhere to the recommended PSI located on your driver's side door jamb.</p>
      
      <h2>3. Wash and Wax Your Exterior</h2>
      <p>Washing your car removes corrosive dirt, road salt, and bird droppings. Applying a coat of wax or ceramic coating provides a protective barrier against UV damage.</p>
      
      <h2>4. Check and Replace Wipers</h2>
      <p>Visibility is crucial for safety. Replace your windshield wipers every 6-12 months or as soon as they start streaking.</p>
      
      <h2>5. Clean the Interior Regularly</h2>
      <p>Vacuuming the carpets and wiping down the dashboard not only preserves the interior materials but also ensures a hygienic driving environment.</p>
    `,
    date: "2026-07-01",
    author: "VaCar Expert",
    coverImage: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
    tags: ["Maintenance", "Tips", "Car Care"]
  },
  {
    id: "2",
    slug: "benefits-of-ceramic-coating",
    title: "Why Ceramic Coating is the Best Paint Protection",
    excerpt: "Learn how ceramic coating provides a 9H hardness shield against scratches, acid rain, and UV rays while keeping your car glossy.",
    content: `
      <h2>What is Ceramic Coating?</h2>
      <p>Ceramic coating is a liquid polymer applied to the exterior of a vehicle. It chemically bonds with the factory paint, creating a layer of protection.</p>
      
      <h2>The Benefits of Ceramic Coating</h2>
      <ul>
        <li><strong>Protection from UV Damage:</strong> Prevents the paint from oxidizing and fading.</li>
        <li><strong>Protection from Chemical Stains:</strong> Acidic contaminants in the air can't bond to the paint.</li>
        <li><strong>Hydrophobic Nature:</strong> Water beads up and rolls off, taking dirt with it, making washing incredibly easy.</li>
        <li><strong>Candy-Like Gloss:</strong> Enhances the reflective properties of your car's paint and clear coat.</li>
      </ul>
      
      <p>At VaCar Cleaning Service, we provide premium 9H Ceramic Coating directly at your doorstep.</p>
    `,
    date: "2026-07-05",
    author: "VaCar Expert",
    coverImage: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
    tags: ["Ceramic Coating", "Detailing", "Protection"]
  },
  {
    id: "3",
    slug: "monsoon-car-care-guide",
    title: "The Ultimate Monsoon Car Care Guide",
    excerpt: "The rainy season can wreak havoc on your car. Follow these essential tips to protect your vehicle from rust, mold, and breakdowns during the monsoon.",
    content: `
      <h2>1. Check Your Tires</h2>
      <p>Ensure your tires have adequate tread depth. Bald tires lead to hydroplaning on wet roads, which is extremely dangerous.</p>
      
      <h2>2. Inspect Brakes</h2>
      <p>Wet conditions reduce braking efficiency. Have your brake pads and fluids checked before the season starts.</p>
      
      <h2>3. Protect the Undercarriage</h2>
      <p>Mud and water splashed onto the undercarriage can cause rust. An anti-rust coating is highly recommended.</p>
      
      <h2>4. Interior Odor and Mold Prevention</h2>
      <p>Damp clothes and shoes bring moisture inside. Use silica gel packs or an air purifier to keep the cabin dry and odor-free.</p>
    `,
    date: "2026-07-10",
    author: "VaCar Expert",
    coverImage: "https://images.unsplash.com/photo-1515569067071-ec3b51335dd0?auto=format&fit=crop&q=80&w=800",
    tags: ["Monsoon", "Seasonal", "Safety"]
  },
  {
    id: "4",
    slug: "interior-car-cleaning-importance",
    title: "Why Deep Interior Car Cleaning Matters",
    excerpt: "Your car's cabin harbors millions of bacteria. Discover why a professional deep interior dry cleaning is vital for your health and comfort.",
    content: `
      <h2>The Hidden Dangers of a Dirty Cabin</h2>
      <p>Studies show that a car's steering wheel can hold four times more bacteria than a public toilet seat. Spilled food, sweat, and pet dander accumulate over time.</p>
      
      <h2>The Professional Difference</h2>
      <p>While a quick vacuum helps, professional interior detailing involves extracting dirt from deep within the upholstery fibers, steam cleaning vents, and sanitizing touchpoints.</p>
      
      <h2>Preserving Value</h2>
      <p>Regular interior maintenance prevents leather from cracking, plastics from fading, and fabrics from staining permanently, preserving your car's resale value.</p>
    `,
    date: "2026-07-15",
    author: "VaCar Expert",
    coverImage: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=800",
    tags: ["Interior", "Hygiene", "Detailing"]
  },
  {
    id: "5",
    slug: "eco-friendly-car-wash",
    title: "The Rise of the Eco-Friendly Car Wash",
    excerpt: "How modern mobile car washes save hundreds of liters of water per wash while delivering a superior shine.",
    content: `
      <h2>The Problem with Traditional Washes</h2>
      <p>A typical driveway car wash with a hose uses up to 400 liters of water. Even commercial bays use over 150 liters. Furthermore, the runoff, laden with toxic soaps and heavy metals, goes straight into storm drains.</p>
      
      <h2>The Eco-Friendly Solution</h2>
      <p>Modern mobile detailing units use advanced polymer-based solutions that encapsulate dirt, allowing it to be safely wiped away without scratching the paint. This method requires less than 10 liters of water.</p>
      
      <h2>Convenience Meets Conservation</h2>
      <p>By choosing an eco-friendly mobile service like VaCar, you're not only saving time but also actively participating in water conservation efforts.</p>
    `,
    date: "2026-07-18",
    author: "VaCar Expert",
    coverImage: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800",
    tags: ["Eco-friendly", "Sustainability", "Innovation"]
  }
];
