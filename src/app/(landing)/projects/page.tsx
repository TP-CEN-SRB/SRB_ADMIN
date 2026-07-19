"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GraduationCap, Code2, Blocks, Cpu, Layers3, BarChart3, BrainCircuit } from "lucide-react"
import { cn } from "@/lib/utils"

interface Module {
  slug: string
  title: string
  code: string
  credits: number
  teaser: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

const modules: Module[] = [
  {
    slug: "computer-programming",
    title: "Computer Programming & Problem Solving",
    code: "ESE1006",
    credits: 4,
    teaser: "Breaking problems down into code, from design to debugging.",
    description:
      "This subject covers the process of decomposing a problem into a sequence of smaller abstractions. The abstractions are implemented in software in a structured top-down approach. Software implementation includes the process of designing, writing, testing, and debugging program code.",
    icon: Code2,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    slug: "oop",
    title: "Object-Oriented Programming (Java)",
    code: "ESE2004",
    credits: 5,
    teaser: "Designing software the object-oriented way, with UML and testing.",
    description:
      "This subject equips you with a good understanding of software design and development process. Important phases of the software development process will be covered. More emphasis will be placed on object-oriented software design using UML (Unified Modelling Language), software documentation and testing methodologies in order to gear you towards a more practice-oriented industry.",
    icon: Blocks,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    slug: "microcontroller",
    title: "Microcontroller Applications",
    code: "EMC3006",
    credits: 5,
    teaser: "Programming hardware — interrupts, timers, PWM, and IoT-ready chips.",
    description:
      "This subject provides you with working knowledge on microcontroller architecture, the features and characteristics of the internal peripherals in the microcontroller, such as interrupts, Timer and PWM, in order to design and implement an embedded system that involves hardware and software interfacing. The subject also covers the features of evolving microcontrollers that support Internet of Things (IoT) applications.",
    icon: Cpu,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    slug: "fullstack",
    title: "Full Stack Development",
    code: "ESE3014",
    credits: 5,
    teaser: "Front-end, back-end, and the database in between — end to end.",
    description:
      "This subject will provide you with the basic knowledge of full stack application development. Full stack (web or mobile stack) refers to the development of both the front-end and the back-end portions of an application, thereby introducing all the necessary steps from conceptualisation of the application idea to the implementation of the final product. The subject will cover the various aspects of designing and implementing the client-end application as well as the design, implementation of a database, and the appropriate retrieval of the data, from the client application through a business logic layer.",
    icon: Layers3,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    slug: "data-visualisation",
    title: "Data Visualisation & Analytics",
    code: "ESE1008",
    credits: 3,
    teaser: "Turning raw data into insight — gathering, cleaning, and visualising.",
    description:
      "This subject covers the data analytics lifecycle, including gathering, cleaning, processing and visualising of data. Exploratory data analysis methods, descriptive and predictive analytics, and the presentation of insights, will also be covered.",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    slug: "ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    code: "ESE3012",
    credits: 4,
    teaser: "Building intelligent models from real-world data, hands-on.",
    description:
      "This subject will provide you with the fundamental concepts of Artificial Intelligence (AI) and Machine Learning (ML). It will cover knowledge and skills in AI techniques and tools to build intelligent learning models from real-world data, through training, testing, validation and optimisation. Through hands-on group projects, you will build AI-based applications to add intelligence to existing systems.",
    icon: BrainCircuit,
    gradient: "from-rose-500 to-pink-600",
  },
]

export default function ProjectsPage() {
  const [selected, setSelected] = useState<Module | null>(null)

  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pb-24 transition-colors duration-300 min-h-screen">
      {/* Background Decorative Vertical Glowing Lines (matching landing page) */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center overflow-hidden">
        {/* Faint background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">

          {/* UPDATED HEADING */}
          <h1 className='text-3xl leading-[1.29167] text-balance max-lg:text-center sm:text-4xl lg:text-5xl'>
            Skills Used to Build the<br className="hidden sm:block" />
            <span className="font-bold text-foreground"> Smart Recycling Bin.</span>
          </h1>

          <p className='text-muted-foreground max-w-xl text-xl max-lg:text-center'>
            This Smart Recycling Bin platform draws on skills built across the Diploma in
            Computer Engineering (T13) at Temasek Polytechnic. Click a card for the full
            module description.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <button
                key={mod.slug}
                onClick={() => setSelected(mod)}
                className="group text-left rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
              >
                <div
                  className={cn(
                    "flex h-36 items-center justify-center bg-gradient-to-br",
                    mod.gradient
                  )}
                >
                  <Icon className="size-14 text-white/90 drop-shadow-sm" />
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {mod.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{mod.credits} credits</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {mod.teaser}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <div
                className={cn(
                  "-mx-6 -mt-6 mb-2 flex h-28 items-center justify-center bg-gradient-to-br",
                  selected.gradient
                )}
              >
                <selected.icon className="size-12 text-white/90" />
              </div>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.code} &middot; {selected.credits} credits
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selected.description}
              </p>
              <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border">
                Module description from Temasek Polytechnic&apos;s Diploma in Computer
                Engineering (T13).
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}