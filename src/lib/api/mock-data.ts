import type {
  AdminScenarioRow,
  PlayerProfile,
  Scenario,
} from "@/lib/types";

/**
 * Hardcoded prototype fixtures.
 *
 * Everything here is shaped exactly like the payloads the real API will return,
 * so swapping `MockApiClient` for `HttpApiClient` requires no component changes.
 */

export const MOCK_PROFILE: PlayerProfile = {
  handle: "Guardian_2481",
  cohort: "NYP · Y2-04",
  coins: 1240,
  resiliencePoints: 85,
  guardiansUnlocked: 3,
  guardiansTotal: 6,
};

/* ------------------------------------------------------------------ */
/* View 1 — Scenario Encounter                                         */
/* ------------------------------------------------------------------ */

export const MULE_ENCOUNTER: Scenario = {
  id: "scn_money_mule_01",
  mode: "ENCOUNTER",
  title: "Easy Money",
  threatType: "Money Mule Recruitment",
  competencies: ["SPOT", "HOLD", "EVALUATE"],
  prompt:
    "It's 11:40pm. Someone you've never met messages you on a gaming server.",
  messages: [
    {
      id: "m1",
      author: "system",
      body: "New message request · @cash_flow_sg",
    },
    {
      id: "m2",
      author: "them",
      displayName: "cash_flow_sg",
      body: "yo bro, saw ur post. u want easy side income? 💰",
    },
    {
      id: "m3",
      author: "them",
      displayName: "cash_flow_sg",
      body: "Someone online offers you S$300 to receive money into your bank account.",
    },
    {
      id: "m4",
      author: "them",
      displayName: "cash_flow_sg",
      body: "all u do is receive, then transfer out. 10 mins work. 100% legit, my company does this daily. need answer tonight ah, got 2 other ppl asking",
    },
  ],
  choices: [
    {
      id: "ch_accept",
      label: "Accept",
      hint: "Send your bank details and take the S$300",
      reply: "ok deal. sending u my acc number now",
      outcome: "RISKY",
      immediate: {
        coinDelta: 300,
        resilienceDelta: 0,
        flash: "+300 Coins",
      },
      delayed: {
        delayMs: 3000,
        headline: "Your account has been frozen",
        body: "Three days later, your bank suspends your account for suspicious activity. The S$300 came from a scam victim in Jurong. You are now the account holder police can trace — and your name is on the transfer.",
        coinDelta: -300,
        debrief:
          "Receiving and forwarding money for a stranger makes you a money mule. Under Singapore law that is an offence even if you did not know the money was stolen — and a frozen account can follow you for years.",
        competency: "EVALUATE",
      },
      feedback:
        "The payout arrived instantly. That is exactly why this works on people.",
    },
    {
      id: "ch_proof",
      label: "Ask for proof",
      hint: "Request company details before deciding",
      reply: "wait, which company is this? send me ur UEN and website first",
      outcome: "CAUTIOUS",
      immediate: {
        coinDelta: 10,
        resilienceDelta: 5,
        flash: "+10 Coins · Verification attempted",
      },
      feedback:
        "Good instinct — you slowed the deal down. But scammers produce fake documents easily, and staying in the conversation keeps the pressure on you. Verifying a stranger's story is weaker than refusing an offer that is illegal regardless of who is asking.",
    },
    {
      id: "ch_reject",
      label: "Reject & Report",
      hint: "Block the account and report it to ScamShield",
      reply: "No. That's money mule work and it's illegal. Blocking and reporting you.",
      outcome: "SAFE",
      immediate: {
        coinDelta: 50,
        resilienceDelta: 25,
        flash: "+50 Coins · +25 Resilience",
      },
      feedback:
        "Correct. No legitimate employer needs your bank account to receive and forward funds. You spotted the risk, held before acting, and removed yourself from the situation entirely. Reporting it also protects the next person they message.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* View 2 — Peer Shield Mode                                           */
/* ------------------------------------------------------------------ */

export const MULE_PEER_SHIELD: Scenario = {
  id: "scn_money_mule_peer_01",
  mode: "PEER_SHIELD",
  title: "Your Friend's Turn",
  threatType: "Money Mule Recruitment",
  competencies: ["DEFEND", "LEAD"],
  prompt:
    "Same offer, different target. You notice your friend agreeing to transfer unknown funds.",
  messages: [
    {
      id: "p1",
      author: "system",
      body: "Group chat · Bball Kakis (6 members)",
    },
    {
      id: "p2",
      author: "them",
      displayName: "Dan",
      body: "eh guys i found legit side hustle 😤 300 bucks just to receive money in my POSB then transfer out",
    },
    {
      id: "p3",
      author: "them",
      displayName: "Dan",
      body: "already sent him my acc number. money coming tonight 🤑",
    },
    {
      id: "p4",
      author: "system",
      body: "Dan is typing…",
    },
  ],
  choices: [
    {
      id: "pc_ignore",
      label: "Ignore it",
      hint: "Not your business — say nothing",
      reply: "(you say nothing and close the chat)",
      outcome: "RISKY",
      immediate: {
        coinDelta: 0,
        resilienceDelta: -10,
        flash: "−10 Resilience",
      },
      feedback:
        "Silence reads as agreement. Dan had six people watching and none of them gave him a reason to stop. Bystander research is consistent on this: the more witnesses there are, the less likely any one of them acts.",
    },
    {
      id: "pc_roast",
      label: "Call him out in the group",
      hint: "Tell everyone he's being scammed",
      reply: "BRO ARE YOU SERIOUS 😂 that's a scam, everyone knows this one",
      outcome: "CAUTIOUS",
      immediate: {
        coinDelta: 5,
        resilienceDelta: 5,
        flash: "+5 Resilience",
      },
      feedback:
        "You said something, which beats silence. But a public callout costs Dan face in front of five friends, and people defend a position harder once they've been embarrassed into it. The message was right; the venue was wrong.",
    },
    {
      id: "pc_private",
      label: "Warn them privately",
      hint: "DM Dan, give him an exit that doesn't cost him face",
      reply: "(DM to Dan) eh don't do that one — receiving + transferring for a stranger is money mule, they freeze your account. call the bank now and stop it, I'll help you.",
      outcome: "SAFE",
      immediate: {
        coinDelta: 40,
        resilienceDelta: 30,
        flash: "+30 Community Resilience Points",
      },
      feedback:
        "This is the highest-scoring intervention. A private message lets Dan back out without losing face, which is the single biggest barrier to a peer changing their mind. You named the risk, you didn't shame him, and you gave him something to do next — tell him to stop the transfer and call the bank.",
    },
    {
      id: "pc_report",
      label: "Report the recruiter",
      hint: "Escalate the account to ScamShield",
      reply: "(you report the recruiter's account to ScamShield)",
      outcome: "SAFE",
      immediate: {
        coinDelta: 35,
        resilienceDelta: 25,
        flash: "+25 Community Resilience Points",
      },
      feedback:
        "Strong — this protects everyone the recruiter contacts next, not just Dan. Pair it with a private warning to Dan himself and you cover both the immediate risk and the source.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* View 3 — Scenario Management Portal                                 */
/* ------------------------------------------------------------------ */

export const MOCK_ADMIN_SCENARIOS: AdminScenarioRow[] = [
  {
    id: "scn_money_mule_01",
    title: "Easy Money",
    threatType: "Money Mule",
    ageGroup: "16–18",
    status: "LIVE",
    safeDecisionRate: 61,
    previousSafeDecisionRate: 54,
    plays: 2841,
    competencies: ["SPOT", "HOLD", "EVALUATE"],
    updatedBy: "SSgt Lim",
    updatedOn: "12 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_shop_theft_01",
    title: "The Dare at Checkout",
    threatType: "Shop Theft",
    ageGroup: "13–15",
    status: "LIVE",
    safeDecisionRate: 74,
    previousSafeDecisionRate: 71,
    plays: 3960,
    competencies: ["SPOT", "IDENTIFY", "LEAD"],
    updatedBy: "Insp Rahman",
    updatedOn: "09 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_job_scam_01",
    title: "S$800 A Day, No Experience",
    threatType: "Job Scam",
    ageGroup: "16–18",
    status: "LIVE",
    safeDecisionRate: 48,
    previousSafeDecisionRate: 57,
    plays: 1874,
    competencies: ["IDENTIFY", "EVALUATE"],
    updatedBy: "SSgt Lim",
    updatedOn: "14 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_ecom_01",
    title: "Concert Tickets, Cash Only",
    threatType: "E-Commerce Scam",
    ageGroup: "13–21",
    status: "LIVE",
    safeDecisionRate: 82,
    previousSafeDecisionRate: 80,
    plays: 5120,
    competencies: ["SPOT", "HOLD"],
    updatedBy: "Cpl Yeo",
    updatedOn: "02 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_flash_qr_01",
    title: "Carpark QR Swap",
    threatType: "Phishing QR",
    ageGroup: "16–18",
    status: "LIVE",
    safeDecisionRate: 39,
    previousSafeDecisionRate: 39,
    plays: 412,
    competencies: ["SPOT", "IDENTIFY"],
    updatedBy: "Insp Rahman",
    updatedOn: "18 Aug 2026",
    isFlashMission: true,
  },
  {
    id: "scn_vape_01",
    title: "Just Hold It For Me",
    threatType: "Vape Possession",
    ageGroup: "13–15",
    status: "DRAFT",
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    plays: 0,
    competencies: ["HOLD", "DEFEND"],
    updatedBy: "Cpl Yeo",
    updatedOn: "17 Aug 2026",
    isFlashMission: false,
  },
  {
    id: "scn_loan_01",
    title: "Runner for a Day",
    threatType: "Unlicensed Moneylending",
    ageGroup: "16–18",
    status: "SCHEDULED",
    safeDecisionRate: 0,
    previousSafeDecisionRate: 0,
    plays: 0,
    competencies: ["EVALUATE", "LEAD"],
    updatedBy: "SSgt Lim",
    updatedOn: "16 Aug 2026",
    isFlashMission: false,
  },
];
