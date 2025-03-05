"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProjectsAggregateViewer from "@/components/ProjectsAggregateViewer";

export default function ProjectsComparisonPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to all projects
            </Button>
          </Link>
        </div>

        <ProjectsAggregateViewer />

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-2">About Impact Curves</h2>
          <p className="text-muted-foreground mb-4">
            Impact curves show how different projects deliver value per dollar
            of funding. The curve represents the marginal impact of each
            additional dollar, with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Y-intercept:</strong> The immediate impact of the first
              dollar invested
            </li>
            <li>
              <strong>Curve shape:</strong> How quickly diminishing returns set
              in
            </li>
            <li>
              <strong>X-intercept:</strong> The point at which additional
              funding no longer produces impact
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Comparing curves across projects helps identify which initiatives
            deliver the most value for different funding levels, and where
            community resources might be best allocated.
          </p>
        </div>
      </div>
    </div>
  );
}
