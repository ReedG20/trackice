import { GeospatialIndex } from "@convex-dev/geospatial";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const geospatialIndex = new GeospatialIndex<Id<"reports">>(
  components.geospatial
);
