// app/not-found.tsx
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="h-screen justify-center items-center flex">
      <div className="text-center max-w-lg p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-600">
          Oops! Page not found
        </h2>
        <p className="mt-4 text-gray-500">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link href="/" passHref>
          <button className="mt-6 px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}
