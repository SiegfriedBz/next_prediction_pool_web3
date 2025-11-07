import { GameListenerSwitch } from "./_components/game-listener-switch";
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
				className="min-h-screen scroll-mt-12 sm:scroll-mt-24"
			>
				<div className="flex justify-center mb-8">
					<GameListenerSwitch />
				</div>

				<GameTabs />
			</section>
		</main>
	);
}
