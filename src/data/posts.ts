export type Post = {
  id: number
  type: "Project" | "Comment" | "Reaction" | "Funding"
  title: string
  description: string
  detail: string
  author: string
  date: string
  karma: number
  comments: number
  tags: string[]
}

export const posts: Post[] = [
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
  {
      id: 4,
      type: "Project",
      title: "Mental Health Support Network for EAs",
      description:
        "Building a support network and resources specifically tailored for effective altruists dealing with burnout and anxiety",
      detail:
        "Creating a comprehensive mental health platform that includes: 1) Peer support groups 2) Connection to EA-aligned therapists 3) Burnout prevention resources 4) Work-life balance workshops. Initial pilot with 50 participants showed significant improvement in well-being metrics.",
      author: "David Kumar",
      date: "2024-01-07",
      karma: 156,
      comments: 28,
      tags: ["Mental Health", "Community", "Wellbeing"],
    },
    {
      id: 5,
      type: "Funding",
      title: "Factory Farming Investigation Unit",
      description:
        "Expanding undercover investigation capabilities to document and expose factory farming practices",
      detail:
        "Looking to raise $800K for a dedicated investigation unit focusing on industrial animal agriculture. Funds will cover: Equipment, training, legal support, and media outreach. Previous investigations led to policy changes in 3 states.",
      author: "Rachel Martinez",
      date: "2024-01-06",
      karma: 289,
      comments: 45,
      tags: ["Animal Welfare", "Investigation", "Advocacy"],
    },
    {
      id: 6,
      type: "Funding",
      title: "Biosecurity Risk Assessment Framework",
      description:
        "Developing a standardized framework for evaluating and prioritizing biological risks",
      detail:
        "Creating an open-source risk assessment tool that combines: 1) Historical data analysis 2) Expert elicitation 3) Scenario modeling 4) Cost-benefit analysis of interventions. Aimed at helping organizations allocate resources more effectively.",
      author: "James Wilson",
      date: "2024-01-05",
      karma: 312,
      comments: 67,
      tags: ["Biosecurity", "Research", "Risk Assessment"],
    },
    {
      id: 7,
      type: "Project",
      title: "Education Access in Rural India",
      description:
        "Implementing low-cost tablet-based learning programs in underserved rural communities",
      detail:
        "Expanding successful pilot program that showed 40% improvement in learning outcomes. Project includes: Solar-powered tablets, offline-first educational content, teacher training, and impact measurement system.",
      author: "Priya Patel",
      date: "2024-01-04",
      karma: 245,
      comments: 39,
      tags: ["Education", "Technology", "Development"],
    },
    {
      id: 8,
      type: "Funding",
      title: "Clean Cooking Initiative Scale-up",
      description:
        "Expanding distribution of clean cookstoves to reduce indoor air pollution and deforestation",
      detail:
        "Seeking $1.2M to scale successful pilot in East Africa. Project has shown 70% reduction in fuel use and significant health improvements. Includes manufacturing partnerships, distribution network, and carbon credit program.",
      author: "Thomas Nyongo",
      date: "2024-01-03",
      karma: 198,
      comments: 31,
      tags: ["Environment", "Health", "Development"],
    },
    {
      id: 9,
      type: "Reaction",
      title: "Long-term Value Accounting Methods",
      description:
        "Research project to develop better frameworks for measuring long-term impact of interventions",
      detail:
        "Developing new methodologies for accounting for long-term effects, including: Temporal uncertainty, flow-through effects, and value drift. Collaboration with economists and philosophers to create practical evaluation tools.",
      author: "Lisa Chen",
      date: "2024-01-02",
      karma: 267,
      comments: 52,
      tags: ["Methodology", "Research", "Impact Measurement"],
    },
    {
      id: 10,
      type: "Project",
      title: "Alternative Protein Research Hub",
      description:
        "Creating an open-source database and collaboration platform for alternative protein research",
      detail:
        "Building a comprehensive platform to accelerate alternative protein development through: 1) Shared research databases 2) Collaboration tools 3) Publishing platform 4) Funding connection portal. Focus on cellular agriculture and plant-based innovations.",
      author: "Mark Stevens",
      date: "2024-01-01",
      karma: 334,
      comments: 48,
      tags: ["Food Systems", "Research", "Innovation"],
    },
];