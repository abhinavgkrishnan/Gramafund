import { CurvePoint, Project } from "@/types";

export function generateCurvePoints(
  project: Project,
  numPoints: number = 10000,
): CurvePoint[] {
  const { xIntercept, yIntercept, middlePoint } = project;
  const points: CurvePoint[] = [];

  // Precompute coefficients for the quadratic Bézier curve
  const P0 = { x: 0, y: yIntercept }; // Start point
  const P1 = { x: middlePoint.x, y: middlePoint.y }; // Control point
  const P2 = { x: xIntercept, y: 0 }; // End point

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Quadratic Bézier formula
    const x = (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x;
    const y = (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y;

    points.push({ x, y });
  }

  // Ensure the last point is exactly (xIntercept, 0)
  points[points.length - 1] = { x: xIntercept, y: 0 };

  return points;
}

export function calculateAggregatedCurve(
  userSubmissions: Project[],
): CurvePoint[] {
  if (userSubmissions.length === 0) return [];

  // Find the maximum x-intercept among all user submissions
  const maxValidX = Math.max(...userSubmissions.map((p) => p.xIntercept));
  const stepSize = Math.min(500, maxValidX / 400); // Higher resolution sampling

  const aggregatedPoints: CurvePoint[] = [];

  for (let x = 0; x <= maxValidX; x += stepSize) {
    const yValues: number[] = [];
    const weights: number[] = [];

    userSubmissions.forEach((submission) => {
      const curvePoints = generateCurvePoints(submission);

      // Find the nearest points for interpolation
      const lowerPoint = curvePoints.reduce((prev, curr) =>
        curr.x <= x && curr.x > prev.x ? curr : prev,
      );
      const upperPoint = curvePoints.reduce((prev, curr) =>
        curr.x > x && curr.x < prev.x ? curr : prev,
      );

      // Perform linear interpolation
      if (lowerPoint && upperPoint && lowerPoint.x !== upperPoint.x) {
        const ratio = (x - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
        const interpolatedY =
          lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y);
        yValues.push(interpolatedY);

        // Weight based on the distance between the points (closer points get higher weight)
        const distance = upperPoint.x - lowerPoint.x;
        weights.push(1 / distance);
      }
    });

    // Filter out invalid y-values
    const validYValues = yValues.filter((v) => v !== null && isFinite(v));
    if (validYValues.length < userSubmissions.length / 3) continue; // Ignore low-data points

    // Calculate weighted average
    let weightedSum = 0;
    let weightSum = 0;
    validYValues.forEach((y, index) => {
      weightedSum += y * weights[index];
      weightSum += weights[index];
    });
    let avgY = weightedSum / weightSum;

    // Apply Gaussian smoothing (optional)
    if (aggregatedPoints.length > 2) {
      const prev1 = aggregatedPoints[aggregatedPoints.length - 1].y;
      const prev2 = aggregatedPoints[aggregatedPoints.length - 2].y;
      avgY = (prev2 + prev1 + avgY) / 3; // Simple moving average
    }

    // Clamp the value to a reasonable range (e.g., 0 to 100)
    avgY = Math.max(0, Math.min(avgY, 100));

    // Add the point to the aggregated curve
    aggregatedPoints.push({ x, y: avgY });
  }

  console.log("=== Final Aggregated User Curve ===");
  console.table(aggregatedPoints);
  return aggregatedPoints;
}
