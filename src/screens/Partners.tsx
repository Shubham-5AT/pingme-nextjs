'use client';

import MainLayout from "@/layouts/MainLayout";
import Link from "next/link";
import { BadgeCheck, Building2, Handshake, Rocket, ShieldCheck, Users } from "lucide-react";
import pingMeLogo from "@/assets/pingprocard_logo.jpeg";
import collaborationCard from "@/assets/pingprocard.jpeg";

const programHighlights = [
  {
    icon: Rocket,
    title: "Pilot Program Launch",
    description: "Pro Ultimate Gym Chain is our first official collaborator for testing high-traffic safety communication use cases.",
  },
  {
    icon: Users,
    title: "Member Safety Experience",
    description: "The pilot introduces privacy-first owner alerts to improve response time and member support around parked vehicles.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    description: "All interactions are built on PingME's masked communication framework to protect personal contact details.",
  },
];

const outcomes = [
  "Pilot onboarding for Pro Ultimate locations",
  "Operational feedback loop between gym teams and PingME",
  "Measure notification response and issue resolution time",
  "Prepare a scalable partnership rollout model",
];

const Partners = () => {
  return (
    <MainLayout>
      <section className="relative overflow-hidden py-14 md:py-20 text-stone-900" style={{ backgroundColor: '#FCF3E0' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(250,204,21,0.08)_0%,rgba(250,204,21,0.02)_20%,rgba(0,0,0,0)_42%,rgba(0,0,0,0)_58%,rgba(239,68,68,0.02)_80%,rgba(239,68,68,0.08)_100%)]" />
          <div className="absolute -left-40 top-10 h-[40rem] w-[40rem] rounded-full bg-yellow-300/30 blur-[170px] opacity-60" />
          <div className="absolute -left-8 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-amber-400/20 blur-[140px] opacity-50" />
          <div className="absolute -right-32 top-8 h-[42rem] w-[42rem] rounded-full bg-red-500/20 blur-[180px] opacity-60" />
          <div className="absolute right-[-4rem] bottom-[-7rem] h-[30rem] w-[30rem] rounded-full bg-rose-600/20 blur-[150px] opacity-50" />
        </div>

        <div className="container relative space-y-12">
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800 shadow-sm backdrop-blur-sm">
              Partners
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 md:text-5xl">
              Building Safer Experiences Through Strategic Collaboration
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-stone-600">
              PingME is proud to announce a pilot partnership with{" "}
              <span className="font-semibold text-amber-800">Pro Ultimate Gym Chain</span>, our first collaborator. This
              program validates how privacy-first communication can improve member safety and day-to-day operations.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                role="button"
                className="inline-block w-full sm:w-auto text-center bg-amber-200/40 hover:bg-amber-300/50 border border-amber-400/40 text-amber-950 font-extrabold text-2xl md:text-3xl px-6 py-4 rounded-2xl shadow-md transition-colors"
              >
                Want to collaborate with us? Contact us
              </Link>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.75rem] border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-md">
                  <img src={pingMeLogo.src} alt="PingME logo" className="h-12 w-auto object-contain rounded-xl" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500/25 to-amber-400/20 text-amber-800 shadow-sm">
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">Collaboration Partner</p>
                  <h2 className="text-2xl font-bold text-stone-900">Pro Ultimate Gym Chain</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {programHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-stone-200 bg-white/70 p-4 backdrop-blur-sm shadow-sm">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-amber-400/20 shadow-sm">
                        <Icon className="h-5 w-5 text-amber-800" />
                      </div>
                      <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-300/30 bg-white/50 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                  <BadgeCheck className="h-4 w-4 text-red-500" />
                  Pilot Program Objectives
                </div>
                <ul className="space-y-2">
                  {outcomes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shadow-none" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="rounded-[1.75rem] border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-amber-400/20">
                  <Building2 className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">Partnership Preview</p>
                  <h3 className="text-xl font-bold text-stone-900">Collaboration Snapshot</h3>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100/80">
                <img src={collaborationCard.src} alt="PingME collaboration card" className="w-full object-cover" />
              </div>

              <p className="mt-4 text-sm leading-7 text-stone-600">
                This pilot marks the beginning of PingME's partnership track. We are working closely with Pro Ultimate Gym
                Chain to shape reliable, privacy-first communication at scale.
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Want to collaborate with us?{" "}
                <Link href="/contact" className="font-semibold text-amber-800 hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </aside>
          </div>

          {/* -- BECOME A PARTNER -- */}
          <div className="rounded-[1.75rem] border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-amber-400/20 shadow-sm">
                <Handshake className="h-5 w-5 text-amber-800" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/80">Get Started</p>
                <h2 className="text-xl font-bold text-stone-900">Become a Partner</h2>
              </div>
            </div>

            <p className="mb-6 text-sm leading-7 text-stone-600">
              Interested in bringing PingME to your gym, society, or office? Reach out to us and let's build something
              together.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Company", value: "Ping IFF LLP", href: undefined },
                { label: "Address", value: "745, Burail, Ekta Market, Sector 45, Chandigarh – 160047", href: undefined },
                { label: "Phone", value: "+91 73473 40007", href: "tel:+917347340007" },
                { label: "Email", value: "contact@pingiff.ai", href: "mailto:contact@pingiff.ai" },
              ].map(({ label, value, href }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-stone-200 bg-white/60 p-4 backdrop-blur-sm"
                >
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800/70">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="break-all text-sm font-medium text-stone-700 transition-colors hover:text-amber-800"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium leading-5 text-stone-700">{value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-200/40 px-6 py-2.5 text-sm font-semibold text-amber-950 transition-all hover:bg-amber-300/50"
              >
                Contact Us to Partner
                <span className="text-amber-800">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Partners;
