'use client';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Stillwater Pulse | Aggregating the best of Stillwater, Oklahoma
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Posts are embedded from public Instagram accounts. All content belongs to their respective creators.
        </p>
      </div>
    </footer>
  );
}