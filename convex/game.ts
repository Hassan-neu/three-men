import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
export const create = mutation({
    args: {
        username: v.string(),
        userId: v.string(),
        gameKey: v.string(),
        pawnColor: v.string(),
    },
    handler: async (ctx, { username, userId, gameKey, pawnColor }) => {
        const gameId = await ctx.db.insert("games", {
            maxPlayer: 2,
            gameKey,
            availablePlayers: [userId],
            players: [
                {
                    id: userId,
                    username,
                    wins: 0,
                },
            ],
            grids: [
                {
                    status: "blocked",
                    gridArea: "a",
                    showButton: false,
                    allowedMove: ["b", "d", "e"],
                },
                {
                    status: "blocked",
                    gridArea: "b",
                    showButton: false,
                    allowedMove: ["a", "c", "e"],
                },
                {
                    status: "blocked",
                    gridArea: "c",
                    showButton: false,
                    allowedMove: ["b", "e", "f"],
                },
                {
                    status: "open",
                    gridArea: "d",
                    showButton: true,
                    allowedMove: ["a", "e", "g"],
                },
                {
                    status: "open",
                    gridArea: "e",
                    showButton: true,
                    allowedMove: ["a", "b", "c", "d", "f", "g", "h", "i"],
                },
                {
                    status: "open",
                    gridArea: "f",
                    showButton: true,
                    allowedMove: ["c", "e", "i"],
                },
                {
                    status: "blocked",
                    gridArea: "g",
                    showButton: false,
                    allowedMove: ["d", "e", "h"],
                },
                {
                    status: "blocked",
                    gridArea: "h",
                    showButton: false,
                    allowedMove: ["e", "g", "i"],
                },
                {
                    status: "blocked",
                    gridArea: "i",
                    showButton: false,
                    allowedMove: ["e", "f", "h"],
                },
            ],
            pawns: [
                {
                    playerId: userId,
                    pawnColor,
                    gridArea: "a",
                    pawnName: `${username}-1`,
                },
                {
                    playerId: userId,
                    pawnColor,
                    gridArea: "b",
                    pawnName: `${username}-2`,
                },
                {
                    playerId: userId,
                    pawnColor,
                    gridArea: "c",
                    pawnName: `${username}-3`,
                },
            ],
            createdBy: userId,
            isPlayable: false,
        });
        return gameId;
    },
});
export const join = mutation({
    args: {
        username: v.string(),
        userId: v.string(),
        gameKey: v.string(),
        pawnColor: v.optional(v.string()),
    },
    handler: async (ctx, { username, userId, gameKey, pawnColor }) => {
        try {
            const existingGame = await ctx.db
                .query("games")
                .filter((q) => q.eq(q.field("gameKey"), gameKey))
                .unique();

            if (!existingGame) {
                throw new ConvexError("Game not found, Confirm Game Id");
            }
            if (existingGame.availablePlayers.length == 2) {
                throw new ConvexError(
                    "Max Players reached, Join another or Create your own"
                );
            }
            const { availablePlayers, pawns, players } = existingGame;
            await ctx.db.patch(existingGame._id, {
                availablePlayers: [...availablePlayers, userId],
                players: [...players, { id: userId, username, wins: 0 }],
                pawns: [
                    ...pawns,
                    {
                        playerId: userId,
                        pawnColor,
                        gridArea: "g",
                        pawnName: `${username}-1`,
                    },
                    {
                        playerId: userId,
                        pawnColor,
                        gridArea: "h",
                        pawnName: `${username}-2`,
                    },
                    {
                        playerId: userId,
                        pawnColor,
                        gridArea: "i",
                        pawnName: `${username}-3`,
                    },
                ],
                otherPlayer: userId,
                lastPlayer: userId,
                isPlayable: true,
            });
        } catch (error) {
            if (error instanceof ConvexError) {
                throw error.message;
            } else {
                throw error;
            }
        }
    },
});

export const get = query({
    args: { gameKey: v.string() },
    handler: async (ctx, { gameKey }) => {
        try {
            const data = await ctx.db
                .query("games")
                .filter((q) => q.eq(q.field("gameKey"), gameKey))
                .unique();
            return data;
        } catch (error) {
            if (error instanceof ConvexError) {
                console.log(error.message);
                throw error.message;
            } else {
                throw error;
            }
        }
    },
});

