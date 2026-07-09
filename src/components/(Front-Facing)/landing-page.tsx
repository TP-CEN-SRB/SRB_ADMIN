"use client"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDaysIcon, ArrowUpRightIcon } from "lucide-react"
import Image from 'next/image'

interface BlogData {
  img: string
  date: string
  blogTitle: string
  description: string
  author: string
  badge: string
  authorLink: string
  blogLink: string
  categoryLink: string
}

const blogData: BlogData [] = [
  {
    img: '/recycling.png',
    date: 'January 20, 2026',
    blogTitle: 'Build with Empathy for Better User Outcomes',
    description: 'Understand user needs to create intuitive and lovable experiences.',
    author: 'Allen Reilly',
    badge: 'UI',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    img: '/recycling.png',
    date: 'May 20, 2025',
    blogTitle: 'Write Code That Scales with Your Product',
    description: 'Structure your projects for easier updates, faster growth, and bugs.',
    author: 'Sara Wilkerson',
    badge: 'Coding',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  }
]

export default function HeroSection(){
  return (
    <section className='bg-muted pt-16 pb-12 sm:pb-16 lg:pb-24'>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8'>
        {/* Hero Header */}
        <div className='flex max-w-4xl flex-col items-center gap-4 self-center text-center'>
          <Badge variant='outline' className='h-auto text-sm'>
            Next-Gen Smart Recycling
          </Badge>
          <h1 className='text-3xl leading-[1.29167] font-semibold text-balance sm:text-4xl lg:text-5xl'>
            AIRS: AI-Powered Recycling System for Sustainability
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              Meet the IoT recycling system that turns waste into rewards.
              Powered by AI, this smart bin automatically identifies materials,
              opens the correct bin, and calculates the weight into points that can be credited to your account.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {blogData.map((item, index) => (
            <Card key={`${item.author}-${index}`} className='group py-6 shadow-none'>
              <CardContent className='grid grid-cols-1 gap-6 px-6 xl:grid-cols-2'>
                <div>
                  <div className='relative h-60 w-full overflow-hidden rounded-lg'>
                    <Image
                      src={item.img}
                      alt={item.author}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                </div>
                <div className='flex flex-col justify-center gap-3'>
                  <div className='flex items-center gap-1.5 py-1'>
                    <div className='text-muted-foreground flex grow items-center gap-1.5'>
                      <CalendarDaysIcon className='size-6' />
                      <p className='text-base'>{item.date}</p>
                    </div>
                    <a href={item.categoryLink}>
                      <Badge className='bg-primary/10 text-primary border-0 text-sm'>{item.badge}</Badge>
                    </a>
                  </div>
                  <a href={item.blogLink}>
                    <h3 className='text-xl font-medium'>{item.blogTitle}</h3>
                  </a>

                  <p className='text-muted-foreground text-base'>{item.blogTitle}</p>
                  <div className='flex w-full items-center justify-between gap-1 py-1'>
                    <a href={item.authorLink} className='text-sm font-medium'>
                      {item.author}
                    </a>
                    <Button
                      size='icon-lg'
                      variant='outline'
                      className='group-hover:bg-primary! hover:bg-primary! hover:text-primary-foreground group-hover:text-primary-foreground group-hover:border-transparent hover:border-transparent'
                      asChild
                    >
                      <a href={item.blogLink}>
                        <ArrowUpRightIcon
                        />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
