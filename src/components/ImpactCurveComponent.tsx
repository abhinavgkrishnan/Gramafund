import React, { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceDot,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  generateCurvePoints,
  calculateAggregatedCurve,
} from "@/lib/curve-utils";
import { Project } from "@/types/index";
import { useNeynarContext } from "@neynar/react";
import { useToast } from "@/hooks/use-toast";

interface ImpactCurveComponentProps {
  projectId: string;
}

const ImpactCurveComponent: React.FC<ImpactCurveComponentProps> = ({
  projectId,
}) => {
  const fetcher = (url: string) => axios.get(url).then((res) => res.data.post);

  const { data: projectData, error } = useSWR<{ post: Project }>(
    `/api/posts/${projectId}`,
    fetcher,
  );

  const { user } = useNeynarContext();
  const { toast } = useToast();

  const [newProject, setNewProject] = useState<Project>({
    id: String(Date.now()),
    title: "",
    description: "",
    xIntercept: 100000,
    yIntercept: 80,
    middlePoint: { x: 83000, y: 60 },
    color: "hsl(var(--chart-1))",
  });

  // Initialize aggregateCurve from the post's curveSubmissions
  const [aggregateCurve, setAggregateCurve] = useState<Project[]>(
    () =>
      projectData?.post.curveSubmissions?.map((submission) => ({
        ...submission,
        id: String(Date.now()), // Generate an ID for each submission
        title: "",
        description: "",
        color: "hsl(var(--chart-1))",
      })) || [],
  );
  const [activePoint, setActivePoint] = useState<"x" | "y" | "middle" | null>(
    null,
  );
  const [initialCoords, setInitialCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [initialValues, setInitialValues] = useState<{
    xIntercept: number;
    yIntercept: number;
    middlePoint: { x: number; y: number };
  } | null>(null);

  // Update newProject state with fetched project data
  useEffect(() => {
    if (projectData?.post) {
      setNewProject({
        id: projectData.post.id,
        title: projectData.post.title,
        description: projectData.post.description,
        xIntercept: projectData.post.xIntercept,
        yIntercept: projectData.post.yIntercept,
        middlePoint: projectData.post.middlePoint,
        color: projectData.post.color,
      });

      // Update aggregateCurve with curveSubmissions if available
      if (projectData.post.curveSubmissions?.length) {
        setAggregateCurve(
          projectData.post.curveSubmissions.map((submission) => ({
            ...submission,
            id: String(Date.now()),
            title: "",
            description: "",
            color: "hsl(var(--chart-1))",
          })),
        );
      }
    }
  }, [projectData]);

  const curvePoints = useMemo(
    () => (projectData ? generateCurvePoints(newProject) : []),
    [newProject, projectData],
  );

  const aggregatePoints = useMemo(
    () => calculateAggregatedCurve(aggregateCurve),
    [aggregateCurve],
  );

  // Function to calculate Y value for a given X on the curve
  const getYValueOnCurve = (x: number): number => {
    if (curvePoints.length === 0) return 0;

    // Find the two closest points
    const sortedPoints = [...curvePoints].sort(
      (a, b) => Math.abs(a.x - x) - Math.abs(b.x - x),
    );

    const p1 = sortedPoints[0];
    const p2 = sortedPoints[1];

    // If we found an exact match, return it
    if (p1.x === x) return p1.y;

    // Otherwise interpolate between the two closest points
    if (p1 && p2) {
      const ratio = (x - p1.x) / (p2.x - p1.x);
      return p1.y + ratio * (p2.y - p1.y);
    }

    return p1.y;
  };

  // Custom dot component for draggable points
  interface DraggableDotProps {
    cx: number;
    cy: number;
    pointType: "x" | "y" | "middle";
  }

  const DraggableDot: React.FC<DraggableDotProps> = ({ cx, cy, pointType }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setActivePoint(pointType);
      setInitialCoords({ x: e.clientX, y: e.clientY });
      setInitialValues({
        xIntercept: newProject.xIntercept,
        yIntercept: newProject.yIntercept,
        middlePoint: { ...newProject.middlePoint },
      });
    };

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={newProject.color}
        style={{ cursor: pointType === "middle" ? "grab" : "pointer" }}
        onMouseDown={handleMouseDown}
      />
    );
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!activePoint || !initialCoords || !initialValues) return;

      const deltaX = e.clientX - initialCoords.x;
      const deltaY = e.clientY - initialCoords.y;

      // Convert pixel movement to chart values with increased sensitivity
      const xScale = (200000 / window.innerWidth) * 2; // 2x more sensitive
      const yScale = (100 / window.innerHeight) * 2; // 2x more sensitive

      // Round to nearest thousand for x values
      const scaledDeltaX = Math.round((deltaX * xScale) / 1000) * 1000;
      const scaledDeltaY = Math.round(-deltaY * yScale); // Negative because Y axis is inverted

      setNewProject((prev) => {
        switch (activePoint) {
          case "x": {
            const newXIntercept = Math.max(
              0,
              Math.min(initialValues.xIntercept + scaledDeltaX, 200000),
            );
            const wasMiddleMoved =
              initialCoords.x !== initialValues.middlePoint.x;
            const newMiddleX = wasMiddleMoved
              ? Math.max(
                  0,
                  Math.min(
                    initialValues.middlePoint.x + scaledDeltaX / 2,
                    newXIntercept,
                  ),
                )
              : (initialValues.middlePoint.x / initialValues.xIntercept) *
                newXIntercept;

            return {
              ...prev,
              xIntercept: newXIntercept,
              middlePoint: {
                x: newMiddleX,
                y: prev.middlePoint.y,
              },
            };
          }
          case "y":
            return {
              ...prev,
              yIntercept: Math.max(
                0,
                Math.min(initialValues.yIntercept + scaledDeltaY, 100),
              ),
            };
          case "middle":
            return {
              ...prev,
              middlePoint: {
                x: Math.max(
                  0,
                  Math.min(
                    initialValues.middlePoint.x + scaledDeltaX,
                    prev.xIntercept,
                  ),
                ),
                y: Math.max(
                  0,
                  Math.min(initialValues.middlePoint.y + scaledDeltaY, 100),
                ),
              },
            };
          default:
            return prev;
        }
      });
    },
    [activePoint, initialCoords, initialValues],
  );

  const handleMouseUp = useCallback(() => {
    setActivePoint(null);
    setInitialCoords(null);
    setInitialValues(null);
  }, []);

  useEffect(() => {
    if (activePoint) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [activePoint, handleMouseMove, handleMouseUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.signer_uuid) {
      toast({
        description: "Please sign in with Farcaster first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Submit curve data as a special comment
      await axios.post("/api/posts/reply", {
        signerUuid: user.signer_uuid,
        parentHash: projectId,
        curveData: {
          xIntercept: newProject.xIntercept,
          yIntercept: newProject.yIntercept,
          middlePoint: newProject.middlePoint,
        },
      });

      // Optimistically update local state
      setAggregateCurve((prevCurves) => [...prevCurves, newProject]);

      toast({
        description: "Curve submitted successfully",
      });
    } catch (error) {
      console.error("Failed to submit curve:", error);
      toast({
        description: "Failed to submit curve",
        variant: "destructive",
      });
    }
  };

  if (error) {
    console.error("Error fetching project data:", error);
    return <div>Error loading project</div>;
  }

  if (!projectData?.post) {
    return <div>Loading...</div>;
  }

  const project = projectData.post;

  if (!project.id) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Impact Curve</CardTitle>
            <CardDescription>
              Aggregated impact curve for all submitted curves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={curvePoints}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0, 200000]}
                    label={{ value: "Funding ($)", position: "bottom" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Impact Score",
                      angle: -90,
                      position: "left",
                    }}
                  />
                  <Tooltip />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingTop: "35px", fontSize: "14px" }}
                  />
                  {/* Aggregated curve */}
                  <Line
                    type="monotone"
                    data={aggregatePoints}
                    dataKey="y"
                    name="Aggregated Curve"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                  {/* Your curve */}
                  <Line
                    type="monotone"
                    dataKey="y"
                    name="Your Curve"
                    stroke={newProject.color}
                    strokeWidth={2}
                    dot={false}
                  />
                  {/* Draggable points */}
                  <ReferenceDot
                    x={0}
                    y={newProject.yIntercept}
                    r={0}
                    label=""
                    shape={(props) => <DraggableDot {...props} pointType="y" />}
                  />
                  <ReferenceDot
                    x={newProject.middlePoint.x}
                    y={getYValueOnCurve(newProject.middlePoint.x)}
                    r={0}
                    label=""
                    shape={(props) => (
                      <DraggableDot {...props} pointType="middle" />
                    )}
                  />
                  <ReferenceDot
                    x={newProject.xIntercept}
                    y={0}
                    r={0}
                    label=""
                    shape={(props) => <DraggableDot {...props} pointType="x" />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Maximum Impact (Y-Intercept)</Label>
                <Slider
                  value={[newProject.yIntercept]}
                  onValueChange={([value]) =>
                    setNewProject({ ...newProject, yIntercept: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  Value: {newProject.yIntercept}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Required Funding (X-Intercept)</Label>
                <Slider
                  value={[newProject.xIntercept]}
                  onValueChange={([value]) =>
                    setNewProject({
                      ...newProject,
                      xIntercept: value,
                      middlePoint: {
                        x:
                          newProject.middlePoint.x === newProject.xIntercept / 2
                            ? value / 2
                            : newProject.middlePoint.x,
                        y: newProject.middlePoint.y,
                      },
                    })
                  }
                  min={10000}
                  max={200000}
                  step={1000}
                />
                <p className="text-sm text-muted-foreground">
                  Value: ${newProject.xIntercept.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Midpoint X Position</Label>
                <Slider
                  value={[newProject.middlePoint.x]}
                  onValueChange={([value]) =>
                    setNewProject({
                      ...newProject,
                      middlePoint: {
                        ...newProject.middlePoint,
                        x: Math.max(0, Math.min(value, newProject.xIntercept)),
                      },
                    })
                  }
                  min={0}
                  max={newProject.xIntercept}
                  step={1000}
                />
                <p className="text-sm text-muted-foreground">
                  Value: {newProject.middlePoint.x.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Midpoint Y Position</Label>
                <Slider
                  value={[newProject.middlePoint.y]}
                  onValueChange={([value]) =>
                    setNewProject({
                      ...newProject,
                      middlePoint: {
                        ...newProject.middlePoint,
                        y: Math.max(0, Math.min(value, 100)),
                      },
                    })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  Value: {newProject.middlePoint.y}
                </p>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              onClick={handleSubmit}
            >
              Submit Curve
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImpactCurveComponent;
