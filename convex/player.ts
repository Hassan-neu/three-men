// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";
// export const createUser = mutation({
//     args: { username: v.string() },
//     handler: async (ctx, { username }) => {
//         const user = await ctx.db.insert("players", {
//             username,
//             wins: 0,
//         });
//         return user;
//     },
// });
// export const get = query({
//     args: { id: v.optional(v.id("players")) },
//     handler: async (ctx, { id }) => {
//         if (id) return await ctx.db.get(id);
//     },
// });
