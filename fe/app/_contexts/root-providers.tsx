"use client";

import { type FC, type PropsWithChildren } from "react";
import {
	type State as WagmiState,
} from "wagmi";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./theme-provider";
import { CustomWagmiProvider } from "./custom-wagmi-provider";

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

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<CustomWagmiProvider initialWagmiState={initialWagmiState}>
				{children}
			</CustomWagmiProvider>
			<Toaster position="bottom-right" />
		</ThemeProvider>
	);
};
