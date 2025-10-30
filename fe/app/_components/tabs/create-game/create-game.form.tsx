"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ChartSplineIcon,
	CoinsIcon,
	DicesIcon,
	TargetIcon,
	TimerIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
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

	const contractConfig: ContractConfigT = useMemo(
		() => getPredictionPoolContractConfig(chainId),
		[chainId],
	);

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

	const {
		data: createRoundHash,
		error: createRoundError,
		isPending: createRoundIsPending,
		writeContract,
	} = useWriteContract();

	const dataFeedAddress = form.watch("dataFeedAddress") as HexAddress;
	const targetPrice = form.watch("targetPrice");

	const currentPrice = useCurrentPrice({ dataFeedAddress });

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

	const {
		isLoading: createRoundIsConfirming,
		isSuccess: createRoundIsConfirmed,
	} = useWaitForTransactionReceipt({
		hash: createRoundHash,
	});

	useTransactionToast({
		hash: createRoundHash,
		isConfirming: createRoundIsConfirming,
		isConfirmed: createRoundIsConfirmed,
		error: createRoundError as BaseError | null,
	});

	useEffect(() => {
		if (createRoundIsConfirmed) {
			form.reset();
		}
	}, [createRoundIsConfirmed, form]);

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
								Select Pair
							</FormLabel>
							<FormControl>
								<FeedPairSelect {...field} onValueChange={field.onChange} />
							</FormControl>
							<FormDescription>Select a pair to bet on.</FormDescription>
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
								<FormDescription>Set a targetPrice.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-y-2.5 text-3xl">
						<Label>Current Price (USD)</Label>

						{currentPrice ? (
							<Input
								key={dataFeedAddress}
								readOnly
								defaultValue={formatEther(currentPrice)}
								className="max-sm:w-full w-64"
							/>
						) : (
							<Skeleton className="h-[2.35rem] max-sm:w-full w-64 rounded-lg border-border bg-blue-100/10" />
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
								Set on which Side of the Target Price you bet on.
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
							<FormDescription>Set a game duration.</FormDescription>
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
								Your Bet (ETH)
							</FormLabel>
							<FormControl>
								<Input {...field} className="max-sm:w-full w-64" />
							</FormControl>

							<FormDescription>Amount You Want to Bet (ETH).</FormDescription>

							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={createRoundIsPending}
					className="w-full"
				>
					{createRoundIsPending ? "Confirming..." : "Submit"}
				</Button>
			</form>
		</Form>
	);
};
