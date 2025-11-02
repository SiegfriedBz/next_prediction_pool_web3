import { ActiveRoundsWithPlayerBetsProvider } from "@/app/_contexts/active-rounds-with-player-bets-provider";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { TypographyH2 } from "../../typography/h2";
import { TypographyLead } from "../../typography/lead";
import { GamesStatsCard } from "./games-stats-card";
import { GamesTable } from "./games-table";

export const BetOnGamesTab = () => {
	return (
		<TabsContent value="bet-on-games" className="mt-4">
			<ActiveRoundsWithPlayerBetsProvider>
				<Card>
					<CardHeader className="flex items-center sm:justify-between">
						<div className="flex flex-col w-full">
							<CardTitle>
								<TypographyH2>Bet on Games</TypographyH2>
							</CardTitle>
							<CardDescription>
								<GamesStatsCard className="max-sm:w-full max-sm:mb-4 sm:hidden " />
								<TypographyLead>Select Games on which to bet</TypographyLead>
							</CardDescription>
						</div>
						<GamesStatsCard className="max-sm:hidden sm:min-w-1/3 md:min-w-1/2 lg:min-w-1/4" />
					</CardHeader>
					<CardContent>
						<GamesTable />
					</CardContent>
				</Card>
			</ActiveRoundsWithPlayerBetsProvider>
		</TabsContent>
	);
};
