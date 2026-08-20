// ============================================================
// 살(煞) — 전통 택일에서 보는 날
//
// 표마다 출처와 확정도를 함께 적는다. 근거가 다른 것을 한 덩어리로
// 뭉뚱그리면 화면에서 정직하게 설명할 수 없기 때문이다.
//
// 반영
//   · 월기일     — 음력 5·14·23일
//   · 고초일     — 음력 월별 일지(日支). 『하은일록』 「경람」 · 1908 필사본 『택일법』
//   · 십악대패일 — 『선택기요』 무록일 계열 고정 10간지. 당일 일진만 본다
//   · 가취월     — 신부 띠별 대리월(大利月). 『연길택일예목』 · 『류편역법통서대전』 권7
//   · 살부대기월 — 통용표. 원전 미확인이라 출처를 한정해 쓴다
//
// 반영하지 않음
//   · 대공망일 — 목록은 확인됐으나 혼인용이 아니다 (아래 주석 참고)
// ============================================================

/** 지지 한자 순서 — 자축인묘진사오미신유술해 */
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ── 월기일 ───────────────────────────────────────────────────

/**
 * 월기일(月忌日) — 음력 5·14·23일.
 * 한 달을 셋으로 나눈 각 구간의 다섯째 날로, 예부터 큰일을 벌이지 않는 날로 본다.
 */
export function isWolgiil(lunarDay: number): boolean {
  return lunarDay === 5 || lunarDay === 14 || lunarDay === 23;
}

// ── 고초일 ───────────────────────────────────────────────────

/**
 * 고초일(枯焦日) — 음력 월별로 정해진 일지(日支)의 날.
 * 날짜 숫자가 아니라 그날 일진의 지지로 판정한다.
 * 예) 정월에는 일지가 辰인 날(갑진·병진·무진·경진·임진일)이 고초일.
 *
 * 출처: 국사편찬위원회 공개 원문 『하은일록』 부록 「경람」,
 *       국립한글박물관 소장 1908년 필사본 『택일법』 (같은 배열 확인)
 */
export const GOCHOIL_BRANCH_BY_LUNAR_MONTH: Record<number, string> = {
  1: '辰',
  2: '丑',
  3: '戌',
  4: '未',
  5: '卯',
  6: '子',
  7: '酉',
  8: '午',
  9: '寅',
  10: '亥',
  11: '申',
  12: '巳',
};

/** @param dayBranchHanja 그날 일진의 지지 한자 */
export function isGochoil(lunarMonth: number, dayBranchHanja: string): boolean {
  return GOCHOIL_BRANCH_BY_LUNAR_MONTH[lunarMonth] === dayBranchHanja;
}

// ── 십악대패일 ───────────────────────────────────────────────

/**
 * 십악대패일(十惡大敗日) — 『선택기요』 무록일(無祿日) 계열 고정 10간지.
 * 그날의 일진이 이 열 개 중 하나인지만 본다.
 *
 * ⚠ 여섯 번째는 己丑이다. 인터넷 표에 흔한 乙丑은 오류로 보인다.
 * ⚠ 『삼명통회』 「논십악대패」에는 연·일 조합설(『원백경』),
 *    연간·월·일 조합설(『현황경』) 같은 다른 체계도 함께 실려 있다.
 *    그쪽은 명리 이설이므로 이 택일 규칙에 섞지 않는다.
 */
export const SIPAK_DAEPAE_ILJIN = [
  '甲辰', '乙巳', '丙申', '丁亥', '戊戌',
  '己丑', '庚辰', '辛巳', '壬申', '癸亥',
] as const;

/** @param iljinHanja 일진 두 글자 (천간+지지 한자) */
export function isSipakDaepaeil(iljinHanja: string): boolean {
  return (SIPAK_DAEPAE_ILJIN as readonly string[]).includes(iljinHanja);
}

// ── 대공망일 (반영하지 않음) ─────────────────────────────────

/**
 * 대공망일(大空亡日) — 고정 12간지.
 *
 * ⚠ 점수에 쓰지 않는다.
 *   남병길 『선택기요』 하편에서 대공망일은 파토·사초·입석 등
 *   묘지·장사 관련 작업에 쓸 수 있는 "길일" 요소로 든다.
 *   혼인·이사·계약에 일률적인 감점 살로 넣으면 근거가 맞지 않는다.
 *
 * 판정은 고정 목록 대조 방식이다 — 순(旬)마다 두 공망 지지를 구하는
 * 일반적인 순공망 계산으로 구현하면 안 된다.
 *
 * 출처: 『하은일록』 「경람」
 */
export const DAEGONGMANG_ILJIN = [
  '甲戌', '甲申', '甲午', '乙丑', '乙亥', '乙酉',
  '壬辰', '壬寅', '壬子', '癸未', '癸巳', '癸卯',
] as const;

