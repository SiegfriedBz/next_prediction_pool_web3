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
	useChainId,
	useWaitForTransactionReceipt,
	useWriteContract,
} from "wagmi";
import { z } from "zod";
import { getPredictionPoolContractConfig } from "@/app/_contracts/prediction-pool";
import type { ContractConfigT } from "@/app/_contracts/types";
import { useRoundDataContext } from "@/app/_hooks/use-round-data-context";
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

	const queryClient = useQueryClient();

	const { refetchAllRoundsData } = useRoundDataContext();

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
			// invalidate stale round data
			queryClient.invalidateQueries({
				queryKey: ["round", roundId.toString()],
			});

			// Refetch updated round data
			refetchAllRoundsData();

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
		refetchAllRoundsData,
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
