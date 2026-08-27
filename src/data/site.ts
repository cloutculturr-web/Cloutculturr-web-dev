import aayushImage from "@/assets/aayush.jpg";
import kritinyaImage from "@/assets/kritinya.jpg";
import snehasImage from "@/assets/snehas.jpg";

export type Pkg = {
  name: string;
  price: number;
  deliverables: string[];
  delivery: string;
  revisions: number;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  role: string;
  city: string;
  niche: string[];
  rating: number;
  reviews: number;
  years: number;
  from: number;
  hue: string;
  bio: string;
  packages: Pkg[];
};

// Company Information
export const companyInfo = {
  name: "CloutCulturee",
  tagline: "Scaling Potential • Empowering Brands",
  description: "Premium digital marketing agency and vetted creator marketplace for restaurants, startups, personal brands and creators.",
  email: "cloutculturee@gmail.com",
  phone: "+91 9704924121",
  location: "Hyderabad, India",
  website: "https://cloutculturee.com",
  socialMedia: {
    instagram: "https://www.instagram.com/cloutculturr?igsh=enV2enN6ZDhmeGl6aayush",
    linkedin: "https://www.linkedin.com/company/cloutculturee",
    twitter: "https://twitter.com/cloutculturee",
  },
  founder: {
    name: "Aayush Singh",
    title: "Founder & Director",
    bio: "Content creator and digital marketing strategist specializing in reels, edits, and brand growth.",
    image: "/src/assets/aayush.jpg",
    socialMedia: {
      instagram: "https://www.instagram.com/_aayusshhedits?utm_source=qrcode",
      linkedin: "https://www.linkedin.com/in/aayush-singh-597320404?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      email: "cloutculturee@gmail.com",
      companyInstagram: "https://www.instagram.com/cloutculturr?igsh=enV2enN6ZDhmeGl6aayush",
    },
  },
};

