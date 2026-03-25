// ─── Subscription Plans & Limits ──────────────────────────────────────────────
// Free     : 0 €        — 1 bot, 6 cmds, 3 events, 500 MB DB, 1 000 AI credits, 3 members/bot
// Pro      : 4.99 €/mo  | 49.90 €/yr — 3 bots, 30 cmds, 15 events, 5 GB, 5 000 AI, 6 members/bot
// Business : 14.99 €/mo | 149.90 €/yr — 15 bots, unlimited, 15 GB, 20 000 AI, 15 members/bot (+2€/extra seat/mo)

export const PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,   // cents
    annualPrice: 0,     // cents
    currency: 'eur',
    limits: {
      maxBots: 1,
      maxCommandsPerBot: 6,
      maxEventsPerBot: 3,
      maxMembersPerBot: 3,
      maxDbSizeMb: 500,
      maxDbPerBot: 1,
      aiCreditsPerMonth: 1000,
      extraSeatPriceCents: 0,
      unlimitedNodes: true,
    },
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 499,   // 4.99 €/mo
    annualPrice: 4990,    // 49.90 €/yr (~2 mois offerts)
    currency: 'eur',
    limits: {
      maxBots: 3,
      maxCommandsPerBot: 30,
      maxEventsPerBot: 15,
      maxMembersPerBot: 6,
      maxDbSizeMb: 5120, // 5 GB
      maxDbPerBot: 1,
      aiCreditsPerMonth: 5000,
      extraSeatPriceCents: 0,
      unlimitedNodes: true,
    },
  },
  business: {
    name: 'Business',
    monthlyPrice: 1499,  // 14.99 €/mo
    annualPrice: 14990,   // 149.90 €/yr (~2 mois offerts)
    currency: 'eur',
    limits: {
      maxBots: 15,
      maxCommandsPerBot: Infinity,
      maxEventsPerBot: Infinity,
      maxMembersPerBot: 15,
      maxDbSizeMb: 15360, // 15 GB
      maxDbPerBot: 1,
      aiCreditsPerMonth: 20000,
      extraSeatPriceCents: 200, // 2€/extra seat/month
      unlimitedNodes: true,
    },
  },
};

export function getPlanLimits(plan) {
  return PLANS[plan]?.limits || PLANS.free.limits;
}

export function getPlan(plan) {
  return PLANS[plan] || PLANS.free;
}
