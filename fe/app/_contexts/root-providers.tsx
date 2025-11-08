"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type FC, type PropsWithChildren, useMemo, useState } from "react";
import {
	type Config as WagmiConfig,
	WagmiProvider,
	type State as WagmiState,
} from "wagmi";
import { Toaster } from "@/components/ui/sonner";
import { wagmiHttpConfig } from "../_config/wagmi";
import { ThemeProvider } from "./theme-provider";

const rainbowLightTheme = {
	accentColor: '#c9317f',
	accentColorForeground: '#fff',
}
const rainbowDarkTheme = {
	accentColor: '#ff8ca2',
	accentColorForeground: '#000',
}

type Props = {
	initialWagmiState: WagmiState | undefined;
};

export const RootProviders: FC<PropsWithChildren<Props>> = (props) => {
	const { initialWagmiState, children } = props;

	const [wagmiConfig] = useState<WagmiConfig>(() => wagmiHttpConfig);
	const [queryClient] = useState<QueryClient>(() => new QueryClient());

	const rainbowTheme = useMemo(() => ({
			lightMode: lightTheme(rainbowLightTheme),
			darkMode: darkTheme(rainbowDarkTheme),
		}),[])

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<WagmiProvider config={wagmiConfig} initialState={initialWagmiState}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider
						theme={rainbowTheme}
					>
						{children}
						<Toaster position="bottom-right" />
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	);
};
