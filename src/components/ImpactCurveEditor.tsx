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

  //handleMouseMove function
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!activePoint || !initialCoords || !initialValues) return;
  
      const deltaX = e.clientX - initialCoords.x;
      const deltaY = e.clientY - initialCoords.y;
      
      // Simple scaling factors for smooth movement
      const xScale = post.requestedFunding / 500;
      const yScale = 0.5;
      
      const scaledDeltaX = deltaX * xScale;
      const scaledDeltaY = -deltaY * yScale;
  
      setNewProject((prev) => {
        switch (activePoint) {
          case "x": {
            // Basic X-intercept bounds
            const newXIntercept = Math.max(
              0,
              Math.min(
                initialValues.xIntercept + scaledDeltaX,
                post.requestedFunding
              )
            );
            
            // Middle X cannot exceed X-intercept
            const newMiddleX = Math.min(
              initialValues.middlePoint.x / initialValues.xIntercept * newXIntercept, 
              newXIntercept
            );
            
            return {
              ...prev,
              xIntercept: newXIntercept,
              middlePoint: {
                x: newMiddleX,
                y: prev.middlePoint.y,
              },
            };
          }
          case "y": {
            // Y-intercept basic bounds
            const newYIntercept = Math.max(
              0,
              Math.min(initialValues.yIntercept + scaledDeltaY, 100)
            );
            
            //Ensure middle point Y doesn't exceed Y-intercept
            return {
              ...prev,
              yIntercept: newYIntercept,
              middlePoint: {
                x: prev.middlePoint.x,
                y: Math.min(prev.middlePoint.y, newYIntercept),
              },
            };
          }
          case "middle": {
            // Calculate potential new middle point values
            const newMiddleX = initialValues.middlePoint.x + scaledDeltaX;
            const newMiddleY = initialValues.middlePoint.y + scaledDeltaY;
            
            // Apply constraints
            return {
              ...prev,
              middlePoint: {
                x: Math.max(0, Math.min(newMiddleX, prev.xIntercept)),
                //Ensure middle Y doesn't exceed Y-intercept
                y: Math.max(0, Math.min(newMiddleY, prev.yIntercept)),
              },
            };
          }
          default:
            return prev;
        }
      });
    },
    [activePoint, initialCoords, initialValues, post.requestedFunding]
  );
  
  //slider inputs
  <Slider
    value={[newProject.middlePoint.y]}
    onValueChange={([value]) =>
      setNewProject({
        ...newProject,
        middlePoint: {
          ...newProject.middlePoint,
          //Ensure slider doesn't set Y higher than Y-intercept
          y: Math.min(value, newProject.yIntercept),
        },
      })
    }
    min={0}
    max={100}
    step={1}
  />

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
  const getYValueAtMiddleX = (project: Project) => {
    // Generate points along the curve
    const curvePoints = generateCurvePoints(project, 1000);
    
    // Find the point on the curve closest to the middlePoint.x coordinate
    const closestPoint = curvePoints.reduce((closest, point) => {
      return Math.abs(point.x - project.middlePoint.x) < Math.abs(closest.x - project.middlePoint.x) 
        ? point 
        : closest;
    }, curvePoints[0]);
    
    // Return the actual Y value at that position
    return Math.round(closestPoint.y * 10) / 10; // Round to 1 decimal place
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
          {/* X-intercept slider */}
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
                  // Also update middle point if necessary
                  middlePoint: {
                    // If middle X now exceeds the new X-intercept, adjust it proportionally
                    x: Math.min(newProject.middlePoint.x, value),
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
          
          {/* Y-intercept slider */}
          <div className="space-y-2">
            <Label>Y-intercept</Label>
            <p className="text-xs text-muted-foreground">
              How much impact does the first dollar have on this project?
            </p>
            <Slider
              value={[newProject.yIntercept]}
              onValueChange={([value]) =>
                setNewProject({
                  ...newProject,
                  yIntercept: value,
                  // Also update middle point if necessary
                  middlePoint: {
                    x: newProject.middlePoint.x,
                    // If middle Y now exceeds the new Y-intercept, adjust it
                    y: Math.min(newProject.middlePoint.y, value),
                  },
                })
              }
              min={0}
              max={100}
              step={1}
            />
            <p className="text-sm text-muted-foreground">
              Value: {newProject.yIntercept}
            </p>
          </div>
          
          {/* Shape of curve (X) slider */}
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
                    x: Math.min(value, newProject.xIntercept),
                    y: newProject.middlePoint.y,
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
          
          {/* Shape of curve (Y) slider */}
          <div className="space-y-2">
            <Label>Shape of the curve (Y)</Label>
            <p className="text-xs text-muted-foreground">
              How does the impact change from the first dollar impact to the last dollar impact?
            </p>
            <Slider
              value={[newProject.middlePoint.y]}
              onValueChange={([value]) =>
                setNewProject({
                  ...newProject,
                  middlePoint: {
                    x: newProject.middlePoint.x,
                    y: Math.min(value, newProject.yIntercept),
                  },
                })
              }
              min={0}
              max={newProject.yIntercept}
              step={1}
            />
            <p className="text-sm text-muted-foreground">
              {/* Show both values for clarity */}
              {/* Control value: {newProject.middlePoint.y} */}
              {/* <br /> */}
              Value: {getYValueAtMiddleX(newProject)}
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