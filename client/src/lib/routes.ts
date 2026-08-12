export type AppAudience = "public" | "learner" | "admin";
export type AppNavGroup = "primary" | "secondary" | "management";

export type AppRouteId =
  | "home"
  | "about"
  | "booking"
  | "today"
  | "learn"
  | "practice"
  | "review"
  | "progress"
  | "plan"
  | "resources"
  | "adminOverview"
  | "adminContent"
  | "adminImport"
  | "adminTaxonomy"
  | "adminFlags"
  | "adminAnalytics";

export interface AppRouteDefinition {
  id: AppRouteId;
  label: string;
  path: string;
  audience: AppAudience;
  navGroup: AppNavGroup;
  description: string;
  aliases?: readonly string[];
  showInNav?: boolean;
  end?: boolean;
}

export const APP_ROUTES: readonly AppRouteDefinition[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    audience: "public",
    navGroup: "primary",
    description: "Choose an LSAT learning path and enter the study workspace.",
    showInNav: true,
    end: true,
  },
  {
    id: "about",
    label: "About",
    path: "/about",
    audience: "public",
    navGroup: "primary",
    description: "Learn about Devaney's instructional approach and LSAT expertise.",
    showInNav: true,
  },
  {
    id: "booking",
    label: "Book a session",
    path: "/booking",
    audience: "public",
    navGroup: "secondary",
    description: "Schedule an individual LSAT tutoring session.",
    showInNav: true,
  },
  {
    id: "today",
    label: "Today",
    path: "/today",
    aliases: ["/dashboard"],
    audience: "learner",
    navGroup: "primary",
    description: "Continue with the single highest-priority learning action.",
    showInNav: true,
  },
  {
    id: "learn",
    label: "Learn",
    path: "/learn",
    aliases: ["/lessons"],
    audience: "learner",
    navGroup: "primary",
    description: "Study LSAT concepts through sequenced lessons and prerequisites.",
    showInNav: true,
  },
  {
    id: "practice",
    label: "Practice",
    path: "/practice",
    aliases: ["/question-bank"],
    audience: "learner",
    navGroup: "primary",
    description: "Find questions and complete evidence-producing practice.",
    showInNav: true,
  },
  {
    id: "review",
    label: "Review",
    path: "/review",
    audience: "learner",
    navGroup: "primary",
    description: "Return to due questions and reflect on prior mistakes.",
    showInNav: true,
  },
  {
    id: "progress",
    label: "Progress",
    path: "/progress",
    audience: "learner",
    navGroup: "primary",
    description: "Inspect observed practice evidence without unsupported score claims.",
    showInNav: true,
  },
  {
    id: "plan",
    label: "Plan",
    path: "/plan",
    aliases: ["/lesson-plan-generator", "/session-plan-generator"],
    audience: "learner",
    navGroup: "primary",
    description: "Create and maintain an editable weekly study plan.",
    showInNav: true,
  },
  {
    id: "resources",
    label: "Resources",
    path: "/resources",
    aliases: ["/study-guide"],
    audience: "learner",
    navGroup: "secondary",
    description: "Open supporting study references and guides.",
    showInNav: true,
  },
  {
    id: "adminOverview",
    label: "Overview",
    path: "/admin",
    audience: "admin",
    navGroup: "management",
    description: "Review administrative workflows and system readiness.",
    showInNav: true,
    end: true,
  },
  {
    id: "adminContent",
    label: "Content",
    path: "/admin/content",
    aliases: ["/curriculum"],
    audience: "admin",
    navGroup: "management",
    description: "Review curriculum and question-content readiness.",
    showInNav: true,
    end: true,
  },
  {
    id: "adminImport",
    label: "Import",
    path: "/admin/content/import",
    aliases: ["/import"],
    audience: "admin",
    navGroup: "management",
    description: "Validate content imports before a durable commit.",
    showInNav: true,
  },
  {
    id: "adminTaxonomy",
    label: "Taxonomy",
    path: "/admin/taxonomy",
    aliases: ["/tag-manager"],
    audience: "admin",
    navGroup: "management",
    description: "Manage question tags and curriculum classifications.",
    showInNav: true,
  },
  {
    id: "adminFlags",
    label: "Feature flags",
    path: "/admin/flags",
    audience: "admin",
    navGroup: "management",
    description: "Control staged feature availability and rollout percentages.",
    showInNav: true,
  },
  {
    id: "adminAnalytics",
    label: "Analytics",
    path: "/admin/analytics",
    audience: "admin",
    navGroup: "management",
    description: "Inspect privacy-bounded aggregate product analytics.",
    showInNav: true,
  },
];

