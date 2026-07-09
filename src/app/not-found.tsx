import { EmptyInputGroup } from '@/components/(Front-Facing)/missing-page'
 
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <EmptyInputGroup />
      </div>
    </div>
  )
}