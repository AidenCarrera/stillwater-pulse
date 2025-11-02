'use client';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
      <p className="font-medium">Error</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}