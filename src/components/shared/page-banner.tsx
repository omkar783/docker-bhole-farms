"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface CTA {
  label: string;
  href: string;
}

interface PageBannerProps {
  backgroundImage: string;
  badge?: string;
  heading: string;
  highlightedWord?: string;
  highlightedGradient?: string;
  subtitle: string;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  rightImage?: string;
  rightImageAlt?: string;
  showRatingCard?: boolean;
  showTrustBadges?: boolean;
}

const trustBadges = [
  { icon: "🌿", label: "100% Organic" },
  { icon: "🧪", label: "Chemical Free" },
  { icon: "🚚", label: "Fast Delivery" },
  { icon: "👨‍🌾", label: "Farm Fresh" },
];

export function PageBanner({
  backgroundImage,
  badge = "🌿 100% Organic",
  heading,
  highlightedWord,
  highlightedGradient = "linear-gradient(90deg, #A5D66D, #F4C542)",
  subtitle,
  primaryCTA = { label: "Explore Products", href: "/products" },
  secondaryCTA = { label: "Visit Farm", href: "/about" },
  rightImage,
  rightImageAlt = "Bhole Farms",
  showRatingCard = !!rightImage,
  showTrustBadges = true,
}: PageBannerProps) {
  const parts = highlightedWord
    ? heading.split(highlightedWord)
    : [heading];

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "calc(100vh - 88px)", paddingTop: "120px", paddingBottom: "180px" }}
    >
      {/* Layer 0: Background Image */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Layer 1: Dark green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

      {/* Layer 2: Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Layer 3: Sunlight rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ray origin-center opacity-0"
          style={{
            background: "linear-gradient(135deg, transparent 30%, rgba(255,248,220,0.06) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Layer 4: Glow circles */}
      <div className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[5%] w-64 h-64 rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

      {/* Layer 5: Floating leaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-16 left-[8%] w-8 h-8 text-white/8 animate-leaf-drift" viewBox="0 0 100 100" fill="currentColor">
          <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
        </svg>
        <svg className="absolute top-32 right-[12%] w-6 h-6 text-white/8 animate-float-slow" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "2s" }}>
          <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
        </svg>
        <svg className="absolute bottom-24 left-[15%] w-5 h-5 text-white/8 animate-leaf-drift" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "4s", animationDuration: "14s" }}>
          <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
        </svg>
        <svg className="absolute bottom-16 right-[20%] w-7 h-7 text-white/8 animate-float" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "1s" }}>
          <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
        </svg>
      </div>

      {/* Layer 6: Glowing particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: "20%", left: "10%", delay: "0s", size: "3px" },
          { top: "35%", left: "85%", delay: "0.5s", size: "2px" },
          { top: "60%", left: "5%", delay: "1s", size: "4px" },
          { top: "70%", left: "80%", delay: "1.5s", size: "2px" },
          { top: "45%", left: "50%", delay: "2s", size: "3px" },
          { top: "80%", left: "60%", delay: "2.5s", size: "2px" },
          { top: "25%", left: "70%", delay: "3s", size: "3px" },
          { top: "55%", left: "25%", delay: "3.5s", size: "2px" },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30 animate-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Layer 7: Content */}
      <div className="relative z-10 w-full px-6 md:px-10 lg:px-20" style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="flex items-center justify-between" style={{ gap: "80px" }}>
          {/* Left Column */}
          <div className="max-w-xl">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 text-sm text-white/90"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {badge}
            </motion.span>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
              style={{ marginTop: "24px" }}
            >
              {highlightedWord ? (
                <>
                  {parts[0]}
                  <span
                    className="bg-clip-text text-transparent bg-gradient-to-r from-[#A5D66D] to-[#F4C542]"
                  >
                    {highlightedWord}
                  </span>
                  {parts[1]}
                </>
              ) : (
                heading
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base md:text-lg text-white/70 leading-relaxed max-w-[520px]"
              style={{ marginTop: "24px" }}
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ marginTop: "40px", display: "flex", flexWrap: "wrap", gap: "20px" }}
            >
              {primaryCTA && (
                <Link
                  href={primaryCTA.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 text-sm font-button font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:shadow-primary/35 hover:-translate-y-0.5 hover:bg-[#1a6b20]"
                  style={{ height: "56px", borderRadius: "999px" }}
                >
                  {primaryCTA.label}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 text-sm font-button font-semibold text-white transition-all hover:bg-white/20 hover:-translate-y-0.5"
                  style={{ height: "56px", borderRadius: "999px" }}
                >
                  {secondaryCTA.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                </Link>
              )}
            </motion.div>

            {/* Trust Badges */}
            {showTrustBadges && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                style={{ marginTop: "40px", display: "flex", flexWrap: "wrap", gap: "40px 24px" }}
              >
                {trustBadges.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-xs text-white/60">
                    <span>{badge.icon}</span>
                    <span className="text-white/70 font-medium">{badge.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          {(rightImage || showRatingCard) && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex flex-col items-center gap-6 shrink-0"
            >
              {/* Floating Image */}
              {rightImage && (
                <div className="relative">
                  <div
                    className="w-[280px] h-[320px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.18)] rotate-[3deg] hover:rotate-0 transition-transform duration-700"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${rightImage})` }}
                      role="img"
                      aria-label={rightImageAlt}
                    />
                  </div>
                  {/* Shadow under floating image */}
                  <div className="absolute -bottom-4 left-[10%] right-[10%] h-6 bg-black/10 blur-xl rounded-full" />
                </div>
              )}

              {/* Glass Rating Card */}
              {showRatingCard && (
                <div className="glass-dark rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl backdrop-blur-xl border border-white/15 min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span className="text-white font-bold text-sm">4.9</span>
                  </div>
                  <div className="h-6 w-px bg-white/15" />
                  <div className="text-xs text-white/80">
                    <span className="font-semibold text-white">5000+</span> Happy Customers
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Layer 8: Organic Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
          <path
            fill="#F8F8F5"
            d="M0,40 C240,100 480,0 720,40 C960,80 1200,0 1440,40 L1440,100 L0,100 Z"
          />
          <path
            fill="#1B5E20"
            opacity="0.03"
            d="M0,55 C240,95 480,15 720,55 C960,95 1200,15 1440,55 L1440,100 L0,100 Z"
          />
        </svg>
      </div>
    </section>
  );
}
