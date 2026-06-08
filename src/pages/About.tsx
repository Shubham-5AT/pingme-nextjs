import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Users, Target, Shield, Heart, MapPin, Phone, Mail, ArrowRight, Zap, Lock, Globe } from "lucide-react";
import { getCachedPublicStats, refreshPublicStats } from "@/lib/publicStatsService";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATIC_CITIES_COVERED = 3;
const STATIC_GOOGLE_RATING = 4.0;

const TIMELINE = [
  {
    year: "2024",
    title: "First Tag Ships",
    description:
      "PingME v1 launched in Chandigarh. Our first 100 customers gave us feedback that shaped everything that came after.",
  },
  {
    year: "2025",
    title: "Expanding the Ecosystem",
    description:
      "Lost & Found and Pet Safety tags join the product family. NFC smart cards bring tap-to-contact to everyday life.",
  },
  {
    year: "2026",
    title: "Privacy at Scale",
    description:
      "Thousands of vehicles, belongings, and pets protected. We're just getting started.",
  },
];

const VALUES = [
  {
    icon: Target,
    label: "Our Mission",
    description:
      "To make every person reachable — through their vehicle, belongings, or pet — without ever compromising their privacy.",
  },
  {
    icon: Shield,
    label: "Privacy First",
    description:
      "Your phone number is never shared. All calls are masked and you control exactly who can reach you.",
  },
  {
    icon: Users,
    label: "Community Driven",
    description:
      "Built with feedback from thousands of customers across 3+ cities in India — and growing every day.",
  },
  {
    icon: Heart,
    label: "Made in India",
    description:
      "Proudly designed and manufactured in India, built for everyday Indian life and beyond.",
  },
];

