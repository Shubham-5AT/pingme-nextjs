'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useScroll,
  useVelocity,
  useAnimationFrame,
  wrap,
} from "framer-motion";

type Review = {
  name: string; location: string; vehicle: string;
  text: string; rating: number; tag: string;
  initials: string; avatarColor: string;
};

const reviews: Review[] = [
  { name: "Rohit Sharma", location: "Sector 22, Chandigarh", vehicle: "Car owner", text: "Mere building ke neeche parking mein koi baar baar notice chhodta tha. Ab scan karo, message aao, main nikal deta hoon. No awkward calls, no sharing number with random strangers.", rating: 5, tag: "Apartment parking", initials: "RS", avatarColor: "#92400E" },
  { name: "Priya Nair", location: "HSR Layout, Bengaluru", vehicle: "Scooty owner", text: "As a woman, sharing my number with unknown people near my vehicle always felt unsafe. PingME completely solved that. Whoever scans gets to alert me — without ever seeing my actual number.", rating: 5, tag: "Safety-first", initials: "PN", avatarColor: "#78350F" },
  { name: "Gurpreet Singh", location: "Mohali, Punjab", vehicle: "SUV owner", text: "Costco jaisa experience chahiye tha mujhe. One tap and the person outside knows I'll move my car in 5 minutes. Already recommended it to 4 friends in my society.", rating: 5, tag: "Society parking", initials: "GS", avatarColor: "#451A03" },
  { name: "Ananya Krishnan", location: "Koramangala, Bengaluru", vehicle: "Car owner", text: "Got a ping that my car was blocking a delivery truck. Moved it in 2 minutes. Without this, the truck would've waited 40 mins for office hours to end. Absolute lifesaver.", rating: 5, tag: "Quick response", initials: "AK", avatarColor: "#92400E" },
  { name: "Mohammed Rafi", location: "Hyderabad Old City", vehicle: "Bike owner", text: "Main market area mein park karta hoon. Pehle toh log honk karte rehte the. Ab seedha message aata hai — zero noise, zero stress.", rating: 5, tag: "Market parking", initials: "MR", avatarColor: "#78350F" },
  { name: "Sunita Mehra", location: "Burail, Chandigarh", vehicle: "Car owner", text: "My husband travels a lot. When I park outside the school, someone always needed me to shift. Now they just scan and ping me. I feel so much safer not giving my number to everyone.", rating: 5, tag: "School pickup", initials: "SM", avatarColor: "#451A03" },
  { name: "Arjun Kapoor", location: "Noida Sector 50", vehicle: "Car owner", text: "Office mein visitor parking mein zyada ruk jata tha. Security wale khud scan karke alert karte hain ab. Company ne 15 PingME cards bulk mein order kiye hain ab.", rating: 5, tag: "Office fleet", initials: "AK", avatarColor: "#92400E" },
  { name: "Deepa Venkataraman", location: "T. Nagar, Chennai", vehicle: "Hatchback owner", text: "Enna solrathu — it just works. Downloaded it for my husband when he started driving to work. Now our whole neighbourhood WhatsApp group is talking about it.", rating: 5, tag: "Neighbourhood hit", initials: "DV", avatarColor: "#78350F" },
  { name: "Kabir Malhotra", location: "Panchkula, Haryana", vehicle: "Car owner", text: "My car headlight was left on all night. A neighbour scanned my PingME tag at 11pm and sent an alert. Saved my battery. That one incident alone was worth every rupee.", rating: 5, tag: "Emergency alert", initials: "KM", avatarColor: "#451A03" },
  { name: "Ritika Joshi", location: "Baner, Pune", vehicle: "Two-wheeler owner", text: "Setup liya 10 minutes mein. Sticker ek dum clean lagta hai bike pe. Log impress ho jaate hain when they scan it — already three of my colleagues got one too.", rating: 5, tag: "Quick setup", initials: "RJ", avatarColor: "#92400E" },
  { name: "Vijay Rangan", location: "Anna Nagar, Chennai", vehicle: "Car owner", text: "I drive a white Alto. Parking trouble is real even for small cars. Now I just hang the card and relax. No fights, no drama.", rating: 5, tag: "Stress-free", initials: "VR", avatarColor: "#78350F" },
  { name: "Neha Bansal", location: "Zirakpur, Punjab", vehicle: "SUV owner", text: "Maternity leave pe hoon, bahar nahi ja sakti jaldi. Someone pinged that I was blocking their driveway. Moved it in 90 seconds from inside the house.", rating: 5, tag: "New parent must", initials: "NB", avatarColor: "#451A03" },
];

