"use client";

import {
	type ComponentProps,
	type FC,
	useCallback,
	useMemo,
	useState,
} from "react";
import { useChainId } from "wagmi";
import { FeedMap, FeedPair, type FeedPairT } from "@/app/_utils/feed-maps";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FeedIcon } from "../../feed-icon";

type Props = Omit<ComponentProps<typeof Select>, "onValueChange"> & {
	onValueChange: (value: string) => void;
};

export const FeedPairSelect: FC<Props> = (props) => {
	const { onValueChange, ...rest } = props;

	const chainId = useChainId();

	const [selectedPair, setSelectedPair] = useState<FeedPairT | null>(null);

	const currentFeedMap = useMemo(() => FeedMap.get(chainId), [chainId]);

	const handleChange = useCallback(
		(selected: FeedPairT) => {
			setSelectedPair(selected);

			const address = currentFeedMap?.get(selected);
			if (address) {
				onValueChange(address);
			}
		},
		[currentFeedMap, onValueChange],
	);

	return (
		<Select
			{...rest}
			value={selectedPair ?? undefined}
			onValueChange={handleChange}
		>
			<SelectTrigger className="max-sm:w-full w-64">
				<SelectValue placeholder="Select a pair" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Pairs</SelectLabel>
					{FeedPair.options.map((pairSymbol) => (
						<SelectItem
							key={pairSymbol}
							value={pairSymbol}
							className="flex gap-x-2 items-center"
						>
							<FeedIcon pairSymbol={pairSymbol} />
							{pairSymbol}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
