import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  reports: defineTable({
    address: v.string(),
    longitude: v.number(),
    latitude: v.number(),
    dateTime: v.string(),
    details: v.optional(v.string()),
    agentCount: v.optional(v.number()),
    vehicleCount: v.optional(v.number()),
    createdAt: v.number(),
  }),
});
