import type {
  AdminScenarioRow,
  ChoiceResult,
  ChoiceSubmission,
  FlashMissionDraft,
  PlayerProfile,
  Scenario,
} from "@/lib/types";
import {
  MOCK_ADMIN_SCENARIOS,
  MOCK_PROFILE,
  MULE_ENCOUNTER,
  MULE_PEER_SHIELD,
} from "@/lib/api/mock-data";

/**
 * The single seam between the UI and the backend.
 *
 * Components only ever talk to `api`, never to fixtures. When the Node.js
 * service is ready, implement `HttpApiClient` below against the same interface
 * and flip `NEXT_PUBLIC_API_MODE=http` — no component has to change.
 */
export interface ShieldQuestApi {
  getProfile(): Promise<PlayerProfile>;
  getScenario(id: string): Promise<Scenario>;
  submitChoice(submission: ChoiceSubmission): Promise<ChoiceResult>;
  listScenarios(): Promise<AdminScenarioRow[]>;
  deployFlashMission(draft: FlashMissionDraft): Promise<AdminScenarioRow>;
}

/** Simulated network latency so loading states are exercised in the prototype. */
const latency = (ms = 260) => new Promise((r) => setTimeout(r, ms));

class MockApiClient implements ShieldQuestApi {
  private scenarios = new Map<string, Scenario>([
    [MULE_ENCOUNTER.id, MULE_ENCOUNTER],
    [MULE_PEER_SHIELD.id, MULE_PEER_SHIELD],
  ]);

  private adminRows: AdminScenarioRow[] = [...MOCK_ADMIN_SCENARIOS];

  async getProfile(): Promise<PlayerProfile> {
    await latency(120);
    return { ...MOCK_PROFILE };
  }

  async getScenario(id: string): Promise<Scenario> {
    await latency();
    const scenario = this.scenarios.get(id);
    if (!scenario) throw new Error(`Unknown scenario: ${id}`);
    return scenario;
  }

  /**
   * In production this is authoritative: the server resolves the choice, applies
   * the wallet deltas and schedules the delayed consequence. The client is told
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
      flash: choice.immediate.flash,
      coinDelta: choice.immediate.coinDelta,
      resilienceDelta: choice.immediate.resilienceDelta,
      feedback: choice.feedback,
      delayed: choice.delayed,
    };
  }

  async listScenarios(): Promise<AdminScenarioRow[]> {
    await latency(320);
    return [...this.adminRows];
  }

  async deployFlashMission(draft: FlashMissionDraft): Promise<AdminScenarioRow> {
    await latency(700);
    const row: AdminScenarioRow = {
      id: `scn_flash_${this.adminRows.length + 1}`,
      title: draft.title,
      threatType: draft.threatType,
      ageGroup: draft.ageGroup,
      status: "LIVE",
      safeDecisionRate: 0,
      previousSafeDecisionRate: 0,
      plays: 0,
      competencies: [draft.competency],
      updatedBy: "You (Duty Officer)",
      updatedOn: "Just now",
      isFlashMission: true,
    };
    this.adminRows = [row, ...this.adminRows];
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
