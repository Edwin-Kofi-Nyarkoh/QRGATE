import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-600">404</h1>
        <p className="text-xl mt-4 ">
          Sorry, the page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-green-60 font-medium rounded hover:bg-green-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
