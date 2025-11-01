"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/sonner";
import { wagmiHttpConfig } from "../_config/wagmi";
import { ThemeProvider } from "./theme-provider";

const queryClient = new QueryClient();

export const RootProviders: FC<PropsWithChildren> = ({ children }) => {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<WagmiProvider config={wagmiHttpConfig}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
						{children}
						<Toaster />
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	);
};
