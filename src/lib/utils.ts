import type { LucideIcon } from "lucide-react";
import {
  HeartHandshake,
  Utensils,
  Sparkles,
  GraduationCap,
  Stethoscope,
} from "lucide-react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const SITE = {
  name: "Sahayata Web",
  tagline: "Seva, made simple.",
  description:
    "Sahayata Web connects local volunteers with real community needs — senior citizen care, food donation, neighbourhood cleanups, education and health drives across India. Join a campaign near you and be the change.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  creator: "Vedant Pandey · Class IX",
  keywords: [
    "volunteer platform India",
    "community service",
    "senior citizen care volunteers",
    "food donation near me",
    "neighbourhood cleanup drive",
    "NGO volunteering India",
    "Digital India",
    "social good platform",
    "Sahayata",
    "seva",
    "help community",
  ],
};

export type CategoryId =
  | "senior-care"
  | "food-relief"
  | "cleanup"
  | "education"
  | "health";

export const CATEGORY_META: Record<
  CategoryId,
  {
    label: string;
    tagline: string;
    icon: LucideIcon;
    image: string;
    gradient: string;
    chip: string;
  }
> = {
  "senior-care": {
    label: "Senior Citizen Care",
    tagline: "Companionship, errands & dignity for our elders",
    icon: HeartHandshake,
    image: "/images/campaigns/senior-care.svg",
    gradient: "from-rose-500/80 to-orange-400/80",
    chip: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  },
  "food-relief": {
    label: "Food Donation",
    tagline: "Meals, ration kits & zero-hunger communities",
    icon: Utensils,
    image: "/images/campaigns/food-relief.svg",
    gradient: "from-amber-500/80 to-yellow-400/80",
    chip: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
  cleanup: {
    label: "Neighbourhood Cleanup",
    tagline: "Cleaner streets, parks, lakes & public spaces",
    icon: Sparkles,
    image: "/images/campaigns/cleanup.svg",
    gradient: "from-emerald-500/80 to-teal-400/80",
    chip: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  },
  education: {
    label: "Education & Mentorship",
    tagline: "Tutoring, digital literacy & career guidance",
    icon: GraduationCap,
    image: "/images/campaigns/education.svg",
    gradient: "from-sky-500/80 to-indigo-400/80",
    chip: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  },
  health: {
    label: "Health & Wellness",
    tagline: "Health camps, blood donation & awareness",
    icon: Stethoscope,
    image: "/images/campaigns/health.svg",
    gradient: "from-violet-500/80 to-fuchsia-400/80",
    chip: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  },
};

export function isCategory(v: string): v is CategoryId {
  return v in CATEGORY_META;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact" }).format(n);
}

/** Strip characters that could be dangerous if ever rendered raw. */
export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, "").replace(/\s+\n/g, "\n").trim();
}
