// ============================================================
// 신살(神煞) 종합 — 사주에 깃든 별들
//
// 재미와 통찰을 주는 대표 신살만 담는다.
//  · 길신: 천을귀인 · 문창귀인 · 화개살(예술) · 역마살(이동)
//  · 강한 별: 괴강 · 백호 — 겁주지 않고 "강한 기운" 으로 순화
//  · 공망 — "비어 있어 자유로운 자리" 로 순화
//  * 도화살은 "내 매력의 결" 섹션(sinsal-love)에서 따로 다룬다.
//
// 해석 원칙 — 나쁜 살도 쓰임새로 풀어준다. 단정 금지, "~예요" 체.
// ============================================================

import { CHEONGAN, JIJI, type SajuResult, type JiJi } from './saju';

export type SinsalId =
  | 'cheoneul' // 천을귀인
  | 'munchang' // 문창귀인
  | 'yeokma'   // 역마살
  | 'hwagae'   // 화개살
  | 'goegang'  // 괴강
  | 'baekho'   // 백호
  | 'gongmang'; // 공망

export interface SinsalHit {
  id: SinsalId;
  name: string;
  hanja: string;
  emoji: string;
  /** 어느 자리에서 발견되었는지 */
  positions: string[];
  /** 한 줄 정의 */
  tagline: string;
  /** 풀이 2~3문장 — 긍정 프레임 */
  reading: string;
  /** 실생활 팁 한 줄 */
  tip: string;
}

export interface SinsalResult {
  hits: SinsalHit[];
  /** 발견된 별 개수 */
  count: number;
  /** 아무것도 없을 때의 안내 */
  emptyNote: string;
}

// ─── 조견표 ────────────────────────────────────────────────

/** 삼합 그룹 인덱스: 지지 index → 그룹 (0 신자진 / 1 인오술 / 2 사유축 / 3 해묘미) */
const SAMHAP_GROUP: number[] = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3];
// 자(0)→신자진(0), 축(1)→사유축(2), 인(2)→인오술(1), 묘(3)→해묘미(3),
// 진(4)→신자진(0), 사(5)→사유축(2), 오(6)→인오술(1), 미(7)→해묘미(3),
// 신(8)→신자진(0), 유(9)→사유축(2), 술(10)→인오술(1), 해(11)→해묘미(3)

/** 삼합 그룹 → 역마 지지 index (신자진→인2, 인오술→신8, 사유축→해11, 해묘미→사5) */
const YEOKMA_OF_GROUP = [2, 8, 11, 5];

/** 삼합 그룹 → 화개 지지 index (신자진→진4, 인오술→술10, 사유축→축1, 해묘미→미7) */
const HWAGAE_OF_GROUP = [4, 10, 1, 7];

/** 천을귀인 — 일간 index → 귀인 지지 index 목록 */
const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], // 갑 → 축·미
  1: [0, 8], // 을 → 자·신
  2: [11, 9], // 병 → 해·유
  3: [11, 9], // 정 → 해·유
  4: [1, 7], // 무 → 축·미
  5: [0, 8], // 기 → 자·신
  6: [1, 7], // 경 → 축·미
  7: [2, 6], // 신 → 인·오
  8: [5, 3], // 임 → 사·묘
  9: [5, 3], // 계 → 사·묘
};

/** 문창귀인 — 일간 index → 지지 index */
const MUNCHANG: Record<number, number> = {
  0: 5,  // 갑 → 사
  1: 6,  // 을 → 오
  2: 8,  // 병 → 신
  3: 9,  // 정 → 유
  4: 8,  // 무 → 신
  5: 9,  // 기 → 유
  6: 11, // 경 → 해
  7: 0,  // 신 → 자
  8: 2,  // 임 → 인
  9: 3,  // 계 → 묘
};

/** 괴강 일주 — 경진·경술·임진·임술·무술 */
const GOEGANG: [number, number][] = [
  [6, 4], [6, 10], [8, 4], [8, 10], [4, 10],
];

/** 백호 일주 — 갑진·을미·병술·정축·무진·임술·계축 */
const BAEKHO: [number, number][] = [
  [0, 4], [1, 7], [2, 10], [3, 1], [4, 4], [8, 10], [9, 1],
];

// ─── 메인 ──────────────────────────────────────────────────

