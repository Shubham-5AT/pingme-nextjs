import { useState, useEffect, useRef } from "react";
import logo from "@/assets/ping-me-logo.png";
import { Link } from "react-router-dom";
import {
  Tag,
  Smartphone,
  PawPrint,
  CreditCard,
  Wifi,
  QrCode,
  Shield,
  ChevronRight,
  Search,
  BookOpen,
  Zap,
  Settings,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  ScanLine,
  UserCheck,
  Globe,
  Lock,
  Phone,
  Mail,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string }[];
}

interface Section {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

// ─── Nav Structure ─────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Zap,
    children: [
      { id: "what-is-pingme", label: "What is PingME?" },
      { id: "how-it-works", label: "How It Works" },
      { id: "quick-setup", label: "Quick Setup" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    children: [
      { id: "vehicle-tags", label: "Vehicle Tags" },
      { id: "lost-found-tags", label: "Lost & Found Tags" },
      { id: "pet-safety-tags", label: "Pet Safety Tags" },
      { id: "nfc-smart-cards", label: "NFC Smart Cards" },
    ],
  },
  {
    id: "scanning",
    label: "Scanning & NFC",
    icon: ScanLine,
    children: [
      { id: "nfc-scanning", label: "NFC Scanning" },
      { id: "qr-scanning", label: "QR Code Scanning" },
      { id: "compatibility", label: "Device Compatibility" },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Shield,
    children: [
      { id: "privacy-model", label: "Privacy Model" },
      { id: "data-protection", label: "Data Protection" },
    ],
  },
  {
    id: "account",
    label: "Account & Settings",
    icon: Settings,
    children: [
      { id: "profile-setup", label: "Profile Setup" },
      { id: "managing-tags", label: "Managing Tags" },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: HelpCircle,
    children: [
      { id: "faq", label: "FAQ" },
      { id: "contact", label: "Contact Support" },
    ],
  },
];

// ─── Reusable Components ────────────────────────────────────────────────────────

const Callout = ({
  type,
  children,
}: {
  type: "info" | "warning" | "success";
  children: React.ReactNode;
}) => {
  const config = {
    info: {
      icon: Info,
      bg: "rgba(180, 130, 0, 0.06)",
      border: "rgba(180, 130, 0, 0.25)",
      iconColor: "hsl(var(--ping-yellow))",
    },
    warning: {
      icon: AlertCircle,
      bg: "rgba(220, 80, 20, 0.06)",
      border: "rgba(220, 80, 20, 0.25)",
      iconColor: "#dc5014",
    },
    success: {
      icon: CheckCircle,
      bg: "rgba(30, 140, 80, 0.06)",
      border: "rgba(30, 140, 80, 0.25)",
      iconColor: "#1e8c50",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "10px",
        padding: "14px 18px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        margin: "20px 0",
      }}
    >
      <Icon
        style={{ color: config.iconColor, flexShrink: 0, marginTop: "2px" }}
        size={16}
      />
      <span
        style={{
          fontSize: "14px",
          color: "hsl(var(--ping-dark))",
          fontFamily: "'Poppins', sans-serif",
          lineHeight: "1.6",
        }}
      >
        {children}
      </span>
    </div>
  );
};

const StepCard = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div
    style={{
      display: "flex",
      gap: "16px",
      padding: "20px",
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(180, 130, 0, 0.15)",
      borderRadius: "12px",
      marginBottom: "12px",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "hsl(var(--ping-yellow))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 800,
        fontSize: "14px",
        color: "hsl(var(--ping-dark))",
      }}
    >
      {number}
    </div>
    <div>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          color: "hsl(var(--ping-dark))",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "13px",
          color: "hsl(var(--ping-ash))",
          lineHeight: "1.6",
        }}
      >
        {description}
      </div>
    </div>
  </div>
);

