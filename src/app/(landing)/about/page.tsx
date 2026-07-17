"use client"

import { Badge } from '@/components/ui/badge'
import { Info } from "lucide-react"

export default function About() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-12 sm:pt-32 sm:pb-16 lg:pb-24 transition-colors duration-300 min-h-screen">
      {/* Background Decorative Vertical Glowing Lines (matching landing page) */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        {/* Faint background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_100%]" />

        {/* Bright center glowing lines */}
        <div className="absolute top-[-10%] bottom-[-10%] left-[30%] w-[1px] bg-emerald-500/50 shadow-[0_0_30px_5px_rgba(16,185,129,0.4)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[35%] w-[4px] bg-emerald-300 dark:bg-white shadow-[0_0_40px_10px_rgba(52,211,153,0.4)] dark:shadow-[0_0_40px_10px_rgba(255,255,255,0.8)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[38%] w-[2px] bg-emerald-400 shadow-[0_0_30px_5px_rgba(52,211,153,0.5)]" />
        <div className="absolute top-[-10%] bottom-[-10%] left-[42%] w-[1px] bg-emerald-600/40 shadow-[0_0_20px_2px_rgba(5,150,105,0.3)]" />

        {/* Top and Bottom Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-90" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:px-8">

        {/* About Header - Center Aligned */}
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="h-auto rounded-full border-border bg-muted/50 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase backdrop-blur-md"
          >
            <Info className="mr-2 h-3.5 w-3.5" />
            About Computer Engineering
          </Badge>

          <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Redefining Waste Management with <br className="hidden sm:block" />
            <span className="font-bold text-foreground">Smart Technology.</span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            See how our AI-powered smart bins and IoT sensors work together to create a seamless, rewarding recycling experience.
          </p>
        </div>

        {/* Cinematic Video Container */}
        <div className="relative w-full max-w-5xl mx-auto group">
          {/* Ambient Emerald Glow behind the video */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30 blur-2xl opacity-50 dark:opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative rounded-2xl overflow-hidden border border-border bg-muted shadow-2xl">
            <video 
              /* Next.js automatically serves files from the public folder at the root path '/' */
              src="/tp_video.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-auto aspect-video object-cover"
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Subtle inner gradient overlay to blend the video edges slightly */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  )
}