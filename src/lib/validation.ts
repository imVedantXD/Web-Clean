import { z } from "zod";

export const CATEGORIES = [
  "senior-care",
  "food-relief",
  "cleanup",
  "education",
  "health",
] as const;

export const AVAILABILITY = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekends",
  "Flexible / remote",
] as const;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(255);

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email,
  password,
});

export const signinSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const verifySchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const campaignSchema = z.object({
  title: z.string().trim().min(6, "Title needs at least 6 characters").max(160),
  summary: z
    .string()
    .trim()
    .min(20, "Summary needs at least 20 characters")
    .max(300),
  description: z
    .string()
    .trim()
    .min(50, "Please describe the drive in at least 50 characters")
    .max(5000),
  category: z.enum(CATEGORIES),
  city: z.string().trim().min(2, "Enter the city").max(120),
  location: z.string().trim().min(3, "Enter the venue / area").max(255),
  startAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Pick a valid start date & time",
  }),
  endAt: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      message: "Pick a valid end date & time",
    }),
  volunteersNeeded: z.coerce.number().int().min(1).max(5000),
  imageKey: z.enum(CATEGORIES),
});

export const volunteerSchema = z.object({
  city: z.string().trim().min(2, "Enter your city").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+0-9][0-9\s-]{7,19}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  interests: z.array(z.enum(CATEGORIES)).min(1, "Pick at least one cause").max(5),
  availability: z.enum(AVAILABILITY),
  bio: z.string().trim().max(600, "Keep it under 600 characters").optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email,
  subject: z.string().trim().min(4, "Enter a subject").max(200),
  message: z.string().trim().min(10, "Message is too short").max(3000),
});

export const newsletterSchema = z.object({ email });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  city: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600, "Keep it under 600 characters").optional(),
});
