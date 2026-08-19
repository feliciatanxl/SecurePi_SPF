import type {
  AdminScenarioRow,
  ChoiceResult,
  ChoiceSubmission,
  FlashMissionDraft,
  Guardian,
  Insight,
  PlayerProfile,
  PortalSummary,
  Scenario,
} from "@/lib/types";
import {
  FLASH_MISSIONS_KEY,
  readDemo,
  writeDemo,
} from "@/lib/state/demoStorage";
import {
  derivePortalSummary,
  MOCK_ADMIN_SCENARIOS,
  MOCK_GUARDIANS,
  MOCK_INSIGHTS,
  MOCK_PROFILE,
  MULE_ENCOUNTER,
  MULE_PEER_SHIELD,
} from "@/lib/api/mock-data";

/**
 * The single seam between the UI and the backend.
 *
 * Components only ever talk to `api`, never to fixtures. When the Node.js
 * service is ready, implement `HttpApiClient` below against the same interface
 * and swap the export — no component has to change.
 */
export interface ShieldQuestApi {
  getProfile(): Promise<PlayerProfile>;
  getGuardians(): Promise<Guardian[]>;
  getScenario(id: string): Promise<Scenario>;
  submitChoice(submission: ChoiceSubmission): Promise<ChoiceResult>;
  listScenarios(): Promise<AdminScenarioRow[]>;
  getPortalSummary(): Promise<PortalSummary>;
  getInsights(): Promise<Insight[]>;
  deployFlashMission(draft: FlashMissionDraft): Promise<AdminScenarioRow>;
}

/** Simulated network latency so loading states are exercised in the prototype. */
const latency = (ms = 240) => new Promise((r) => setTimeout(r, ms));

class MockApiClient implements ShieldQuestApi {
  private scenarios = new Map<string, Scenario>([
    [MULE_ENCOUNTER.id, MULE_ENCOUNTER],
    [MULE_PEER_SHIELD.id, MULE_PEER_SHIELD],
  ]);

  /**
   * Flash Missions deployed during a demo session, overlaid on the fixtures so
   * a page refresh mid-presentation does not lose them. The fixture list stays
   * the base dataset and is never mutated.
   */
  private demoFlashMissions(): AdminScenarioRow[] {
    const stored = readDemo<AdminScenarioRow[]>(FLASH_MISSIONS_KEY);
    return Array.isArray(stored) ? stored : [];
  }

  /** Newest demo missions first, then fixtures. Keyed by id so reloads cannot duplicate. */
  private allRows(): AdminScenarioRow[] {
    const merged = new Map<string, AdminScenarioRow>();
    for (const row of [...this.demoFlashMissions(), ...MOCK_ADMIN_SCENARIOS]) {
      if (!merged.has(row.id)) merged.set(row.id, row);
    }
    return [...merged.values()];
  }

  async getProfile(): Promise<PlayerProfile> {
    await latency(120);
    return { ...MOCK_PROFILE };
  }

  async getGuardians(): Promise<Guardian[]> {
    await latency(120);
    return MOCK_GUARDIANS.map((g) => ({ ...g }));
  }

  async getScenario(id: string): Promise<Scenario> {
    await latency();
    const scenario = this.scenarios.get(id);
    if (!scenario) throw new Error(`Unknown scenario: ${id}`);
    return scenario;
  }

  /**
   * In production this is authoritative: the server resolves the choice, applies
   * the stat deltas and schedules the delayed consequence. The client is told
   * only what it needs to render. We keep the same shape here.
   */
  async submitChoice({
    scenarioId,
    choiceId,
  }: ChoiceSubmission): Promise<ChoiceResult> {
    await latency(180);
    const scenario = this.scenarios.get(scenarioId);
    const choice = scenario?.choices.find((c) => c.id === choiceId);
    if (!choice) throw new Error(`Unknown choice: ${choiceId}`);

    return {
      outcome: choice.outcome,
      flashTitle: choice.immediate.flashTitle,
      flashAmount: choice.immediate.flashAmount,
      deltas: choice.immediate.deltas,
      debrief: choice.debrief,
      delayed: choice.delayed,
    };
  }

  async listScenarios(): Promise<AdminScenarioRow[]> {
    await latency(300);
    return this.allRows();
  }

  async getPortalSummary(): Promise<PortalSummary> {
    await latency(140);
    return derivePortalSummary(this.allRows());
  }

  async getInsights(): Promise<Insight[]> {
    await latency(140);
    return MOCK_INSIGHTS.map((i) => ({ ...i }));
  }

  async deployFlashMission(draft: FlashMissionDraft): Promise<AdminScenarioRow> {
    await latency(650);
    const existing = this.demoFlashMissions();
    const row: AdminScenarioRow = {
      // Stable and collision-free across reloads, unlike a length-based index.
      id: `scn_flash_demo_${Date.now().toString(36)}`,
      title: draft.title,
      category: draft.category,
      targetGroup: draft.targetGroup,
      status: draft.status,
      safeDecisionRate: 0,
      previousSafeDecisionRate: 0,
      responses: 0,
      competencies: [draft.competency],
      updatedBy: "You (Duty Officer)",
      updatedOn: "Just now",
      isFlashMission: true,
    };
    writeDemo(FLASH_MISSIONS_KEY, [row, ...existing]);
    return row;
  }
}

/**
 * Production implementation — intentionally left as a skeleton so the shape of
 * the eventual integration is visible in the prototype.
 *
 * class HttpApiClient implements ShieldQuestApi {
 *   constructor(private baseUrl = process.env.NEXT_PUBLIC_API_URL!) {}
 *
 *   private async request<T>(path: string, init?: RequestInit): Promise<T> {
 *     const res = await fetch(`${this.baseUrl}${path}`, {
 *       ...init,
 *       headers: { "content-type": "application/json", ...init?.headers },
 *       credentials: "include",
 *     });
 *     if (!res.ok) throw new ApiError(res.status, await res.text());
 *     return res.json() as Promise<T>;
 *   }
 *
 *   getScenario = (id: string) => this.request<Scenario>(`/v1/scenarios/${id}`);
 *   submitChoice = (body: ChoiceSubmission) =>
 *     this.request<ChoiceResult>("/v1/choices", { method: "POST", body: JSON.stringify(body) });
 *   // …
 * }
 */

export const api: ShieldQuestApi = new MockApiClient();
