"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ChartSplineIcon,
	CircleQuestionMarkIcon,
	CoinsIcon,
	DicesIcon,
	LoaderIcon,
	TargetIcon,
	TimerIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { useCurrentPrice } from "@/app/_hooks/use-current-price";
import { useTransactionToast } from "@/app/_hooks/use-tx-toast";
import type { HexAddress } from "@/app/_types";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FeedPairSelect } from "./feed-pair.select";
import { SideCheckBox } from "./side.checkbox";

const formSchema = z.object({
	ethValue: z
		.string()
		.regex(/^\d*\.?\d+$/, "Must be a valid number")
		.refine((val) => Number(val) > 0, "Must be greater than 0"),

	targetPrice: z
		.string()
		.regex(/^\d*\.?\d+$/, "Must be a valid number")
		.refine((val) => Number(val) > 0, "Must be greater than 0"),

	duration: z
		.string()
		.regex(/^\d+$/, "Must be a valid integer")
		.refine((val) => Number(val) > 1, "Must be greater than 1"),

	dataFeedAddress: z.string().min(1, "Please select a pair"),

	isAboveTarget: z.boolean(),
});

type FormSchemaT = z.infer<typeof formSchema>;

export const CreateGameForm = () => {
	const chainId = useChainId();

	// Contract config for the current chain
	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

	// React-hook-form setup
	const form = useForm<FormSchemaT>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			ethValue: "0.1",
			dataFeedAddress: "",
			targetPrice: "",
			duration: "10",
			isAboveTarget: true,
		},
	});

	// Subscribe to the "targetPrice" field in the form.
	// useWatch ensures that the component re-renders when this field changes
	// without causing unnecessary re-renders for the entire form.
	const targetPrice = useWatch({
		control: form.control,
		name: "targetPrice",
	});

	// Subscribe to the "dataFeedAddress" field in the form.
	const dataFeedAddress = useWatch({
		control: form.control,
		name: "dataFeedAddress",
	}) as HexAddress;

	// Fetch the current price for the selected data feed
	const currentPrice = useCurrentPrice({ dataFeedAddress });

	// Wagmi write contract setup for creating a game
	const {
		data: createRoundHash,
		error: createRoundError,
		isPending: isCreatingRound,
		writeContract,
	} = useWriteContract();

	// Submit handler
	const onSubmit = useCallback(
		async (values: FormSchemaT) => {
			const { dataFeedAddress, isAboveTarget } = values;
			const ethValueInWei = parseEther(values.ethValue);
			const targetPriceInWei = parseEther(values.targetPrice);
			const duration = parseInt(values.duration, 10) * 60;

			writeContract({
				...contractConfig,
				functionName: "createRound",
				// payable createRound(address _feed, uint256 _target, BetSide _betSide, uint256 _duration)
				args: [dataFeedAddress, targetPriceInWei, isAboveTarget, duration],
				value: ethValueInWei,
			});
		},
		[contractConfig, writeContract],
	);

	// Wait for transaction confirmation
	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash: createRoundHash,
		});

	// Transaction toast notifications
	useTransactionToast({
		hash: createRoundHash,
		isConfirming,
		isConfirmed,
		error: createRoundError as BaseError | null,
	});

	// Handle post create game transaction confirmation logic
	useEffect(() => {
		if (isConfirmed) {
			// Reset form to defaults
			form.reset();
		}
	}, [isConfirmed, form]);

	const isDisabled = useMemo(
		() => isCreatingRound || isConfirming,
		[isCreatingRound, isConfirming],
	);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-8"
			>
				<FormField
					control={form.control}
					name="dataFeedAddress"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center font-semibold">
								<DicesIcon size={16} />
								Market Pair
							</FormLabel>
							<FormControl>
								<FeedPairSelect {...field} onValueChange={field.onChange} />
							</FormControl>
							<FormDescription>
								Select a price feed to base your prediction on.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex gap-4 max-sm:gap-8 max-sm:flex-col-reverse">
					<FormField
						control={form.control}
						name="targetPrice"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center font-semibold">
									<TargetIcon size={16} />
									Target Price (USD)
								</FormLabel>
								<FormControl>
									<Input {...field} className="max-sm:w-full w-64" />
								</FormControl>
								<FormDescription>
									Reference price used to determine the bet outcome.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-y-2.5 text-3xl">
						<Tooltip>
							<TooltipTrigger asChild>
								<Label className="flex w-fit items-center gap-x-2 text-semibold">
									<TargetIcon size={16} />
									Current Price (USD)
									<CircleQuestionMarkIcon size={14} />
								</Label>
							</TooltipTrigger>
							<TooltipContent className="max-w-64 text-sm">
								<p>
									Price data provided by{" "}
									<span className="font-bold italic">
										Chainlink Price Feeds
									</span>
									, aggregated from multiple exchanges for reliable on-chain
									market information.
								</p>
							</TooltipContent>
						</Tooltip>

						{currentPrice ? (
							<Input
								key={dataFeedAddress}
								readOnly
								defaultValue={formatEther(currentPrice)}
								className="max-sm:w-full w-64 ring-2 ring-primary bg-primary/10"
							/>
						) : (
							<Skeleton className="h-[2.35rem] max-sm:w-full w-64 rounded-lg border-border bg-primary/10" />
						)}
					</div>
				</div>

				<FormField
					control={form.control}
					name="isAboveTarget"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center font-semibold">
								<ChartSplineIcon size={16} />
								Side
							</FormLabel>
							<FormControl>
								<SideCheckBox
									targetPrice={targetPrice}
									checked={field.value}
									onChange={field.onChange}
								/>
							</FormControl>
							<FormDescription>
								Select whether you predict the final price will end above or
								below your target.{" "}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="duration"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center font-semibold">
								<TimerIcon size={16} /> Duration (min)
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									className="max-sm:w-full w-64"
								/>
							</FormControl>
							<FormDescription>
								Set how long the game will last.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="ethValue"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center font-semibold">
								<CoinsIcon size={16} />
								Bet Amount (ETH)
							</FormLabel>
							<FormControl>
								<Input {...field} className="max-sm:w-full w-64" />
							</FormControl>

							<FormDescription>
								Enter the amount of ETH you want to stake.
							</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					size={"lg"}
					disabled={isCreatingRound}
					className={cn(
						"w-full",
						isDisabled ? "cursor-not-allowed" : "cursor-pointer",
					)}
				>
					{isDisabled ? (
						<span className="inline-flex gap-2 items-center">
							<span className="animate-spin">
								<LoaderIcon />
							</span>
							<span>Creating Game...</span>
						</span>
					) : (
						<span className="inline-flex gap-2 items-center">
							<span>
								<DicesIcon />
							</span>
							<span>Create Game</span>
						</span>
					)}
				</Button>
			</form>
		</Form>
	);
};
