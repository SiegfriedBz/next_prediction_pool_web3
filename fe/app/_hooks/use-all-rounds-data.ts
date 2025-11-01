"use client";

import type {
	QueryObserverResult,
	RefetchOptions,
} from "@tanstack/react-query";
import type { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { getPredictionPoolContractConfig } from "../_contracts/prediction-pool";
import type { ContractConfigT } from "../_contracts/types";
import type { Round } from "../_types";

export type UseAllRoundsDataReturnType = {
	/** Array of Round objects (empty if not loaded) */
	allRoundsData: Round[];
	/** Boolean indicating whether the data is currently loading */
	isLoadingAllRoundsData: boolean;
	/** Normalized error object if the fetch failed, or null */
	errorFetchingAllRoundsData: ReadContractsErrorType | null;
	/** Function to manually refetch all rounds data */
	refetchAllRoundsData: (options?: RefetchOptions | undefined) => Promise<
		QueryObserverResult<
			(
				| {
						error?: undefined;
						result: unknown;
						status: "success";
				  }
				| {
						error: Error;
						result?: undefined;
						status: "failure";
				  }
			)[],
			ReadContractsErrorType
		>
	>;
};

/**
 * useAllRoundsData
 *
 * Custom React hook to fetch and manage all rounds (games) data
 * from the Prediction Pool smart contract using wagmi's useReadContract
 * and useReadContracts.
 *
 * @returns {UseAllRoundsDataReturnType}
 *
 * Usage example:
 * const { allRoundsData, isLoadingAllRoundsData, errorFetchingAllRoundsData } = useAllRoundsData();
 *
 * Notes:
 * - Fetches total number of rounds first, then fetches each round data concurrently
 * - Data is memoized to avoid unnecessary recalculations
 * - Error is normalized to a simple object with message, name, and optional shortMessage
 */
export const useAllRoundsData = (): UseAllRoundsDataReturnType => {
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
	const allRoundsData: Round[] = useMemo(
		() => roundData?.map((res) => res.result as Round) ?? [],
		[roundData],
	);

	return {
		allRoundsData,
		isLoadingAllRoundsData: isLoading,
		errorFetchingAllRoundsData: error,
		refetchAllRoundsData: refetch,
	};
};
