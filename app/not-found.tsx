// app/not-found.tsx
import Card from "@/components/Card/Card";
import CardButton from "@/components/Card/CardButton";

export default function NotFoundPage() {
  return (
    <div className="h-screen justify-center items-center flex">
      <Card>
        <h1 className="text-gray-800 text-center">404</h1>
        <div className="flex flex-col items-center justify-center">
          <h2 className="mt-2 text-2xl font-semibold text-gray-600">
            Oops! Page not found
          </h2>
          <p className="mt-4 text-gray-500">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
          <CardButton color="blue" href="/">
            Go to Homepage
          </CardButton>
        </div>
      </Card>
    </div>
  );
}
