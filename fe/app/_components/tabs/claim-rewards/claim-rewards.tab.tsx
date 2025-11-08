import { ResolvedRoundsWithPlayerBetsAndWinsProvider } from "@/app/_contexts/resolved-rounds-with-player-bets-and-wins-provider";
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
import { ClaimRewardsTable } from "./claim-rewards-table";
import { ClaimsStatsCard } from "./claims-stats-card";
import { RoundsProvider } from "@/app/_contexts/rounds-provider";

export const ClaimRewardsTab = () => {
	return (
		<TabsContent value="claim-rewards" className="mt-4">
			<RoundsProvider>
				<ResolvedRoundsWithPlayerBetsAndWinsProvider>
					<Card>
						<CardHeader className="flex items-center sm:justify-between">
							<div className="flex flex-col w-full">
								<CardTitle>
									<TypographyH2>Claim Rewards</TypographyH2>
								</CardTitle>
								<CardDescription>
									<ClaimsStatsCard className="max-sm:w-full max-sm:mb-4 sm:hidden " />
									<TypographyLead>
										Claim rewards on your winning bets
									</TypographyLead>
								</CardDescription>
							</div>
							<ClaimsStatsCard className="max-sm:hidden sm:min-w-1/3 md:min-w-1/2 lg:min-w-1/4" />
						</CardHeader>
						<CardContent>
							<ClaimRewardsTable />
						</CardContent>
					</Card>
				</ResolvedRoundsWithPlayerBetsAndWinsProvider>
			</RoundsProvider>
		</TabsContent>
	);
};
