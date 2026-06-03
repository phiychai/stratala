import {
  bulletListNode,
  numberListNode,
  paragraphNode,
  richText,
  richTextFromNodes,
} from './lexical'

import type { SeedPost } from './types'

const day = 24 * 60 * 60 * 1000
const now = Date.now()
const isoDaysAgo = (daysAgo: number) => new Date(now - daysAgo * day).toISOString()

export const seededPosts: SeedPost[] = [
  {
    title: 'Incident Postmortems That Actually Change Team Behavior',
    slug: 'incident-postmortems-that-change-team-behavior',
    description: 'A practical framework for turning incidents into measurable reliability gains.',
    content: richText(
      'Strong postmortems focus on system conditions, not individual mistakes.',
      'Track a small set of corrective actions with explicit owners and deadlines to avoid drift.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(3),
  },
  {
    title: 'Feature Flags in Multi-Tenant SaaS Without Configuration Debt',
    slug: 'feature-flags-in-multi-tenant-saas-without-debt',
    description:
      'How to structure flags by audience and lifecycle so stale toggles do not accumulate.',
    content: richText(
      'Feature flags are a release mechanism, not a permanent architecture layer.',
      'Add expiry dates and ownership metadata for every long-lived flag.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(6),
  },
  {
    title: 'Designing API Error Contracts for Faster Frontend Debugging',
    slug: 'designing-api-error-contracts-for-faster-debugging',
    description: 'Error responses that improve operator visibility and reduce support round-trips.',
    content: richText(
      'Provide a machine-readable error code and a human-readable remediation hint.',
      'Keep validation, auth, and dependency failures distinguishable in both logs and payloads.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(9),
  },
  {
    title: 'Production Readiness Checklist for New Background Workers',
    slug: 'production-readiness-checklist-background-workers',
    description:
      'Queue visibility, retries, and idempotency checks before your first high-volume run.',
    content: richText(
      'Workers should be idempotent by default and safe to replay.',
      'Treat queue metrics and dead-letter handling as first-class release criteria.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(12),
  },
  {
    title: 'Schema Evolution in Event-Driven Systems',
    slug: 'schema-evolution-in-event-driven-systems',
    description: 'Versioning approaches that preserve compatibility across independent consumers.',
    content: richText(
      'Backward-compatible event changes keep producers and consumers deployable independently.',
      'Add contract tests that replay captured events against newer consumers.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(16),
  },
  {
    title: 'An Opinionated CI Pipeline for TypeScript Monorepos',
    slug: 'opinionated-ci-pipeline-for-typescript-monorepos',
    description: 'A staged pipeline that balances speed, determinism, and actionable feedback.',
    content: richText(
      'Split checks into fast gating jobs and slower non-blocking confidence jobs.',
      'Cache dependency stores and build artifacts with clear invalidation boundaries.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(20),
  },
  {
    title: 'Writing Better Internal Docs for High-Change Systems',
    slug: 'writing-better-internal-docs-for-high-change-systems',
    description: 'Documentation patterns that stay relevant after rapid iteration cycles.',
    content: richText(
      'Optimize docs for decision context and operating constraints, not just setup steps.',
      'Every document should have an owner and a review cadence.',
    ),
    status: 'draft',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(25),
  },
  {
    title: 'Pragmatic Database Indexing for Product Teams',
    slug: 'pragmatic-database-indexing-for-product-teams',
    description: 'When to add indexes, when to remove them, and how to verify impact safely.',
    content: richText(
      'Indexing decisions should start from query patterns, cardinality, and write pressure.',
      'Track index usage so cleanup work is data-driven rather than speculative.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(28),
  },
  {
    title: 'Observability Baseline for Teams Shipping Weekly',
    slug: 'observability-baseline-for-teams-shipping-weekly',
    description: 'A minimum viable telemetry model for confident and frequent releases.',
    content: richText(
      'Instrument business journeys, not only technical endpoints.',
      'Alert on symptoms users feel first, then map to likely causes.',
    ),
    status: 'draft',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(33),
  },
  {
    title: 'Reliable Bulk Imports with Idempotent Keys',
    slug: 'reliable-bulk-imports-with-idempotent-keys',
    description: 'Prevent duplicate records and partial corruption during large ingest jobs.',
    content: richText(
      'Use deterministic natural keys and record-level upsert behavior.',
      'Emit a reconciliation report listing created, updated, skipped, and failed rows.',
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(40),
  },
  {
    title: 'Running Cost Reviews Without Slowing Delivery Teams',
    slug: 'running-cost-reviews-without-slowing-delivery-teams',
    description:
      'A lightweight operating cadence for cloud cost accountability and faster tradeoff decisions.',
    content: richTextFromNodes(
      paragraphNode(
        'Cost reviews work best when they are short, recurring, and tied to service-level ownership.',
      ),
      numberListNode(
        'Review top spend deltas since the last release window.',
        'Decide which optimizations are immediate vs backlog.',
        'Capture one measurable cost action per team.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(45),
  },
  {
    title: 'Release Trains vs Continuous Delivery in B2B Platforms',
    slug: 'release-trains-vs-continuous-delivery-b2b-platforms',
    description:
      'How to choose a release model based on customer coordination and platform coupling.',
    content: richTextFromNodes(
      paragraphNode(
        'Both release trains and continuous delivery can be effective, depending on constraints.',
      ),
      bulletListNode(
        'Use release trains when customers require predictable communication windows.',
        'Prefer continuous delivery when architecture supports independent deployability.',
        'Mix models by product area to avoid one-size-fits-all policy.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(49),
  },
  {
    title: 'Turning Support Tickets Into Product Discovery Inputs',
    slug: 'turning-support-tickets-into-product-discovery-inputs',
    description:
      'A repeatable method for converting recurring support pain into roadmap direction.',
    content: richTextFromNodes(
      paragraphNode(
        'Support signals should influence product strategy before churn metrics react.',
      ),
      numberListNode(
        'Tag tickets by friction pattern and customer segment.',
        'Estimate operational cost of each friction pattern.',
        'Prioritize fixes with measurable customer outcome goals.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=500&fit=crop',
      ),
    ),
    status: 'draft',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(52),
  },
  {
    title: 'Designing Better On-Call Rotations for Small Teams',
    slug: 'designing-better-oncall-rotations-for-small-teams',
    description:
      'Reduce burnout with practical constraints, escalation policy, and incident follow-through.',
    content: richTextFromNodes(
      paragraphNode(
        'Healthy on-call systems are built around recovery time, not only schedule fairness.',
      ),
      bulletListNode(
        'Set clear ownership boundaries and escalation paths.',
        'Protect post-incident recovery windows in the rota.',
        'Use incident trends to rebalance workload monthly.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(58),
  },
  {
    title: 'Service Ownership Templates That Scale Across Squads',
    slug: 'service-ownership-templates-that-scale-across-squads',
    description: 'Define ownership expectations once and keep runtime operations consistent.',
    content: richTextFromNodes(
      paragraphNode('Ownership templates remove ambiguity during incidents and release planning.'),
      numberListNode(
        'Publish service SLOs and primary escalation contacts.',
        'Document dependencies with failure blast radius notes.',
        'Track weekly reliability debt and remediation status.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(63),
  },
  {
    title: 'API Versioning Policy for Fast-Moving Product Teams',
    slug: 'api-versioning-policy-for-fast-moving-product-teams',
    description:
      'Balance backward compatibility with product velocity using explicit change classes.',
    content: richTextFromNodes(
      paragraphNode(
        'A clear versioning policy helps teams ship faster by reducing negotiation overhead.',
      ),
      bulletListNode(
        'Classify changes as additive, behavior-changing, or breaking.',
        'Set deprecation windows and customer communication templates.',
        'Automate compatibility checks in CI for shared APIs.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=900&h=500&fit=crop',
      ),
    ),
    status: 'draft',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(68),
  },
  {
    title: 'Data Retention Rules Developers Can Actually Apply',
    slug: 'data-retention-rules-developers-can-apply',
    description:
      'Translate policy language into implementation-ready retention and deletion patterns.',
    content: richTextFromNodes(
      paragraphNode(
        'Retention policy succeeds only when engineering teams can execute it repeatedly.',
      ),
      numberListNode(
        'Map each data class to retention duration and legal basis.',
        'Define automatic deletion jobs with auditable logs.',
        'Add exception handling for legal hold workflows.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1551281044-8b5bd3f4f5d2?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1551281044-8b5bd3f4f5d2?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(73),
  },
  {
    title: 'Queue Backpressure Strategies for Event Pipelines',
    slug: 'queue-backpressure-strategies-for-event-pipelines',
    description: 'Operational patterns to protect downstream dependencies under burst traffic.',
    content: richTextFromNodes(
      paragraphNode(
        'Backpressure is a product safety feature, not just an infrastructure concern.',
      ),
      bulletListNode(
        'Throttle producers when consumer lag crosses policy thresholds.',
        'Use dead-letter queues with explicit replay contracts.',
        'Alert on sustained lag trend, not transient spikes.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(79),
  },
  {
    title: 'Migration Playbook for Splitting Monolithic Services',
    slug: 'migration-playbook-for-splitting-monolithic-services',
    description: 'A phased migration model that keeps customer-facing risk under control.',
    content: richTextFromNodes(
      paragraphNode(
        'Service extraction should follow business seams and measured runtime behavior.',
      ),
      numberListNode(
        'Identify domains with high change frequency and low coupling first.',
        'Introduce anti-corruption boundaries around shared contracts.',
        'Migrate traffic gradually with reversible rollout gates.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=500&fit=crop',
      ),
    ),
    status: 'draft',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(84),
  },
  {
    title: 'Practical SLO Reviews for Product and Engineering',
    slug: 'practical-slo-reviews-for-product-and-engineering',
    description: 'Use shared SLO review rituals to align reliability tradeoffs with roadmap goals.',
    content: richTextFromNodes(
      paragraphNode(
        'SLO reviews are most effective when product and engineering interpret the same evidence.',
      ),
      bulletListNode(
        'Review burn-rate incidents and feature-release overlap.',
        'Document temporary reliability exceptions and expiry dates.',
        'Link SLO debt directly to roadmap milestones.',
      ),
      paragraphNode(
        'Inline image: https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&h=500&fit=crop',
      ),
    ),
    status: 'published',
    type: 'article',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=600&fit=crop',
    publishedAt: isoDaysAgo(90),
  },
]

export const seededPostSlugs = seededPosts.map((post) => post.slug)
