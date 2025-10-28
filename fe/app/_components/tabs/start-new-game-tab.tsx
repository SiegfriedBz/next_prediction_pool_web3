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

export const StartNewGameTab = () => {
	return (
		<TabsContent value="start-new-game" className="mt-4">
			<Card>
				<CardHeader>
					<CardTitle>
						<TypographyH2>Start a new Game</TypographyH2>
					</CardTitle>
					<CardDescription>
						<TypographyLead>Fill the form to Start a new Game</TypographyLead>
					</CardDescription>
				</CardHeader>
				<CardContent>Start a new Game - FORM</CardContent>
			</Card>
		</TabsContent>
	);
};
