import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70dvh] items-center justify-center overflow-clip">
      <div className="hero-grid-bg absolute inset-0 -z-10" />
      <div className="glow-orb top-10 left-1/3 h-96 w-96 bg-emerald-500/20 animate-float-slow" />
      <div className="container-x flex flex-col items-center gap-6 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_50px_-10px_rgba(16,185,129,0.7)]">
          <SearchX className="h-9 w-9" />
        </span>
        <p className="font-display bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-8xl font-extrabold text-transparent">
          404
        </p>
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
          This path leads nowhere — but seva is everywhere
        </h1>
        <p className="max-w-md text-mute">
          The page you&apos;re looking for doesn&apos;t exist or was moved. The
          campaigns, thankfully, are all still here.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-outline">
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link href="/campaigns" className="btn btn-primary">
            <Compass className="h-4 w-4" /> Browse campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
