import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to GramaFund</h1>
        <p className="mb-8 text-xl text-muted-foreground">
          A platform for effective altruists to collaborate, share projects, and maximize impact.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/posts">View Posts</Link>
          </Button>
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}