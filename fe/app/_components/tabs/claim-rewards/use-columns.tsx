"use client";

import type { ColumnDef, SortingFn } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
	BanIcon,
	CircleQuestionMarkIcon,
	CircleSlash2Icon,
	CoinsIcon,
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
import { AboveTargetTableHeader } from "../table/above-target-table-header";
import { BelowTargetTableHeader } from "../table/below-target-table-header";
import { CreatorTableCell } from "../table/creator-table-cell";
import { TargetPriceTableHeader } from "../table/target-price-table-header";
import { RowActions } from "./row-actions";

//custom sorting logic for end column (soonest → latest)
export const sortEndFn: SortingFn<RoundWithPlayerBet> = (rowA, rowB) => {
	const endA = rowA.original.end;
	const endB = rowB.original.end;
	return Number(endA) - Number(endB);
};

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
			header: () => <TargetPriceTableHeader />,
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
						<div className="flex items-center gap-x-2 text-semibold">
							<span>Claim</span>
							<CircleQuestionMarkIcon size={14} />
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Claim your rewards</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const playerBet = row.getValue("playerBet");

				if (!playerBet) {
					return (
						<span className="inline-flex justify-start items-center size-9">
							<CircleSlash2Icon size={12} />
						</span>
					);
				}

				const playerHasClaimed = (playerBet as Bet).claimed;

				if (playerHasClaimed) {
					return (
						<div className="flex items-center">
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="inline-flex justify-start items-center size-9">
										<CoinsIcon className="h-4 w-4 text-chart-2/50 cursor-not-allowed" />
									</span>
								</TooltipTrigger>
								<TooltipContent>
									<p>You already claimed this reward.</p>
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
			header: () => <div className="text-semibold">Your bet (ETH)</div>,
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
			header: () => <BelowTargetTableHeader />,
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
			header: () => <AboveTargetTableHeader />,
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
			accessorKey: "end",
			header: () => <div className="text-semibold">End</div>,
			cell: ({ row }) => {
				const endDate = new Date(Number(row.getValue("end")) * 1000);
				const relative = formatDistanceToNow(endDate, { addSuffix: true });

				return <div className="font-medium">{relative}</div>;
			},
			sortingFn: sortEndFn,
		},
		{
			accessorKey: "creator",
			header: () => <div className="text-semibold">Creator</div>,
			cell: ({ row }) => {
				return (
					<CreatorTableCell
						rawCreator={row.getValue("creator")}
						address={account.address}
					/>
				);
			},
		},
	];

	return columns;
};