export type FounderProfile = {
  name: string;
  /** The name they actually go by — used for "Connect with ___" and the initial-letter placeholder. */
  shortName: string;
  title: string;
  bio: string;
  image?: string;
  hue: string;
  stats: { value: string; label: string }[];
  socialMedia: {
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
};

// Shared company track record — reused across all three founders' stat
// callouts rather than inventing individual numbers that aren't verified.
const sharedStats = [
  { value: "120+", label: "Brands Scaled" },
  { value: "240M+", label: "Views Generated" },
];

export const founders: FounderProfile[] = [
  {
    name: companyInfo.founder.name,
    shortName: "Aayush",
    title: companyInfo.founder.title,
    bio: companyInfo.founder.bio,
    image: aayushImage,
    hue: "from-[oklch(0.66_0.243_300)] to-[oklch(0.55_0.245_268)]",
    stats: sharedStats,
    socialMedia: {
      instagram: companyInfo.founder.socialMedia.instagram,
      linkedin: companyInfo.founder.socialMedia.linkedin,
      email: companyInfo.founder.socialMedia.email,
    },
  },
  {
    name: "Kandi Sai Kritinya",
    shortName: "Kritinya",
    title: "Co-Founder & Creative Director",
    bio: "Leads art direction, brand worlds and the visual standard every creator on the marketplace is held to.",
    image: kritinyaImage,
    hue: "from-[oklch(0.8_0.13_350)] to-[oklch(0.66_0.243_300)]",
    stats: sharedStats,
    socialMedia: {
      instagram: "https://www.instagram.com/kr1t1nya?igsh=eXQydnA4eXNqYWQ4&utm_source=qr",
      linkedin: "https://www.linkedin.com/in/kandi-sai-kritinya-612620370?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    },
  },
  {
    name: "Kyatam Snehas Chandra Reddy",
    shortName: "Snehas",
    title: "Co-Founder & Technology",
    bio: "Owns the product, data and automation layer that keeps clients, creators and payouts running clean.",
    image: snehasImage,
    hue: "from-[oklch(0.55_0.245_268)] to-[oklch(0.75_0.16_200)]",
    stats: sharedStats,
    socialMedia: {
      instagram: "https://www.instagram.com/snehaswhat?utm_source=qr",
      linkedin: "https://www.linkedin.com/in/kyatam-snehas-chandra-reddy-3b692625b?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    },
  },
];

export const creators: Creator[] = [
  {
    id: "aarav-mehta",
    name: "Aarav Mehta",
    handle: "@aarav.frames",
    role: "Reels Director & Editor",
    city: "Mumbai",
    niche: ["Restaurants", "Food"],
    rating: 4.9,
    reviews: 132,
    years: 6,
    from: 12000,
    hue: "from-[oklch(0.66_0.243_300)] to-[oklch(0.55_0.245_268)]",
    bio: "Food-first storyteller shooting cinematic restaurant reels that fill tables on weekdays.",
    packages: [
      { name: "Basic", price: 12000, deliverables: ["8 Reels", "12 Posts", "20 Stories"], delivery: "10 days", revisions: 2 },
      { name: "Standard", price: 22000, deliverables: ["14 Reels", "20 Posts", "40 Stories", "Photography"], delivery: "14 days", revisions: 3 },
      { name: "Premium", price: 38000, deliverables: ["24 Reels", "30 Posts", "Ad Management", "Analytics"], delivery: "20 days", revisions: 5 },
    ],
  },
  {
    id: "kiara-nair",
    name: "Kiara Nair",
    handle: "@kiara.studio",
    role: "Brand Designer",
    city: "Bengaluru",
    niche: ["Startups", "Personal Brands"],
    rating: 4.8,
    reviews: 87,
    years: 5,
    from: 15000,
    hue: "from-[oklch(0.8_0.13_350)] to-[oklch(0.66_0.243_300)]",
    bio: "Identity systems, launch kits and design that makes early-stage brands look Series-B.",
    packages: [
      { name: "Basic", price: 15000, deliverables: ["Logo suite", "Colour + Type system"], delivery: "7 days", revisions: 2 },
      { name: "Standard", price: 28000, deliverables: ["Full identity", "Social kit", "Pitch deck"], delivery: "14 days", revisions: 3 },
      { name: "Premium", price: 52000, deliverables: ["Identity", "Website design", "Campaign art"], delivery: "21 days", revisions: 5 },
    ],
  },
  {
    id: "rehan-shaikh",
    name: "Rehan Shaikh",
    handle: "@rehan.performance",
    role: "Performance Marketer",
    city: "Delhi",
    niche: ["Small Business", "Ecommerce"],
    rating: 4.9,
    reviews: 164,
    years: 8,
    from: 25000,
    hue: "from-[oklch(0.55_0.245_268)] to-[oklch(0.75_0.16_200)]",
    bio: "₹9Cr+ ad spend managed. Meta & Google funnels engineered around profit, not vanity reach.",
    packages: [
      { name: "Basic", price: 25000, deliverables: ["Meta Ads", "2 creatives/wk", "Weekly report"], delivery: "Monthly", revisions: 2 },
      { name: "Standard", price: 45000, deliverables: ["Meta + Google", "Landing page", "Analytics"], delivery: "Monthly", revisions: 4 },
      { name: "Premium", price: 80000, deliverables: ["Full funnel", "CRO", "Creative team", "Dashboard"], delivery: "Monthly", revisions: 8 },
    ],
  },
  {
    id: "meher-kapoor",
    name: "Meher Kapoor",
    handle: "@meher.shoots",
    role: "Photographer",
    city: "Jaipur",
    niche: ["Fashion", "Personal Brands"],
    rating: 4.7,
    reviews: 61,
    years: 4,
    from: 18000,
    hue: "from-[oklch(0.8_0.13_350)] to-[oklch(0.55_0.245_268)]",
    bio: "Editorial-grade product and founder portraits with a warm, filmic finish.",
    packages: [
      { name: "Basic", price: 18000, deliverables: ["Half-day shoot", "25 edits"], delivery: "5 days", revisions: 1 },
      { name: "Standard", price: 32000, deliverables: ["Full-day shoot", "60 edits", "Reels"], delivery: "9 days", revisions: 3 },
      { name: "Premium", price: 58000, deliverables: ["2-day production", "120 edits", "Campaign film"], delivery: "15 days", revisions: 4 },
    ],
  },
  {
    id: "dev-oberoi",
    name: "Dev Oberoi",
    handle: "@devwrites",
    role: "Content Strategist",
    city: "Pune",
    niche: ["Agencies", "B2B"],
    rating: 4.8,
    reviews: 74,
    years: 7,
    from: 20000,
    hue: "from-[oklch(0.66_0.243_300)] to-[oklch(0.85_0.16_90)]",
    bio: "Narrative systems, scripts and calendars that turn founders into category voices.",
    packages: [
      { name: "Basic", price: 20000, deliverables: ["Content calendar", "12 scripts"], delivery: "Monthly", revisions: 2 },
      { name: "Standard", price: 34000, deliverables: ["Calendar", "20 scripts", "Newsletter"], delivery: "Monthly", revisions: 3 },
      { name: "Premium", price: 60000, deliverables: ["Full editorial ops", "LinkedIn ghostwriting"], delivery: "Monthly", revisions: 6 },
    ],
  },
  {
    id: "tanya-rao",
    name: "Tanya Rao",
    handle: "@tanya.creates",
    role: "UGC Creator",
    city: "Hyderabad",
    niche: ["Influencers", "D2C"],
    rating: 5,
    reviews: 48,
    years: 3,
    from: 9000,
    hue: "from-[oklch(0.75_0.16_200)] to-[oklch(0.66_0.243_300)]",
    bio: "Scroll-stopping UGC hooks tested across 400+ paid creatives for D2C brands.",
    packages: [
      { name: "Basic", price: 9000, deliverables: ["4 UGC videos", "Hooks pack"], delivery: "7 days", revisions: 2 },
      { name: "Standard", price: 16000, deliverables: ["8 UGC videos", "3 variants each"], delivery: "12 days", revisions: 3 },
      { name: "Premium", price: 30000, deliverables: ["16 UGC videos", "Ad-ready edits", "Usage rights"], delivery: "20 days", revisions: 5 },
    ],
  },
];

export const services = [
  { title: "Social Media Management", desc: "End-to-end content engines: strategy, shooting, editing, posting, community.", tag: "01" },
  { title: "Performance Marketing", desc: "Meta, Google and creator-led paid systems tuned to CAC and ROAS.", tag: "02" },
  { title: "Brand & Design", desc: "Identity, packaging, campaign art and design systems that scale.", tag: "03" },
  { title: "Content Production", desc: "Reels, ad films, photography and UGC at agency production quality.", tag: "04" },
  { title: "Influencer & Creator Ops", desc: "Vetted creator sourcing, negotiation, briefs and reporting.", tag: "05" },
  { title: "Growth Analytics", desc: "Dashboards, attribution and monthly growth reviews with real numbers.", tag: "06" },
];

export const workflow = [
  { step: "Discovery", desc: "A strategy call where we audit your brand, market and current funnel." },
  { step: "Strategy", desc: "A written growth plan: positioning, content pillars, budget and KPIs." },
  { step: "Production", desc: "Shoots, edits, design and copy produced on a locked monthly calendar." },
  { step: "Distribution", desc: "Organic + paid rollout across the platforms your buyers actually use." },
  { step: "Scale", desc: "Weekly optimisation, creator support and transparent monthly reporting." },
];

export const caseStudies = [
  { brand: "Thali & Co.", metric: "+312%", label: "footfall from Instagram in 90 days", type: "Restaurant" },
  { brand: "Nuvo Skincare", metric: "4.8x", label: "blended ROAS on paid social", type: "D2C" },
  { brand: "Studio Arka", metric: "1.2M", label: "organic views per month", type: "Personal Brand" },
  { brand: "Fyne Fitness", metric: "₹42L", label: "revenue attributed in 2 quarters", type: "Startup" },
];

export const stats = [
  { value: "180+", label: "Brands scaled" },
  { value: "240M+", label: "Views generated" },
  { value: "96%", label: "Client retention" },
  { value: "50+", label: "Vetted creators" },
];

export const testimonials = [
  { quote: "CC rebuilt our content engine in six weeks. We went from invisible to fully booked weekends.", name: "Rhea Malhotra", role: "Owner, Thali & Co." },
  { quote: "The only agency that reports on revenue instead of reach. Numbers first, aesthetics always.", name: "Kabir Sethi", role: "Founder, Nuvo Skincare" },
  { quote: "Their marketplace gave us a photographer and an editor in 48 hours. Zero chasing.", name: "Ananya Iyer", role: "CMO, Fyne Fitness" },
  { quote: "Best creative direction we've had. Our feed finally looks like the brand we imagined.", name: "Vikram Rao", role: "Founder, Studio Arka" },
];

export const agencyPackages = [
  {
    name: "Ignite",
    price: "₹24,000",
    period: "/month",
    tagline: "For new brands finding their voice.",
    features: ["8 Reels + 12 Posts", "20 Stories", "Content calendar", "Monthly analytics", "1 strategy call"],
  },
  {
    name: "Momentum",
    price: "₹58,000",
    period: "/month",
    tagline: "Our most chosen growth engine.",
    features: ["16 Reels + 24 Posts", "Photography day", "Meta ad management", "Landing page", "Weekly reporting", "Priority support"],
    highlight: true,
  },
  {
    name: "Dominate",
    price: "₹1,20,000",
    period: "/month",
    tagline: "Full-stack marketing department.",
    features: ["Unlimited content pipeline", "Ad film production", "Paid across Meta + Google", "Influencer campaigns", "Dedicated strategist", "Real-time dashboard"],
  },
];

export const faqs = [
  { q: "What makes CloutCulturee different from a normal agency?", a: "We run as an agency first and a marketplace second. Every enquiry gets the CC team's proposal first — if we're not the right fit, you're routed to a vetted creator inside our marketplace instead of being left to search alone." },
  { q: "How does the creator marketplace work?", a: "Creators are invited and approved by our admin team — nobody self-registers. Each approved creator publishes verified packages, pricing and portfolio, and clients can browse, compare and book directly." },
  { q: "What does Premium membership include?", a: "₹100/month unlocks unlimited creator access, unlimited comparisons, direct messaging, bookings, shortlists, portfolio downloads, AI recommendations and priority support. Free accounts can browse up to 10 creators." },
  { q: "How is commission handled?", a: "Projects delivered by CloutCulturee are 100% CC. Marketplace bookings carry a 25–30% platform commission, configurable by admin, with the balance paid out to the creator." },
  { q: "Which payment methods are supported?", a: "UPI, cards, net banking and wallets via Razorpay, with GST-ready invoices, subscription billing and refund management." },
  { q: "How fast can we start?", a: "Strategy calls are usually available within 48 hours, and most engagements go live within a week of the plan being approved." },
];