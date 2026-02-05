import type { UserRole, UserGroup } from "./types"

export interface RoleConfig {
  role: UserRole
  label: string
  seniority: "ELT" | "Manager" | "IC"
  team: UserGroup
  keyDecisions: string[]
  defaultGoals: string[]
  defaultOutcomes: string[]
}

export function getSeniorityFromRole(role: UserRole): "ELT" | "Manager" | "IC" {
  const config = roleConfigurations[role]
  return config.seniority
}

export const roleConfigurations: Record<UserRole, RoleConfig> = {
  ceo: {
    role: "ceo",
    label: "CEO",
    seniority: "ELT",
    team: "product",
    keyDecisions: ["Company strategy", "Investment allocation", "Resource prioritization"],
    defaultGoals: [
      "drive revenue growth",
      "improve margins",
      "optimize burn rate",
      "improve GTM efficiency",
      "increase retention",
    ],
    defaultOutcomes: ["we achieve sustainable growth", "we maximize shareholder value", "we stay ahead of competition"],
  },
  cto: {
    role: "cto",
    label: "CTO",
    seniority: "ELT",
    team: "engineering",
    keyDecisions: ["Tech strategy", "Architecture decisions", "Engineering resourcing"],
    defaultGoals: [
      "improve system reliability",
      "increase deployment frequency",
      "reduce incident rate",
      "improve engineering velocity",
    ],
    defaultOutcomes: ["we build scalable infrastructure", "we deliver features faster", "we maintain high quality"],
  },
  cpo: {
    role: "cpo",
    label: "CPO",
    seniority: "ELT",
    team: "product",
    keyDecisions: ["Product portfolio priorities", "Resource allocation", "Roadmap direction"],
    defaultGoals: ["improve retention", "increase activation", "drive adoption", "improve NPS", "maximize ARR impact"],
    defaultOutcomes: ["we maximize ARR impact", "we achieve product-market fit", "we delight customers"],
  },
  "product-manager": {
    role: "product-manager",
    label: "Product Manager",
    seniority: "Manager",
    team: "product",
    keyDecisions: ["What to build next", "Roadmap priorities", "Feature specifications"],
    defaultGoals: ["improve retention", "increase engagement", "optimize adoption funnels", "improve CSAT"],
    defaultOutcomes: ["we solve customer problems", "we drive product growth", "we improve user satisfaction"],
  },
  "engineering-manager": {
    role: "engineering-manager",
    label: "Engineering Manager",
    seniority: "Manager",
    team: "engineering",
    keyDecisions: ["Sprint capacity planning", "Work prioritization", "Team development"],
    defaultGoals: ["increase velocity", "reduce cycle time", "minimize bug counts", "reduce on-call load"],
    defaultOutcomes: ["we deliver on time", "we maintain code quality", "we support team growth"],
  },
  "design-lead": {
    role: "design-lead",
    label: "Design Lead / UX Manager",
    seniority: "Manager",
    team: "design",
    keyDecisions: ["UX direction", "Problem prioritization", "Design standards"],
    defaultGoals: ["improve task completion", "increase usability scores", "reduce drop-off rate"],
    defaultOutcomes: ["we create delightful experiences", "we solve user problems", "we maintain design consistency"],
  },
  "sales-manager": {
    role: "sales-manager",
    label: "Sales Manager",
    seniority: "Manager",
    team: "sales",
    keyDecisions: ["Pipeline management", "Deal coaching", "Forecasting"],
    defaultGoals: ["improve pipeline coverage", "increase win rate", "improve quota attainment"],
    defaultOutcomes: ["we hit revenue targets", "we close more deals", "we grow revenue predictably"],
  },
  "marketing-manager": {
    role: "marketing-manager",
    label: "Marketing Manager",
    seniority: "Manager",
    team: "marketing",
    keyDecisions: ["Campaign mix", "Content calendar", "Budget allocation"],
    defaultGoals: ["reduce CAC", "improve ROAS", "increase MQL volume", "improve traffic", "increase conversion rate"],
    defaultOutcomes: ["we generate quality leads", "we maximize marketing ROI", "we build brand awareness"],
  },
  "customer-success-manager": {
    role: "customer-success-manager",
    label: "Customer Success Manager",
    seniority: "Manager",
    team: "customer-success",
    keyDecisions: ["Account health actions", "Renewal strategy", "Escalation handling"],
    defaultGoals: ["improve NPS", "increase health scores", "reduce support volume", "improve usage frequency"],
    defaultOutcomes: ["we retain customers", "we expand accounts", "we drive customer satisfaction"],
  },
  "finance-manager": {
    role: "finance-manager",
    label: "Finance Manager",
    seniority: "Manager",
    team: "finance",
    keyDecisions: ["Budgeting", "Forecasting", "Cost control"],
    defaultGoals: ["reduce burn rate", "extend runway", "improve margins", "increase forecast accuracy"],
    defaultOutcomes: ["we maintain financial health", "we extend runway", "we allocate resources effectively"],
  },
  "delivery-manager": {
    role: "delivery-manager",
    label: "Delivery Manager",
    seniority: "Manager",
    team: "delivery",
    keyDecisions: ["Work sequencing", "Blocker removal", "Delivery risk management"],
    defaultGoals: [
      "improve sprint velocity",
      "reduce cycle time",
      "reduce WIP",
      "improve burndown",
      "track dependency status",
    ],
    defaultOutcomes: ["we deliver predictably", "we remove blockers", "we manage risks effectively"],
  },
  "product-analyst": {
    role: "product-analyst",
    label: "Product Analyst",
    seniority: "IC",
    team: "product",
    keyDecisions: ["Insights generation", "Reporting", "Experimentation"],
    defaultGoals: ["improve retention insights", "analyze cohorts", "optimize funnel metrics"],
    defaultOutcomes: ["we make data-driven decisions", "we uncover insights", "we validate hypotheses"],
  },
  "product-designer": {
    role: "product-designer",
    label: "Product Designer",
    seniority: "IC",
    team: "design",
    keyDecisions: ["UX/UI decisions", "Feature flows", "Interaction patterns"],
    defaultGoals: [
      "improve usability scores",
      "reduce drop-off points",
      "increase task completion rate",
      "analyze heatmaps",
    ],
    defaultOutcomes: ["we create intuitive interfaces", "we solve user problems", "we maintain design quality"],
  },
  "data-analyst": {
    role: "data-analyst",
    label: "Data Analyst",
    seniority: "IC",
    team: "product",
    keyDecisions: ["Build dashboards", "Answer ad-hoc questions", "Data accuracy"],
    defaultGoals: ["improve accuracy of inputs", "increase statistical confidence", "build better dashboards"],
    defaultOutcomes: ["we make informed decisions", "we trust our data", "we answer business questions"],
  },
  "data-scientist": {
    role: "data-scientist",
    label: "Data Scientist",
    seniority: "IC",
    team: "product",
    keyDecisions: ["Models", "Predictions", "Segmentation"],
    defaultGoals: ["improve model accuracy", "reduce MSE", "increase prediction lift"],
    defaultOutcomes: ["we predict customer behavior", "we optimize outcomes", "we segment effectively"],
  },
  "ux-researcher": {
    role: "ux-researcher",
    label: "UX Researcher",
    seniority: "IC",
    team: "design",
    keyDecisions: ["Validate problems", "Validate solutions", "Research methods"],
    defaultGoals: ["improve SUS score", "identify thematic patterns", "reduce time-to-task"],
    defaultOutcomes: ["we understand user needs", "we validate designs", "we reduce friction"],
  },
  "sales-rep": {
    role: "sales-rep",
    label: "Sales Rep / AE",
    seniority: "IC",
    team: "sales",
    keyDecisions: ["Which deals to prioritize", "Which motions to use", "Deal strategy"],
    defaultGoals: ["improve deal score", "track intent signals", "increase activity response"],
    defaultOutcomes: ["we close more deals", "we prioritize effectively", "we engage prospects"],
  },
}

export function getRoleConfig(role: UserRole): RoleConfig {
  return roleConfigurations[role]
}

export function getRolesByTeam(team: UserGroup): RoleConfig[] {
  return Object.values(roleConfigurations).filter((config) => config.team === team)
}

export function getRolesBySeniority(seniority: "ELT" | "Manager" | "IC"): RoleConfig[] {
  return Object.values(roleConfigurations).filter((config) => config.seniority === seniority)
}
