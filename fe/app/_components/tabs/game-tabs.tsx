import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH3 } from "../typography/h3";
import { BetOnGamesTab } from "./bet-on-games/bet-on-games.tab";
import { ClaimRewardsTab } from "./claim-rewards/claim-rewards.tab";
import { CreateGameTab } from "./create-game/create-game.tab";

export const GameTabs = () => {
	return (
		<Tabs defaultValue="create-game">
			<TabsList className="mx-auto justify-center flex max-sm:flex-wrap max-sm:items-start h-full md:gap-4">
				<TabsTrigger value="create-game" className="cursor-pointer">
					<TypographyH3>Create Game</TypographyH3>
				</TabsTrigger>
				<TabsTrigger value="bet-on-games" className="cursor-pointer">
					<TypographyH3>Bet on Games</TypographyH3>
				</TabsTrigger>
				<TabsTrigger value="claim-rewards" className="cursor-pointer">
					<TypographyH3>Claim Rewards</TypographyH3>
				</TabsTrigger>
			</TabsList>

			<CreateGameTab />
			<BetOnGamesTab />
			<ClaimRewardsTab />
		</Tabs>
	);
};
