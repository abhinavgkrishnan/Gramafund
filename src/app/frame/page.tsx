export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Grama Fund</h1>
      <div className="w-full max-w-2xl bg-gray-100 p-4 rounded-lg">
        <iframe
          src="/frame"
          width="100%"
          height="500px"
          style={{ border: "none" }}
        />
      </div>
    </main>
  );
}
