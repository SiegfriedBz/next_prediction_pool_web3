import { Hero } from "./_components/hero";

export default function Home() {
	return (
		<div className="relative min-h-screen p-4 sm:p-16">
			<main className="flex flex-col gap-4">
				<section id={"hero"}>
					<Hero />
				</section>

				<section
					className="min-h-screen w-full mb-4 scroll-mt-32 sm:scroll-mt-48"
					id={"tabs"}
				>
					TABS
				</section>
			</main>
			{/* Background gradient glow */}
			<div className="absolute inset-0 bg-linear-to-b from-blue-900/30 via-transparent to-transparent blur-3xl pointer-events-none" />
		</div>
	);
}