const half = Math.ceil(reviews.length / 2);
const row1 = reviews.slice(0, half);
const row2 = reviews.slice(half);

// --- Animated counter --------------------------------------------------------
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// --- Star rating --------------------------------------------------------------
const StarRating = ({ rating, animate = false }: { rating: number; animate?: boolean }) => (
  <div style={{ display: "flex", gap: "3px" }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.svg key={i} width="13" height="13" viewBox="0 0 24 24"
        fill={i < rating ? "#F4B400" : "none"} stroke={i < rating ? "#F4B400" : "#D1B87A"} strokeWidth="1.5"
        initial={animate ? { scale: 0, rotate: -30 } : false}
        animate={animate ? { scale: 1, rotate: 0 } : false}
        transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 15 }}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </motion.svg>
    ))}
  </div>
);

// --- Avatar -------------------------------------------------------------------
const Avatar = ({ initials, color }: { initials: string; color: string }) => (
  <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
    style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#FEF3C7", letterSpacing: "0.04em", fontFamily: "'Poppins',sans-serif", border: "2px solid rgba(244,180,0,0.25)", cursor: "default" }}>
    {initials}
  </motion.div>
);

// --- Review card with 3D tilt -------------------------------------------------
const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8);
    rotateX.set(-((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 8);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0); rotateY.set(0); setHovered(false);
  }, [rotateX, rotateY]);

  return (
    <motion.div ref={cardRef} onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)} onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", perspective: 800, flexShrink: 0, width: 320 }}
      whileHover={{ scale: 1.03, zIndex: 10 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div style={{ borderRadius: 16, background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", padding: "22px 22px 18px", display: "flex", flexDirection: "column", gap: 14, cursor: "default", boxShadow: hovered ? "0 24px 50px rgba(81,60,9,0.18),0 0 0 1px rgba(244,180,0,0.15)" : "0 2px 16px rgba(81,60,9,0.07)", transition: "box-shadow 0.3s ease", position: "relative", overflow: "hidden" }}>
        {/* Shimmer */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(135deg,rgba(244,180,0,0.06),transparent 60%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none" }} />
        {/* Top accent */}
        <motion.div animate={{ opacity: hovered ? 0.9 : 0.5, scaleX: hovered ? 1.1 : 1 }} transition={{ duration: 0.3 }}
          style={{ position: "absolute", top: 0, left: 24, right: 24, height: 2, borderRadius: "0 0 2px 2px", background: "linear-gradient(90deg,transparent,#F4B400 30%,#F4B400 70%,transparent)" }} />
        {/* Particles */}
        <AnimatePresence>
          {hovered && [0, 1, 2].map(i => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 0, x: 10 + i * 30, scale: 0 }}
              animate={{ opacity: [0, 1, 0], y: -40 - i * 15, scale: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
              style={{ position: "absolute", bottom: 20, width: 6, height: 6, borderRadius: "50%", background: "#F4B400", pointerEvents: "none" }} />
          ))}
        </AnimatePresence>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <svg width="24" height="18" viewBox="0 0 24 18" fill="none" style={{ flexShrink: 0 }}>
            <path d="M0 18V11.1C0 9.3.405 7.575 1.215 5.925 2.025 4.275 3.195 2.85 4.725 1.65 6.285.45 8.145.03 10.305 0l.63 1.8C9.135 2.28 7.8 3.12 6.9 4.32c-.96 1.17-1.44 2.52-1.44 4.05H8.1V18H0zM13.5 18V11.1c0-1.8.405-3.525 1.215-5.175.81-1.65 1.98-3.075 3.51-4.275C19.785.45 21.645.03 23.805 0l.63 1.8c-2.07.48-3.435 1.32-4.335 2.52-.96 1.17-1.44 2.52-1.44 4.05H21.6V18H13.5z" fill="#F4B400" opacity="0.25" />
          </svg>
          <StarRating rating={review.rating} animate={hovered} />
        </div>
        {/* Text */}
        <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "hsl(var(--foreground))", margin: 0, flex: 1, fontFamily: "'Poppins',sans-serif", fontWeight: 400 }}>{review.text}</p>
        {/* Tag */}
        <motion.span whileHover={{ scale: 1.05 }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px 3px 8px", borderRadius: 99, background: "hsl(var(--ping-card))", color: "hsl(var(--ping-brown))", border: "1px solid hsl(var(--border))", fontSize: 11, fontWeight: 600, alignSelf: "flex-start", fontFamily: "'Poppins',sans-serif", cursor: "default" }}>
          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "#F4B400", display: "inline-block", flexShrink: 0 }} />
          {review.tag}
        </motion.span>
        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid hsl(var(--border))" }}>
          <Avatar initials={review.initials} color={review.avatarColor} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", fontFamily: "'Poppins',sans-serif" }}>{review.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "'Poppins',sans-serif" }}>{review.location} · {review.vehicle}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Framer marquee row -------------------------------------------------------
const MarqueeRow = ({ items, direction = "left", speed = 30 }: { items: Review[]; direction?: "left" | "right"; speed?: number }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], { clamp: false });
  const x = useTransform(baseX, v => `${wrap(-50, 0, v)}%`);
  const dirFactor = useRef(1);
  const [paused, setPaused] = useState(false);
  const baseVelocity = direction === "left" ? -speed : speed;

  useAnimationFrame((_, delta) => {
    if (paused) return;
    let move = dirFactor.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) dirFactor.current = -1;
    else if (vf > 0) dirFactor.current = 1;
    move += dirFactor.current * move * vf;
    baseX.set(baseX.get() + move);
  });

  const looped = [...items, ...items, ...items, ...items];
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "4px 0" }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-hidden="true">
      <motion.div style={{ x, display: "flex", gap: 16, width: "max-content" }}>
        {looped.map((r, i) => <ReviewCard key={`${r.name}-${i}`} review={r} index={i} />)}
      </motion.div>
    </div>
  );
};

