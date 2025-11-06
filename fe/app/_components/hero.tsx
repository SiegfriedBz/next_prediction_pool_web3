import Link from "next/link";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "./typography/h1";
import { TypographyH4 } from "./typography/h4";
import { TypographyLead } from "./typography/lead";

export const Hero: FC = () => {
	return (
		<section className="flex flex-col items-center justify-center text-center py-28 px-6 overflow-hidden min-h-[calc(100svh-8rem)] sm:min-h-[calc(100svh-12rem)] animate-fade-in">
			<TypographyH1>
				Bet
				<span className="text-blue-500">2</span>
				Gether
			</TypographyH1>

			<div
				className="mt-6 text-lg md:text-2xl max-w-2xl leading-relaxed"
			>
				<TypographyH4>
					Predict. Bet. Win —{" "}
					<span className="text-blue-400 font-semibold">Together</span>.
					<br />
				</TypographyH4>

				<TypographyLead className="inline-block">
					Create or join prediction games on crypto asset prices — powered by{" "}
					<span className="text-accent-foreground italic">
						Ethereum <span className="text-sm">(Sepolia)</span>
					</span>
					, <span className="text-accent-foreground italic">Alchemy</span>,{" "}
					<span className="text-accent-foreground italic">Chainlink</span> and{" "}
					<span className="text-accent-foreground italic">Tenderly</span>.
				</TypographyLead>
			</div>

				<Button
					asChild
					size="lg"
					className="mt-10 text-lg px-8 py-6 font-semibold tracking-wide transition-all duration-200 cursor-pointer"
				>
					<Link href="/#tabs">Start Betting</Link>
				</Button>
		</section>
	);
};