export function getSinsal(saju: SajuResult): SinsalResult {
  const hits: SinsalHit[] = [];

  const branchPositions: { pos: string; ji: JiJi }[] = [
    { pos: '년지', ji: saju.yearBranch },
    { pos: '월지', ji: saju.monthBranch },
    { pos: '일지', ji: saju.dayBranch },
    { pos: '시지', ji: saju.hourBranch },
  ];
  const ilganIdx = CHEONGAN.indexOf(saju.dayStem);
  const iljiIdx = JIJI.indexOf(saju.dayBranch);
  const yeonjiIdx = JIJI.indexOf(saju.yearBranch);
  const jiIdx = (j: JiJi) => JIJI.indexOf(j);

  // ── 천을귀인 — 하늘이 보낸 귀인
  {
    const targets = CHEONEUL[ilganIdx] ?? [];
    const found = branchPositions.filter((b) => targets.includes(jiIdx(b.ji)));
    if (found.length > 0) {
      hits.push({
        id: 'cheoneul',
        name: '천을귀인',
        hanja: '天乙貴人',
        emoji: '🌟',
        positions: found.map((f) => `${f.pos} ${f.ji.name}(${f.ji.hanja})`),
        tagline: '하늘이 보낸 귀인이 곁에 있는 사주',
        reading:
          '신살 중 으뜸으로 치는 길신이에요. 위기의 순간마다 나를 돕는 사람이 나타나고, 막힌 길에 뜻밖의 문이 열리는 힘이에요. 사람 덕이 큰 사주이니 인연을 소중히 할수록 복이 커져요.',
        tip: '어려울 때 혼자 끙끙대지 말고 손을 내밀어보세요 — 귀인은 청할 때 움직여요.',
      });
    }
  }

  // ── 문창귀인 — 글과 배움의 별
  {
    const target = MUNCHANG[ilganIdx];
    const found = branchPositions.filter((b) => jiIdx(b.ji) === target);
    if (found.length > 0) {
      hits.push({
        id: 'munchang',
        name: '문창귀인',
        hanja: '文昌貴人',
        emoji: '📜',
        positions: found.map((f) => `${f.pos} ${f.ji.name}(${f.ji.hanja})`),
        tagline: '글재주와 배움의 복을 타고난 사주',
        reading:
          '공부·글쓰기·시험에 힘을 실어주는 별이에요. 이해력이 빠르고 표현이 정갈해서, 배운 것을 자기 언어로 풀어내는 재주가 있어요. 시험운이 따르는 별이라 도전을 겁내지 않아도 돼요.',
        tip: '생각을 글로 남기는 습관을 들이면 이 별의 힘이 두 배가 돼요.',
      });
    }
  }

  // ── 역마살 — 이동과 확장의 별 (년지·일지 삼합 기준)
  {
    const targets = new Set([
      YEOKMA_OF_GROUP[SAMHAP_GROUP[yeonjiIdx]],
      YEOKMA_OF_GROUP[SAMHAP_GROUP[iljiIdx]],
    ]);
    const found = branchPositions.filter((b) => targets.has(jiIdx(b.ji)));
    if (found.length > 0) {
      hits.push({
        id: 'yeokma',
        name: '역마살',
        hanja: '驛馬煞',
        emoji: '🐎',
        positions: found.map((f) => `${f.pos} ${f.ji.name}(${f.ji.hanja})`),
        tagline: '한곳에 머무르지 않는 이동과 확장의 별',
        reading:
          '옛날엔 떠돌이 살이라 했지만, 지금은 글로벌 시대의 축복이에요. 여행·이사·해외·출장처럼 움직일수록 운이 열리고, 낯선 환경에 빨리 적응하는 힘이 있어요. 가만히 있으면 오히려 답답해지는 기질이에요.',
        tip: '막히는 느낌이 들 땐 환경을 바꿔보세요 — 움직임 자체가 개운(開運)이 돼요.',
      });
    }
  }

  // ── 화개살 — 예술과 사색의 별 (년지·일지 삼합 기준)
  {
    const targets = new Set([
      HWAGAE_OF_GROUP[SAMHAP_GROUP[yeonjiIdx]],
      HWAGAE_OF_GROUP[SAMHAP_GROUP[iljiIdx]],
    ]);
    const found = branchPositions.filter((b) => targets.has(jiIdx(b.ji)));
    if (found.length > 0) {
      hits.push({
        id: 'hwagae',
        name: '화개살',
        hanja: '華蓋煞',
        emoji: '🎨',
        positions: found.map((f) => `${f.pos} ${f.ji.name}(${f.ji.hanja})`),
        tagline: '예술적 감성과 깊은 사색의 별',
        reading:
          '화려함을 덮는다는 이름처럼, 홀로 있는 시간에 깊어지는 별이에요. 예술·종교·철학·학문처럼 정신의 깊이가 필요한 영역에서 재능이 피어나요. 고독을 외로움이 아니라 창작의 연료로 쓰는 사주예요.',
        tip: '혼자만의 작업 시간을 일부러 만들어두세요 — 거기서 가장 좋은 것이 나와요.',
      });
    }
  }

  // ── 괴강 — 우두머리의 별 (일주 기준)
  {
    const isGoegang = GOEGANG.some(
      ([g, j]) => g === ilganIdx && j === iljiIdx
    );
    if (isGoegang) {
      hits.push({
        id: 'goegang',
        name: '괴강',
        hanja: '魁罡',
        emoji: '⚔️',
        positions: [`일주 ${saju.dayStem.name}${saju.dayBranch.name}(${saju.dayStem.hanja}${saju.dayBranch.hanja})`],
        tagline: '무리를 이끄는 우두머리의 별',
        reading:
          '총명함과 결단력, 강한 카리스마를 타고난 별이에요. 위기에서 오히려 침착해지고, 남들이 주저할 때 앞장서는 힘이 있어요. 기운이 강한 만큼 부드러움을 더하면 따르는 사람이 많아져요.',
        tip: '강함은 이미 충분해요 — 한 번 더 듣고 한 박자 늦게 말하면 완성돼요.',
      });
    }
  }

  // ── 백호 — 강렬한 승부사의 별 (일주 기준)
  {
    const isBaekho = BAEKHO.some(
      ([g, j]) => g === ilganIdx && j === iljiIdx
    );
    if (isBaekho) {
      hits.push({
        id: 'baekho',
        name: '백호',
        hanja: '白虎',
        emoji: '🐯',
        positions: [`일주 ${saju.dayStem.name}${saju.dayBranch.name}(${saju.dayStem.hanja}${saju.dayBranch.hanja})`],
        tagline: '호랑이처럼 강렬한 에너지의 별',
        reading:
          '옛 문헌에선 무섭게 그려졌지만, 현대 명리에서는 프로 승부사의 별로 읽어요. 집중력과 몰입이 남달라서 전문 분야에서 일가를 이루는 힘이 있어요. 강한 에너지를 일과 운동으로 흘려보내면 최고의 무기가 돼요.',
        tip: '에너지가 넘칠 땐 몸을 움직이세요 — 이 별은 쓰면 약, 묵히면 독이에요.',
      });
    }
  }

  // ── 공망 — 비어 있어 자유로운 자리 (일주 기준 순중공망)
  {
    const gapjaIdx = (() => {
      for (let i = 0; i < 60; i++) {
        if (i % 10 === ilganIdx && i % 12 === iljiIdx) return i;
      }
      return 0;
    })();
    const soon = Math.floor(gapjaIdx / 10); // 순(旬) 번호
    const gm1 = (10 - soon * 2 + 12 * 3) % 12;
    const gm2 = (11 - soon * 2 + 12 * 3) % 12;
    const targets = new Set([gm1, gm2]);
    // 일지 자신은 제외하고 년·월·시지에서 찾는다
    const found = branchPositions.filter(
      (b) => b.pos !== '일지' && targets.has(jiIdx(b.ji))
    );
    if (found.length > 0) {
      hits.push({
        id: 'gongmang',
        name: '공망',
        hanja: '空亡',
        emoji: '🌫️',
        positions: found.map((f) => `${f.pos} ${f.ji.name}(${f.ji.hanja})`),
        tagline: '비어 있어 오히려 자유로운 자리',
        reading:
          '그 자리의 기운이 반쯤 비어 있다는 뜻인데, 나쁜 게 아니라 세속의 욕심에서 자유로운 자리로 읽어요. 물질보다 정신적 가치에서 만족을 찾을 때 채워지는 별이에요. 비어 있기에 무엇이든 새로 담을 수 있어요.',
        tip: '이 자리는 소유보다 경험으로 채우세요 — 배움·여행·수행이 잘 어울려요.',
      });
    }
  }

  return {
    hits,
    count: hits.length,
    emptyNote:
      '뚜렷하게 드러난 별이 없어요. 신살이 없다는 건 큰 굴곡 없이 내 실력대로 흘러가는 담백한 사주라는 뜻이에요 — 오히려 꾸준함이 무기가 돼요.',
  };
}