// ── 가취월 · 살부대기월 (신부 띠 기준) ───────────────────────

/**
 * 가취월(嫁娶月) 중 대리월(大利月) — 신부 띠별로 혼인에 좋은 음력월.
 *
 * ⚠ 전통 표는 대리월 하나가 아니라 방매씨·방옹고·방여부모·방부주·방여신 등
 *   여섯 단계로 나뉜다. 여기서는 대리월만 가점으로 쓰고,
 *   나머지 단계를 "나쁜 달"로 단순화하지 않는다.
 *
 * 출처: 국립민속박물관 필사본 『연길택일예목』,
 *       『류편역법통서대전』 권7 (같은 배열 확인)
 */
export const DAERIWOL_BY_ANIMAL: Record<string, number[]> = {
  쥐: [6, 12],
  소: [5, 11],
  호랑이: [2, 8],
  토끼: [1, 7],
  용: [4, 10],
  뱀: [3, 9],
  말: [6, 12],
  양: [5, 11],
  원숭이: [2, 8],
  닭: [1, 7],
  개: [4, 10],
  돼지: [3, 9],
};

/**
 * 살부대기월(殺夫大忌月) — 신부 띠별로 혼인을 피하는 음력월.
 *
 * ⚠ 원전을 확인하지 못했다. 현대 통용표(사주플러스·역학사전 계열) 기준이며,
 *   토끼띠(12월 vs 11월)와 돼지띠(7·8월 vs 해당 없음)에 이본이 있다.
 *   화면에 『천기대요』 기준이라고 표기하면 안 된다.
 */
export const SALBU_DAEGIWOL_BY_ANIMAL: Record<string, number[]> = {
  쥐: [1, 2],
  소: [4],
  호랑이: [7],
  토끼: [12],
  용: [4],
  뱀: [5],
  말: [8, 12],
  양: [6, 7],
  원숭이: [6, 7],
  닭: [8],
  개: [12],
  돼지: [7, 8],
};

/** 이본이 있어 화면에서 따로 알리는 띠 */
export const SALBU_VARIANT_ANIMALS = ['토끼', '돼지'] as const;

export function isDaeriwol(brideAnimal: string, lunarMonth: number): boolean {
  return (DAERIWOL_BY_ANIMAL[brideAnimal] ?? []).includes(lunarMonth);
}

export function isSalbuDaegiwol(brideAnimal: string, lunarMonth: number): boolean {
  return (SALBU_DAEGIWOL_BY_ANIMAL[brideAnimal] ?? []).includes(lunarMonth);
}

// ── 화면 표기용 ──────────────────────────────────────────────

/** 반영한 살과 그 근거 — 화면이 그대로 읽어 쓴다 */
export const SAL_SOURCES: {
  name: string;
  /** 이름만으로는 뜻을 알 수 없어, 한 줄 풀이를 함께 보여준다 */
  meaning: string;
  source: string;
  note?: string;
}[] = [
  {
    name: '월기일',
    meaning: '달마다 꺼리는 세 날',
    source: '음력 5·14·23일',
  },
  {
    name: '고초일',
    meaning: '메마른 날 — 혼인을 피하던 날',
    source: '『하은일록』 「경람」 · 1908년 필사본 『택일법』',
  },
  {
    name: '십악대패일',
    meaning: '크게 꺼리는 열 가지 날',
    source: '『선택기요』 무록일 기준 (당일 일진 고정 10간지)',
  },
  {
    name: '가취월',
    meaning: '신부 띠로 보는, 혼인하기 좋은 달',
    source: '『연길택일예목』 · 『류편역법통서대전』 권7',
    note: '여섯 단계 중 가장 좋은 달만 가점으로 반영',
  },
  {
    name: '살부대기월',
    meaning: '신부 띠로 보아 혼인을 미루던 달',
    source: '사주플러스·역학사전 계열 통용표',
    note: '원전 미확인 · 토끼띠와 돼지띠에 이본 있음',
  },
];

/** 일부러 넣지 않은 것 — 왜 뺐는지까지 알린다 */
export const SAL_EXCLUDED: { name: string; reason: string }[] = [
  {
    name: '대공망일',
    reason:
      '『선택기요』에서 묘지·장사 관련 길일로 드는 날이라, 혼인 택일의 감점으로 쓰지 않았습니다.',
  },
];

export const APPLIED_SAL = SAL_SOURCES.map((s) => s.name);

/** 지지 한자로 띠 이름을 얻는다 */
export function animalOfBranch(branchHanja: string): string | undefined {
  const idx = BRANCHES.indexOf(branchHanja);
  if (idx < 0) return undefined;
  return ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'][idx];
}
