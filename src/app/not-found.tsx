// app/not-found.tsx
import ButtonRedirect from "@/components/Button/ButtonRedirect"
import Card from "@/components/Card/Card"

export default function NotFoundPage() {
  return (
    <div className="bg-(--pastel-green)">
      <div className="h-screen flex items-center justify-center container mx-auto max-w-(--breakpoint-lg) p-4">
        <Card rounded>
          <h1 className="text-slate-800 text-center">404</h1>
          <div className="flex flex-col items-center justify-center">
            <h2 className="mt-2 text-2xl font-semibold text-slate-600">
              Oops! Page not found
            </h2>
            <p className="mt-4 text-slate-500">
              Sorry, the page you&aposre looking for doesn&apost exist or has
              been moved.
            </p>
            <ButtonRedirect href="/" rounded color="slate" variant="outline">
              Go to Homepage
            </ButtonRedirect>
          </div>
        </Card>
      </div>
    </div>
  )
}
