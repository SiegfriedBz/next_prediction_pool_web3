import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { TypographyH2 } from "../typography/h2";
import { TypographyLead } from "../typography/lead";

export const ClaimRewardsTab = () => {
	return (
		<TabsContent value="claim-rewards" className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>
						<TypographyH2>Get Rewards</TypographyH2>
					</CardTitle>
					<CardDescription>
						<TypographyLead>Claim rewards on your winning bets</TypographyLead>
					</CardDescription>
				</CardHeader>
				<CardContent>Get Rewards - TABLE</CardContent>
			</Card>
		</TabsContent>
	);
};
