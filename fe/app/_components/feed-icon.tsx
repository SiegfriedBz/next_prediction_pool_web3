import type { IconComponent } from "@web3icons/react";
import { type FC, useMemo } from "react";
import { type FeedPairT, PairIconMap } from "../_utils/feed-maps";

type FeedIconProps = { pairSymbol: FeedPairT };

export const FeedIcon: FC<FeedIconProps> = ({ pairSymbol }) => {
	const Icon = useMemo(
		() => PairIconMap.get(pairSymbol),
		[pairSymbol],
	) as IconComponent;

	if (!Icon) return null;

	return <Icon />;
};
