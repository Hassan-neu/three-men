import Board from "@/components/board";
import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
async function BoardPage({ params }: { params: Promise<{ gameid: string }> }) {
    const { gameid } = await params;
    return <Board gameId={gameid as Id<"games">} />;
}

export default BoardPage;
