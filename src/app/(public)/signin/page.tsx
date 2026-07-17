"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function AwsSignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8">
        <div className="text-4xl font-bold tracking-tight">
          <span className="text-[#232f3e]">aws</span>
          <svg
            className="inline-block ml-1 w-10 h-6 text-[#ff9900]"
            viewBox="0 0 100 60"
            fill="none"
          >
            <path
              d="M 0 40 C 20 10, 80 10, 100 40"
              stroke="#ff9900"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-0 items-start justify-center">
        {/* Left: Form Card */}
        <div className="w-full lg:w-[380px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 pb-4">
            <h1 className="text-[22px] font-semibold text-[#16191f] mb-1">
              IAM user sign in
            </h1>
            <p className="text-sm text-[#16191f]">
              Account ID or alias{" "}
              <span className="inline-flex items-center">
                <svg
                  className="w-4 h-4 text-[#0073bb] ml-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.217l.919 6.632A1 1 0 0012.323 18H12a1 1 0 00-1 1v-.1a.1.1 0 01.1-.1h1.1a.9.9 0 00.9-.9v-.632a.25.25 0 01.244-.217H14a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.217l-.919-6.632A1 1 0 009.677 7H10a1 1 0 001-1v.1a.1.1 0 01-.1.1H9.9a.9.9 0 00-.9.9v.632a.25.25 0 01-.244.217H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <a href="#" className="text-[#0073bb] hover:underline ml-1 text-sm">
                (Don&apos;t have?)
              </a>
            </p>
          </div>

          <div className="px-6 pb-4">
            <input
              type="text"
              className="w-full h-[31px] px-3 text-[#16191f] text-sm border border-[#687078] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-[#0073bb]"
            />
          </div>

          <div className="px-6 pb-4">
            <label className="flex items-center gap-2 text-sm text-[#16191f]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-[#0073bb]"
              />
              Remember this account
            </label>
          </div>

          <div className="px-6 pb-3">
            <label className="block text-sm font-semibold text-[#16191f] mb-1.5">
              IAM username
            </label>
            <input
              type="text"
              className="w-full h-[31px] px-3 text-[#16191f] text-sm border border-[#687078] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-[#0073bb]"
            />
          </div>

          <div className="px-6 pb-2">
            <label className="block text-sm font-semibold text-[#16191f] mb-1.5">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-[31px] px-3 text-[#16191f] text-sm border border-[#687078] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-[#0073bb]"
            />
          </div>

          <div className="px-6 pb-4 flex items-center justify-between">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#0073bb] text-sm hover:underline"
            >
              Show Password
            </button>
            <a href="#" className="text-[#0073bb] text-sm hover:underline">
              Having trouble?
            </a>
          </div>

          <div className="px-6 pb-4">
            <button className="w-full h-[31px] bg-[#ff9900] hover:bg-[#ec7211] text-[#16191f] text-sm font-semibold rounded-full transition-colors">
              Sign in
            </button>
          </div>

          <div className="px-6 pb-6">
            <a
              href="#"
              className="block w-full h-[31px] border border-[#0073bb] text-[#0073bb] text-sm font-semibold rounded-full hover:bg-[#f2f8fd] text-center leading-[29px] transition-colors"
            >
              Sign in using root user email
            </a>
          </div>
        </div>

        {/* Right: Promo Card */}
        <div className="w-full lg:w-[380px] lg:ml-6 mt-6 lg:mt-0">
          <div className="relative h-[500px] bg-[#161d2e] rounded-xl overflow-hidden shadow-sm">
            {/* Abstract gradient lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-[20%] left-[-20%] w-[140%] h-[2px] bg-gradient-to-r from-transparent via-[#ff9900] to-transparent transform rotate-[-5deg] opacity-70" />
              <div className="absolute top-[35%] left-[-10%] w-[120%] h-[3px] bg-gradient-to-r from-transparent via-[#ff9900] to-transparent transform rotate-[-3deg] opacity-50" />
              <div className="absolute top-[50%] left-[-30%] w-[160%] h-[2px] bg-gradient-to-r from-transparent via-[#ff9900] to-transparent transform rotate-[-2deg] opacity-40" />
              <div className="absolute top-[65%] left-[-10%] w-[130%] h-[2px] bg-gradient-to-r from-transparent via-[#ff9900] to-transparent transform rotate-[2deg] opacity-60" />
              {/* Top right glow */}
              <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-gradient-to-bl from-[#ff9900]/20 via-[#ff5e00]/10 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="text-3xl font-semibold text-white mb-3">
                Grow faster with AI
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-6">
                AI solutions built for small businesses —
                <br />
                ready to deploy with trusted AWS Partners
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-white text-base font-semibold hover:underline group"
              >
                Learn more
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-[#5f6b7a]">
        100% Privacy Guaranteed
      </div>
    </div>
  );
}
