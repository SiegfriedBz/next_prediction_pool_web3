"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LoaderIcon, TrophyIcon } from "lucide-react";
import {
	type FC,
	startTransition,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import {
	type BaseError,
	useAccount,
	useChainId,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type { ContractConfigT } from "@/app/_contracts/types";
import { useResolvedRoundsWithPlayerBetsAndWinsContext } from "@/app/_hooks/use-resolved-rounds-with-player-bets-and-wins-context";
import { useTransactionToast } from "@/app/_hooks/use-tx-toast";
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
	roundId: bigint;
	onCloseDialog: () => void;
};
export const ClaimRewardsConfirm: FC<Props> = (props) => {
	const { roundId, onCloseDialog } = props;

	const { address } = useAccount();
	const chainId = useChainId();

	const queryClient = useQueryClient();

	const { refetchResolvedRoundsWithPlayerBets } =
		useResolvedRoundsWithPlayerBetsAndWinsContext();

	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// Wagmi write contract setup for claiming rewards
	const {
		data: claimHash,
		error: claimError,
		isPending: isClaimingRewards,
		writeContract,
	} = useWriteContract();

	const onClaim = useCallback(async () => {
		writeContract({
			...contractConfig,
			functionName: "claimReward",
			// function claimReward(uint256 _roundId)
			args: [roundId],
		});
	}, [contractConfig, writeContract, roundId]);

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: claimHash,
		});

	useTransactionToast({
		hash: claimHash,
		isConfirming,
		isConfirmed,
		error: claimError as BaseError | null,
	});

	useEffect(() => {
		if (isConfirmed) {
			// invalidate stale player's bet
			queryClient.invalidateQueries({
				queryKey: ["round-to-player-bet", `${roundId.toString()}-${address}`],
			});

			// Refetch resolved rounds with player's bets
			refetchResolvedRoundsWithPlayerBets();

			// Close dialog in a non-blocking way
			startTransition(() => {
				onCloseDialog();
			});
		}
	}, [
		isConfirmed,
		onCloseDialog,
		queryClient,
		roundId,
		address,
		refetchResolvedRoundsWithPlayerBets,
	]);

	const isDisabled = useMemo(
		() => isClaimingRewards || isConfirming,
		[isClaimingRewards, isConfirming],
	);

	return (
		<AlertDialogFooter>
			<AlertDialogCancel
				disabled={isDisabled}
				className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
				onClick={onCloseDialog}
			>
				Cancel
			</AlertDialogCancel>
			<Button
				disabled={isDisabled}
				className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
				onClick={onClaim}
			>
				{isDisabled ? (
					<span className="inline-flex gap-2 items-center">
						<span className="animate-spin">
							<LoaderIcon />
						</span>
						<span>Claiming Rewards...</span>
					</span>
				) : (
					<span className="inline-flex gap-2 items-center">
						<span>
							<TrophyIcon />
						</span>
						<span>Claim Rewards</span>
					</span>
				)}
			</Button>
		</AlertDialogFooter>
	);
};
