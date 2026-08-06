import React from "react";

/**
 * Generates a cartoon profile picture URL.
 * Uses DiceBear's cartoon avataaars avatar API based on user's name/email/uid seed.
 */
export function getCartoonAvatar(seed?: string | null): string {
  const identifier = seed && seed.trim() ? seed.trim() : `cartoon-user-${Math.floor(Math.random() * 10000)}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(identifier)}`;
}

/**
 * Smart Avatar helper:
 * 1. Uses user's Google Gmail photo (photoURL/photo) if available.
 * 2. Otherwise detects gender from name/email and returns tailored cartoon avatar.
 */
export function getUserAvatar(user?: { photoURL?: string; photo?: string; name?: string; email?: string } | null, fallbackSeed?: string): string {
  if (user?.photoURL && user.photoURL.trim()) return user.photoURL;
  if (user?.photo && user.photo.trim()) return user.photo;

  const nameOrEmail = ((user?.name || "") + " " + (user?.email || "") + " " + (fallbackSeed || "")).toLowerCase();

  const femaleKeywords = [
    "priya", "pooja", "neha", "bandana", "shreya", "ananya", "divya", "simran",
    "sneha", "sakshi", "kavita", "sunita", "aarti", "priyanka", "swati", "megha",
    "ritu", "sharda", "sheetal", "renu", "sonam", "radhika", "kavya", "nisha",
    "anjali", "chhavi", "reena", "pinky", "tanya", "tanvi", "monika", "archana",
    "bhavna", "drishti", "ishita", "jyoti", "khushi", "laxmi", "manju", "naina",
    "payal", "rachel", "sarita", "twinkle", "uma", "vaishnavi", "yashika", "zoya",
    "female", "girl", "woman", "mrs", "miss", "lady"
  ];

  const isFemale = femaleKeywords.some((kw) => nameOrEmail.includes(kw));
  const seed = (user?.name || user?.email || fallbackSeed || "user").trim();

  if (isFemale) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=longHair,straight01,straight02,curly,dreads,frizzle,wavy&hairColor=black,brown,blonde`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=shortHair,shortRound,shortWaved,shortFlat,sides,theCaesar&hairColor=black,brown`;
}

/**
 * Clean inline cartoon avatar SVG (Data URL) as fallback when external images fail to load.
 */
export const FALLBACK_CARTOON_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120">
  <rect width="100" height="100" rx="50" fill="#3B82F6"/>
  <!-- Hair -->
  <path d="M 25 38 C 25 15, 75 15, 75 38 C 75 25, 25 25, 25 38 Z" fill="#1E293B"/>
  <!-- Face -->
  <circle cx="50" cy="45" r="24" fill="#FFD180"/>
  <!-- Eyes -->
  <circle cx="41" cy="42" r="3.5" fill="#0F172A"/>
  <circle cx="59" cy="42" r="3.5" fill="#0F172A"/>
  <circle cx="42" cy="40.5" r="1" fill="#FFFFFF"/>
  <circle cx="60" cy="40.5" r="1" fill="#FFFFFF"/>
  <!-- Cheeks -->
  <circle cx="36" cy="48" r="3" fill="#F43F5E" opacity="0.3"/>
  <circle cx="64" cy="48" r="3" fill="#F43F5E" opacity="0.3"/>
  <!-- Smile -->
  <path d="M 42 52 Q 50 60 58 52" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- Clothes -->
  <path d="M 20 92 C 25 70, 75 70, 80 92 Z" fill="#1D4ED8"/>
  <path d="M 44 70 L 50 78 L 56 70 Z" fill="#FFFFFF"/>
</svg>
`)}`;

/**
 * React onError handler for <img> elements to replace broken images with a cartoon avatar.
 */
export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement, Event>, seed?: string | null) {
  const target = e.currentTarget;
  const cartoonUrl = getCartoonAvatar(seed || "user");
  if (target.src !== cartoonUrl && !target.src.startsWith("data:image/svg+xml")) {
    target.src = cartoonUrl;
  } else {
    target.src = FALLBACK_CARTOON_AVATAR;
  }
}
