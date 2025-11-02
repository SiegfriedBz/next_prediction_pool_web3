"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	BanIcon,
	CircleQuestionMarkIcon,
	CircleSlash2Icon,
	CoinsIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
	TrophyIcon,
} from "lucide-react";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import type { Bet, RoundWithPlayerBet } from "@/app/_types";
import { ReverseFeedMap } from "@/app/_utils/feed-maps";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedIcon } from "../../feed-icon";
import { RowActions } from "./row-actions";

export const useColumns = () => {
	const account = useAccount();
	const chainId = useChainId();
	const currentReverseFeedMap = useMemo(
		() => ReverseFeedMap.get(chainId),
		[chainId],
	);

	const columns: ColumnDef<RoundWithPlayerBet>[] = [
		{
			accessorKey: "priceFeed",
			header: () => <div className="text-semibold">Pair</div>,
			cell: ({ row }) => {
				const pairSymbol = currentReverseFeedMap?.get(
					row.getValue("priceFeed"),
				);

				if (!pairSymbol) return <CircleSlash2Icon size={12} />;

				return (
					<div className="flex gap-x-2 items-center">
						<FeedIcon pairSymbol={pairSymbol} />
						<div className="font-medium">{pairSymbol}</div>
					</div>
				);
			},
		},
		{
			accessorKey: "target",
			header: () => (
				<Tooltip>
					<TooltipTrigger>
						<div className="text-semibold relative">
							Target (USD)
							<CircleQuestionMarkIcon
								size={8}
								className="absolute -top-2 -right-2"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Target Price (USD) on Games</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const price = formatEther(row.getValue("target"));

				return <div className="font-medium">{price}</div>;
			},
		},

		{
			accessorKey: "playerIsWinner",
			header: () => <div className="text-semibold">You won</div>,
			cell: ({ row }) => {
				const playerBet = row.getValue("playerBet");

				if (!playerBet) {
					return <CircleSlash2Icon size={12} />;
				}

				const playerIsWinner = row.getValue("playerIsWinner") ?? false;

				if (playerIsWinner) {
					return <TrophyIcon size={14} color="var(--chart-2)" />;
				}
				return <BanIcon size={14} color="var(--destructive)" />;
			},
		},

		{
			id: "actions",
			header: () => (
				<Tooltip>
					<TooltipTrigger>
						<div className="flex items-center gap-x-2 text-semibold relative">
							<TrophyIcon size={12} color="var(--chart-2)" />
							<span>Claim</span>
							<CircleQuestionMarkIcon
								size={8}
								className="absolute -top-2 -right-2"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Claim your rewards on this game</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const playerBet = row.getValue("playerBet");

				if (!playerBet) {
					return <CircleSlash2Icon size={12} />;
				}

				const playerHasClaimed = (playerBet as Bet).claimed;

				if (playerHasClaimed) {
					return (
						<div className="flex items-center">
							<Tooltip>
								<TooltipTrigger>
									<CoinsIcon className="h-4 w-4 text-chart-2/50 cursor-not-allowed" />
								</TooltipTrigger>
								<TooltipContent>
									<p>Already claimed</p>
								</TooltipContent>
							</Tooltip>
						</div>
					);
				}

				const playerIsWinner = row.getValue("playerIsWinner") ?? false;

				if (!playerIsWinner) {
					return <CircleSlash2Icon size={12} />;
				}

				const pairSymbol = currentReverseFeedMap?.get(
					row.getValue("priceFeed"),
				);

				if (!pairSymbol) return <CircleSlash2Icon size={12} />;

				return <RowActions pairSymbol={pairSymbol} roundId={row.original.id} />;
			},
		},

		{
			accessorKey: "playerBet",
			header: () => <div className="text-semibold">Your bid (ETH)</div>,
			cell: ({ row }) => {
				const playerBet = row.getValue("playerBet");

				if (!playerBet) {
					return <CircleSlash2Icon size={12} />;
				}

				const playerBetAmount = (playerBet as Bet).amount;

				return (
					<div className="font-medium">{formatEther(playerBetAmount)}</div>
				);
			},
			enableSorting: false,
		},
		{
			accessorKey: "ltTotal",
			header: () => (
				<Tooltip>
					<TooltipTrigger>
						<div className="flex items-center gap-x-2 text-semibold relative">
							<ThumbsDownIcon color="var(--destructive)" size={12} />
							<span>LT Total Bets (ETH)</span>
							<CircleQuestionMarkIcon
								size={8}
								className="absolute -top-2 -right-2"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							<strong>Less Than</strong> Side - Total Sum Bets on Games
						</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const wei: bigint = row.getValue("ltTotal");

				return (
					<div className="font-medium">
						{wei === BigInt(0) ? "-" : formatEther(wei)}
					</div>
				);
			},
			enableSorting: false,
		},
		{
			accessorKey: "gteTotal",
			header: () => (
				<Tooltip>
					<TooltipTrigger>
						<div className="flex items-center gap-x-2 text-semibold relative">
							<ThumbsUpIcon color="var(--chart-2)" size={12} />
							<span>GTE Total Bets (ETH)</span>
							<CircleQuestionMarkIcon
								size={8}
								className="absolute -top-2 -right-2"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							<strong>Greater Than</strong> Side - Total Sum Bets on Games
						</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const wei: bigint = row.getValue("gteTotal");

				return (
					<div className="font-medium">
						{wei === BigInt(0) ? "-" : formatEther(wei)}
					</div>
				);
			},
			enableSorting: false,
		},
		{
			accessorKey: "creator",
			header: () => <div className="text-semibold">Creator</div>,
			cell: ({ row }) => {
				const rawCreator: string | null = row.getValue("creator") ?? null;

				if (!rawCreator) {
					return <CircleSlash2Icon size={12} />;
				}

				const currentUserIsCreator = rawCreator === account.address;
				const shortRawCreator = `${rawCreator.slice(0, 5)}...${rawCreator.slice(37, 42)}`;

				const creator = currentUserIsCreator ? "Me" : shortRawCreator;

				return <div className="font-medium">{creator}</div>;
			},
		},
	];

	return columns;
};
