"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "./typography/h1";
import { TypographyLead } from "./typography/lead";

export const Hero: FC = () => {
	return (
		<section className="flex flex-col items-center justify-center text-center py-28 px-6 overflow-hidden min-h-[calc(100svh-8rem)] sm:min-h-[calc(100svh-12rem)]">
			{/* Title */}
			<motion.div
				className=""
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<TypographyH1>
					Bet
					<span className="text-blue-500">2</span>
					Gether
				</TypographyH1>
			</motion.div>

			{/* Subtitle */}
			<motion.p
				className="mt-6 text-lg md:text-2xl text-slate-400 max-w-2xl leading-relaxed"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15, duration: 0.8 }}
			>
				<TypographyLead>
					Predict. Bet. Win —{" "}
					<span className="text-blue-400 font-semibold">Together</span>.
					<br />
					<span>Powered by Chainlink and Ethereum.</span>
				</TypographyLead>
			</motion.p>

			{/* CTA */}
			<motion.div
				className="mt-10"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3, duration: 0.8 }}
			>
				<Button
					asChild
					size="lg"
					className="text-lg px-8 py-6 font-semibold tracking-wide transition-all duration-200 cursor-pointer"
				>
					<Link href="/#tabs">Start Betting</Link>
				</Button>
			</motion.div>
		</section>
	);
};
