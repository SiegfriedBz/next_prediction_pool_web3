"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
	CoinsIcon,
	DicesIcon,
	LoaderIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "lucide-react";
import {
	type FC,
	startTransition,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import {
	type BaseError,
	useAccount,
	useChainId,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { z } from "zod";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type { ContractConfigT } from "@/app/_contracts/types";
import { useActiveRoundsWithPlayerBetsContext } from "@/app/_hooks/rounds/use-active-rounds-with-player-bets-context";
import { useRoundsContext } from "@/app/_hooks/rounds/use-rounds-context";
import { useTransactionToast } from "@/app/_hooks/use-tx-toast";
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
	ethValue: z
		.string()
		.regex(/^\d*\.?\d+$/, "Please enter a valid number")
		.refine((val) => Number(val) > 0, "Amount must be greater than 0"),
});

type FormSchemaT = z.infer<typeof formSchema>;

type Props = {
	roundId: bigint;
	targetPrice: bigint;
	isAboveTarget: boolean;
	onCloseDialog: () => void;
};

export const BetOnGameForm: FC<Props> = ({
	roundId,
	targetPrice,
	isAboveTarget,
	onCloseDialog,
}) => {
	const chainId = useChainId();
	const { address } = useAccount();

	const queryClient = useQueryClient();

	// Wrapped in RoundsProvider - Context provides refetch helper:
	// - refetchRounds(): refetch the global rounds dataset (all statuses).
	//   We intentionally invalidate the single "round" query below so that
	//   only that round is requested fresh; other rounds will keep using the
	//   React Query cached values.
	const { refetchRounds } = useRoundsContext();

	// Wrapped in ActiveRoundsWithPlayerBetsProvider - Context provides refetch helper:
	// - refetchActiveRoundsWithPlayerBets(): refetch the user's *active rounds with bets*
	//   dataset. This hook is implemented to use per-round player query keys so we can
	//   selectively update only affected player-round entries.
	const { refetchActiveRoundsWithPlayerBets } =
		useActiveRoundsWithPlayerBetsContext();

	// Contract config for the current chain
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// React-hook-form setup
	const form = useForm<FormSchemaT>({
		resolver: zodResolver(formSchema),
		defaultValues: { ethValue: "0.1" },
	});

	// Wagmi write contract setup for placing a bet
	const {
		data: betHash,
		error: betError,
		isPending: isPlacingBet,
		writeContract,
	} = useWriteContract();

	// Submit handler
	const onSubmit = useCallback(
		async (values: FormSchemaT) => {
			const ethValueInWei = parseEther(values.ethValue);

			writeContract({
				...contractConfig,
				functionName: "betOn",
				// payable betOn(uint256 _roundId, BetSide _betSide)
				args: [roundId, isAboveTarget],
				value: ethValueInWei,
			});
		},
		[contractConfig, writeContract, roundId, isAboveTarget],
	);

	// Wait for transaction confirmation
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: betHash,
		});

	// Transaction toast notifications
	useTransactionToast({
		hash: betHash,
		isConfirming,
		isConfirmed,
		error: betError as BaseError | null,
	});

	// Handle post betOn transaction confirmation logic
	useEffect(() => {
		if (isConfirmed) {
			// Invalidate the single round query so that this specific round's data
			// (totals, status, etc.) is refetched from the network.
			// This ensures the UI shows the updated bet totals for this round.
			queryClient.invalidateQueries({
				queryKey: ["round", roundId.toString()],
			});

			// Invalidate the player's bet for this specific round.
			// This causes a network refetch of the player's bet for this round.
			queryClient.invalidateQueries({
				queryKey: ["round-to-player-bet", `${roundId.toString()}-${address}`],
			});

			// Refetch the global rounds dataset (all statuses): required to refresh all bets amounts on betOnGames Table.
			refetchRounds();

			// Refetch the user's active rounds with bets dataset: required to refresh betOnGames RowActions.
			refetchActiveRoundsWithPlayerBets();

			// Reset form to defaults
			form.reset();
			// Close dialog in a non-blocking way
			startTransition(onCloseDialog);
		}
	}, [
		isConfirmed,
		form,
		onCloseDialog,
		queryClient,
		roundId,
		refetchRounds,
		refetchActiveRoundsWithPlayerBets,
		address,
	]);

	const isDisabled = useMemo(
		() => isPlacingBet || isConfirming,
		[isPlacingBet, isConfirming],
	);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<PredictionSideBadge
					targetPrice={targetPrice}
					isAboveTarget={isAboveTarget}
				/>

				<FormField
					control={form.control}
					name="ethValue"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center font-semibold gap-1">
								<CoinsIcon size={16} />
								ETH Amount
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormDescription>
								Enter the amount of ETH you want to place on this prediction.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<AlertDialogFooter>
					<AlertDialogCancel
						onClick={onCloseDialog}
						disabled={isDisabled}
						className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
					>
						Cancel
					</AlertDialogCancel>

					<Button
						type="submit"
						disabled={isDisabled}
						className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
					>
						{isDisabled ? (
							<span className="inline-flex gap-2 items-center">
								<span className="animate-spin">
									<LoaderIcon />
								</span>
								<span>Placing Bet...</span>
							</span>
						) : (
							<span className="inline-flex gap-2 items-center">
								<span>
									<DicesIcon />
								</span>
								<span>Confirm Bet</span>
							</span>
						)}
					</Button>
				</AlertDialogFooter>
			</form>
		</Form>
	);
};

type PredictionSideBadgeProps = {
	targetPrice: bigint;
	isAboveTarget: boolean;
};

const PredictionSideBadge: FC<PredictionSideBadgeProps> = ({
	targetPrice,
	isAboveTarget,
}) => {
	return (
		<div className="flex items-center gap-x-2 font-semibold">
			{isAboveTarget ? (
				<ThumbsUpIcon color="var(--chart-2)" size={16} />
			) : (
				<ThumbsDownIcon color="var(--destructive)" size={16} />
			)}
			<span>
				Predicting {isAboveTarget ? "above" : "below"}{" "}
				{formatEther(targetPrice)} USD
			</span>
		</div>
	);
};