export const updateMovement = mutation({
    args: {
        gameKey: v.string(),
        pawnName: v.string(),
        newArea: v.string(),
    },
    handler: async (ctx, { gameKey, pawnName, newArea }) => {
        const existingGame = await ctx.db
            .query("games")
            .filter((q) => q.eq(q.field("gameKey"), gameKey))
            .unique();
        const { gridArea, playerId } = existingGame!.pawns.find(
            (pawn) => pawn.pawnName == pawnName
        )!;
        const { pawns, grids } = existingGame!;
        await ctx.db.patch(existingGame!._id, {
            pawns: pawns.map((pawn) =>
                pawn.pawnName == pawnName
                    ? {
                          ...pawn,
                          gridArea: newArea,
                      }
                    : pawn
            ),
            grids: grids.map((grid) =>
                grid.gridArea == newArea
                    ? {
                          ...grid,
                          status: "blocked",
                          showButton: false,
                      }
                    : grid.gridArea == gridArea
                      ? {
                            ...grid,
                            status: "open",
                            showButton: true,
                        }
                      : grid
            ),
            lastPlayer: playerId,
        });
        const isWon = await checkWinner(ctx, gameKey, playerId);
        if (isWon) {
            const existingGame = await ctx.db
                .query("games")
                .filter((q) => q.eq(q.field("gameKey"), gameKey))
                .unique();
            await ctx.db.patch(existingGame!._id, {
                gameWinner: playerId,
                isPlayable: false,
            });
        }
    },
});
export const updateColor = mutation({
    args: { pawnColor: v.string(), gameKey: v.string(), userId: v.string() },
    handler: async (ctx, { pawnColor, gameKey, userId }) => {
        const existingGame = await ctx.db
            .query("games")
            .filter((q) => q.eq(q.field("gameKey"), gameKey))
            .unique();
        const updateUserPawn = existingGame?.pawns.map((pawn) =>
            pawn.playerId == userId ? { ...pawn, pawnColor } : pawn
        );
        await ctx.db.patch(existingGame!._id, {
            pawns: updateUserPawn,
        });
    },
});
export const restart = mutation({
    args: { gameKey: v.string() },
    handler: async (ctx, { gameKey }) => {
        const existingGame = await ctx.db
            .query("games")
            .filter((q) => q.eq(q.field("gameKey"), gameKey))
            .unique();
        const { pawns: existingPawn, createdBy, otherPlayer } = existingGame!;
        const creatorGrid = ["a", "b", "c"];
        const secondGrid = ["g", "h", "i"];
        const creatorPawn = existingPawn.filter(
            (pawn) => pawn.playerId == createdBy
        );
        creatorPawn.forEach(
            (pawn, indx) => (pawn.gridArea = creatorGrid[indx])
        );
        const secondPawn = existingPawn.filter(
            (pawn) => pawn.playerId == otherPlayer
        );
        secondPawn.forEach((pawn, indx) => (pawn.gridArea = secondGrid[indx]));
        await ctx.db.patch(existingGame!._id, {
            grids: [
                {
                    status: "blocked",
                    gridArea: "a",
                    showButton: false,
                    allowedMove: ["b", "d", "e"],
                },
                {
                    status: "blocked",
                    gridArea: "b",
                    showButton: false,
                    allowedMove: ["a", "c", "e"],
                },
                {
                    status: "blocked",
                    gridArea: "c",
                    showButton: false,
                    allowedMove: ["b", "e", "f"],
                },
                {
                    status: "open",
                    gridArea: "d",
                    showButton: true,
                    allowedMove: ["a", "e", "g"],
                },
                {
                    status: "open",
                    gridArea: "e",
                    showButton: true,
                    allowedMove: ["a", "b", "c", "d", "f", "g", "h", "i"],
                },
                {
                    status: "open",
                    gridArea: "f",
                    showButton: true,
                    allowedMove: ["c", "e", "i"],
                },
                {
                    status: "blocked",
                    gridArea: "g",
                    showButton: false,
                    allowedMove: ["d", "e", "h"],
                },
                {
                    status: "blocked",
                    gridArea: "h",
                    showButton: false,
                    allowedMove: ["e", "g", "i"],
                },
                {
                    status: "blocked",
                    gridArea: "i",
                    showButton: false,
                    allowedMove: ["e", "f", "h"],
                },
            ],
            pawns: [...creatorPawn, ...secondPawn],
            lastPlayer: existingGame?.gameWinner,
            gameWinner: undefined,
            isPlayable: true,
        });
    },
});
export const endGame = mutation({
    args: {
        gameKey: v.string(),
    },
    handler: async (ctx, { gameKey }) => {
        const existingGame = await ctx.db
            .query("games")
            .filter((q) => q.eq(q.field("gameKey"), gameKey))
            .unique();
        await ctx.db.delete(existingGame!._id);
        return "Game Ended";
    },
});
async function checkWinner(ctx: QueryCtx, gameKey: string, playerId: string) {
    const winningCombo = [
        ["a", "e", "i"],
        ["b", "e", "h"],
        ["c", "e", "g"],
        ["d", "e", "f"],
    ];
    const game = await ctx.db
        .query("games")
        .filter((q) => q.eq(q.field("gameKey"), gameKey))
        .unique();
    const { pawns } = game!;
    const filled = pawns
        .filter((pawn) => pawn.playerId == playerId)
        .sort((a, b) => (a.gridArea > b.gridArea ? 1 : -1))
        .reduce((a, b) => a + b.gridArea, "");
    const isWon = winningCombo.some((combo) => combo.join("") == filled);
    return isWon;
}
