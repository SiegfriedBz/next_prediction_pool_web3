"use client";

import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import type { ContractConfigT } from "../_contracts/types";
import type { Round } from "../_types";
import type { RefetchType } from "./type";

export type UseRoundsReturnType = {
	/** Array of Round objects (empty if not loaded) */
	rounds: Round[];
	/** Boolean indicating whether the data is currently loading */
	isLoadingRounds: boolean;
	/** Normalized error object if the fetch failed, or null */
	errorFetchingRounds: ReadContractsErrorType | null;
	/** Function to manually refetch all rounds data */
	refetchRounds: RefetchType<ReadContractsErrorType>;
};

/**
 * useRounds
 *
 * Custom React hook to fetch and manage all rounds (games) data
 * from the Prediction Pool smart contract using wagmi's useReadContract
 * and useReadContracts.
 *
 * @returns {UseRoundsReturnType}
 *
 * Usage example:
 * const { rounds, isLoadingRounds, errorFetchingRounds } = useRounds();
 *
 * Notes:
 * - Fetches total number of rounds first, then fetches each round data concurrently
 * - Data is memoized to avoid unnecessary recalculations
 * - Error is normalized to a simple object with message, name, and optional shortMessage
 */
export const useRounds = (): UseRoundsReturnType => {
	// Get the current chain ID from wagmi
	const chainId = useChainId();

	// Prepare the contract configuration based on the current chain
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// Fetch total number of rounds from the smart contract
	const { data: totalRounds } = useReadContract({
		...contractConfig,
		functionName: "nextRoundId",
		args: [],
	}) as { data: bigint | undefined };

	// Prepare the array of calls to fetch each round data
	const roundCalls = useMemo(() => {
		if (!totalRounds) return [];

		return Array.from({ length: Number(totalRounds) }).map((_, i) => ({
			...contractConfig,
			functionName: "getRound",
			args: [BigInt(i)],
			query: { queryKey: ["round", i.toString()] }, // unique per round
		}));
	}, [contractConfig, totalRounds]);

	// Fetch all rounds data concurrently
	const {
		data: roundData,
		isLoading,
		error,
		refetch,
	} = useReadContracts({
		contracts: roundCalls,
		query: {
			enabled: roundCalls.length > 0,
		},
	});

	// Extract and memoize the results as Round[]
	const rounds: Round[] = useMemo(
		() => roundData?.map((res) => res.result as Round) ?? [],
		[roundData],
	);

	return {
		rounds,
		isLoadingRounds: isLoading,
		errorFetchingRounds: error,
		refetchRounds: refetch,
	};
};
