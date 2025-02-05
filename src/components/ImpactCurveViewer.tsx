import React, { useMemo } from 'react';
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
import { generateCurvePoints, calculateAggregatedCurve } from '@/lib/curve-utils';
import type { Post } from '@/types/index';

interface CurveSubmission {
  xIntercept: number;
  yIntercept: number;
  middlePoint: {
    x: number;
    y: number;
  };
}

interface ImpactCurveViewerProps {
  post: Post;
  userSubmission: CurveSubmission;
  curveSubmissions: CurveSubmission[];
}

const ImpactCurveViewer: React.FC<ImpactCurveViewerProps> = ({
  post,
  userSubmission,
  curveSubmissions,
}) => {
  const userCurvePoints = useMemo(() => 
    generateCurvePoints({
      id: post.id,
      title: post.title,
      description: post.description,
      requestedFunding: post.requestedFunding,
      ...userSubmission,
      color: "hsl(var(--chart-1))",
    }),
    [post, userSubmission]
  );

  const aggregatePoints = useMemo(() => 
    calculateAggregatedCurve(curveSubmissions.map(submission => ({
      id: post.id,
      title: post.title,
      description: post.description,
      requestedFunding: post.requestedFunding,
      ...submission,
      color: "hsl(var(--chart-1))",
    }))),
    [curveSubmissions, post]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Curve Analysis</CardTitle>
        <CardDescription>
          Your curve (orange) compared with the aggregated community assessment (blue). 
          The community curve represents the average evaluation from all submissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}`, 'Impact Score']}
                labelFormatter={(label: number) => `Funding: $${label.toLocaleString()}`}
              />
              <Legend 
                verticalAlign="top"
                align="center"
                wrapperStyle={{ paddingTop: "35px", fontSize: "14px" }}
              />
              <Line
                type="monotone"
                data={userCurvePoints}
                dataKey="y"
                name="Your Assessment"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                data={aggregatePoints}
                dataKey="y"
                name="Community Average"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total submissions: {curveSubmissions.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactCurveViewer;