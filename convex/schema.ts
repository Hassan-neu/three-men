import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    games: defineTable({
        grids: v.array(
            v.object({
                allowedMove: v.array(v.string()),
                gridArea: v.string(),
                showButton: v.boolean(),
                status: v.string(),
            })
        ),
        pawns: v.array(
            v.object({
                pawnName: v.string(),
                playerId: v.string(),
                background: v.optional(v.string()),
                gridArea: v.string(),
            })
        ),
        maxPlayer: v.number(),
        createdBy: v.string(),
        otherPlayer: v.optional(v.string()),
        availablePlayers: v.array(v.string()),
        lastPlayer: v.optional(v.string()),
        gameWinner: v.optional(v.string()),
        isPlayable: v.boolean(),
        players: v.array(
            v.object({
                id: v.string(),
                username: v.string(),
                avatar: v.optional(v.string()),
                wins: v.number(),
            })
        ),
    }),
    players: defineTable({
        username: v.string(),
        avatar: v.optional(v.string()),
        wins: v.number(),
    }),
});
