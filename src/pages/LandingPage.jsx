import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  PhoneCall,
  Activity,
  Smile,
  Pill,
  Star,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage({ onNavigate, onDemoLogin }) {
  return (
    <div className="min-h-screen bg-[#F5F5F9] text-slate-900 selection:bg-bento-lime selection:text-slate-950">
      {/* Top Floating Navigation */}
      <header className="sticky top-0 z-40 bg-[#F5F5F9]/90 backdrop-blur-md pt-3 pb-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white/90 rounded-full border border-slate-200/80 shadow-subtle px-5 sm:px-7 py-3 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-4.5 h-4.5 fill-bento-lime text-bento-lime" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">Sahaaya</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#features" className="hover:text-slate-950 transition-colors">Services</a>
            <a href="#personas" className="hover:text-slate-950 transition-colors">Personas</a>
            <a href="#about" className="hover:text-slate-950 transition-colors">About</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 px-4 py-2 rounded-full transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onDemoLogin('elderly')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-300 bg-white/80 hover:bg-white text-slate-800 transition-all shadow-2xs"
            >
              <span>Explore Demo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <Button
              variant="electric"
              size="sm"
              onClick={() => onNavigate('register')}
              className="text-xs px-5 py-2 font-bold shadow-sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Bento Hero Grid */}
      <section className="pt-6 pb-16 sm:pt-8 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Hero Row: Main Lavender Card + Cornflower Service Module */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Lavender Hero Card (Col 8) */}
            <div className="lg:col-span-8 bg-bento-lavender rounded-[32px] sm:rounded-[40px] border border-bento-lavender-border p-7 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col justify-between shadow-subtle min-h-[460px]">
              {/* Organic Coral Glow Accents */}
              <div className="absolute top-10 right-10 w-64 h-64 bg-bento-coral/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-28 w-52 h-52 bg-bento-lime/30 rounded-full blur-2xl pointer-events-none" />

              {/* Top Row: Floating Rating Badge + Content */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] font-sans">
                    Trusted Care & Medication for your loved ones
                  </h1>

                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('register')}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-bento-lime text-slate-950 font-extrabold text-sm sm:text-base hover:bg-bento-lime-hover shadow-sm transition-all transform active:scale-95 group border border-lime-400"
                    >
                      <span>Get Started</span>
                      <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Hero Photo & Floating Rating Card (Reference Inspiration) */}
                <div className="relative shrink-0 self-center lg:self-auto">
                  {/* Organic Coral Blob Behind Subject */}
                  <div className="absolute -top-4 -right-4 w-52 h-52 bg-bento-coral rounded-full opacity-90 blur-xs" />
                  <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-bento-coral/80 rounded-full blur-xs" />

                  {/* Rounded Subject Photo */}
                  <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-full overflow-hidden border-4 border-white shadow-card relative z-10 bg-slate-200">
                    <img 
                      src="/images/premium_photo-1663036976879-4baf18adfd5b.avif" 
                      alt="Caregiver with senior loved one" 
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>

                  {/* Floating 4.9 Rating Card Over Photo */}
                  <div className="absolute -bottom-3 -left-4 z-20 bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3 shadow-card flex flex-col items-center">
                    <div className="flex items-center gap-1 text-slate-950 font-black text-base">
                      <span>4.9</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Family-Rated</span>
                  </div>
                </div>
              </div>

              {/* Sub-hero divider & brand accreditation */}
              <div className="relative z-10 pt-10 sm:pt-14 mt-auto">
                <div className="h-px bg-slate-900/10 mb-6" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 underline underline-offset-4 decoration-slate-900/40">
                      CARECIRCLE
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 max-w-sm">
                      Care that connects generations across families & caregivers
                    </span>
                  </div>

                  {/* Trust Rating Pill with Avatar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      KS
                    </div>
                    <div className="px-3 py-1 rounded-full bg-bento-lime text-slate-950 text-xs font-black border border-lime-400 shadow-2xs">
                      5.0 ★
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Cornflower Regimen Module (Col 4) */}
            <div className="lg:col-span-4 bg-bento-cornflower rounded-[32px] sm:rounded-[40px] border border-bento-cornflower-dark p-7 sm:p-8 text-white flex flex-col justify-between shadow-subtle min-h-[460px] relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between pb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/80">Our Services</span>
                  <Sparkles className="w-4 h-4 text-bento-lime" />
                </div>

                <h3 className="text-2xl font-black text-white leading-tight mb-4">
                  Elderly Care Regimen & Support
                </h3>
                <p className="text-xs text-white/80 leading-relaxed mb-6">
                  Intelligent scheduling tailored for seniors, loved ones, and professional nurse shifts.
                </p>

                {/* Tactile Floating Sticker Pills */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <span className="px-3.5 py-1.5 rounded-full border border-white/70 bg-white/10 text-white text-xs font-semibold -rotate-2 hover:rotate-0 transition-transform cursor-default">
                    Morning Blood Pressure
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full border border-white/70 bg-white/10 text-white text-xs font-semibold rotate-2 hover:rotate-0 transition-transform cursor-default">
                    Insulin at Lunch
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full border border-white/70 bg-white/10 text-white text-xs font-semibold -rotate-1 hover:rotate-0 transition-transform cursor-default">
                    Bedtime Statin
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full border border-white/70 bg-white/10 text-white text-xs font-semibold rotate-3 hover:rotate-0 transition-transform cursor-default">
                    Doctor Checkup
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full border border-white/70 bg-white/10 text-white text-xs font-semibold -rotate-2 hover:rotate-0 transition-transform cursor-default">
                    SOS Emergency Dial
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white text-slate-950 text-xs font-black shadow-sm hover:scale-105 transition-transform cursor-default">
                    More +
                  </span>
                </div>
              </div>

              {/* Bottom Quick Trigger */}
              <div className="pt-8 border-t border-white/20 mt-6 flex items-center justify-between">
                <span className="text-xs font-medium text-white/90">Experience 1-click preview</span>
                <button
                  onClick={() => onDemoLogin('elderly')}
                  className="w-9 h-9 rounded-full bg-bento-lime text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
                  title="Launch Elderly Demo"
                >
                  <ArrowUpRight className="w-5 h-5 font-bold" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bento Row: Split Mint Feature Card + Warm Peach Metric Card */}
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Mint Dual-Column Split Card (Col 7) */}
            <div className="lg:col-span-7 bg-bento-mint rounded-[32px] sm:rounded-[40px] border border-bento-mint-border p-7 sm:p-9 shadow-subtle">
              <div className="grid sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/10">
                {/* Column 1: Professional Care */}
                <div className="space-y-3 sm:pr-4">
                  <div className="w-11 h-11 rounded-full border border-slate-900/20 bg-white/60 flex items-center justify-center text-slate-900 mb-4">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-black text-slate-950 font-sans">
                    Connected Family Care
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    We understand the vital importance of entrusting your parent's well-being to capable, attentive hands — whether at home or miles away.
                  </p>
                </div>

                {/* Column 2: Zero Missed Doses */}
                <div className="space-y-3 pt-6 sm:pt-0 sm:pl-8">
                  <div className="w-11 h-11 rounded-full border border-slate-900/20 bg-white/60 flex items-center justify-center text-slate-900 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-black text-slate-950 font-sans">
                    Zero-Cost, Accessible
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    We believe every senior deserves exceptional care management regardless of tech familiarity or budget constraints. 100% free forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Warm Peach Highlight Card (Col 5) */}
            <div className="lg:col-span-5 bg-bento-peach rounded-[32px] sm:rounded-[40px] border border-bento-peach-border p-7 sm:p-9 flex flex-col justify-between shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-bento-coral text-white text-xs font-bold tracking-wide shadow-2xs">
                  Top Rated
                </span>
                <button
                  onClick={() => onDemoLogin('family')}
                  className="w-9 h-9 rounded-full bg-bento-lime text-slate-950 flex items-center justify-center hover:scale-105 transition-transform border border-lime-400 shadow-2xs"
                  title="Explore Family Overview"
                >
                  <ArrowUpRight className="w-5 h-5 font-bold" />
                </button>
              </div>

              {/* Decorative Rhythm Lines */}
              <div className="py-8 space-y-2 opacity-30">
                <div className="h-0.5 bg-slate-900/30 w-3/4 mx-auto rounded-full" />
                <div className="h-0.5 bg-slate-900/30 w-1/2 mx-auto rounded-full" />
              </div>

              {/* Bottom Metrics with Avatars */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans leading-tight">
                    More Than 2k Doses Protected
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Zero Missed Doses Logged
                  </p>
                </div>

                {/* Stacked Circular Avatars with Real Photos */}
                <div className="flex -space-x-2.5 shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-2xs">
                    <img 
                      src="/images/premium_photo-1674855780695-b5d5c3e86b88.avif" 
                      alt="Kamla Sharma" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-2xs">
                    <img 
                      src="/images/premium_photo-1663036976879-4baf18adfd5b.avif" 
                      alt="Rohan Sharma" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-2xs">
                    <img 
                      src="/images/premium_photo-1663089870095-c231a534ac31.avif" 
                      alt="Nurse Priya Rao" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Interactive Personas Bento Showcase with Authentic Photography */}
      <section id="personas" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold uppercase tracking-widest border border-slate-200">
              Interactive Demonstrations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-sans">
              Three tailored perspectives, one shared Care Circle
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Click any persona below to immediately experience Sahaaya from their perspective with pre-populated medical regimens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Persona 1: Kamla Sharma (Elderly) */}
            <div 
              onClick={() => onDemoLogin('elderly')}
              className="bg-bento-lavender rounded-[32px] p-6 sm:p-7 border border-bento-lavender-border hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Photo Header */}
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/60 shadow-subtle relative">
                  <img 
                    src="/images/premium_photo-1674855780695-b5d5c3e86b88.avif" 
                    alt="Elderly patient Kamla Sharma" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-950 text-[10px] font-extrabold uppercase tracking-wider border border-white shadow-2xs">
                      Elderly Individual
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">Kamla Sharma</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Age 74 • Daily Regimen</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-bento-lime group-hover:text-slate-950 transition-colors">
                    <ArrowUpRight className="w-4 h-4 font-bold" />
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Designed for independence. Massive 56px touch targets, distraction-free medication schedule, and single-tap dose confirmation.
                </p>
              </div>

              <div className="pt-5 border-t border-slate-900/10 mt-5 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Try Senior View</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 2: Rohan Sharma (Family Admin) */}
            <div 
              onClick={() => onDemoLogin('family')}
              className="bg-bento-peach rounded-[32px] p-6 sm:p-7 border border-bento-peach-border hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Photo Header */}
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/60 shadow-subtle relative">
                  <img 
                    src="/images/photo-1454875392665-2ac2c85e8d3e.avif" 
                    alt="Family Caregiving" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-950 text-[10px] font-extrabold uppercase tracking-wider border border-white shadow-2xs">
                      Family Member
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">Rohan Sharma</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Son • Circle Admin</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-bento-lime group-hover:text-slate-950 transition-colors">
                    <ArrowUpRight className="w-4 h-4 font-bold" />
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Complete peace of mind. Daily adherence analytics, doctor consultations, missed-dose alerts, and member invitations.
                </p>
              </div>

              <div className="pt-5 border-t border-slate-900/10 mt-5 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Try Family Overview</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Persona 3: Nurse Priya Rao (Caregiver) */}
            <div 
              onClick={() => onDemoLogin('caregiver')}
              className="bg-bento-mint rounded-[32px] p-6 sm:p-7 border border-bento-mint-border hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Photo Header */}
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/60 shadow-subtle relative">
                  <img 
                    src="/images/premium_photo-1663089870095-c231a534ac31.avif" 
                    alt="Nurse Priya Rao compassionate care" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-950 text-[10px] font-extrabold uppercase tracking-wider border border-white shadow-2xs">
                      Professional Caregiver
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">Nurse Priya Rao</h3>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Home Nurse • Shift Lead</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-bento-lime group-hover:text-slate-950 transition-colors">
                    <ArrowUpRight className="w-4 h-4 font-bold" />
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Shift checklist precision. Clinical instructions, vitals tracking, and structured handover observations between care providers.
                </p>
              </div>

              <div className="pt-5 border-t border-slate-900/10 mt-5 flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Try Caregiver Shift</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-bento-lime text-slate-950 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="text-lg font-black text-white">Sahaaya</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right font-medium">
            Care that connects generations. Built with dignity, privacy, and precision.
          </p>
        </div>
      </footer>
    </div>
  );
}
