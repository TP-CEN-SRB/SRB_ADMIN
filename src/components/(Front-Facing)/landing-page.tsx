'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

import Autoplay from 'embla-carousel-autoplay'
import { Separator } from '@/components/ui/separator'

import { Button } from '@/components/ui/button'
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

const menudata = [
  {
    id: 1,
    img: "/about.png",
    imgAlt: 'about',
    userComment: 'About Us: Discover our mission and the team behind the smart bins.',
    link: '/about'
  },
  {
    id: 2,
    img: "/MCAPP.jpeg",
    imgAlt: 'projects',
    userComment: 'Our Projects: Explore projects done during your 3 years in Computer Engineering',
    link: '/projects'
  },
  {
    id: 3,
    img: "/about.png",
    imgAlt: 'contact us',
    userComment: 'Contact Us: Feel free to leave any questions you have for the smart bin down in our email!',
    link: '/contact'
  }
]

export default function HeroSection(){
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [commentsApi, setCommentsApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(function(){
    if (!mainApi) {
      return
    }

    setCurrent(mainApi.selectedScrollSnap())
    mainApi.on('select', function(){
      const selectedIndex = mainApi.selectedScrollSnap()

      setCurrent(selectedIndex)

      // Sync all carousels with main carousel
      thumbApi?.scrollTo(selectedIndex)
      commentsApi?.scrollTo(selectedIndex)
    })
  }, [mainApi, thumbApi, commentsApi])

  useEffect(function(){
    if (!thumbApi) {
      return
    }

    thumbApi.on('select', function(){
      const selectedIndex = thumbApi.selectedScrollSnap()

      setCurrent(selectedIndex)

      // Sync main and comments carousel with thumbnail carousel
      mainApi?.scrollTo(selectedIndex)
      commentsApi?.scrollTo(selectedIndex)
    })
  }, [thumbApi, mainApi, commentsApi])

  useEffect(function(){
    if (!commentsApi) {
      return
    }

    commentsApi.on('select', function(){
      const selectedIndex = commentsApi.selectedScrollSnap()

      setCurrent(selectedIndex)

      // Sync main and thumbnail carousel with comments carousel
      mainApi?.scrollTo(selectedIndex)
      thumbApi?.scrollTo(selectedIndex)
    })
  }, [commentsApi, mainApi, thumbApi])

  const handleThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index)
    },
    [mainApi]
  )

  // Increased delay from 3000 to 6000 for a slower loop
  const plugin = useRef(Autoplay({ delay: 6000, stopOnInteraction: false }))

  return (
    <section className='flex-1 py-12 sm:py-16 lg:py-24'>
      <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center overflow-hidden">
        {/* Faint background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8'>
        {/* Hero Header */}
        <div className='grid grid-cols-1 gap-6 gap-y-12 md:gap-y-16 lg:grid-cols-5'>
          <div className='flex w-full flex-col justify-center gap-5 max-lg:items-center lg:col-span-3 lg:h-95.5'>
            <h1 className='text-3xl leading-[1.29167] text-balance max-lg:text-center sm:text-4xl lg:text-5xl'>
              Smart Recycling Bin for a <br className="hidden sm:block" />
            <span className="font-bold text-foreground">Sustainable Future.</span>
            </h1>

            <p className='text-muted-foreground max-w-xl text-xl max-lg:text-center'>
              Meet the IoT system that turns waste into rewards. Drop your items, and let our smart bins automatically identify, sort, and calculate your eco-points in real time.
            </p>

            <div className='flex items-center gap-4'>
              <Button size="lg">
                <Link href="https://tp-cen-srb.github.io/RecycleTP/">
                  Admin Dashboard
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin">
                  Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <Carousel
            className='w-full lg:col-span-2'
            setApi={setMainApi}
            plugins={[plugin.current]}
            opts={{
              loop: true
            }}
          >
            <CarouselContent>
              {menudata.map(item => (
                <CarouselItem key={item.id} className='flex w-full items-center justify-center'>
                  {/* Wrapped image in a Link to make it clickable based on the menudata link */}
                  <Link href={item.link}>
                    <img 
                      src={item.img} 
                      alt={item.imgAlt} 
                      className='size-95 object-contain cursor-pointer transition-transform -105' 
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className='grid grid-cols-1 gap-24 gap-y-12 md:gap-y-16 lg:grid-cols-5'>
          <Carousel
            className='relative w-full max-lg:order-2 lg:col-span-3'
            setApi={setThumbApi}
            opts={{
              loop: true
            }}
          >
            <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-1 w-25 bg-linear-to-r via-85% to-transparent' />
            <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-1 w-25 bg-linear-to-l via-85% to-transparent' />
            <CarouselContent className='my-1 flex'>
              {menudata.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className={cn(
                    'basis-1/2 cursor-pointer items-center sm:basis-1/3 md:basis-1/4 lg:basis-1/3 xl:basis-1/4'
                  )}
                  onClick={() => handleThumbClick(index)}
                >
                  <div className='relative flex h-33 items-center justify-center'>
                    <div className={cn('absolute bottom-0 -z-1', current === index ? 'text-primary' : 'text-border')}>
                      <svg xmlns='http://www.w3.org/2000/svg' width='161' height='92' viewBox='0 0 161 92' fill='none'>
                        <path
                          d='M0.682517 80.6118L0.501193 39.6946C0.480127 34.9409 3.80852 30.8294 8.46241 29.8603L148.426 0.713985C154.636 -0.579105 160.465 4.16121 160.465 10.504V80.7397C160.465 86.2674 155.98 90.7465 150.453 90.7397L10.6701 90.5674C5.16936 90.5607 0.706893 86.1125 0.682517 80.6118Z'
                          stroke='currentColor'
                        />
                      </svg>
                    </div>
                    <img src={item.img} alt={item.imgAlt} className='size-25' />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <Carousel
            className='flex w-full items-center justify-center lg:col-span-2'
            setApi={setCommentsApi}
            opts={{
              loop: true
            }}
          >
            <CarouselContent>
              {menudata.map(item => (
                <CarouselItem
                  key={item.id}
                  className='flex h-full min-h-14 w-full items-center justify-center gap-4 px-6'
                >
                  <p className='text-card-foreground text-center italic text-sm text-muted-foreground'>
                    "{item.userComment}"
                  </p>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  )
}