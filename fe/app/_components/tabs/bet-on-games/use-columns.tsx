"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
	CircleQuestionMarkIcon,
	CircleSlash2Icon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "lucide-react";
import { type ReactElement, useMemo } from "react";
import { formatEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { type Round, RoundStatus } from "@/app/_types";
import { ReverseFeedMap } from "@/app/_utils/feed-maps";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedIcon } from "../../feed-icon";
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
					return <CircleSlash2Icon size={12} />;
				}

				return <RowActions round={row.original} />;
			},
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
				const rawCreator: string | null = row.getValue("creator") ?? null;

				if (!rawCreator) {
					return <CircleSlash2Icon size={12} />;
				}

				const currentUserIsCreator = rawCreator === account.address;
				const shortRawCreator = `${rawCreator.slice(0, 5)}...${rawCreator.slice(37, 42)}`;

				const creator = currentUserIsCreator ? "You" : shortRawCreator;

				return <div className="font-medium">{creator}</div>;
			},
		},
	];

	return columns;
};
