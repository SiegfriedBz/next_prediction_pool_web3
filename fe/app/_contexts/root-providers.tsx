"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type FC, type PropsWithChildren, useState } from "react";
import {
	type Config as WagmiConfig,
	WagmiProvider,
	type State as WagmiState,
} from "wagmi";
import { Toaster } from "@/components/ui/sonner";
import { wagmiHttpConfig } from "../_config/wagmi";
import { ThemeProvider } from "./theme-provider";

type Props = {
	initialWagmiState: WagmiState | undefined;
};

export const RootProviders: FC<PropsWithChildren<Props>> = (props) => {
	const { initialWagmiState, children } = props;

	const [wagmiConfig] = useState<WagmiConfig>(() => wagmiHttpConfig);
	const [queryClient] = useState<QueryClient>(() => new QueryClient());

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<WagmiProvider config={wagmiConfig} initialState={initialWagmiState}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider>
						{children}
						<Toaster position="bottom-right" />
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	);
};
