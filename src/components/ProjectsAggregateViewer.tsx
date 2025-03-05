import React, { useState, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { calculateAggregatedCurve } from '@/lib/curve-utils';
import type { Post, Project, CurvePoint } from '@/types';

// Define type for project curve data
interface ProjectCurve {
  id: string;
  title: string;
  color: string;
  requestedFunding: number;
  points: Array<CurvePoint & {
    originalX?: number;
    projectId?: string;
    projectTitle?: string;
  }>;
}

// Define types for chart data points
interface ChartPoint {
  x: number;
  [key: string]: number | string; // For dynamic project IDs as keys
}

interface ProjectsResponse {
  posts: Post[];
}

interface ProjectDetailsResponse {
  [key: string]: { 
    post: Post;
  } | { 
    error: string;
  };
}

// Pre-calculated curve data cache
interface CurveCache {
  [key: string]: {
    normalizedPoints: Array<CurvePoint & { originalX: number; projectId: string; projectTitle: string }>;
    absolutePoints: Array<CurvePoint & { originalX: number; projectId: string; projectTitle: string }>;
  };
}

const ProjectsAggregateViewer = () => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('date');
  const [normalizeX, setNormalizeX] = useState<boolean>(true);
  const [allProjectsLoaded, setAllProjectsLoaded] = useState<boolean>(false);
  // Store pre-calculated curves for all projects
  const [allCurves, setAllCurves] = useState<CurveCache>({});
  const initializedRef = useRef(false);

  // Color palette for projects - wrapped in useMemo to avoid recreating on every render
  const colors = useMemo(() => [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3, 240 50% 60%))',
    'hsl(var(--chart-4, 180 70% 50%))',
    'hsl(var(--chart-5, 120 60% 50%))',
    'hsl(var(--chart-6, 30 90% 60%))',
    'hsl(var(--chart-7, 280 60% 60%))',
    'hsl(var(--chart-8, 0 70% 60%))'
  ], []);

  // Custom fetcher using native fetch with proper typing
  const fetcher = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  };

  // Fetch all projects list
  const { data: projectsData, error } = useSWR<ProjectsResponse>(
    '/api/posts',
    fetcher
  );

  // Initialize selected projects when data loads
  useEffect(() => {
    if (projectsData?.posts && !initializedRef.current) {
      // Select first 4 projects by default
      const initialProjects = projectsData.posts.slice(0, 4).map(post => post.id);
      setSelectedProjects(initialProjects);
      initializedRef.current = true;
    }
  }, [projectsData]);

  // Sort projects based on the selected sort option
  const sortedProjects = useMemo(() => {
    if (!projectsData?.posts) return [];
    
    return [...projectsData.posts].sort((a, b) => {
      switch (sortOption) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'funding':
          return b.requestedFunding - a.requestedFunding;
        case 'karma':
          return b.karma - a.karma;
        case 'comments':
          return b.comments - a.comments;
        default:
          return 0;
      }
    });
  }, [projectsData, sortOption]);

  // Once we have the project list, fetch ALL detailed data at once
  const { data: allProjectDetails } = useSWR<ProjectDetailsResponse>(
    projectsData?.posts ? '/api/posts/multiple' : null,
    async (url: string) => {
      if (!projectsData?.posts.length) return {};
      
      // Get IDs of all projects
      const allIds = projectsData.posts.map(p => p.id);
      const response = await fetch(`${url}?ids=${allIds.join(',')}`);
      
      if (!response.ok) throw new Error('Failed to fetch project details');
      const data = await response.json();
      setAllProjectsLoaded(true);
      return data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  // Pre-calculate all curve data when project details are loaded
  useEffect(() => {
    if (!allProjectDetails || Object.keys(allCurves).length > 0) return;
    
    const curveCache: CurveCache = {};
    
    // Process all projects
    Object.entries(allProjectDetails).forEach(([projectId, projectResponse], index) => {
      // Skip errors
      if ('error' in projectResponse) return;
      
      const projectData = projectResponse.post;
      let curvePoints: CurvePoint[] = [];

      // If we have curve submissions, use the aggregate of those
      if (projectData.curveSubmissions?.length) {
        // Convert submissions to Project objects for curve-utils
        const projectSubmissions: Project[] = projectData.curveSubmissions.map(submission => ({
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          requestedFunding: projectData.requestedFunding,
          xIntercept: submission.xIntercept,
          yIntercept: submission.yIntercept,
          middlePoint: submission.middlePoint,
          color: colors[index % colors.length]
        }));

        // Use the calculateAggregatedCurve function
        curvePoints = calculateAggregatedCurve(projectSubmissions);
      } else {
        // For projects with no submissions, use zero-value curve
        curvePoints = [
          { x: 0, y: 0 },
          { x: projectData.requestedFunding / 2, y: 0 },
          { x: projectData.requestedFunding, y: 0 }
        ];
      }

      // Pre-calculate both normalized and absolute points
      const normalizedPoints = curvePoints.map(point => ({
        ...point,
        x: (point.x / projectData.requestedFunding) * 100,
        originalX: point.x,
        projectId: projectData.id,
        projectTitle: projectData.title
      }));
      
      const absolutePoints = curvePoints.map(point => ({
        ...point,
        originalX: point.x,
        projectId: projectData.id,
        projectTitle: projectData.title
      }));

      // Store both in cache
      curveCache[projectId] = {
        normalizedPoints,
        absolutePoints
      };
    });
    
    setAllCurves(curveCache);
  }, [allProjectDetails, colors, allCurves]);

  // Get curves for selected projects from the cache
  const selectedProjectCurves = useMemo(() => {
    if (Object.keys(allCurves).length === 0) return [];
    
    const curves: ProjectCurve[] = [];
    
    selectedProjects.forEach((projectId, index) => {
      // Skip if project isn't in cache
      if (!allCurves[projectId]) return;
      
      // Get project from all projects list for metadata
      const project = projectsData?.posts.find(p => p.id === projectId);
      if (!project) return;
      
      // Use pre-calculated points based on normalization setting
      const points = normalizeX 
        ? allCurves[projectId].normalizedPoints
        : allCurves[projectId].absolutePoints;
      
      curves.push({
        id: projectId,
        title: project.title,
        color: colors[index % colors.length],
        requestedFunding: project.requestedFunding,
        points
      });
    });
    
    return curves;
  }, [allCurves, selectedProjects, normalizeX, colors, projectsData?.posts]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!selectedProjectCurves.length) return [];
    
    // If normalizing X, use 0-100 range
    // Otherwise, find the max X value across all projects
    const maxX = normalizeX 
      ? 100 
      : Math.max(...selectedProjectCurves.map(curve => 
          Math.max(...curve.points.map(point => point.x))
        ));
    
    // Create data points for the chart
    const stepSize = maxX / 100;
    const data: ChartPoint[] = [];
    
    for (let x = 0; x <= maxX; x += stepSize) {
      const point: ChartPoint = { x };
      
      selectedProjectCurves.forEach(curve => {
        // Find the closest points for interpolation
        const sortedPoints = [...curve.points].sort(
          (a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)
        );
        
        if (sortedPoints.length >= 2) {
          const p1 = sortedPoints[0];
          const p2 = sortedPoints[1];
          
          // If exact match, use it
          if (p1.x === x) {
            point[curve.id] = p1.y;
          } 
          // Otherwise interpolate
          else if (p1 && p2) {
            const ratio = (x - p1.x) / (p2.x - p1.x);
            // Ensure value never goes below 0
            point[curve.id] = Math.max(0, p1.y + ratio * (p2.y - p1.y));
            
            // If x is beyond the project's requested funding, impact should be 0
            if (!normalizeX && x > curve.requestedFunding) {
              point[curve.id] = 0;
            }
          }
        }
      });
      
      data.push(point);
    }
    
    return data;
  }, [selectedProjectCurves, normalizeX]);

  // Toggle project selection
  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (error) {
    return <div>Error loading projects</div>;
  }

  if (!projectsData) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Projects Impact Curve Comparison</CardTitle>
          <CardDescription>
            Compare the impact curves of different projects to see how funding translates to impact across projects.
            {!allProjectsLoaded && (
              <div className="mt-2 text-sm text-amber-600">
                Loading project details... Selections will be fully responsive once loaded.
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="w-full md:w-1/3">
                <Label htmlFor="sort-select">Sort Projects By</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger id="sort-select">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Most Recent</SelectItem>
                    <SelectItem value="funding">Requested Funding</SelectItem>
                    <SelectItem value="karma">Karma (Likes)</SelectItem>
                    <SelectItem value="comments">Comment Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="normalize" 
                  checked={normalizeX}
                  onCheckedChange={(checked) => setNormalizeX(checked === true)}
                />
                <label
                  htmlFor="normalize"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Normalize X-axis (% of requested funding)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sortedProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="flex items-center space-x-2 p-2 border rounded-md"
                >
                  <Checkbox 
                    id={`project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => toggleProject(project.id)}
                    disabled={!allProjectsLoaded || Object.keys(allCurves).length === 0}
                  />
                  <div className="flex-1 overflow-hidden">
                    <label
                      htmlFor={`project-${project.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span 
                        className="w-3 h-3 inline-block mr-2 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></span>
                      {project.title}
                    </label>
                    <p className="text-xs text-muted-foreground truncate">
                      ${project.requestedFunding.toLocaleString()} · {project.karma} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[500px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    domain={[0, normalizeX ? 100 : 'auto']}
                    label={{ 
                      value: normalizeX ? "Funding (% of requested)" : "Funding ($)", 
                      position: "bottom",
                      offset: 20 
                    }}
                    tickFormatter={(value) => normalizeX ? `${value}%` : `$${value.toLocaleString()}`}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Impact Score",
                      angle: -90,
                      position: "left",
                    }}
                    tickFormatter={(value: number) => Math.round(value).toString()}
                    allowDataOverflow={true}
                    scale="linear"
                    type="number"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const project = selectedProjectCurves.find(p => p.id === name);
                      // Ensure impact score is never negative
                      const impactScore = Math.max(0, value);
                      return [
                        `${impactScore.toFixed(1)}`, 
                        project ? project.title : name
                      ];
                    }}
                    labelFormatter={(label: number) => 
                      normalizeX 
                        ? `Funding: ${label.toFixed(0)}%` 
                        : `Funding: ${label.toLocaleString()}`
                    }
                  />
                  <Legend 
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconSize={8}
                    wrapperStyle={{ 
                      width: '100%',
                      paddingTop: "20px", 
                      fontSize: "11px", 
                      bottom: -80,
                      lineHeight: "14px",
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginBottom: '20px'
                    }}
                    margin={{ top: 20, bottom: 20 }}
                  />
                  
                  {selectedProjectCurves.map((curve) => (
                    <Line
                      key={curve.id}
                      type="monotone"
                      dataKey={curve.id}
                      name={curve.title}
                      stroke={curve.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsAggregateViewer;