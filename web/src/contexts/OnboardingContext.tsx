import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

// ─── Step definitions ─────────────────────────────────────────────────────────

export type OnboardingCategory = 'welcome' | 'dashboard' | 'workflow';

export interface OnboardingStep {
  id: string;
  category: OnboardingCategory;
  /** CSS selector or data-onboarding="..." attribute value to spotlight */
  target?: string;
  /** Arrow placement relative to the target */
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** i18n key inside t.onboarding */
  titleKey: string;
  descKey: string;
  /** If true, the user must perform the action to advance (otherwise click "Next") */
  waitForAction?: boolean;
  /** Action id that resolves this step (matched via completeAction()) */
  actionId?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // ── Welcome ─────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    category: 'welcome',
    placement: 'center',
    titleKey: 'welcomeTitle',
    descKey: 'welcomeDesc',
  },
  // ── Dashboard ───────────────────────────────────────────────────────────
  {
    id: 'dashboard-stats',
    category: 'dashboard',
    target: '[data-onboarding="stats"]',
    placement: 'bottom',
    titleKey: 'statsTitle',
    descKey: 'statsDesc',
  },
  {
    id: 'dashboard-widgets',
    category: 'dashboard',
    target: '[data-onboarding="widgets"]',
    placement: 'bottom',
    titleKey: 'widgetsTitle',
    descKey: 'widgetsDesc',
  },
  {
    id: 'dashboard-botlist',
    category: 'dashboard',
    target: '[data-onboarding="botlist"]',
    placement: 'top',
    titleKey: 'botlistTitle',
    descKey: 'botlistDesc',
  },
  {
    id: 'dashboard-create-bot',
    category: 'dashboard',
    target: '[data-onboarding="create-bot"]',
    placement: 'bottom',
    titleKey: 'createBotTitle',
    descKey: 'createBotDesc',
    waitForAction: true,
    actionId: 'bot-created',
  },
  // ── Workflow ────────────────────────────────────────────────────────────
  {
    id: 'workflow-welcome',
    category: 'workflow',
    placement: 'center',
    titleKey: 'workflowWelcomeTitle',
    descKey: 'workflowWelcomeDesc',
  },
  {
    id: 'workflow-header',
    category: 'workflow',
    target: '[data-onboarding="wf-header"]',
    placement: 'bottom',
    titleKey: 'headerTitle',
    descKey: 'headerDesc',
  },
  {
    id: 'workflow-left-sidebar',
    category: 'workflow',
    target: '[data-onboarding="wf-left-sidebar"]',
    placement: 'right',
    titleKey: 'leftSidebarTitle',
    descKey: 'leftSidebarDesc',
  },
  {
    id: 'workflow-canvas',
    category: 'workflow',
    target: '[data-onboarding="canvas"]',
    placement: 'left',
    titleKey: 'canvasTitle',
    descKey: 'canvasDesc',
  },
  {
    id: 'workflow-sidebar',
    category: 'workflow',
    target: '[data-onboarding="node-sidebar"]',
    placement: 'left',
    titleKey: 'sidebarTitle',
    descKey: 'sidebarDesc',
  },
  {
    id: 'workflow-add-trigger',
    category: 'workflow',
    target: '[data-onboarding="node-sidebar"]',
    placement: 'left',
    titleKey: 'addTriggerTitle',
    descKey: 'addTriggerDesc',
    waitForAction: true,
    actionId: 'node-added',
  },
  {
    id: 'workflow-add-action',
    category: 'workflow',
    target: '[data-onboarding="node-sidebar"]',
    placement: 'left',
    titleKey: 'addActionTitle',
    descKey: 'addActionDesc',
    waitForAction: true,
    actionId: 'node-added',
  },
  {
    id: 'workflow-connect',
    category: 'workflow',
    target: '[data-onboarding="canvas"]',
    placement: 'left',
    titleKey: 'connectTitle',
    descKey: 'connectDesc',
    waitForAction: true,
    actionId: 'edge-added',
  },
  {
    id: 'workflow-bottom-bar',
    category: 'workflow',
    target: '[data-onboarding="wf-bottom-bar"]',
    placement: 'top',
    titleKey: 'bottomBarTitle',
    descKey: 'bottomBarDesc',
  },
  {
    id: 'workflow-save',
    category: 'workflow',
    target: '[data-onboarding="save-btn"]',
    placement: 'bottom',
    titleKey: 'saveTitle',
    descKey: 'saveDesc',
    waitForAction: true,
    actionId: 'workflow-saved',
  },
  {
    id: 'workflow-deploy',
    category: 'workflow',
    target: '[data-onboarding="deploy-btn"]',
    placement: 'bottom',
    titleKey: 'deployTitle',
    descKey: 'deployDesc',
  },
  {
    id: 'complete',
    category: 'workflow',
    placement: 'center',
    titleKey: 'completeTitle',
    descKey: 'completeDesc',
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface OnboardingContextValue {
  /** Whether onboarding is currently active (visible) */
  active: boolean;
  /** Whether onboarding has been completed (forever dismissed) */
  completed: boolean;
  /** Current step index */
  currentStep: number;
  /** Current step object */
  step: OnboardingStep | null;
  /** Total number of steps */
  totalSteps: number;
  /** Start the onboarding */
  start: () => void;
  /** Go to next step */
  next: () => void;
  /** Go to previous step */
  prev: () => void;
  /** Skip / dismiss onboarding permanently */
  skip: () => void;
  /** Notify that an action was completed (for waitForAction steps) */
  completeAction: (actionId: string) => void;
  /** Jump to a specific category (e.g. when entering workflow editor) */
  jumpToCategory: (category: OnboardingCategory) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dnc_onboarding';

interface StoredState {
  completed: boolean;
  currentStep: number;
}

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completed: false, currentStep: 0 };
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const initialised = useRef(false);

  // Re-evaluate onboarding when user changes (login/logout)
  useEffect(() => {
    const stored = loadState();
    setCompleted(stored.completed);
    setCurrentStep(stored.currentStep);

    // No user = not authenticated, nothing to do
    if (!user) {
      initialised.current = false;
      return;
    }

    // Fetch server-side preferences to decide whether to show onboarding
    apiRequest('/users/preferences').then((prefs: any) => {
      if (prefs?.onboarding?.completed) {
        setCompleted(true);
        saveState({ completed: true, currentStep: ONBOARDING_STEPS.length - 1 });
      } else if (!stored.completed) {
        // First time user — auto-start onboarding
        setActive(true);
      }
      initialised.current = true;
    }).catch(() => {
      // If request fails, rely on localStorage
      if (!stored.completed) {
        setActive(true);
      }
      initialised.current = true;
    });
  }, [user]);

  const persist = useCallback((step: number, done: boolean) => {
    saveState({ completed: done, currentStep: step });
    // Fire-and-forget save to server (only if authenticated)
    const token = localStorage.getItem('token');
    if (!token) return;
    apiRequest('/users/preferences').then((prefs: any) => {
      const updated = { ...prefs, onboarding: { completed: done, currentStep: step } };
      apiRequest('/users/preferences', {
        method: 'PUT',
        body: JSON.stringify(updated),
      }).catch(() => { /* ignore */ });
    }).catch(() => { /* ignore */ });
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setCompleted(false);
    setActive(true);
    persist(0, false);
  }, [persist]);

  const next = useCallback(() => {
    setCurrentStep(prev => {
      const nextIdx = prev + 1;
      if (nextIdx >= ONBOARDING_STEPS.length) {
        // Completed
        setCompleted(true);
        setActive(false);
        persist(nextIdx, true);
        return prev;
      }
      persist(nextIdx, false);
      return nextIdx;
    });
  }, [persist]);

  const prev = useCallback(() => {
    setCurrentStep(prev => {
      const prevIdx = Math.max(0, prev - 1);
      persist(prevIdx, false);
      return prevIdx;
    });
  }, [persist]);

  const skip = useCallback(() => {
    setCompleted(true);
    setActive(false);
    persist(currentStep, true);
  }, [currentStep, persist]);

  const completeAction = useCallback((actionId: string) => {
    setCurrentStep(cur => {
      const step = ONBOARDING_STEPS[cur];
      if (step?.waitForAction && step.actionId === actionId) {
        const nextIdx = cur + 1;
        if (nextIdx >= ONBOARDING_STEPS.length) {
          setCompleted(true);
          setActive(false);
          persist(nextIdx, true);
          return cur;
        }
        setTimeout(() => {
          persist(nextIdx, false);
        }, 0);
        return nextIdx;
      }
      return cur;
    });
  }, [persist]);

  const jumpToCategory = useCallback((category: OnboardingCategory) => {
    if (completed || !active) return;
    const idx = ONBOARDING_STEPS.findIndex(s => s.category === category);
    if (idx >= 0 && idx > currentStep) {
      setCurrentStep(idx);
      persist(idx, false);
    }
  }, [completed, active, currentStep, persist]);

  const step = active && currentStep < ONBOARDING_STEPS.length
    ? ONBOARDING_STEPS[currentStep]
    : null;

  return (
    <OnboardingContext.Provider value={{
      active, completed, currentStep, step,
      totalSteps: ONBOARDING_STEPS.length,
      start, next, prev, skip, completeAction, jumpToCategory,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
