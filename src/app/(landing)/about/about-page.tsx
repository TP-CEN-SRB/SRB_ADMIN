"use client"

export function About() {
  return (
    // Reduced pt-20 to pt-8, and sm:pt-32 to sm:pt-12 to pull the content higher
    <section className="relative overflow-hidden bg-background pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pb-24 transition-colors duration-300 min-h-screen">
      {/* Background Decorative Vertical Glowing Lines (matching landing page) */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        {/* Faint background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:px-8">

        {/* About Header - Center Aligned */}
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">

          <h1 className='text-3xl leading-[1.29167] font-bold text-balance max-lg:text-center sm:text-4xl lg:text-5xl'>
            About Computer Engineering <br className="hidden sm:block" />
          </h1>

          <p className='text-muted-foreground max-w-xl text-xl max-lg:text-center'>
            Discover the world of computer engineering behind our project, where hardware, software, and IoT come together to build innovative solutions for a sustainable future.
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

        {/* Computer Engineering Content Section */}
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-16 mt-8 sm:mt-12">
          
          {/* Content Block 1: Image Left, Text Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-video md:aspect-[4/3] group">
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img 
                src="/MCAPP.jpeg" 
                alt="Hardware and Microcontrollers" 
                className="w-full h-full object-cover transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Bridging Hardware and Software
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Computer Engineering sits at the dynamic intersection of electrical engineering and computer science. It isn’t just about writing code or building circuits in isolation; it’s about making them work seamlessly together. 
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From configuring microcontrollers and routing sensor data to developing the backend databases that store it all, engineers design the foundational systems that bridge the physical and digital worlds.
              </p>
            </div>
          </div>

          {/* Content Block 2: Text Left, Image Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-4 order-2 md:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Powering the Internet of Things (IoT)
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                As our world becomes increasingly connected, the role of computer engineering has expanded heavily into IoT. By embedding intelligent sensors, machine learning algorithms, and network connectivity into everyday objects, we bring them to life.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This connectivity allows for intelligent automation, real-time analytics, and smarter decision-making. It is the exact framework we used to give our Smart Recycling Bins the ability to automatically identify waste, track fullness levels, and reward users instantly.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg aspect-video md:aspect-[4/3] order-1 md:order-2 group">
              <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <img 
                src="/IOTP.jpeg" 
                alt="IoT and Networking Data" 
                className="w-full h-full object-cover transition-transform duration-500 group--105"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}