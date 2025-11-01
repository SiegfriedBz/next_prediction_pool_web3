"use client";

import { useEffect, useMemo } from "react";
import { useChainId, useReadContract } from "wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import type { ContractConfigT } from "../_contracts/types";
import type { HexAddress } from "../_types";

type Params = {
	/** The Chainlink price feed contract address to fetch the current price from */
	dataFeedAddress: HexAddress;
};

/**
 * useCurrentPrice
 *
 * Custom React hook to fetch the normalized current price from a Chainlink data feed
 * via the Prediction Pool smart contract.
 *
 * @param {Params} params - Hook parameters
 * @returns {bigint | undefined} The current price, or undefined if not yet loaded
 *
 * Features:
 * - Fetches the current normalized price from the contract
 * - Refetches automatically when the hook mounts
 * - Uses wagmi's useReadContract under the hood
 *
 * Usage example:
 * const currentPrice = useCurrentPrice({ dataFeedAddress: "0x..." });
 *
 * Notes:
 * - Can be extended with websocket or contract event listeners for live updates.
 */
export const useCurrentPrice = (params: Params): bigint | undefined => {
	const { dataFeedAddress } = params;

	// Get the current chain ID from wagmi
	const chainId = useChainId();

	// Prepare the contract configuration based on the current chain
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// Fetch the current price from the smart contract
	const { data: currentPrice, refetch } = useReadContract({
		...contractConfig,
		functionName: "getChainlinkDataFeedNormalizedPrice",
		args: [dataFeedAddress],
		query: {
			enabled: !!dataFeedAddress,
		},
	});

	// Refetch on mount
	useEffect(() => {
		refetch();
	}, [refetch]);

	return currentPrice as unknown as bigint | undefined;
};
