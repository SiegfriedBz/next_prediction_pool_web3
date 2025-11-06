import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Header } from "./_components/header";
import { wagmiHttpConfig } from "./_config/wagmi";
import { RootProviders } from "./_contexts/root-providers";
import { Footer } from "./_components/footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Bet2Gether | Predict. Bet. Win. Together.",
	description:
		"Bet2Gether is a decentralized prediction game powered by Chainlink, Ethereum, and Tenderly. Create games to bet on asset prices, join others' games, and earn rewards based on your predictions.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const initialWagmiState = cookieToInitialState(
		wagmiHttpConfig,
		(await headers()).get("cookie"),
	);

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<RootProviders initialWagmiState={initialWagmiState}>
					<div className="relative max-[480px]:h-54 h-64">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
				</RootProviders>

				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