const ProductCard = ({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}) => (
  <div
    style={{
      padding: "24px",
      background: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(180, 130, 0, 0.15)",
      borderRadius: "14px",
      marginBottom: "16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          background: "hsl(var(--ping-yellow))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color="hsl(var(--ping-dark))" />
      </div>
      <h3
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "16px",
          color: "hsl(var(--ping-dark))",
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
    <p
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: "14px",
        color: "hsl(var(--ping-ash))",
        lineHeight: "1.7",
        marginBottom: "16px",
      }}
    >
      {description}
    </p>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {features.map((f) => (
        <li
          key={f}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "13px",
            color: "hsl(var(--ping-ash))",
            marginBottom: "6px",
          }}
        >
          <CheckCircle size={13} color="hsl(var(--ping-yellow))" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 800,
      fontSize: "22px",
      color: "hsl(var(--ping-dark))",
      marginBottom: "8px",
      marginTop: "0",
    }}
  >
    {children}
  </h2>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      fontSize: "16px",
      color: "hsl(var(--ping-dark))",
      marginBottom: "8px",
      marginTop: "28px",
    }}
  >
    {children}
  </h3>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <p
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontSize: "14px",
      color: "hsl(var(--ping-ash))",
      lineHeight: "1.8",
      marginBottom: "16px",
    }}
  >
    {children}
  </p>
);

const Divider = () => (
  <div
    style={{
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(180,130,0,0.2), transparent)",
      margin: "32px 0",
    }}
  />
);

