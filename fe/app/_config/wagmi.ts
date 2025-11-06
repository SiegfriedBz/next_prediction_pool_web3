"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http, webSocket } from "wagmi";
import { sepolia } from "wagmi/chains";

const ETH_SEPOLIA_ALCHEMY_HTTP_URL =
	process.env.NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_HTTP_URL ?? "";
const ETH_SEPOLIA_ALCHEMY_WS_URL =
	process.env.NEXT_PUBLIC_ETH_SEPOLIA_ALCHEMY_WS_URL ?? "";
const WALLETCONNECT_PROJECT_ID =
	process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiHttpConfig = getDefaultConfig({
	appName: "Bet2Gether",
	projectId: WALLETCONNECT_PROJECT_ID,
	chains: [sepolia],
	ssr: true,
	storage: createStorage({ storage: cookieStorage }),
	transports: {
		[sepolia.id]: http(ETH_SEPOLIA_ALCHEMY_HTTP_URL, {
			key: "Alchemy",
			name: "Alchemy RPC Provider",
		}),
	},
});

export const wagmiWsConfig = getDefaultConfig({
	appName: "Bet2Gether",
	projectId: WALLETCONNECT_PROJECT_ID,
	chains: [sepolia],
	ssr: true,
	transports: {
		[sepolia.id]: webSocket(ETH_SEPOLIA_ALCHEMY_WS_URL, {
			key: "Alchemy",
			name: "Alchemy WebSocket Provider",
		}),
	},
});
