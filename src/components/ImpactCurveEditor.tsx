import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Line, LineChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, Legend, ReferenceDot
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { generateCurvePoints } from '@/lib/curve-utils';
import type { Post, Project } from '@/types/index';
import { useNeynarContext } from '@neynar/react';
import { useToast } from '@/hooks/use-toast';

interface ImpactCurveEditorProps {
  post: Post;
}

interface DraggableDotProps {
  cx: number;
  cy: number;
  pointType: "x" | "y" | "middle";
}

const ImpactCurveEditor: React.FC<ImpactCurveEditorProps> = ({ post }) => {
  const { user } = useNeynarContext();
  const { toast } = useToast();

  const [newProject, setNewProject] = useState<Project>({
    id: post.id,
    title: post.title,
    description: post.description,
    requestedFunding: post.requestedFunding,
    xIntercept: 100,
    yIntercept: 80,
    middlePoint: { x: 60, y: 60 },
    color: "hsl(var(--chart-1))"
  });

  const [activePoint, setActivePoint] = useState<"x" | "y" | "middle" | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ x: number; y: number } | null>(null);
  const [initialValues, setInitialValues] = useState<{
    xIntercept: number;
    yIntercept: number;
    middlePoint: { x: number; y: number };
  } | null>(null);

  const curvePoints = useMemo(
    () => generateCurvePoints(newProject),
    [newProject]
  );

  const getYValueOnCurve = (x: number): number => {
    if (curvePoints.length === 0) return 0;

    const sortedPoints = [...curvePoints].sort(
      (a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)
    );

    const p1 = sortedPoints[0];
    const p2 = sortedPoints[1];

    if (p1.x === x) return p1.y;

    if (p1 && p2) {
      const ratio = (x - p1.x) / (p2.x - p1.x);
      return p1.y + ratio * (p2.y - p1.y);
    }

    return p1.y;
  };

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

      const xScale = (post.requestedFunding / window.innerWidth) * 2;
      const yScale = (100 / window.innerHeight) * 2;

      const scaledDeltaX = Math.round((deltaX * xScale) / 10) * 10;
      const scaledDeltaY = Math.round(-deltaY * yScale);

      setNewProject((prev) => {
        switch (activePoint) {
          case "x": {
            const newXIntercept = Math.max(
              0,
              Math.min(
                initialValues.xIntercept + scaledDeltaX,
                post.requestedFunding
              )
            );
            const wasMiddleMoved = initialCoords.x !== initialValues.middlePoint.x;
            const newMiddleX = wasMiddleMoved
              ? Math.max(
                  0,
                  Math.min(
                    initialValues.middlePoint.x + scaledDeltaX / 2,
                    newXIntercept
                  )
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
                Math.min(initialValues.yIntercept + scaledDeltaY, 100)
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
                    prev.xIntercept
                  )
                ),
                y: Math.max(
                  0,
                  Math.min(initialValues.middlePoint.y + scaledDeltaY, 100)
                ),
              },
            };
          default:
            return prev;
        }
      });
    },
    [activePoint, initialCoords, initialValues, post.requestedFunding]
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
      await axios.post("/api/posts/reply", {
        signerUuid: user.signer_uuid,
        parentHash: post.id,
        curveData: {
          xIntercept: newProject.xIntercept,
          yIntercept: newProject.yIntercept,
          middlePoint: newProject.middlePoint,
        },
      });
      
      toast({
        description: "Curve submitted successfully",
      });
      window.location.reload();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast({
          description: error.response.data.error,
          variant: "destructive",
        });
      } else {
        console.error("Failed to submit curve:", error);
        toast({
          description: "Failed to submit curve",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Curve</CardTitle>
        <CardDescription>
          Evaluate the project based on the details provided. Your curve will be combined 
          with other community member submissions after you submit.
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
                domain={[0, post.requestedFunding]}
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
              <Line
                type="monotone"
                dataKey="y"
                name="Your Curve"
                stroke={newProject.color}
                strokeWidth={2}
                dot={false}
              />
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
                shape={(props) => <DraggableDot {...props} pointType="middle" />}
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
            <Label>Y-intercept</Label>
            <p className="text-xs text-muted-foreground">
              How much impact does the first dollar have on this project?
            </p>
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
            <Label>X-intercept</Label>
            <p className="text-xs text-muted-foreground">
              At what point does the impact go to zero for this project?
            </p>
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
              min={0}
              max={post.requestedFunding}
              step={post.requestedFunding / 1000}
            />
            <p className="text-sm text-muted-foreground">
              Value: ${newProject.xIntercept.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Shape of the curve (X)</Label>
            <p className="text-xs text-muted-foreground">
              How does the impact change from the first dollar impact to the
              last dollar impact?
            </p>
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
              step={post.requestedFunding / 1000}
            />
            <p className="text-sm text-muted-foreground">
              Value: ${newProject.middlePoint.x.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Shape of the curve (Y)</Label>
            <p className="text-xs text-muted-foreground">
              How does the impact change from the first dollar impact to the
              last dollar impact?
            </p>
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
  );
};

export default ImpactCurveEditor;