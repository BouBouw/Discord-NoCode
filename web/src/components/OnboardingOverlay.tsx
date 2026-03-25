import { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Rocket, SkipForward } from 'lucide-react';
import { useOnboarding, ONBOARDING_STEPS, type OnboardingCategory } from '../contexts/OnboardingContext';
import { useTranslation } from '../hooks/useTranslation';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<OnboardingCategory, { icon: string; colorVar: string }> = {
  welcome:   { icon: '👋', colorVar: 'var(--t-a)' },
  dashboard: { icon: '📊', colorVar: '#7289DA' },
  workflow:  { icon: '⚡', colorVar: '#22c55e' },
};

// ─── Helpers  ─────────────────────────────────────────────────────────────────

function getTargetRect(selector?: string): DOMRect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  return el?.getBoundingClientRect() ?? null;
}

// ─── OnboardingOverlay ────────────────────────────────────────────────────────

export default function OnboardingOverlay() {
  const { active, step, currentStep, totalSteps, next, prev, skip } = useOnboarding();
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDir, setArrowDir] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);

  // Category progress
  const categories = ['welcome', 'dashboard', 'workflow'] as const;
  const currentCategory = step?.category ?? 'welcome';
  const categoryIndex = categories.indexOf(currentCategory);

  // Re-calculate position when step changes or window resizes
  const updatePosition = useCallback(() => {
    if (!step) return;

    if (step.placement === 'center' || !step.target) {
      setTargetRect(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setArrowStyle({ display: 'none' });
      return;
    }

    const rect = getTargetRect(step.target);
    setTargetRect(rect);

    if (!rect) {
      // Target not found — center
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setArrowStyle({ display: 'none' });
      return;
    }

    const GAP = 16;
    const tw = 380; // tooltip width
    const th = 220; // approx tooltip height

    let top = 0, left = 0;
    let aDir: typeof arrowDir = 'top';

    switch (step.placement) {
      case 'bottom':
        top = rect.bottom + GAP;
        left = rect.left + rect.width / 2 - tw / 2;
        aDir = 'top';
        break;
      case 'top':
        top = rect.top - th - GAP;
        left = rect.left + rect.width / 2 - tw / 2;
        aDir = 'bottom';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.right + GAP;
        aDir = 'left';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - th / 2;
        left = rect.left - tw - GAP;
        aDir = 'right';
        break;
    }

    // Clamp to viewport
    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - th - 12));

    setTooltipStyle({ position: 'fixed', top, left, width: tw });
    setArrowDir(aDir);

    // Arrow pointing at the target
    const arrowPos: React.CSSProperties = { position: 'absolute' };
    if (aDir === 'top') { arrowPos.top = -8; arrowPos.left = '50%'; arrowPos.transform = 'translateX(-50%)'; }
    else if (aDir === 'bottom') { arrowPos.bottom = -8; arrowPos.left = '50%'; arrowPos.transform = 'translateX(-50%) rotate(180deg)'; }
    else if (aDir === 'left') { arrowPos.left = -8; arrowPos.top = '50%'; arrowPos.transform = 'translateY(-50%) rotate(-90deg)'; }
    else if (aDir === 'right') { arrowPos.right = -8; arrowPos.top = '50%'; arrowPos.transform = 'translateY(-50%) rotate(90deg)'; }
    setArrowStyle(arrowPos);
  }, [step]);

  useEffect(() => {
    if (!active || !step) return;
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);

    // Small delay to let DOM render the target
    const posTimer = setTimeout(updatePosition, 50);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      clearTimeout(timer);
      clearTimeout(posTimer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [active, step, currentStep, updatePosition]);

  if (!active || !step) return null;

  const onboardingT = (t as any).onboarding ?? {};
  const title = onboardingT[step.titleKey] ?? step.titleKey;
  const desc = onboardingT[step.descKey] ?? step.descKey;
  const catMeta = CATEGORY_META[step.category];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const isCenter = step.placement === 'center';

  return (
    <>
      {/* Backdrop overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={e => {
          // Don't close on backdrop click — only Skip button
          e.stopPropagation();
        }}
      >
        {/* Spotlight cutout */}
        {targetRect && (
          <div
            className="absolute rounded-xl transition-all duration-300"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              background: 'transparent',
              border: `2px solid ${catMeta.colorVar}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`z-[9999] rounded-2xl shadow-2xl transition-all duration-300 ${
          animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          ...tooltipStyle,
          background: 'var(--t-s)',
          border: '1px solid var(--t-bd)',
          maxWidth: isCenter ? 460 : 380,
          width: isCenter ? 460 : undefined,
        }}
      >
        {/* Arrow */}
        {!isCenter && (
          <div style={arrowStyle}>
            <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
              <path d="M8 0L16 8H0L8 0Z" fill="var(--t-s)" />
              <path d="M8 0L16 8H0L8 0Z" stroke="var(--t-bd)" strokeWidth="1" fill="var(--t-s)" />
            </svg>
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{catMeta.icon}</span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: `${catMeta.colorVar}20`,
                color: catMeta.colorVar,
              }}
            >
              {onboardingT[`cat_${step.category}`] ?? step.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: 'var(--t-m)' }}>
              {currentStep + 1}/{totalSteps}
            </span>
            <button
              onClick={skip}
              className="p-1 rounded-lg transition-colors hover:bg-[var(--t-s2)]"
              title={onboardingT.skip ?? 'Skip'}
            >
              <X className="w-4 h-4" style={{ color: 'var(--t-m)' }} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 mb-3">
          <div className="flex gap-1">
            {categories.map((cat, i) => (
              <div key={cat} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--t-s2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: i < categoryIndex ? '100%' : i === categoryIndex
                      ? `${((currentStep - ONBOARDING_STEPS.findIndex(s => s.category === cat)) /
                            Math.max(1, ONBOARDING_STEPS.filter(s => s.category === cat).length)) * 100}%`
                      : '0%',
                    background: CATEGORY_META[cat].colorVar,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {categories.map(cat => (
              <span
                key={cat}
                className="text-[9px] font-medium"
                style={{ color: cat === currentCategory ? catMeta.colorVar : 'var(--t-m)', opacity: cat === currentCategory ? 1 : 0.5 }}
              >
                {onboardingT[`cat_${cat}`] ?? cat}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-2">
          {isCenter && step.id === 'welcome' && (
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${catMeta.colorVar}15` }}
              >
                <Sparkles className="w-7 h-7" style={{ color: catMeta.colorVar }} />
              </div>
            </div>
          )}
          {isCenter && step.id === 'complete' && (
            <div className="flex justify-center mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${catMeta.colorVar}15` }}
              >
                <Rocket className="w-7 h-7" style={{ color: catMeta.colorVar }} />
              </div>
            </div>
          )}
          <h3
            className={`font-bold mb-1.5 ${isCenter ? 'text-center text-lg' : 'text-base'}`}
            style={{ color: 'var(--t-tx)' }}
          >
            {title}
          </h3>
          <p
            className={`text-sm leading-relaxed ${isCenter ? 'text-center' : ''}`}
            style={{ color: 'var(--t-sub)' }}
          >
            {desc}
          </p>

          {step.waitForAction && (
            <div
              className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
              style={{ background: `${catMeta.colorVar}12`, color: catMeta.colorVar }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: catMeta.colorVar }}
              />
              {onboardingT.waitingForAction ?? 'Perform the action to continue...'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 mt-1"
          style={{ borderTop: '1px solid var(--t-bd)' }}
        >
          <button
            onClick={skip}
            className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg transition-colors hover:bg-[var(--t-s2)]"
            style={{ color: 'var(--t-m)' }}
          >
            <SkipForward className="w-3 h-3" />
            {onboardingT.skip ?? 'Skip tour'}
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: 'var(--t-sub)', background: 'var(--t-s2)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {onboardingT.prev ?? 'Back'}
              </button>
            )}
            {!step.waitForAction && (
              <button
                onClick={isLast ? skip : next}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: catMeta.colorVar,
                  color: '#fff',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {isLast
                  ? (onboardingT.finish ?? 'Get started!')
                  : (onboardingT.next ?? 'Next')
                }
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
