"use client";

import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { CoinsIcon } from "lucide-react";
import { type FC, useCallback, useState } from "react";
import type { FeedPairT } from "@/app/_utils/feed-maps";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedIcon } from "../../feed-icon";
import { ClaimRewardsConfirm } from "./claim-rewards-confirm";

type Props = {
	roundId: bigint;
	pairSymbol: FeedPairT;
};

export const RowActions: FC<Props> = (props) => {
	const { roundId, pairSymbol } = props;

	const [open, setOpen] = useState<boolean>(false);

	const onOpenDialog = useCallback(() => setOpen(true), []);
	const onCloseDialog = useCallback(() => setOpen(false), []);

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						onClick={onOpenDialog}
						size="icon-sm"
						variant={"outline"}
						className="cursor-pointer"
					>
						<CoinsIcon className="h-4 w-4 text-chart-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>You won, claim your rewards!</p>
				</TooltipContent>
			</Tooltip>

			<AlertDialog
				open={open}
				onOpenChange={(open) => !open && onCloseDialog()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Claim</AlertDialogTitle>

						{pairSymbol && (
							<AlertDialogDescription>
								<span className="flex items-center gap-x-2">
									<CoinsIcon size={16} className="text-chart-2" />
									<span className="whitespace-nowrap">
										Claim your rewards on
									</span>
									<FeedIcon pairSymbol={pairSymbol} />
									{pairSymbol}
								</span>
							</AlertDialogDescription>
						)}
					</AlertDialogHeader>

					<ClaimRewardsConfirm
						roundId={roundId}
						onCloseDialog={onCloseDialog}
					/>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
