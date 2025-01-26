import { Id } from "../../convex/_generated/dataModel";
export type PlayerDetails = {
    id: Id<"players"> | null;
    username: string;
};
export function useLocalStorage() {
    function setItems({ id, username }: PlayerDetails) {
        try {
            window.localStorage.setItem(
                "player",
                JSON.stringify({ id, username })
            );
        } catch (error) {
            console.log(error);
        }
    }

    function getItems() {
        try {
            const data = JSON.parse(
                window.localStorage.getItem("player")!
            ) as PlayerDetails;
            const userDetails = data;
            return { userDetails };
        } catch (error) {
            console.log(error);
        }
    }
    return { getItems, setItems };
}
