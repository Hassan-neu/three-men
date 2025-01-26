import { GameboardContext } from "@/hooks/context";
import React, { use } from "react";
import { PawnProps, GameboardType } from "@/utils/types";
function Player({
    isPlayable,
    lastPlayer,
    pawn,
    styling,
    ...props
}: PawnProps) {
    const { currentArea, setCurrentArea, setShowButtons, user } = use(
        GameboardContext
    ) as GameboardType;
    const { playerId, pawnName } = pawn;

    return (
        <div
            className={`rounded-full ${
                currentArea == pawnName ? "border-2 border-black" : ""
            } ${lastPlayer == playerId || user !== playerId || !isPlayable ? "cursor-not-allowed" : ""}`}
            {...props}
            style={{ ...styling }}
            onClick={() => {
                if (lastPlayer == playerId) return;
                if (!isPlayable) return;
                if (user !== playerId) return;
                setCurrentArea(pawnName);
                setShowButtons(true);
            }}
        ></div>
    );
}

export default Player;
