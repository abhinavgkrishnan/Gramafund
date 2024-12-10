import { PostCard } from "@/components/post-card";

type Post = {
  id: number;
  type: "Project" | "Comment" | "Reaction" | "Funding";
  title: string;
  description: string;
  detail: string;
  author: string;
  date: string;
  karma: number;
  comments: number;
  tags: string[];
};

// Sample post data
const posts: Post[] = [
  {
    id: 1,
    type: "Project",
    title: "AI Alignment Research Initiative",
    description:
      "A collaborative project to develop frameworks for ensuring AI systems remain aligned with human values",
    detail:
      "Our team is working on developing formal verification methods for neural networks to ensure they maintain specified behavioral constraints during training and deployment. We're focusing on three key areas: 1) Value learning from human feedback 2) Robustness to distribution shift 3) Interpretability of decision-making processes. Initial results show promising directions for constraining AI systems while maintaining performance.",
    author: "Sarah Chen",
    date: "2024-01-10",
    karma: 342,
    comments: 56,
    tags: ["AI Safety", "Research", "Technical"],
  },
  {
    id: 2,
    type: "Funding",
    title: "Global Health Intervention Scaling",
    description:
      "Funding proposal to scale proven malaria prevention methods in high-risk regions",
    detail:
      "Seeking $2.5M to expand distribution of long-lasting insecticidal nets (LLINs) in sub-Saharan Africa. Previous pilot showed 60% reduction in malaria cases with $4.30 cost per DALY avoided. Proposal includes: Implementation plan, cost-effectiveness analysis, risk assessment, and monitoring framework. Partnership with local health authorities already established.",
    author: "Michael Okonjo",
    date: "2024-01-09",
    karma: 275,
    comments: 43,
    tags: ["Global Health", "Funding", "Impact"],
  },
  {
    id: 3,
    type: "Project",
    title: "Cost-Effectiveness of Climate Interventions",
    description:
      "Analysis comparing various climate change mitigation strategies based on expected impact per dollar",
    detail:
      "Comparative analysis of 15 climate interventions using updated economic models and latest climate science. Key findings: 1) Industrial heat pumps show highest cost-effectiveness at $5/tCO2e 2) Direct air capture currently at $200/tCO2e but expected to decrease 3) Policy advocacy shows uncertain but potentially very high leverage. Full methodology and data available in attached document.",
    author: "Emma Thompson",
    date: "2024-01-08",
    karma: 198,
    comments: 37,
    tags: ["Climate", "Research", "Analysis"],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