// ─── Products data ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    emoji: "🚗",
    label: "Vehicle Tags",
    tag: "Most Popular",
    description:
      "Hang it on your car mirror. Anyone who needs to reach you — for wrong parking, a damage alert, or an emergency — can ping you privately without seeing your number.",
    href: "/products/car-tags",
  },
  {
    emoji: "🎒",
    label: "Lost & Found Tags",
    tag: null,
    description:
      "Attach to bags, laptops, keys, or any essential. If someone finds it, they scan the tag and you get an instant alert — reuniting you with your belongings fast.",
    href: "/products/keychain-tags",
  },
  {
    emoji: "🐾",
    label: "Pet Safety Tags",
    tag: null,
    description:
      "Replace the old engraved tag. Anyone who finds your pet scans the PingME tag and reaches you instantly — no exposure, no strangers with your number.",
    href: "/products/pet-tags",
  },
  {
    emoji: "📲",
    label: "NFC Smart Cards",
    tag: "New",
    description:
      "Tap-enabled cards for quick, seamless contact. Share your details on a tap — perfect for networking, deliveries, or any moment that calls for a private exchange.",
    href: "/products/nfc-cards",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const animateNumber = (
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void
) => {
  const start = performance.now();
  const frame = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    onUpdate(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

// ─── Custom hook: intersection observer ──────────────────────────────────────
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single stat card with count-up */
const StatCard = ({
  value,
  suffix = "+",
  label,
  delay = 0,
  inView,
}: {
  value: number | string;
  suffix?: string;
  label: string;
  delay?: number;
  inView: boolean;
}) => {
  const [displayed, setDisplayed] = useState(0);
  const isNumber = typeof value === "number";

  useEffect(() => {
    if (!inView || !isNumber) return;
    const timer = setTimeout(
      () => animateNumber(0, value as number, 1200, setDisplayed),
      delay
    );
    return () => clearTimeout(timer);
  }, [inView, value, delay, isNumber]);

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <span className="text-3xl font-bold text-foreground">
        {isNumber ? displayed : value}
        {suffix}
      </span>
      <span className="text-sm text-foreground/80">{label}</span>
    </div>
  );
};

/** Value card — uses your site's card styling pattern */
const ValueCard = ({
  icon: Icon,
  label,
  description,
  index,
  inView,
}: (typeof VALUES)[0] & { index: number; inView: boolean }) => (
  <div
    className="flex gap-4 items-start"
    style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.5s ease ${index * 100 + 100}ms, transform 0.5s ease ${index * 100 + 100}ms`,
    }}
  >
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <div>
      <h3 className="font-bold text-lg mb-2">{label}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

/** Timeline item */
const TimelineItem = ({
  year,
  title,
  description,
  index,
  inView,
  isLast,
}: (typeof TIMELINE)[0] & { index: number; inView: boolean; isLast: boolean }) => (
  <div
    className="relative flex gap-5"
    style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : "translateX(-20px)",
      transition: `opacity 0.5s ease ${index * 120}ms, transform 0.5s ease ${index * 120}ms`,
    }}
  >
    {/* dot + line */}
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0 bg-primary" />
      {!isLast && (
        <div className="flex-1 w-px mt-2 bg-primary/20" />
      )}
    </div>
    {/* content */}
    <div className="pb-8">
      <span className="text-xs font-bold tracking-widest uppercase text-primary">
        {year}
      </span>
      <h4 className="font-bold text-base mt-0.5 mb-1">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{description}</p>
    </div>
  </div>
);

/** Floating badge pill — uses site glass style */
const Pill = ({
  icon: Icon,
  text,
  style,
}: {
  icon: React.ElementType;
  text: string;
  style?: React.CSSProperties;
}) => (
  <div
    className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      bg-background/80 border border-border backdrop-blur-sm text-muted-foreground
      select-none pointer-events-none shadow-sm"
    style={style}
  >
    <Icon className="w-3 h-3 text-primary-foreground" />
    {text}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const About = () => {
  const cachedStats = useMemo(() => getCachedPublicStats(), []);
  const [happyCustomers, setHappyCustomers] = useState(cachedStats?.happyCustomers || 0);
  const [vehiclesProtected, setVehiclesProtected] = useState(
    cachedStats?.vehiclesProtected || 0
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Section refs
  const heroView      = useInView(0.1);
  const storyView     = useInView(0.15);
  const productsView  = useInView(0.08);
  const valuesView    = useInView(0.1);
  const timelineView  = useInView(0.1);
  const statsView     = useInView(0.2);
  const officeView    = useInView(0.2);
  const ctaView       = useInView(0.2);

  // Load live stats
  useEffect(() => {
    let alive = true;
    if (cachedStats) setIsLoaded(true);

    const loadStats = async () => {
      const stats = await refreshPublicStats();
      if (!alive) return;
      animateNumber(cachedStats?.happyCustomers || 0, stats.happyCustomers, 1200, (v) => {
        if (alive) setHappyCustomers(v);
      });
      animateNumber(cachedStats?.vehiclesProtected || 0, stats.vehiclesProtected, 1200, (v) => {
        if (alive) setVehiclesProtected(v);
      });
      setIsLoaded(true);
    };

    void loadStats();
    return () => { alive = false; };
  }, [cachedStats]);

  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=745+Burail+Ekta+Market+Burail+Village+Sector+45+Chandigarh+160047";

  return (
    <MainLayout>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatTag {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes scanLine {
          0%   { top: 8%; opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
        .hero-a { animation: slideUp 0.65s ease 0.05s both; }
        .hero-b { animation: slideUp 0.65s ease 0.18s both; }
        .hero-c { animation: slideUp 0.65s ease 0.30s both; }
        .hero-d { animation: slideUp 0.65s ease 0.44s both; }
        .tag-float { animation: floatTag 4.5s ease-in-out infinite; }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          box-shadow: 0 0 8px 1px hsl(var(--primary) / 0.5);
          animation: scanLine 2.6s ease-in-out infinite;
        }

        /* Ping ripple rings */
        @keyframes pingRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .ping-ring {
          animation: pingRing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Signal dashes travelling right */
        @keyframes signalDash {
          0%   { opacity: 0.15; transform: scaleX(0.5); }
          50%  { opacity: 1;    transform: scaleX(1); }
          100% { opacity: 0.15; transform: scaleX(0.5); }
        }
        .signal-dash {
          animation: signalDash 1.4s ease-in-out infinite;
        }
      `}</style>

      <div className="py-16">
        <div className="container">
        <div className="text-center mb-4">
  <h2 className="group relative inline-block text-5xl md:text-3xl font-bold px-8 py-3 text-yellow-400 cursor-pointer">
    About Us

    <span
      className="
        absolute -inset-2 rounded-full
        border-2 border-yellow-400
        scale-0
        group-hover:scale-100
        transition-transform duration-300 ease-out
      "
    />
  </h2>
</div>

          {/* ─── HERO ──────────────────────────────────────────────────────── */}
          <section ref={heroView.ref} className="mb-20">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

              {/* Left: text */}
              <div className="flex-1 max-w-xl">

                <h1 className="hero-b section-title text-3xl md:text-3xl ml-[-20px] mb-4">
                  Reach people,{" "}
                  <span className="text-primary-foreground">not their data.</span>
                  <br />
                  <span className="text-muted-foreground text-xl ml-[-120px] md:text-xl font-semibold">
                    For every moment that matters.
                  </span>
                </h1>
                <p className="hero-c text-muted-foreground ml-[25px] text-lg leading-relaxed mb-8 max-w-md">
                  PingME protects your privacy across vehicles, belongings, and pets —
                  one scan or tap is all it takes to reach you, without ever exposing your number.
                </p>
                <div className="hero-d ml-[60px]">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground
                      px-6 py-3 rounded-full text-sm font-semibold
                      hover:opacity-90 transition-opacity"
                  >
                    Get Your Tag <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right: floating tag mockup */}
              <div className="flex-1 flex justify-center relative select-none py-10 px-10">
                <div className="relative w-48 md:w-56 tag-float">

                  {/* Card */}
                  <div className="bg-card border border-border rounded-3xl p-6 flex flex-col items-center gap-4 shadow-lg">

                    {/* QR mock */}
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white p-2.5">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Corner squares */}
                        <rect x="5"  y="5"  width="28" height="28" rx="3" fill="#111" />
                        <rect x="9"  y="9"  width="20" height="20" rx="2" fill="white" />
                        <rect x="12" y="12" width="14" height="14" rx="1" fill="#111" />

                        <rect x="67" y="5"  width="28" height="28" rx="3" fill="#111" />
                        <rect x="71" y="9"  width="20" height="20" rx="2" fill="white" />
                        <rect x="74" y="12" width="14" height="14" rx="1" fill="#111" />

                        <rect x="5"  y="67" width="28" height="28" rx="3" fill="#111" />
                        <rect x="9"  y="71" width="20" height="20" rx="2" fill="white" />
                        <rect x="12" y="74" width="14" height="14" rx="1" fill="#111" />

                        {/* Data dots */}
                        <rect x="40" y="40" width="4" height="4" rx="1" fill="#111" />
                        <rect x="46" y="40" width="4" height="4" rx="1" fill="#111" />
                        <rect x="52" y="40" width="4" height="4" rx="1" fill="white" />
                        <rect x="58" y="40" width="4" height="4" rx="1" fill="#111" />
                        <rect x="40" y="46" width="4" height="4" rx="1" fill="white" />
                        <rect x="46" y="46" width="4" height="4" rx="1" fill="#111" />
                        <rect x="52" y="46" width="4" height="4" rx="1" fill="#111" />
                        <rect x="58" y="46" width="4" height="4" rx="1" fill="white" />
                        <rect x="40" y="52" width="4" height="4" rx="1" fill="#111" />
                        <rect x="46" y="52" width="4" height="4" rx="1" fill="white" />
                        <rect x="52" y="52" width="4" height="4" rx="1" fill="#111" />
                        <rect x="58" y="52" width="4" height="4" rx="1" fill="#111" />
                        <rect x="40" y="58" width="4" height="4" rx="1" fill="white" />
                        <rect x="46" y="58" width="4" height="4" rx="1" fill="#111" />
                        <rect x="52" y="58" width="4" height="4" rx="1" fill="#111" />
                        <rect x="58" y="58" width="4" height="4" rx="1" fill="white" />

                        {/* Bottom-right accent */}
                        <rect x="67" y="67" width="28" height="28" rx="3"
                          fill="hsl(var(--primary)/0.12)"
                          stroke="hsl(var(--primary))" strokeWidth="1.5" />
                        <text x="81" y="85" textAnchor="middle" fontSize="11"
                          fill="hsl(var(--primary))" fontWeight="bold">PM</text>
                      </svg>
                      <div className="scan-line" />
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-sm">PingME Tag</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Scan to ping safely</p>
                    </div>

                    {/* Signal dots */}
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-2 h-2 rounded-full bg-primary/60" />
                      <div className="w-2 h-2 rounded-full bg-primary/30" />
                    </div>
                  </div>

                  {/* Floating pills */}
                  <Pill icon={Zap}  text="Instant Alert"  style={{ top: "-14px",  left: "-24px" }} />
                  <Pill icon={Lock}   text="Number Hidden"  style={{ top: "-14px", right: "-18px" }} />
                  <Pill icon={Globe} text="Works Anywhere" style={{ bottom: "-12px", right: "-14px" }} />
                </div>
              </div>
            </div>
          </section>
          <hr className="my-12 border-gray-200" />

          {/* ─── STORY ─────────────────────────────────────────────────────── */}
          <section
            ref={storyView.ref}
            className="ml-[100px] mb-20 max-w-4xl"
          >
            <p
              className="section-eyebrow"
              style={{
                opacity: storyView.inView ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              Why We Built This
            </p>
            <h2
              className="section-title text-3xl mb-6"
              style={{
                opacity: storyView.inView ? 1 : 0,
                transform: storyView.inView ? "none" : "translateY(16px)",
                transition: "opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s",
              }}
            >
              Privacy shouldn't be the price of being reachable.
            </h2>
            <div
              className="grid md:grid-cols-2 gap-6 text-muted-foreground text-lg leading-relaxed"
              style={{
                opacity: storyView.inView ? 1 : 0,
                transform: storyView.inView ? "none" : "translateY(16px)",
                transition: "opacity 0.6s ease 0.18s, transform 0.6s ease 0.18s",
              }}
            >
              <p>
                It started with a blocked car and a stranger who needed to reach the owner —
                but had no safe way to do it. We realised the same problem plays out everywhere:
                a lost bag, a wandering pet, a delivery gone wrong. In every case, you need to be
                reachable without handing out your personal number to a stranger.
              </p>
              <p>
                PingME fixes that with elegantly designed QR and NFC smart tags for vehicles,
                belongings, and pets. One scan connects the finder to you through a
                privacy-protected channel — masked calls, predefined alerts, no app needed.
                Your number stays yours. Always.
              </p>
            </div>
          </section>

          {/* ─── WHAT WE MAKE ──────────────────────────────────────────────── */}
          <section
            ref={productsView.ref}
            className="mb-20 border-t border-border pt-16"
          >
            <p
              className="section-eyebrow"
              style={{ opacity: productsView.inView ? 1 : 0, transition: "opacity 0.5s ease" }}
            >
              What We Make
            </p>
            <h2
              className="section-title text-3xl mb-2"
              style={{
                opacity: productsView.inView ? 1 : 0,
                transform: productsView.inView ? "none" : "translateY(16px)",
                transition: "opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s",
              }}
            >
              One platform. Every situation.
            </h2>
            <p
              className="text-muted-foreground text-lg ml-[320px]  mb-10 max-w-xl"
              style={{
                opacity: productsView.inView ? 1 : 0,
                transform: productsView.inView ? "none" : "translateY(16px)",
                transition: "opacity 0.6s ease 0.16s, transform 0.6s ease 0.16s",
              }}
            >
              Privacy-first contact for every moment life throws at you.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRODUCTS.map((p, i) => (
                <a
                  key={p.label}
                  href={p.href}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6
                    hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  style={{
                    opacity: productsView.inView ? 1 : 0,
                    transform: productsView.inView ? "translateY(0)" : "translateY(28px)",
                    transition: `opacity 0.5s ease ${i * 90 + 100}ms, transform 0.5s ease ${i * 90 + 100}ms`,
                  }}
                >
                  {/* Tag badge */}
                  {p.tag && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest uppercase
                      bg-primary/10 text-primary-foreground px-2 py-0.5 rounded-full border border-primary/20">
                      {p.tag}
                    </span>
                  )}

                  {/* Emoji icon */}
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-2xl
                    group-hover:scale-110 transition-transform duration-300">
                    {p.emoji}
                  </div>

                  <h3 className="font-bold text-base mb-2">{p.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{p.description}</p>

                  <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* ─── VALUES ────────────────────────────────────────────────────── */}
          <section ref={valuesView.ref} className="mb-20">
            <p
              className="section-eyebrow"
              style={{
                opacity: valuesView.inView ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              What We Stand For
            </p>
            <h2
              className="section-title text-3xl mb-10"
              style={{
                opacity: valuesView.inView ? 1 : 0,
                transform: valuesView.inView ? "none" : "translateY(16px)",
                transition: "opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s",
              }}
            >
              Principles we don't compromise on.
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {VALUES.map((v, i) => (
                <ValueCard key={v.label} {...v} index={i} inView={valuesView.inView} />
              ))}
            </div>
          </section>

          {/* ─── TIMELINE ──────────────────────────────────────────────────── */}
          <section
            ref={timelineView.ref}
            className="mb-20 border-t border-border pt-16"
          >
            <div className="grid md:grid-cols-2 gap-16 items-start">

              {/* Left: heading + animated ping journey visual */}
              <div
                style={{
                  opacity: timelineView.inView ? 1 : 0,
                  transform: timelineView.inView ? "none" : "translateX(-20px)",
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                }}
              >
                <p className="section-eyebrow">Our Journey</p>
                <h2 className="section-title text-3xl mb-3">
                  Small idea.{" "}
                  <span className="text-primary-foreground">Big impact.</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-10">
                  From a single frustrating parking incident to thousands of protected
                  vehicles across India.
                </p>

                {/* ── Animated "ping journey" diagram ── */}
                <div className="relative rounded-2xl border border-border bg-primary/5 p-6 overflow-hidden">

                  {/* Ripple pulse rings behind the car icon */}
                  <div className="absolute left-8 top-1/2 -translate-y-1/2">
                    <span className="absolute inline-flex h-10 w-10 rounded-full bg-primary/20 ping-ring" style={{ animationDelay: "0s" }} />
                    <span className="absolute inline-flex h-10 w-10 rounded-full bg-primary/12 ping-ring" style={{ animationDelay: "0.6s" }} />
                    <span className="absolute inline-flex h-10 w-10 rounded-full bg-primary/6  ping-ring" style={{ animationDelay: "1.2s" }} />
                  </div>

                  <div className="relative flex items-center gap-6">
                    {/* Car block */}
                    <div className="w-10 h-10 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center z-10">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground fill-current">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                    </div>

                    {/* Animated signal line */}
                    <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full bg-primary signal-dash"
                          style={{ animationDelay: `${i * 0.12}s` }}
                        />
                      ))}
                    </div>

                    {/* Phone block */}
                    <div className="w-10 h-10 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center z-10">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground fill-current">
                        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="relative mt-4 flex justify-between px-1 text-xs text-muted-foreground">
                    <span className="font-medium">Your vehicle</span>
                    <span className="font-semibold text-primary-foreground">Private ping →</span>
                    <span className="font-medium">Your phone</span>
                  </div>

                  {/* Bottom badge */}
                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                      Number never revealed · Works on any device · No app needed
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: timeline items — vertically centred with left column */}
              <div className="pt-2">
                {TIMELINE.map((item, i) => (
                  <TimelineItem
                    key={item.year}
                    {...item}
                    index={i}
                    inView={timelineView.inView}
                    isLast={i === TIMELINE.length - 1}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ─── STATS ─────────────────────────────────────────────────────── */}
          <section ref={statsView.ref} className="mb-20">
            <div
              className="bg-primary rounded-2xl p-8 md:p-12"
              style={{
                opacity: statsView.inView ? 1 : 0,
                transform: statsView.inView ? "none" : "translateY(24px)",
                transition: "opacity 0.65s ease, transform 0.65s ease",
              }}
            >
              <p className="text-center text-xs font-bold tracking-widest uppercase text-foreground/60 mb-8">
                By The Numbers
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <StatCard
                  value={happyCustomers}
                  label="Happy Customers"
                  delay={0}
                  inView={statsView.inView}
                />
                <StatCard
                  value={vehiclesProtected}
                  label="Vehicles Protected"
                  delay={150}
                  inView={statsView.inView}
                />
                <StatCard
                  value={STATIC_CITIES_COVERED}
                  label="Cities Covered"
                  delay={300}
                  inView={statsView.inView}
                />
                <StatCard
                  value={STATIC_GOOGLE_RATING.toFixed(1) as unknown as number}
                  suffix="★"
                  label="Google Rating"
                  delay={450}
                  inView={statsView.inView}
                />
              </div>
              {!isLoaded && (
                <p className="mt-6 text-center text-xs text-foreground/50 animate-pulse">
                  Loading live stats…
                </p>
              )}
            </div>
          </section>

          {/* ─── OFFICE ────────────────────────────────────────────────────── */}
          <section
            ref={officeView.ref}
            className="mb-20 border-t border-border pt-16"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div
                className="bg-white rounded-2xl p-6 shadow-sm"
                style={{
                  opacity: officeView.inView ? 1 : 0,
                  transform: officeView.inView ? "none" : "translateY(20px)",
                  transition: "opacity 0.55s ease, transform 0.55s ease",
                }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Find Us
                </p>
                <h3 className="font-bold text-2xl mb-5">Our Office</h3>

                <div className="space-y-4">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="mt-0.5 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-0.5">Ping IFF LLP</p>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">
                        745, Burail, Ekta Market,<br />
                        Burail Village, Sector 45,<br />
                        Chandigarh – 160047
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-foreground">
                        Open in Maps <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </a>

                  <div className="h-px bg-border" />

                  <a href="tel:+917347340007" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                      +91 73473 40007
                    </span>
                  </a>

                  <a href="mailto:contact@pingiff.ai" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                      contact@pingiff.ai
                    </span>
                  </a>
                </div>
              </div>

              {/* Map */}
              <div
                className="rounded-2xl overflow-hidden shadow-sm border border-border"
                style={{
                  height: "320px",
                  opacity: officeView.inView ? 1 : 0,
                  transform: officeView.inView ? "none" : "translateX(20px)",
                  transition: "opacity 0.6s ease 0.12s, transform 0.6s ease 0.12s",
                }}
              >
                <iframe
                  title="PingME Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3431.9!2d76.7495!3d30.6905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fef!2sBurail%2C%20Sector%2045%2C%20Chandigarh!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>

          {/* ─── BOTTOM CTA ────────────────────────────────────────────────── */}
          <section
            ref={ctaView.ref}
            className="text-center border-t border-border pt-16 pb-4"
          >
            <div
              style={{
                opacity: ctaView.inView ? 1 : 0,
                transform: ctaView.inView ? "none" : "translateY(20px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <p className="section-eyebrow">Join The Movement</p>
              <h2 className="section-title text-3xl md:text-4xl mb-4">
                Your number. Your rules. Always.
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Whether it's your car, your bag, or your pet — PingME keeps you reachable without compromise.
              </p>
              <a
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground
                  px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  );
};

export default About;