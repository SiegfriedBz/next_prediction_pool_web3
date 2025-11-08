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
import { wagmiHttpConfig } from "../_config/wagmi";
import { useTheme } from "next-themes";

const rainbowLightTheme = {
	accentColor: '#6635d5',
	accentColorForeground: '#fff',
}
const rainbowDarkTheme = {
	accentColor: '#a996ff',
	accentColorForeground: '#000',
}

type Props = {
	initialWagmiState: WagmiState | undefined;
};

export const CustomWagmiProvider: FC<PropsWithChildren<Props>> = (props) => {
	const { initialWagmiState, children } = props;

	const { theme, systemTheme } = useTheme();
	const currentTheme = useMemo(() => theme === "system" ? systemTheme : theme, [theme, systemTheme]);

	const [wagmiConfig] = useState<WagmiConfig>(() => wagmiHttpConfig);
	const [queryClient] = useState<QueryClient>(() => new QueryClient());

	const rainbowTheme = useMemo(() => {
		return currentTheme === "dark"
			? darkTheme(rainbowDarkTheme)
			: lightTheme(rainbowLightTheme);
	}, [currentTheme]);

	return (
			<WagmiProvider config={wagmiConfig} initialState={initialWagmiState}>
				<QueryClientProvider client={queryClient}>
					<RainbowKitProvider
						key={currentTheme}
						theme={rainbowTheme}
						coolMode
					>
						{children}
					</RainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
	);
};
