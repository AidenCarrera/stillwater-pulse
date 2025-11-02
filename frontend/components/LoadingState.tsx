'use client';

export default function LoadingState() {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-gray-600">Loading Stillwater Pulse...</p>
    </div>
  );
}