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

export const BidOnGamesTab = () => {
	return (
		<TabsContent value="bid-on-games" className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>
						<TypographyH2>Bid on running Games</TypographyH2>
					</CardTitle>
					<CardDescription>
						<TypographyLead>Select Games on which to bid</TypographyLead>
					</CardDescription>
				</CardHeader>
				<CardContent>Bid on running Games - TABLE</CardContent>
			</Card>
		</TabsContent>
	);
};
