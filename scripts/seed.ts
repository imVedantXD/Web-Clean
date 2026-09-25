/**
 * Seeds the database with authentic initial content for Sahayata Web —
 * an organizer account, volunteer profiles, live campaigns and signups.
 * Idempotent: exits early if campaigns already exist.
 *
 * Run: npx --yes tsx scripts/seed.ts
 */
import "dotenv/config";
import { scryptSync, randomBytes } from "crypto";
import { db } from "../src/db";
import {
  campaigns,
  campaignSignups,
  users,
  volunteerProfiles,
} from "../src/db/schema";
import { count } from "drizzle-orm";

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const N = 16384;
  const derived = scryptSync(password, salt, 64, { N, r: 8, p: 1 });
  return `scrypt$${N}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const day = 24 * 60 * 60 * 1000;
const at = (daysAhead: number, hour = 10) => {
  const d = new Date(Date.now() + daysAhead * day);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  const existing = await db.select({ n: count() }).from(campaigns);
  if ((existing[0]?.n ?? 0) > 0) {
    console.log("Seed skipped — campaigns already exist.");
    return;
  }

  /* ------------------------------ Organizer ------------------------------ */
  const [organizer] = await db
    .insert(users)
    .values({
      name: "Sahayata Foundation",
      email: "hello@sahayataweb.in",
      passwordHash: hashPassword(randomBytes(24).toString("hex")),
      role: "organizer",
      city: "Jaipur",
      bio: "The founding organizer team of Sahayata Web — seeds and stewards community drives across India.",
      emailVerifiedAt: new Date(),
    })
    .returning();

  /* ------------------------------ Volunteers ----------------------------- */
  const volunteerSeeds = [
    { name: "Aarav Sharma", city: "Jaipur", interests: ["cleanup", "education"], hours: 26 },
    { name: "Diya Patel", city: "Mumbai", interests: ["food-relief", "senior-care"], hours: 31 },
    { name: "Kabir Singh", city: "Delhi", interests: ["cleanup", "health"], hours: 18 },
    { name: "Ananya Iyer", city: "Bengaluru", interests: ["education", "health"], hours: 42 },
    { name: "Rohan Mehta", city: "Pune", interests: ["senior-care", "cleanup"], hours: 12 },
    { name: "Meera Nair", city: "Bengaluru", interests: ["food-relief", "education"], hours: 37 },
    { name: "Arjun Verma", city: "Delhi", interests: ["food-relief", "cleanup"], hours: 22 },
    { name: "Ishita Rao", city: "Mumbai", interests: ["health", "senior-care"], hours: 29 },
  ] as const;

  const volunteerIds: string[] = [];
  for (const v of volunteerSeeds) {
    const email = `${v.name.toLowerCase().replace(/\s+/g, ".")}@volunteer.sahayataweb.in`;
    const [u] = await db
      .insert(users)
      .values({
        name: v.name,
        email,
        passwordHash: hashPassword(randomBytes(24).toString("hex")),
        role: "volunteer",
        city: v.city,
        emailVerifiedAt: new Date(),
      })
      .returning();
    volunteerIds.push(u.id);

    await db.insert(volunteerProfiles).values({
      userId: u.id,
      city: v.city,
      interests: [...v.interests],
      availability: "Weekends",
      bio: "Community volunteer on Sahayata Web.",
      hoursLogged: v.hours,
    });
  }

  /* ------------------------------ Campaigns ------------------------------ */
  type Cat =
    | "senior-care"
    | "food-relief"
    | "cleanup"
    | "education"
    | "health";

  const campaignSeeds: Array<{
    slug: string;
    title: string;
    category: Cat;
    city: string;
    location: string;
    summary: string;
    description: string;
    needed: number;
    offset: number;
    durationH: number;
  }> = [
    {
      slug: "sunday-community-kitchen-500-meal-challenge",
      title: "Sunday Community Kitchen: 500-Meal Challenge",
      category: "food-relief",
      city: "Delhi",
      location: "Community Hall, Lajpat Nagar II",
      summary:
        "Cook, pack and distribute 500 fresh meals for daily-wage workers and homeless neighbours around Lajpat Nagar this Sunday morning.",
      description:
        "Hunger doesn't take weekends off, and neither do we. Join our volunteer kitchen crew to prepare dal-chawal, sabzi and rotis, pack them hygienically, and run three distribution points across the neighbourhood.\n\nNo cooking experience needed — we need choppers, packers, route runners and smile-givers equally. Aprons, gloves and training provided on arrival. Please carry a water bottle and wear closed shoes.\n\nGoal: 500 meals by 2 PM. Bring a friend; leave a hero.",
      needed: 25,
      offset: 3,
      durationH: 6,
    },
    {
      slug: "weekend-companionship-for-elders",
      title: "Weekend Companionship for Elders",
      category: "senior-care",
      city: "Pune",
      location: "Sarthi Senior Living, Kothrud",
      summary:
        "Spend a Saturday afternoon reading newspapers, playing carrom, teaching WhatsApp basics and simply listening to our elders' incredible stories.",
      description:
        "Many residents at Sarthi Senior Living go weeks without visitors. Your presence alone is the gift — but we'll also help them write letters, set up video calls with grandchildren, mend small items and take slow garden walks.\n\nBring patience and warmth; the home provides everything else. Verified volunteers aged 15+ welcome (minors accompanied by a guardian).\n\nTimings are gentle: arrive 3 PM, wrap by 6 PM, chai with the residents included.",
      needed: 15,
      offset: 4,
      durationH: 3,
    },
    {
      slug: "mithi-river-bank-cleanup-drive",
      title: "Mithi River Bank Cleanup Drive",
      category: "cleanup",
      city: "Mumbai",
      location: "Mahim Nature Park entrance",
      summary:
        "Two hours, one river bank, a mountain of plastic removed. Join Mumbai's most satisfying morning workout — gloves, bags and glory provided.",
      description:
        "The Mithi deserves better. In this drive we'll clear the stretch near Mahim Nature Park, segregate recyclables on the spot, and log our haul for the city dashboard.\n\nWear full sleeves and shoes you don't love. We provide gloves, pickers, garbage bags, drinking water and a truly satisfying before-and-after photo.\n\nMonsoon season makes every kilo we pull out count double — it stays out of the sea.",
      needed: 40,
      offset: 6,
      durationH: 4,
    },
    {
      slug: "after-school-math-circle-class-8",
      title: "After-School Math Circle for Class 8",
      category: "education",
      city: "Mumbai",
      location: "Municipal School No. 4, Andheri West",
      summary:
        "Turn fear of fractions into fist-bumps. Tutor Class 8 students in fun, activity-based math sessions twice a week this month.",
      description:
        "We're building a circle of patient volunteers to teach maths through games, puzzles and real-life problems — no boring lectures. Teaching material and a quick orientation are provided; you bring enthusiasm and basic Class 8 math confidence.\n\nCommitment: any 2 evenings per week, 5–7 PM, for one month. College students and working professionals both welcome.\n\nWatch a kid go from 'maths is scary' to 'didi, one more puzzle!' — it's addictive.",
      needed: 10,
      offset: 7,
      durationH: 2,
    },
    {
      slug: "digital-literacy-bootcamp-for-elders",
      title: "Digital Literacy Bootcamp for Grandparents",
      category: "education",
      city: "Jaipur",
      location: "Central Library, C-Scheme",
      summary:
        "Teach smartphones to the smartest generation — UPI payments, video calls with grandkids, and spotting online scams, patient one-on-one sessions.",
      description:
        "Digital India should include everyone — especially the generation that built this city with their hands. In this bootcamp, each volunteer adopts 2–3 elders for the afternoon and walks them through the smartphone basics they actually want: WhatsApp video calls, UPI, Google Maps and spotting fraud messages.\n\nWe provide printed, large-font cheat sheets in Hindi and English. You provide patience and encouragement.\n\nLast bootcamp, 74-year-old Shanti ji sent her first video call to her grandson in Toronto. There were tears. Good ones.",
      needed: 12,
      offset: 9,
      durationH: 4,
    },
    {
      slug: "free-health-checkup-camp-whitefield",
      title: "Free Health Checkup Camp — Whitefield",
      category: "health",
      city: "Bengaluru",
      location: "Community Ground, Whitefield",
      summary:
        "Assist doctors at a free BP, sugar and eye-screening camp for 300+ residents. Volunteers handle registration, crowd flow and elder assistance.",
      description:
        "Partnering with local doctors and nurses, we're hosting a free screening camp for domestic workers, security staff and senior citizens of the area.\n\nVolunteer roles: registration desk, queue management, escorting elders between stations, distributing prescription glasses, and post-camp data entry. A doctor team handles all medical work — no medical background needed for volunteers.\n\nEarly detection saved two lives at our last camp. Help us beat that number.",
      needed: 20,
      offset: 12,
      durationH: 7,
    },
    {
      slug: "ration-kit-packing-marathon",
      title: "Ration Kit Packing Marathon",
      category: "food-relief",
      city: "Lucknow",
      location: "Annapurna Seva Kendra, Gomti Nagar",
      summary:
        "Assemble 200 monthly ration kits — atta, dal, rice, oil, masala — for flood-affected families. Assembly-line format, great music, chai breaks.",
      description:
        "Flood relief isn't just about the floods; families need months of support after the waters recede. We're packing 200 complete monthly ration kits for affected households in the riverine belt.\n\nThe format is pure assembly-line joy: weigh, fill, seal, label, stack. Perfect for groups — bring your whole society or office team.\n\nEvery kit feeds a family of four for a month. Stack yours high.",
      needed: 30,
      offset: 15,
      durationH: 5,
    },
    {
      slug: "hauz-khas-lake-shore-restoration",
      title: "Hauz Khas Lake Shore Restoration",
      category: "cleanup",
      city: "Delhi",
      location: "Hauz Khas Lake, Deer Park side entry",
      summary:
        "Restore the lake's edge: remove invasive weeds, plant native saplings and install bird-friendly signage in Delhi's most loved green lung.",
      description:
        "This isn't a trash pickup — it's ecological restoration. Working with a wetland ecologist, we'll remove invasive water hyacinth patches, plant 60 native saplings along the shore, and put up hand-painted signage to protect nesting birds.\n\nSaplings, tools and gloves provided; please carry sun protection and a refillable bottle.\n\nPlant a sapling, get a photo with it, and come back next year to meet your tree.",
      needed: 35,
      offset: 18,
      durationH: 5,
    },
  ];

  const campaignIds: string[] = [];
  for (const c of campaignSeeds) {
    const imageUrl = `/images/campaigns/${c.category}.jpg`;
    const start = at(c.offset, 10);
    const end = new Date(start.getTime() + c.durationH * 60 * 60 * 1000);
    const [row] = await db
      .insert(campaigns)
      .values({
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        description: c.description,
        category: c.category,
        city: c.city,
        location: c.location,
        imageUrl,
        startAt: start,
        endAt: end,
        volunteersNeeded: c.needed,
        organizerId: organizer.id,
      })
      .returning();
    campaignIds.push(row.id);
  }

  /* ------------------------------- Signups -------------------------------- */
  const signupPlan: Array<[number, number[]]> = [
    // campaign index -> volunteer indices joining it
    [0, [1, 4, 5, 6]],
    [1, [0, 4, 7]],
    [2, [0, 1, 2, 6]],
    [3, [3, 5]],
    [4, [1, 3, 7]],
    [5, [2, 3, 7]],
    [6, [2, 5, 6]],
    [7, [0, 2, 6]],
  ];

  for (const [ci, vis] of signupPlan) {
    for (const vi of vis) {
      await db
        .insert(campaignSignups)
        .values({ campaignId: campaignIds[ci], userId: volunteerIds[vi] })
        .onConflictDoNothing();
    }
  }

  console.log(
    `Seeded: 1 organizer, ${volunteerIds.length} volunteers, ${campaignIds.length} campaigns, ${signupPlan.reduce((a, [, v]) => a + v.length, 0)} signups.`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
