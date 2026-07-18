export type VisualCategory = "graph_interpretation" | "geometry_diagram" | "table_reasoning" | "chart_reading" | "infographic" | "scientific_diagram";

export type VisualOverlay = { id: string; label: string; xPercent: number; yPercent: number; description: string };

export type AIImageSpecification = {
  prompt: string;
  negativePrompt: string;
  intendedUse: string;
  source: "ai-generated";
  reviewStatus: "needs-review" | "approved" | "rejected";
  reviewer?: string;
  reviewedAt?: string;
};

export type GeneratedVisualPlan = {
  kind: "image" | "svg" | "table" | "graph-data" | "diagram";
  category: VisualCategory;
  alt: string;
  caption: string;
  aiImageSpecification?: AIImageSpecification;
};

export type ImageVisual = GeneratedVisualPlan & { kind: "image"; src: string; width: number; height: number; overlays?: VisualOverlay[] };
export type TableVisual = GeneratedVisualPlan & { kind: "table"; columns: string[]; rows: string[][] };
export type GraphPoint = { x: number; y: number; label?: string };
export type GraphSeries = { id: string; label: string; style: "line" | "parabola" | "scatter" | "bar"; points: GraphPoint[] };
export type GraphDataVisual = GeneratedVisualPlan & { kind: "graph-data"; xLabel: string; yLabel: string; xDomain: [number, number]; yDomain: [number, number]; series: GraphSeries[] };
export type DiagramVisual = GeneratedVisualPlan & { kind: "diagram"; diagram: "circle-tangent" | "similar-triangles" | "floor-plan" | "experiment"; labels: Record<string, string> };
/** Raw SVG is intentionally not rendered: it is retained only as a reviewable plan. */
export type SvgVisual = GeneratedVisualPlan & { kind: "svg"; safeDescription: string };
export type QuestionVisual = ImageVisual | TableVisual | GraphDataVisual | DiagramVisual | SvgVisual;
