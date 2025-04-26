import Board from "@/components/board";
import React from "react";

async function BoardPage({ params }: { params: Promise<{ gameid: string }> }) {
    const { gameid } = await params;
    return <Board gameId={gameid} />;
}

export default BoardPage;
