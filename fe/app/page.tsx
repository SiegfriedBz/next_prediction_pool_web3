import { Hero } from "./_components/hero";
import { GameTabs } from "./_components/tabs/game-tabs";

export default function Home() {
	return (
		<main className="relative min-h-screen p-4 sm:p-16 flex flex-col gap-4">
			<section>
				<Hero />
			</section>

			<section
				id={"tabs"}
				className="min-h-screen scroll-mt-32 sm:scroll-mt-42"
			>
				<GameTabs />
			</section>
			{/* Background gradient glow */}
			<div className="absolute inset-0 bg-linear-to-b from-blue-900/30 via-transparent to-transparent blur-3xl pointer-events-none" />
		</main>
	);
}