// --- Floating orb -------------------------------------------------------------
const FloatingOrb = ({ delay, size, left, top, color }: { delay: number; size: number; left: string; top: string; color: string }) => (
  <motion.div
    style={{ position: "absolute", left, top, width: size, height: size, borderRadius: "50%", background: color, filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }}
    animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }} />
);

// --- Main ---------------------------------------------------------------------
const LandingReviews = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <>
      <style>{`
        .pm-reviews-section { position:relative; overflow:hidden; padding:88px 0 72px; background: radial-gradient(circle at 15% 10%,rgba(255,231,170,.35),transparent 50%),radial-gradient(circle at 85% 5%,rgba(255,248,226,.4),transparent 45%),hsl(0 0% 100%); }
        .dark .pm-reviews-section { background:hsl(0 0% 5%); }
        .pm-fade-left  { position:absolute;left:0;top:0;bottom:0;width:140px;background:linear-gradient(to right,hsl(42 100% 96%),transparent);z-index:2;pointer-events:none; }
        .pm-fade-right { position:absolute;right:0;top:0;bottom:0;width:140px;background:linear-gradient(to left,hsl(42 100% 96%),transparent);z-index:2;pointer-events:none; }
        .dark .pm-fade-left  { background:linear-gradient(to right,hsl(0 0% 5%),transparent); }
        .dark .pm-fade-right { background:linear-gradient(to left,hsl(0 0% 5%),transparent); }
        .pm-hazard-bar { height:5px;border-radius:3px;width:48px;background:repeating-linear-gradient(-45deg,hsl(45 100% 48%) 0,hsl(45 100% 48%) 5px,hsl(40 76% 7%) 5px,hsl(40 76% 7%) 10px); }
        .pm-stat-card { display:flex;flex-direction:column;align-items:center;padding:16px 24px;border-radius:16px;background:rgba(255,255,255,.7);border:1.5px solid rgba(244,180,0,.2);backdrop-filter:blur(10px);min-width:110px; }
      `}</style>

      <section className="pm-reviews-section" aria-label="Customer reviews">
        <FloatingOrb delay={0}   size={300} left="5%"  top="10%" color="rgba(244,180,0,0.08)" />
        <FloatingOrb delay={1.5} size={200} left="80%" top="20%" color="rgba(200,130,10,0.06)" />
        <FloatingOrb delay={3}   size={250} left="40%" top="60%" color="rgba(244,180,0,0.05)" />
        <FloatingOrb delay={2}   size={180} left="15%" top="70%" color="rgba(255,200,50,0.07)" />

        {/* Header */}
        <div ref={headerRef} style={{ textAlign: "center", padding: "0 24px 52px", maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.span initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={headerInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}} transition={{ duration: 0.6 }}
            style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(var(--ping-brown))", marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>
            Real stories
          </motion.span>

          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.035em", color: "hsl(var(--foreground))", margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>
            From parking lots to{" "}
            <motion.span style={{ color: "hsl(var(--primary))", position: "relative", display: "inline-block" }}>
              peace of mind
              <motion.span initial={{ scaleX: 0, originX: "0%" }} animate={headerInView ? { scaleX: 1 } : {}} transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", bottom: 4, left: 0, right: 0, height: 12, background: "linear-gradient(90deg,hsl(45 100% 48%),hsl(45 100% 54%))", opacity: 0.3, zIndex: -1, borderRadius: 4 }} />
            </motion.span>
          </motion.h2>

          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={headerInView ? { opacity: 1, scaleX: 1 } : {}} transition={{ duration: 0.6, delay: 0.35 }}
            style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
            <div className="pm-hazard-bar" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.45 }}
            style={{ fontSize: 15, lineHeight: 1.75, color: "hsl(var(--muted-foreground))", margin: "0 0 28px", fontFamily: "'Poppins',sans-serif" }}>
            Vehicle owners across India — apartments, markets, offices — tell it in their own words.
          </motion.p>

          {/* Rating + CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.55 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <motion.div whileHover={{ scale: 1.06, boxShadow: "0 8px 24px rgba(244,180,0,0.25)" }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 99, background: "hsl(45 100% 92%)", color: "hsl(30 75% 26%)", fontSize: 13, fontWeight: 700, fontFamily: "'Poppins',sans-serif", border: "1.5px solid hsl(45 100% 80%)", cursor: "default" }}>
              <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="#F4B400" stroke="#F4B400" strokeWidth="1.5"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </motion.svg>
              4.9 · <AnimatedCounter target={1200} suffix="+" /> happy customers
            </motion.div>

            <motion.a href="/products" whileHover={{ scale: 1.06, y: -2, boxShadow: "0 10px 28px rgba(244,180,0,0.5)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 12, background: "hsl(45 100% 48%)", color: "hsl(40 76% 7%)", fontSize: 14, fontWeight: 700, fontFamily: "'Poppins',sans-serif", textDecoration: "none", boxShadow: "0 4px 16px rgba(244,180,0,0.35)", position: "relative", overflow: "hidden" }}>
              <motion.span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)" }}
                animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }} />
              Get Your Tag
              <motion.svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </motion.svg>
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div ref={statsRef} initial={{ opacity: 0, y: 24 }} animate={statsInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.7 }}
            style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            {[{ value: 2400, suffix: "+", label: "Tags Active" }, { value: 98, suffix: "%", label: "Delivery Rate" }, { value: 12, suffix: "s", label: "Avg Response" }].map((s, i) => (
              <motion.div key={s.label} className="pm-stat-card"
                initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.75 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(244,180,0,0.15)" }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--ping-brown))", fontFamily: "'Poppins',sans-serif" }}>
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </span>
                <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "'Poppins',sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Marquee */}
        <motion.div initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.5 }}
          style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="pm-fade-left" />
          <div className="pm-fade-right" />
          <MarqueeRow items={row1} direction="left"  speed={3} />
          <MarqueeRow items={row2} direction="right" speed={2} />
        </motion.div>
      </section>
    </>
  );
};

export default LandingReviews;
