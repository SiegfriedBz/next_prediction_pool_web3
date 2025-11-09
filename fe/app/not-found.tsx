import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TypographyH3 } from "./_components/typography/h3";

export default function NotFound() {

  return (
  <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 sm:p-16 text-center">
      <TypographyH3>404 - Page Not Found</TypographyH3>

      <Button asChild variant="outline">
        <Link href="/">Go back home</Link>
      </Button>
    </main>
  )
}