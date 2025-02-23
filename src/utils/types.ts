export interface AreaButtonProps extends React.ComponentProps<"button"> {
    styling: {
        gridArea: string;
    };
    gameKey: string;
    player: {
        gridArea: string;
        allowedMove: string[];
        showButton: boolean;
        status: string;
    };
    pawns: Array<{
        background?: string | undefined;
        pawnName: string;
        gridArea: string;
        playerId: string;
    }>;
}
export interface PawnProps extends React.ComponentProps<"div"> {
    styling: {
        background?: string;
        gridArea: string;
    };
    lastPlayer?: string;
    isPlayable: boolean;
    pawn: {
        background?: string | undefined;
        gridArea: string;
        pawnName: string;
        playerId: string;
    };
}

export interface GameboardType {
    user: string;
    showButtons: boolean;
    currentArea: string;

    setUser: (param: string) => void;
    setShowButtons: (param: boolean) => void;
    setCurrentArea: (param: string) => void;
}
