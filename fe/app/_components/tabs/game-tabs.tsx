import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BidOnGamesTab } from "./bid-on-games-tab";
import { ClaimRewardsTab } from "./claim-rewards-tab";
import { StartNewGameTab } from "./start-new-game-tab";

export const GameTabs = () => {
	return (
		<Tabs defaultValue="start-new-game">
			<TabsList className="mx-auto justify-center flex max-sm:flex-wrap max-sm:items-start h-full md:gap-4">
				{" "}
				<TabsTrigger
					value="start-new-game"
					className="max-md:text-lg text-2xl font-bold cursor-pointer w-fit"
				>
					Start a New Game
				</TabsTrigger>
				<TabsTrigger
					value="bid-on-games"
					className="max-md:text-lg text-2xl font-bold cursor-pointer w-fit"
				>
					Bid on Games
				</TabsTrigger>
				<TabsTrigger
					value="claim-rewards"
					className="max-md:text-lg text-2xl font-bold cursor-pointer w-fit"
				>
					Get Rewards
				</TabsTrigger>
			</TabsList>

			<StartNewGameTab />
			<BidOnGamesTab />
			<ClaimRewardsTab />
		</Tabs>
	);
};
