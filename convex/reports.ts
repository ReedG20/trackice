import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { geospatialIndex } from "./geo";

export const createReport = mutation({
  args: {
    address: v.string(),
    longitude: v.number(),
    latitude: v.number(),
    dateTime: v.string(),
    details: v.optional(v.string()),
    agentCount: v.optional(v.number()),
    vehicleCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Insert the report into the reports table
    const reportId = await ctx.db.insert("reports", {
      address: args.address,
      longitude: args.longitude,
      latitude: args.latitude,
      dateTime: args.dateTime,
      details: args.details,
      agentCount: args.agentCount,
      vehicleCount: args.vehicleCount,
      createdAt: Date.now(),
    });

    // Add to geospatial index
    await geospatialIndex.insert(
      ctx,
      reportId,
      {
        latitude: args.latitude,
        longitude: args.longitude,
      },
      {} // filterKeys - empty for now, can add filtering later
    );

    return reportId;
  },
});

export const getReportsByBounds = query({
  args: {
    west: v.number(),
    south: v.number(),
    east: v.number(),
    north: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { west, south, east, north, limit = 100 } = args;

    // Query the geospatial index for reports within the bounds
    const result = await geospatialIndex.query(ctx, {
      shape: {
        type: "rectangle",
        rectangle: { west, south, east, north },
      },
      limit,
    });

    // Fetch full report data for each result
    const reports = await Promise.all(
      result.results.map(async (item) => {
        const report = await ctx.db.get(item.key);
        if (!report) return null;
        return {
          ...report,
          _id: item.key,
        };
      })
    );

    return reports.filter((r) => r !== null);
  },
});

export const getRecentReports = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 20 } = args;

    const reports = await ctx.db
      .query("reports")
      .order("desc")
      .take(limit);

    return reports;
  },
});
