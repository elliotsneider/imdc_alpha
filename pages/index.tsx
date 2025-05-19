import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">Welcome to IMDC</h1>
      <p className="mt-4">Build your identity based on what you love.</p>
      <Link href="/dashboard">
        <a className="inline-block mt-6 bg-blue-500 text-white px-4 py-2 rounded">Get Started</a>
      </Link>
    </main>
  );
}
