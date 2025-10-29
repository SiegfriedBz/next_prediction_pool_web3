import {
	type IconComponent,
	TokenBTC,
	TokenDAI,
	TokenETH,
	TokenLINK,
} from "@web3icons/react";
import z from "zod";
import { type HexAddress, Network, type NetworkT } from "../_types";

export const FeedPair = z.enum(["LINK_USD", "ETH_USD", "BTC_USD", "DAI_USD"]);
export type FeedPairT = z.infer<typeof FeedPair>;

// map feed name => icon
export const PairIconMap = new Map<FeedPairT, IconComponent>([
	[FeedPair.enum.LINK_USD, TokenLINK],
	[FeedPair.enum.ETH_USD, TokenETH],
	[FeedPair.enum.BTC_USD, TokenBTC],
	[FeedPair.enum.DAI_USD, TokenDAI],
]);

// 1. map feed name => sepolia feed address
export const SepoliaFeedMap = new Map<FeedPairT, HexAddress>([
	[FeedPair.enum.LINK_USD, "0xc59E3633BAAC79493d908e63626716e204A45EdF"],
	[FeedPair.enum.ETH_USD, "0x694AA1769357215DE4FAC081bf1f309aDC325306"],
	[FeedPair.enum.BTC_USD, "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43"],
	[FeedPair.enum.DAI_USD, "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19"],
]);

// map network => map feed name => feed address
export const FeedMap = new Map<NetworkT, Map<FeedPairT, HexAddress>>([
	[Network.SEPOLIA, SepoliaFeedMap],
]);

// 2. map Sepolia feed address => feed name
export const SepoliaReverseFeedMap = new Map<HexAddress, FeedPairT>(
	Array.from(SepoliaFeedMap.entries()).map(([pair, address]) => [
		address,
		pair,
	]),
);

// map network => map feed address => feed name
export const ReverseFeedMap = new Map<NetworkT, Map<HexAddress, FeedPairT>>(
	Array.from(FeedMap.entries()).map(([network, pairMap]) => {
		const reverse = new Map<HexAddress, FeedPairT>(
			Array.from(pairMap.entries()).map(([pair, address]) => [address, pair]),
		);
		return [network, reverse];
	}),
);
