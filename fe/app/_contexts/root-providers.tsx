"use client";

import { type FC, type PropsWithChildren } from "react";
import {
	type State as WagmiState,
} from "wagmi";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./theme-provider";
import { CustomWagmiProvider } from "./custom-wagmi-provider";

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
