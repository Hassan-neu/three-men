import { GameboardContext } from "@/hooks/context";
import { useMutation } from "convex/react";
import React from "react";
import { use } from "react";
import { api } from "../../convex/_generated/api";
import { AreaButtonProps, GameboardType } from "@/utils/types";

function AreaButton({
    pawns,
    player,
    gameKey,
    styling,
    ...props
}: AreaButtonProps) {
    const { currentArea, setShowButtons, setCurrentArea } = use(
        GameboardContext
    ) as GameboardType;
    const { gridArea } = pawns.find((pawn) => pawn.pawnName == currentArea)!;
    const openButton = player.allowedMove.includes(gridArea);
    const updateMovement = useMutation(api.game.updateMovement);

    return (
        <button
            className={`${
                openButton ? "flex border rounded-full open" : "hidden"
            }`}
            style={{ ...styling }}
            {...props}
            onClick={async () => {
                document.startViewTransition(async () => {
                    await updateMovement({
                        gameKey,
                        newArea: styling.gridArea,
                        pawnName: currentArea,
                    });
                    setShowButtons(false);
                    setCurrentArea("");
                });
            }}
        ></button>
    );
}

export default AreaButton;
