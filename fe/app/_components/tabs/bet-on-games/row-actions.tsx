"use client";

import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import {
	CircleCheckBigIcon,
	DicesIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import { useChainId } from "wagmi";
import { useActiveRoundsWithPlayerBetsContext } from "@/app/_hooks/use-active-rounds-with-player-bets-context";
import type { Round } from "@/app/_types";
import { ReverseFeedMap } from "@/app/_utils/feed-maps";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedIcon } from "../../feed-icon";
import { BetOnGameForm } from "./bet-on-game.form";

type Props = {
	round: Round;
};

export const RowActions: FC<Props> = (props) => {
	const { round } = props;

	const chainId = useChainId();

	const { activeRoundsWithPlayerBets } = useActiveRoundsWithPlayerBetsContext();

	const userHasAlreadyBetOnThisRound = useMemo(
		() =>
			activeRoundsWithPlayerBets.some((r) => {
				return (
					r.id === round.id &&
					r.playerBet?.amount &&
					Number(r.playerBet?.amount) > 0
				);
			}),
		[round, activeRoundsWithPlayerBets],
	);

	const currentReverseFeedMap = useMemo(
		() => ReverseFeedMap.get(chainId),
		[chainId],
	);

	const pairSymbol = useMemo(() => {
		return currentReverseFeedMap?.get(round.priceFeed);
	}, [currentReverseFeedMap, round.priceFeed]);

	// side on which to bet
	const [side, setSide] = useState<"gte" | "lt" | null>(null);

	const dialogOpen = side !== null;

	const onCloseDialog = useCallback(() => setSide(null), []);
	const onBetAboveTarget = useCallback(() => setSide("gte"), []);
	const onBetBelowTarget = useCallback(() => setSide("lt"), []);

	if (userHasAlreadyBetOnThisRound) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="inline-flex justify-start items-center h-9 w-16">
						<CircleCheckBigIcon size={14} className="text-chart-2" />
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<p>You already bet on this game.</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<>
			<ButtonGroup>
				<Button
					type="button"
					size="icon-sm"
					variant={"outline"}
					onClick={onBetBelowTarget}
					className="cursor-pointer"
				>
					<ThumbsDownIcon size={4} className="text-destructive" />
				</Button>
				<ButtonGroupSeparator />
				<Button
					type="button"
					size="icon-sm"
					variant={"outline"}
					onClick={onBetAboveTarget}
					className="cursor-pointer"
				>
					<ThumbsUpIcon size={4} className="text-chart-2" />
				</Button>
			</ButtonGroup>

			<AlertDialog
				open={dialogOpen}
				onOpenChange={(open) => !open && onCloseDialog()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-x-2">
							<DicesIcon size={20} />
							Place your bet
						</AlertDialogTitle>

						{pairSymbol && (
							<AlertDialogDescription>
								<span className="-ms-1 inline-flex items-center gap-x-2">
									<FeedIcon pairSymbol={pairSymbol} />
									{pairSymbol}
								</span>
							</AlertDialogDescription>
						)}
					</AlertDialogHeader>

					<BetOnGameForm
						roundId={round.id}
						targetPrice={round.target}
						isAboveTarget={side === "gte"}
						onCloseDialog={onCloseDialog}
					/>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
