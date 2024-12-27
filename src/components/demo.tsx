"use client";

export default function Demo({ title = "Gramafund" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="p-6 bg-card rounded-lg shadow-lg max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Gramafund Frame
          </h2>
          <p className="text-muted-foreground">
            Please interact with this frame in Warpcast or a compatible client
          </p>
        </div>
      </div>
    </div>
  );
}