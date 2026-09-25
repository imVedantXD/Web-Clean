import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ---------------------------------- Enums --------------------------------- */

export const campaignCategoryEnum = pgEnum("campaign_category", [
  "senior-care",
  "food-relief",
  "cleanup",
  "education",
  "health",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "active",
  "completed",
  "cancelled",
]);

/* ---------------------------------- Users --------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    avatarUrl: text("avatar_url"),
    city: varchar("city", { length: 120 }),
    bio: text("bio"),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    userAgent: text("user_agent"),
    ip: varchar("ip", { length: 64 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("sessions_token_unique").on(t.tokenHash), index("sessions_user_idx").on(t.userId)]
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 30 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("oauth_provider_account_unique").on(t.provider, t.providerAccountId)]
);

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    codeHash: varchar("code_hash", { length: 64 }).notNull(),
    purpose: varchar("purpose", { length: 30 }).notNull().default("signup"),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("verification_email_idx").on(t.email)]
);

/* -------------------------------- Volunteers ------------------------------- */

export const volunteerProfiles = pgTable(
  "volunteer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    city: varchar("city", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    interests: text("interests").array().notNull().default([]),
    availability: varchar("availability", { length: 120 }).notNull(),
    bio: text("bio"),
    hoursLogged: integer("hours_logged").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("volunteer_user_unique").on(t.userId)]
);

/* -------------------------------- Campaigns -------------------------------- */

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: varchar("summary", { length: 300 }).notNull(),
    description: text("description").notNull(),
    category: campaignCategoryEnum("category").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    imageUrl: text("image_url").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }),
    volunteersNeeded: integer("volunteers_needed").notNull().default(20),
    status: campaignStatusEnum("status").notNull().default("active"),
    organizerId: uuid("organizer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("campaigns_slug_unique").on(t.slug),
    index("campaigns_category_idx").on(t.category),
    index("campaigns_city_idx").on(t.city),
    index("campaigns_start_idx").on(t.startAt),
  ]
);

export const campaignSignups = pgTable(
  "campaign_signups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: varchar("status", { length: 20 }).notNull().default("joined"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("signup_campaign_user_unique").on(t.campaignId, t.userId),
    index("signup_user_idx").on(t.userId),
  ]
);

/* --------------------------------- Contact --------------------------------- */

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("newsletter_email_unique").on(t.email)]
);

/* -------------------------------- Relations -------------------------------- */

export const usersRelations = relations(users, ({ many, one }) => ({
  campaigns: many(campaigns),
  signups: many(campaignSignups),
  volunteerProfile: one(volunteerProfiles, {
    fields: [users.id],
    references: [volunteerProfiles.userId],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  organizer: one(users, {
    fields: [campaigns.organizerId],
    references: [users.id],
  }),
  signups: many(campaignSignups),
}));

export const campaignSignupsRelations = relations(campaignSignups, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSignups.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, { fields: [campaignSignups.userId], references: [users.id] }),
}));

/* ---------------------------------- Types ---------------------------------- */

export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;
