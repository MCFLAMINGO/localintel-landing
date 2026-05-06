// Shared sector gap engine — embedded inline in each ZIP page
// Benchmarks per 10k population, income-adjusted
// Returns gaps sorted by magnitude — direction only, counts gated
const SECTOR_BENCHMARKS = [
  { key:'health',       label:'Healthcare',           icon:'🏥', base:40,  incAdj:1.1 },
  { key:'food',         label:'Food & Dining',         icon:'🍽️', base:28,  incAdj:1.2 },
  { key:'retail',       label:'Retail & Shopping',     icon:'🛍️', base:18,  incAdj:1.25 },
  { key:'fitness',      label:'Fitness & Wellness',    icon:'💪', base:5,   incAdj:1.35 },
  { key:'finance',      label:'Financial Services',    icon:'🏦', base:8,   incAdj:1.2 },
  { key:'hospitality',  label:'Hospitality',           icon:'🏨', base:4,   incAdj:1.0 },
  { key:'legal',        label:'Legal Services',        icon:'⚖️', base:6,   incAdj:1.15 },
  { key:'construction', label:'Construction & Trades', icon:'🔨', base:28,  incAdj:1.0 },
  { key:'automotive',   label:'Automotive',            icon:'🚗', base:6,   incAdj:0.9 },
  { key:'services',     label:'Professional Services', icon:'💼', base:35,  incAdj:1.1 },
];

function computeGaps(sectorBreakdown, population, medianHHI) {
  const pop10k = population / 10000;
  const affluent = medianHHI > 100000;
  return SECTOR_BENCHMARKS.map(s => {
    const actual   = sectorBreakdown[s.key] || 0;
    const expected = Math.max(1, Math.round(s.base * (affluent ? s.incAdj : 1.0) * pop10k));
    const gap      = expected - actual;
    const pct      = Math.round(Math.abs(gap) / expected * 100);
    const tier     = gap >= 10 ? 'high' : gap >= 4 ? 'medium' : gap > 0 ? 'low' : gap <= -8 ? 'saturated' : 'balanced';
    return { ...s, actual, expected, gap, pct, tier };
  }).sort((a, b) => b.gap - a.gap);
}

const TIER_COPY = {
  high:      { label: 'Significant Opportunity',  sub: 'Meaningfully undersupplied relative to market size and income.',  cls: 'urgent'    },
  medium:    { label: 'Moderate Opportunity',      sub: 'Room for new concepts — moderate competition expected.',          cls: 'moderate'  },
  low:       { label: 'Slight Opportunity',        sub: 'Minor gap — niche or specialty concepts may find footing.',       cls: 'slight'    },
  balanced:  { label: 'Balanced Market',           sub: 'Supply roughly matches demand for this sector.',                  cls: 'balanced'  },
  saturated: { label: 'Competitive Market',        sub: 'Oversupplied — existing operators face pricing pressure.',        cls: 'saturated' },
};
