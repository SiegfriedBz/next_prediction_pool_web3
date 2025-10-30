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

export const BetOnGamesTab = () => {
	return (
		<TabsContent value="bet-on-games" className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>
						<TypographyH2>Bet on running Games</TypographyH2>
					</CardTitle>
					<CardDescription>
						<TypographyLead>Select Games on which to bet</TypographyLead>
					</CardDescription>
				</CardHeader>
				<CardContent>Bet on running Games - TABLE</CardContent>
			</Card>
		</TabsContent>
	);
};