export type RegisteredAppRoute = (typeof APP_ROUTES)[number];

export const ROUTE_BY_ID = Object.fromEntries(
  APP_ROUTES.map((route) => [route.id, route])
) as Record<AppRouteId, RegisteredAppRoute>;

export const PUBLIC_NAV_ROUTES = APP_ROUTES.filter(
  (route) => route.audience === "public" && route.showInNav
);

export const LEARNER_NAV_ROUTES = APP_ROUTES.filter(
  (route) => route.audience === "learner" && route.showInNav
);

export const ADMIN_NAV_ROUTES = APP_ROUTES.filter(
  (route) => route.audience === "admin" && route.showInNav
);

export function normalizePath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

function pathMatches(candidate: string, route: AppRouteDefinition): boolean {
  const normalizedCandidate = normalizePath(candidate);
  const normalizedRoute = normalizePath(route.path);

  if (route.end || normalizedRoute === "/") {
    return normalizedCandidate === normalizedRoute;
  }

  return (
    normalizedCandidate === normalizedRoute ||
    normalizedCandidate.startsWith(`${normalizedRoute}/`)
  );
}

export function resolveAppRoute(path: string): RegisteredAppRoute | undefined {
  const normalizedPath = normalizePath(path);

  const exactCanonical = APP_ROUTES.find(
    (route) => normalizePath(route.path) === normalizedPath
  );
  if (exactCanonical) return exactCanonical;

  const aliasMatches = APP_ROUTES.flatMap((route) =>
    (route.aliases ?? []).flatMap((candidate) => {
      const normalizedAlias = normalizePath(candidate);
      const matches =
        normalizedPath === normalizedAlias ||
        normalizedPath.startsWith(`${normalizedAlias}/`);
      return matches ? [{ route, aliasLength: normalizedAlias.length }] : [];
    })
  ).sort((left, right) => right.aliasLength - left.aliasLength);
  if (aliasMatches[0]) return aliasMatches[0].route;

  return APP_ROUTES
    .filter((route) => pathMatches(normalizedPath, route))
    .sort((left, right) => right.path.length - left.path.length)[0];
}

export function canonicalizeAppPath(path: string): string {
  const route = resolveAppRoute(path);
  const suffixIndex = path.search(/[?#]/);
  const suffix = suffixIndex >= 0 ? path.slice(suffixIndex) : "";
  const normalizedPath = normalizePath(path);
  if (!route) return `${normalizedPath}${suffix}`;

  const alias = route.aliases?.find((candidate) =>
    normalizedPath === normalizePath(candidate) ||
    normalizedPath.startsWith(`${normalizePath(candidate)}/`)
  );

  if (!alias) return `${normalizedPath}${suffix}`;
  return `${route.path}${normalizedPath.slice(normalizePath(alias).length)}${suffix}`;
}

export type RouteAccessDecision = "allow" | "sign-in" | "forbidden";

export function getRouteAccessDecision(
  audience: AppAudience,
  userRole: "admin" | "user" | null | undefined
): RouteAccessDecision {
  if (audience === "public") return "allow";
  if (!userRole) return "sign-in";
  if (audience === "admin" && userRole !== "admin") return "forbidden";
  return "allow";
}