// ─── All Section Content ────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "what-is-pingme",
    title: "What is PingME?",
    badge: "Intro",
    badgeColor: "hsl(var(--ping-yellow))",
    content: (
      <>
        <Body>
          PingME is a privacy-first contact ecosystem that connects people to their vehicles,
          belongings, and pets through NFC tags and QR codes — without ever exposing personal
          information to the scanner.
        </Body>
        <Body>
          Whether your car is parked wrong and someone needs to reach you, your wallet is lost and
          a stranger finds it, or your pet goes missing — PingME lets people contact you instantly
          without seeing your phone number, address, or identity.
        </Body>
        <Callout type="info">
          PingME uses smart relay technology: the finder contacts you through a masked link.
          You decide what info to share and when.
        </Callout>
        <SubHeading>Core Principles</SubHeading>
        {[
          ["Privacy First", "Your personal details are never visible to the scanner by default."],
          ["Instant Contact", "No app needed for the finder — works with any smartphone browser."],
          ["Always On", "Tags work 24/7, no internet required on your end to receive a ping."],
          ["D&B Verified", "PingME (Ping IFF LLP) is Dun & Bradstreet registered and verified."],
        ].map(([title, desc]) => (
          <div
            key={title as string}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "12px",
              alignItems: "flex-start",
            }}
          >
            <ArrowRight
              size={14}
              style={{ color: "hsl(var(--ping-yellow))", marginTop: "4px", flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "14px",
                color: "hsl(var(--ping-ash))",
                lineHeight: "1.6",
              }}
            >
              <strong style={{ color: "hsl(var(--ping-dark))" }}>{title as string}</strong>
              {" — "}
              {desc as string}
            </span>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "how-it-works",
    title: "How It Works",
    badge: "Overview",
    content: (
      <>
        <Body>
          PingME works in three simple steps. Each tag contains either an NFC chip, a QR code,
          or both — linked to your private profile on our servers.
        </Body>
        <StepCard
          number={1}
          title="You attach a PingME tag"
          description="Stick or attach your tag to your vehicle, bag, wallet, or pet collar. Register it to your account via the PingME App or website."
        />
        <StepCard
          number={2}
          title="Someone scans it"
          description="The finder taps their phone on the NFC tag or scans the QR code. They land on a secure app ."
        />
        <StepCard
          number={3}
          title="You get pinged"
          description="You receive a notification via Call or SMS on your phone."
        />
        <Callout type="success">
          The entire process takes under 10 seconds for the finder — no registration, no app install required.
        </Callout>
      </>
    ),
  },
  {
    id: "quick-setup",
    title: "Quick Setup",
    badge: "Setup",
    content: (
      <>
        <Body>
          Getting started with PingME takes less than 5 minutes. Follow these steps to activate
          your first tag.
        </Body>
        <StepCard
          number={1}
          title="Create your account"
          description="Sign up at plzpingme.com with your email. No personal details are publicly visible."
        />
        <StepCard
          number={2}
          title="Order your tag"
          description="Visit plzpingme.com/products and choose the tag type that fits your need — vehicle, pet, or belongings."
        />
        <StepCard
          number={3}
          title="Register your tag"
          description="Scan the QR code on your tag packaging using the PingME app to link it to your profile."
        />
        <StepCard
          number={4}
          title="Attach your tag"
          description="Stick, tie, or clip the tag to your item. Your item is now protected and contactable 24/7."
        />
        <Callout type="warning">
          Make sure your notification preferences are set correctly — without them, you won't receive pings when someone scans your tag.
        </Callout>
      </>
    ),
  },
  {
    id: "vehicle-tags",
    title: "Vehicle Tags",
    badge: "Product",
    content: (
      <>
        <Body>
          PingME Vehicle Tags let strangers contact you when your car is parked in a no-parking
          zone, blocking a driveway, or when there is an emergency — without your number being
          visible on your windscreen.
        </Body>
        <ProductCard
          icon={Tag}
          title="QR Tag"
          description="Weatherproof, UV-resistant tag designed for windshields and bumpers. Works in rain, dust, and direct sunlight."
          features={[
            "UV & waterproof coating",
            "Instant relay notification to owner",
            "Anonymous contact option",
          ]}
        />
        <SubHeading>Use Cases</SubHeading>
        {[
          "Wrong parking alerts — neighbour needs you to move",
          "Accident or damage notification",
          "Headlights left on alerts",
          "Blocking gate / driveway situations",
        ].map((item) => (
          <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <ChevronRight size={14} style={{ color: "hsl(var(--ping-yellow))", marginTop: "4px", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "hsl(var(--ping-ash))" }}>
              {item}
            </span>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "lost-found-tags",
    title: "Lost & Found Tags",
    badge: "Product",
    content: (
      <>
        <Body>
          Attach PingME Lost and Found tags to wallets, bags, keys, luggage, and electronics.
          If lost, anyone who finds the item can contact you immediately — without your details
          being printed on the tag.
        </Body>
        <ProductCard
          icon={Package}
          title="Lost & Found Mini Tag"
          description="Compact, lightweight tags designed for everyday carry items. Available in sticker, keyring, and card formats."
          features={[
            "Compact sticker, keyring & card formats",
            "No personal info on the tag",
            "Works without internet for the finder",
          ]}
        />
      </>
    ),
  },
  {
    id: "pet-safety-tags",
    title: "Pet Safety Tags",
    badge: "Product",
    content: (
      <>
        <Body>
          Keep your pet safe with a PingME Pet Safety Tag on their collar. If your pet gets
          lost, anyone who finds them can immediately contact you — even if they don't have
          a smartphone with an NFC reader.
        </Body>
        <ProductCard
          icon={PawPrint}
          title="Pet Safety Tag"
          description="Durable, pet-safe collar tag with QR. Scratch-resistant printing with rounded edges for pet comfort."
          features={[
            "Scratch and waterproof",
            "Rounded edges — safe for pets",
            "Lightweight (under 5g)",
            "Works with any smartphone camera",
          ]}
        />
        <SubHeading>Recommended Setup for Pets</SubHeading>
        <Body>
          Enable the "Emergency Contact" option in your pet profile — this lets the finder
          see a single trusted contact number (like a vet or family member) directly on the
          finder page without needing your approval.
        </Body>
      </>
    ),
  },
  {
    id: "nfc-smart-cards",
    title: "NFC Smart Cards",
    badge: "Product",
    content: (
      <>
        <Body>
          PingME NFC Smart Cards replace traditional visiting cards. Tap your card on someone's
          phone to instantly share your contact details, portfolio, or any link — fully
          customizable.
        </Body>
        <ProductCard
          icon={CreditCard}
          title="NFC Smart Card"
          description="Premium PVC card with embedded NFC chip. Tap-to-share your digital profile, social links, and contact info instantly."
          features={[
            "Tap-to-share digital profile",
            "Unlimited profile updates",
            "Custom branding available",
            "Works with Android & iPhone",
            "No app needed for receiver",
          ]}
        />
        <Callout type="info">
          Unlike regular NFC cards, PingME Smart Cards link to a dynamic profile — meaning you can update your details anytime without replacing the card.
        </Callout>
      </>
    ),
  },
  {
    id: "nfc-scanning",
    title: "NFC Scanning",
    badge: "Technology",
    content: (
      <>
        <Body>
          NFC (Near Field Communication) allows a smartphone to read your tag by simply being
          held close to it — no camera needed. The phone automatically opens the PingME
          contact page.
        </Body>
        <SubHeading>How to Scan via NFC</SubHeading>
        <StepCard
          number={1}
          title="Enable NFC on the phone"
          description="On Android: Settings > Connected Devices > NFC. On iPhone: NFC is always on for iOS 13+ and does not need to be enabled manually."
        />
        <StepCard
          number={2}
          title="Hold phone near the tag"
          description="Bring the top back of the phone (where NFC antenna usually is) within 2–4 cm of the tag."
        />
        <StepCard
          number={3}
          title="Tap the notification"
          description="A system notification appears. Tap it to open the PingME contact page in the browser."
        />
        <Callout type="warning">
          Some phone cases with metal plates or magnetic wallets can block NFC signals. Remove the case if scanning fails.
        </Callout>
      </>
    ),
  },
  {
    id: "qr-scanning",
    title: "QR Code Scanning",
    badge: "Technology",
    content: (
      <>
        <Body>
          Every PingME tag also includes a QR code as a fallback — ensuring compatibility
          with all smartphones, even those without NFC support.
        </Body>
        <SubHeading>How to Scan via QR Code</SubHeading>
        <StepCard
          number={1}
          title="Open camera app"
          description="Use the built-in camera app on iPhone or Android. No third-party QR scanner needed."
        />
        <StepCard
          number={2}
          title="Point at the QR code"
          description="Center the QR code in the camera viewfinder. A link notification will appear at the top."
        />
        <StepCard
          number={3}
          title="Tap the link"
          description="Tap the notification to open the PingME contact page in your browser."
        />
      </>
    ),
  },
  {
    id: "compatibility",
    title: "Device Compatibility",
    badge: "Technology",
    content: (
      <>
        <SubHeading>NFC Support</SubHeading>
        {[
          ["iPhone", "iPhone 7 and above with iOS 13+. NFC reads automatically — no settings needed."],
          ["Android", "Most Android phones from 2016 onwards. Enable NFC in Settings > Connected Devices."],
          ["Older devices", "Devices without NFC can still use the QR code on the same tag."],
        ].map(([device, info]) => (
          <div
            key={device as string}
            style={{
              padding: "14px 18px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(180,130,0,0.12)",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "hsl(var(--ping-dark))", marginBottom: "4px" }}>
              {device as string}
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "hsl(var(--ping-ash))", lineHeight: "1.6" }}>
              {info as string}
            </div>
          </div>
        ))}
        <Callout type="info">
          QR code scanning works on 100% of smartphones with a camera — making PingME universally accessible.
        </Callout>
      </>
    ),
  },
  {
    id: "privacy-model",
    title: "Privacy Model",
    badge: "Privacy",
    content: (
      <>
        <Body>
          PingME is built on a zero-exposure privacy model. The scanner sees only what you
          explicitly choose to reveal — nothing is shared by default.
        </Body>
        <SubHeading>What the finder NEVER sees</SubHeading>
        {["Your phone number", "Your home address", "Your name (unless you choose)", "Your email address"].map((item) => (
          <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(220,80,20,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
              <span style={{ color: "#dc5014", fontSize: "10px", fontWeight: 800 }}>✕</span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "hsl(var(--ping-ash))" }}>{item}</span>
          </div>
        ))}
        <SubHeading>What the finder CAN see (if you enable it)</SubHeading>
        {["A masked contact button (relay call/message)", "A custom message you've written", "An optional reward notice", "Your first name only (optional)"].map((item) => (
          <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <CheckCircle size={14} style={{ color: "hsl(var(--ping-yellow))", marginTop: "3px", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "hsl(var(--ping-ash))" }}>{item}</span>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "data-protection",
    title: "Data Protection",
    badge: "Privacy",
    content: (
      <>
        <Body>
          All data stored on PingME servers is encrypted at rest and in transit. We follow
          industry-standard practices and comply with applicable Indian data protection laws.
        </Body>
        {[
          [Lock, "End-to-end encrypted relay", "All contact relay messages are encrypted — we cannot read them."],
          [Globe, "Indian data residency", "Your data is stored on servers located within India."],
          [Shield, "No data selling", "We do not sell, share, or monetize your personal data with third parties."],
          [UserCheck, "You control your data", "You can delete your account and all associated data at any time from Settings."],
        ].map(([Icon, title, desc]) => {
          const I = Icon as React.ElementType;
          return (
            <div
              key={title as string}
              style={{
                display: "flex",
                gap: "14px",
                padding: "16px 18px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(180,130,0,0.12)",
                borderRadius: "10px",
                marginBottom: "10px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "hsl(var(--ping-yellow))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I size={16} color="hsl(var(--ping-dark))" />
              </div>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "hsl(var(--ping-dark))", marginBottom: "3px" }}>{title as string}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "hsl(var(--ping-ash))", lineHeight: "1.6" }}>{desc as string}</div>
              </div>
            </div>
          );
        })}
      </>
    ),
  },
  {
    id: "profile-setup",
    title: "Profile Setup",
    badge: "Account",
    content: (
      <>
        <Body>
          Your PingME profile is the page that finders see when they scan your tag. Customize
          it to show exactly what you want — and nothing more.
        </Body>
        <SubHeading>Profile Fields</SubHeading>
        {[
          ["Display Name", "Optional. Can be first name only, a nickname, or left blank."],
          ["Contact Method", "Choose: anonymous relay, masked phone, email, or WhatsApp."],
          ["Custom Message", "A message shown to the finder — e.g., 'Please call me if you find this.'"],
          ["Reward Notice", "Optional monetary or non-monetary reward message."],
        ].map(([field, desc]) => (
          <div
            key={field as string}
            style={{
              padding: "12px 16px",
              borderLeft: "3px solid hsl(var(--ping-yellow))",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "0 8px 8px 0",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "13px", color: "hsl(var(--ping-dark))", marginBottom: "2px" }}>{field as string}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "hsl(var(--ping-ash))" }}>{desc as string}</div>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "managing-tags",
    title: "Managing Tags",
    badge: "Account",
    content: (
      <>
        <Body>
          You can register multiple tags under a single PingME account. Each tag can have its
          own profile and settings — useful if you want different messages for your car vs. your pet.
        </Body>
        <SubHeading>Tag Actions</SubHeading>
        {[
          ["Activate / Deactivate", "Pause a tag temporarily — useful when selling a vehicle."],
          ["Reassign", "Transfer a tag to a different profile or family member."],
          ["Rename", "Give tags friendly names like 'Honda City' or 'Bruno's Collar'."],
          ["Delete", "Permanently removes the tag from your account. The tag becomes inactive."],
        ].map(([action, desc]) => (
          <div
            key={action as string}
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "flex-start",
            }}
          >
            <ArrowRight size={13} style={{ color: "hsl(var(--ping-yellow))", marginTop: "4px", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", color: "hsl(var(--ping-ash))", lineHeight: "1.6" }}>
              <strong style={{ color: "hsl(var(--ping-dark))" }}>{action as string}</strong>
              {" — "}
              {desc as string}
            </span>
          </div>
        ))}
        <Callout type="warning">
          Deactivate (don't delete) your tag if you're selling an item — this prevents the new owner from accidentally pinging you.
        </Callout>
      </>
    ),
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    badge: "Support",
    content: (
      <>
        {[
          ["Does the finder need to install an app?", "No. The finder just scans the NFC tag or QR code with their phone's built-in camera or NFC. The contact page opens directly in their browser."],
          ["What if my phone number changes?", "Just update your contact method in the PingME dashboard. Your tag stays the same — no need to replace it."],
          ["Can I have multiple tags on one account?", "Yes. You can register unlimited tags under one account, each with its own profile."],
          ["Is PingME free?", "Tags are purchased once. There is no monthly subscription for basic features. Premium features like analytics and custom branding are available on paid plans."],
          ["What if someone scans my tag repeatedly or abuses it?", "You can block a scanner from contacting you again from your dashboard. Repeat abuse can be reported to our support team."],
          ["Is my data safe?", "Yes. All data is encrypted, stored in India, and never sold to third parties. See our Privacy Policy for details."],
          ["My NFC tag isn't scanning. What do I do?", "Try removing your phone case, enable NFC in settings, and try again. If issues persist, contact support — we'll replace defective tags."],
        ].map(([q, a]) => (
          <div
            key={q as string}
            style={{
              borderBottom: "1px solid rgba(180,130,0,0.12)",
              paddingBottom: "18px",
              marginBottom: "18px",
            }}
          >
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "hsl(var(--ping-dark))", marginBottom: "6px", display: "flex", gap: "8px" }}>
              <span style={{ color: "hsl(var(--ping-yellow))" }}>Q.</span>
              {q as string}
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "hsl(var(--ping-ash))", lineHeight: "1.7", paddingLeft: "20px" }}>
              {a as string}
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Support",
    badge: "Support",
    content: (
      <>
        <Body>
          Our support team is available Monday–Saturday, 10 AM – 6 PM IST. We typically respond
          within 4 business hours.
        </Body>
        {[
          [Phone, "Phone", "+91 73473 40007", "tel:+917347340007"],
          [Mail, "Email", "contact@pingiff.ai", "mailto:contact@pingiff.ai"],
        ].map(([Icon, label, value, href]) => {
          const I = Icon as React.ElementType;
          return (
            <a
              key={label as string}
              href={href as string}
              style={{
                display: "flex",
                gap: "14px",
                padding: "18px 20px",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(180,130,0,0.15)",
                borderRadius: "12px",
                marginBottom: "12px",
                textDecoration: "none",
                alignItems: "center",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "hsl(var(--ping-yellow))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <I size={18} color="hsl(var(--ping-dark))" />
              </div>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(var(--ping-brown))", marginBottom: "2px" }}>
                  {label as string}
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", fontWeight: 600, color: "hsl(var(--ping-yellow))" }}>
                  {value as string}
                </div>
              </div>
            </a>
          );
        })}
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            background: "rgba(180,130,0,0.05)",
            border: "1px solid rgba(180,130,0,0.15)",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "hsl(var(--ping-dark))", marginBottom: "4px" }}>
            Office Address
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px", color: "hsl(var(--ping-ash))", lineHeight: "1.8" }}>
            745, Burail, Ekta Market,<br />
            Burail Village, Sector 45,<br />
            Chandigarh – 160047, India
          </div>
        </div>
      </>
    ),
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("what-is-pingme");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "getting-started": true,
    products: false,
    scanning: false,
    privacy: false,
    account: false,
    support: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Ref for the sidebar so we can scroll the active item into view
  const sidebarRef = useRef<HTMLDivElement>(null);
  // Ref to track if a manual click scroll is in progress (to avoid observer fighting it)
  const isManualScrollRef = useRef(false);

  // ── IntersectionObserver: update activeSection on scroll ──────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // We track which sections are currently intersecting and pick the topmost one
    const visibleSections = new Set<string>();

    const pickActive = () => {
      // Among all currently visible sections, pick the one that appears first in SECTIONS order
      for (const section of SECTIONS) {
        if (visibleSections.has(section.id)) {
          setActiveSection((prev) => {
            if (prev !== section.id) return section.id;
            return prev;
          });
          return;
        }
      }
    };

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.add(section.id);
            } else {
              visibleSections.delete(section.id);
            }
          });
          pickActive();
        },
        {
          // Fire when section top enters within the top 30% of the viewport
          rootMargin: "-10% 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  // ── Auto-expand the group that contains the activeSection ─────────────────
  useEffect(() => {
    const group = NAV.find((g) => g.children?.some((c) => c.id === activeSection));
    if (group) {
      setExpandedGroups((prev) => {
        if (prev[group.id]) return prev; // already open, no update
        return { ...prev, [group.id]: true };
      });
    }
  }, [activeSection]);

  // ── Scroll the sidebar so the active nav item is visible ──────────────────
  useEffect(() => {
    if (!sidebarRef.current) return;
    // Find the active button inside the sidebar
    const activeBtn = sidebarRef.current.querySelector(
      `[data-section-id="${activeSection}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeSection]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    // Expand the group
    const group = NAV.find((g) => g.children?.some((c) => c.id === id));
    if (group) setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));

    setActiveSection(id);
    isManualScrollRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Give scroll time to finish before re-enabling observer updates
      setTimeout(() => {
        isManualScrollRef.current = false;
      }, 800);
    }
  };

  const filteredSections = searchQuery.trim()
    ? SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.badge?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF9EB",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "#FFF9EB",
          borderBottom: "1px solid rgba(180,130,0,0.15)",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>


<Link to="/">
  <img
    src={logo}
    alt="PingME"
    className="h-10 w-auto"
  />
</Link>
          <span style={{ color: "rgba(180,130,0,0.4)", fontSize: "18px" }}>/</span>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              color: "hsl(var(--ping-ash))",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookOpen size={14} />
            Documentation
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/contact"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              color: "hsl(var(--ping-ash))",
              textDecoration: "none",
            }}
          >
            Support
          </Link>
          <Link
            to="/products"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              color: "hsl(var(--ping-dark))",
              textDecoration: "none",
              padding: "6px 16px",
              background: "hsl(var(--ping-yellow))",
              borderRadius: "8px",
            }}
          >
            Shop Tags
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto" }}>
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside
          ref={sidebarRef}
          style={{
            width: "260px",
            flexShrink: 0,
            position: "sticky",
            top: "60px",
            height: "calc(100vh - 60px)",
            overflowY: "auto",
            borderRight: "1px solid rgba(180,130,0,0.12)",
            padding: "24px 16px",
            scrollBehavior: "smooth",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(180,130,0,0.2)",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <Search size={13} style={{ color: "hsl(var(--ping-ash))", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "13px",
                color: "hsl(var(--ping-dark))",
                width: "100%",
              }}
            />
          </div>

          {/* Search results */}
          {filteredSections ? (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "hsl(var(--ping-brown))",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "10px",
                  paddingLeft: "8px",
                }}
              >
                {filteredSections.length} result{filteredSections.length !== 1 ? "s" : ""}
              </div>
              {filteredSections.map((s) => (
                <button
                  key={s.id}
                  data-section-id={s.id}
                  onClick={() => {
                    setSearchQuery("");
                    scrollToSection(s.id);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "7px",
                    border: "none",
                    background: activeSection === s.id ? "rgba(180,130,0,0.1)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                    color: activeSection === s.id ? "hsl(var(--ping-dark))" : "hsl(var(--ping-ash))",
                    fontWeight: activeSection === s.id ? 600 : 400,
                    marginBottom: "2px",
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          ) : (
            NAV.map((group) => {
              const Icon = group.icon;
              const isOpen = expandedGroups[group.id];
              // Check if any child in this group is active
              const groupHasActive = group.children?.some((c) => c.id === activeSection);

              return (
                <div key={group.id} style={{ marginBottom: "4px" }}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: groupHasActive ? "rgba(180,130,0,0.05)" : "transparent",
                      cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: groupHasActive ? "hsl(var(--ping-yellow))" : "hsl(var(--ping-brown))",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      transition: "color 0.2s, background 0.2s",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <Icon size={13} />
                      {group.label}
                    </span>
                    <ChevronRight
                      size={12}
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </button>
                  {isOpen && group.children && (
                    <div style={{ paddingLeft: "8px", marginTop: "2px", marginBottom: "8px" }}>
                      {group.children.map((child) => {
                        const isActive = activeSection === child.id;
                        return (
                          <button
                            key={child.id}
                            data-section-id={child.id}
                            onClick={() => scrollToSection(child.id)}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 12px",
                              borderRadius: "7px",
                              border: "none",
                              background: isActive
                                ? "rgba(180,130,0,0.12)"
                                : "transparent",
                              cursor: "pointer",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "13px",
                              color: isActive
                                ? "hsl(var(--ping-dark))"
                                : "hsl(var(--ping-ash))",
                              fontWeight: isActive ? 700 : 400,
                              marginBottom: "1px",
                              borderLeft: isActive
                                ? "2px solid hsl(var(--ping-yellow))"
                                : "2px solid transparent",
                              // Glow effect for active item
                              boxShadow: isActive
                                ? "0 0 0 1px rgba(180,130,0,0.15), inset 0 0 8px rgba(180,130,0,0.08)"
                                : "none",
                              transition: "all 0.25s ease",
                            }}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </aside>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "48px 56px", maxWidth: "800px" }}>
          {/* Hero */}
          <div style={{ marginBottom: "48px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                background: "rgba(180,130,0,0.08)",
                border: "1px solid rgba(180,130,0,0.2)",
                borderRadius: "20px",
                marginBottom: "16px",
              }}
            >
              <BookOpen size={12} style={{ color: "hsl(var(--ping-yellow))" }} />
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "hsl(var(--ping-brown))",
                  letterSpacing: "0.05em",
                }}
              >
                DOCUMENTATION
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "36px",
                color: "hsl(var(--ping-dark))",
                margin: "0 0 12px 0",
                letterSpacing: "-0.03em",
                lineHeight: "1.1",
              }}
            >
              PingME Docs
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "15px",
                color: "hsl(var(--ping-ash))",
                lineHeight: "1.7",
                margin: 0,
              }}
            >
              Everything you need to know about setting up, using, and managing your
              PingME tags and account.
            </p>
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, rgba(180,130,0,0.3), transparent)",
                marginTop: "32px",
              }}
            />
          </div>

          {/* Quick nav cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "56px",
            }}
          >
            {[
              { icon: Zap, label: "Quick Setup", id: "quick-setup" },
              { icon: Wifi, label: "NFC Scanning", id: "nfc-scanning" },
              { icon: Shield, label: "Privacy Model", id: "privacy-model" },
              { icon: QrCode, label: "QR Scanning", id: "qr-scanning" },
              { icon: Smartphone, label: "Compatibility", id: "compatibility" },
              { icon: HelpCircle, label: "FAQ", id: "faq" },
            ].map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "16px",
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(180,130,0,0.15)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--ping-yellow))";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(180,130,0,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.6)";
                }}
              >
                <Icon size={18} style={{ color: "hsl(var(--ping-yellow))" }} />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "hsl(var(--ping-dark))",
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* All Sections rendered */}
          {SECTIONS.map((section, idx) => (
            <div key={section.id} id={section.id} style={{ marginBottom: "64px" }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <SectionHeading>{section.title}</SectionHeading>
                {section.badge && (
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      background: "rgba(180,130,0,0.1)",
                      color: "hsl(var(--ping-brown))",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {section.badge}
                  </span>
                )}
              </div>
              {section.content}
              {idx < SECTIONS.length - 1 && <Divider />}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default DocsPage;