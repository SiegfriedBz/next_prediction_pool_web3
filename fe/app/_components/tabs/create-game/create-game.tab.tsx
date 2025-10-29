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
import { CreateGameForm } from "./create-game.form";

export const CreateGameTab = () => {
	return (
		<TabsContent value="create-game" className="mt-4 max-w-2xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>
						<TypographyH2>Create Game</TypographyH2>
					</CardTitle>
					<CardDescription>
						<TypographyLead>Fill the form to Create a new Game</TypographyLead>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CreateGameForm />
				</CardContent>
			</Card>
		</TabsContent>
	);
};
