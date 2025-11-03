"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { CircleQuestionMarkIcon, CircleSlash2Icon } from "lucide-react";
import { type ReactElement, useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useActiveRoundsWithPlayerBetsContext } from "@/app/_hooks/use-active-rounds-with-player-bets-context";
import { type Round, RoundStatus } from "@/app/_types";
import { ReverseFeedMap } from "@/app/_utils/feed-maps";
import { Badge } from "@/components/ui/badge";
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
import { sortEndFn } from "./data-table";
import { RowActions } from "./row-actions";

const StatusToText: Record<RoundStatus, ReactElement> = {
	[RoundStatus.NotStarted]: <Badge variant="outline">Not started</Badge>,
	[RoundStatus.Active]: <Badge variant="chartTwo">Active</Badge>,
	[RoundStatus.Ended]: <Badge variant="destructive">Ended</Badge>,
	[RoundStatus.Resolved]: <Badge>Resolved</Badge>,
};

export const useColumns = () => {
	const account = useAccount();
	const chainId = useChainId();

	const currentReverseFeedMap = useMemo(
		() => ReverseFeedMap.get(chainId),
		[chainId],
	);

	const columns: ColumnDef<Round>[] = [
		{
			accessorKey: "priceFeed",
			header: () => <div className="text-semibold">Pair</div>,
			cell: ({ row }) => {
				const pair = currentReverseFeedMap?.get(row.getValue("priceFeed"));

				if (!pair) return <CircleSlash2Icon size={12} />;

				return (
					<div className="flex gap-x-2 items-center">
						<FeedIcon pairSymbol={pair} />
						<div className="font-medium">{pair}</div>
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
			id: "actions",
			header: () => (
				<Tooltip>
					<TooltipTrigger>
						<div className="text-semibold relative">
							Bet
							<CircleQuestionMarkIcon
								size={8}
								className="absolute -top-2 -right-2"
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Bet on Games</p>
					</TooltipContent>
				</Tooltip>
			),
			cell: ({ row }) => {
				const endDate = new Date(Number(row.getValue("end")) * 1000);
				const endDateHasPassed = endDate < new Date();

				const rawCreator: string | null = row.getValue("creator") ?? null;
				const currentUserIsCreator = rawCreator === account.address;

				if (endDateHasPassed || !rawCreator || currentUserIsCreator) {
					return (
						<span className="inline-flex justify-start items-center h-9 w-16">
							<CircleSlash2Icon size={12} />
						</span>
					);
				}

				return <RowActions round={row.original} />;
			},
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
			accessorKey: "status",
			header: () => <div className="text-semibold">Status</div>,
			cell: ({ row }) => {
				const endDate = new Date(Number(row.getValue("end")) * 1000);
				const endDateHasPassed = endDate < new Date();

				const rawStatus = row.getValue("status");
				let status: ReactElement | null = null;

				if (rawStatus === RoundStatus.Active && endDateHasPassed) {
					status = StatusToText[RoundStatus.Ended] as ReactElement;
				} else {
					status = StatusToText[rawStatus as RoundStatus] as ReactElement;
				}

				return <div className="font-medium">{status}</div>;
			},
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
