// ============================================================
// 십성(十星) — 타고난 재능과 일의 결
//
// 일간(나)을 기준으로 나머지 일곱 글자를 열 가지 별로 분류한다.
//  · 같은 오행: 비견(음양 같음) / 겁재(다름)      → 비겁(주체·동료)
//  · 내가 생하는: 식신(같음) / 상관(다름)         → 식상(표현·창작)
//  · 내가 극하는: 편재(같음) / 정재(다름)         → 재성(실속·운용)
//  · 나를 극하는: 편관(같음) / 정관(다름)         → 관성(책임·조직)
//  · 나를 생하는: 편인(같음) / 정인(다름)         → 인성(배움·직관)
//
// 지지는 정기(正氣) 지장간으로 음양·오행을 판정한다.
// 해석 원칙 — 직업을 단정하지 않는다. "이런 결이 강해요" 로 안내.
// ============================================================

import type { SajuResult, Oheng, CheonGan } from './saju';
import {
  getSipseongGroup,
  getJeonggi,
  findGan,
  type SipseongGroup,
} from './yongsin';

// ─── 타입 ──────────────────────────────────────────────────

export type SipseongName =
  | '비견' | '겁재'
  | '식신' | '상관'
  | '편재' | '정재'
  | '편관' | '정관'
  | '편인' | '정인';

export interface SipseongEntry {
  /** 자리 이름 */
  position: '년간' | '월간' | '시간' | '년지' | '월지' | '일지' | '시지';
  /** 글자 (한글·한자) */
  letter: string;
  hanja: string;
  name: SipseongName;
  group: SipseongGroup;
}

export interface SipseongResult {
  /** 일곱 글자 각각의 십성 */
  entries: SipseongEntry[];
  /** 10성 개수 */
  counts: Record<SipseongName, number>;
  /** 5그룹 개수 */
  groupCounts: Record<SipseongGroup, number>;
  /** 가장 강한 결 */
  dominant: SipseongGroup;
  /** 두 번째 결 (동률·0이면 null) */
  secondary: SipseongGroup | null;
  /** 아예 없는 결 */
  missing: SipseongGroup[];
  /** 나의 재능 헤드라인 */
  headline: string;
  /** 재능 풀이 문단 */
  talent: string;
  /** 어울리는 일의 결 (직군 예시) */
  careers: string[];
  /** 돈 버는 방식 */
  moneyStyle: string;
  /** 일할 때 스타일 */
  workStyle: string;
  /** 없는 결에 대한 안내 (없으면 null) */
  missingNote: string | null;
}

// ─── 십성 이름 판정 ─────────────────────────────────────────

function sipseongName(
  group: SipseongGroup,
  sameYin: boolean
): SipseongName {
  switch (group) {
    case '비겁': return sameYin ? '비견' : '겁재';
    case '식상': return sameYin ? '식신' : '상관';
    case '재성': return sameYin ? '편재' : '정재';
    case '관성': return sameYin ? '편관' : '정관';
    case '인성': return sameYin ? '편인' : '정인';
  }
}

/** 십성 이름 → 짧은 뜻 (UI 툴팁용) */
export const SIPSEONG_MEANING: Record<SipseongName, string> = {
  비견: '나와 같은 힘 — 자립심·동료',
  겁재: '경쟁하는 힘 — 승부욕·추진',
  식신: '즐기며 만드는 힘 — 재주·여유',
  상관: '뽐내는 힘 — 표현·아이디어',
  편재: '크게 굴리는 힘 — 사업·유통',
  정재: '알뜰히 모으는 힘 — 관리·성실',
  편관: '밀어붙이는 힘 — 결단·카리스마',
  정관: '바르게 지키는 힘 — 책임·신뢰',
  편인: '남다르게 배우는 힘 — 직관·전문성',
  정인: '깊이 배우는 힘 — 학문·자격',
};

// ─── 그룹별 풀이 ────────────────────────────────────────────

const GROUP_READING: Record<
  SipseongGroup,
  {
    headline: string;
    talent: string;
    careers: string[];
    moneyStyle: string;
    workStyle: string;
    missing: string;
  }
> = {
  비겁: {
    headline: '스스로 길을 내는 개척자의 결',
    talent:
      '남에게 기대기보다 내 힘으로 해내려는 기질이 강해요. 승부처에서 밀리지 않는 뚝심과 추진력이 가장 큰 재산이에요. 함께 뛰는 동료를 만나면 힘이 배가 되지만, 주도권은 내 손에 있을 때 가장 잘 풀려요.',
    careers: ['창업·자영업', '영업·세일즈', '스포츠·트레이너', '프리랜서', '현장 리더'],
    moneyStyle:
      '남이 주는 월급보다 내가 직접 만들어내는 돈의 그릇이 커요. 다만 동업은 지분과 역할을 처음부터 분명히 하는 게 좋아요.',
    workStyle: '지시받기보다 주도할 때 성과가 나는 타입 — 재량이 큰 자리가 맞아요.',
    missing:
      '비겁이 없으면 혼자 밀어붙이는 힘은 약한 대신, 주변과 조화를 이루는 데 능해요. 좋은 파트너를 곁에 두면 약점이 사라져요.',
  },
  식상: {
    headline: '표현하고 만들어내는 창작자의 결',
    talent:
      '머릿속 생각을 말·글·솜씨로 꺼내는 능력이 타고났어요. 아이디어가 마르지 않고, 사람들에게 즐거움을 주는 재주가 있어요. 표현할 통로가 있을 때 운이 살아나고, 막히면 답답함이 쌓이는 타입이에요.',
    careers: ['크리에이터·방송', '요리·베이킹', '교육·강의', '기획·콘텐츠', '예술·디자인'],
    moneyStyle:
      '재능이 곧 돈이 되는 구조가 잘 맞아요. 내 이름으로 쌓은 실력과 팬이 자산이 돼요.',
    workStyle: '자유로운 분위기에서 아이디어가 터지는 타입 — 딱딱한 틀은 답답해요.',
    missing:
      '식상이 없으면 표현은 서툴 수 있지만, 그만큼 말이 무겁고 신중해요. 결과물로 보여주는 방식이 잘 맞아요.',
  },
  재성: {
    headline: '기회를 실속으로 바꾸는 사업가의 결',
    talent:
      '돈과 기회의 흐름을 읽는 현실 감각이 뛰어나요. 사람을 폭넓게 사귀고, 그 관계를 실질적인 결과로 연결하는 힘이 있어요. 숫자와 시장에 밝아 무엇이 값어치 있는지 빠르게 알아봐요.',
    careers: ['사업·경영', '금융·투자', '유통·커머스', '마케팅·영업기획', '부동산'],
    moneyStyle:
      '모으는 것보다 굴리는 데 재능이 있어요. 돈이 돈을 벌게 하는 구조를 만들면 크게 자라요.',
    workStyle: '성과가 눈에 보이는 일에서 몰입하는 타입 — 결과로 평가받는 자리가 맞아요.',
    missing:
      '재성이 없으면 잇속 계산에 서툴 수 있지만, 그만큼 순수하게 일 자체에 몰입해요. 돈 관리는 시스템(자동이체·적립)에 맡기면 좋아요.',
  },
  관성: {
    headline: '믿고 맡길 수 있는 리더의 결',
    talent:
      '책임감과 자기 관리가 몸에 배어 있어요. 조직과 규칙 안에서 신뢰를 쌓아 올라가는 힘이 강하고, 어려운 순간에도 자리를 지키는 묵직함이 있어요. 명예와 평판이 곧 힘이 되는 사주예요.',
    careers: ['공직·행정', '대기업·관리자', '법률·감사', '군·경·안전', '프로젝트 매니저'],
    moneyStyle:
      '자리가 오르면 돈이 따라오는 구조예요. 한탕보다 승진·연봉·신용을 차곡차곡 쌓는 쪽이 결이 맞아요.',
    workStyle: '체계와 목표가 분명할 때 최고 성과 — 기준 없는 환경에선 답답해져요.',
    missing:
      '관성이 없으면 조직 생활이 갑갑할 수 있지만, 그만큼 자유롭게 일하는 데 강해요. 스스로 정한 마감과 루틴이 관성의 역할을 대신해줘요.',
  },
  인성: {
    headline: '깊이 파고드는 지혜의 결',
    talent:
      '배우고 이해하고 정리하는 힘이 타고났어요. 남들이 표면을 볼 때 원리를 꿰뚫어 보고, 지식을 자기 것으로 소화하는 속도가 빨라요. 문서·자격·학위처럼 형태가 있는 지식이 든든한 뒷배가 돼요.',
    careers: ['연구·학문', '의료·약학', '출판·글쓰기', '상담·심리', '전문자격(회계·법무 등)'],
    moneyStyle:
      '지식과 자격이 돈이 되는 구조예요. 배움에 쓰는 돈은 아끼지 않아도 결국 크게 돌아와요.',
    workStyle: '충분히 이해한 뒤 움직이는 타입 — 깊이가 필요한 일에서 빛나요.',
    missing:
      '인성이 없으면 이론보다 몸으로 먼저 익히는 타입이에요. 현장 경험이 최고의 스승이 되니, 배움을 실전과 붙여두면 좋아요.',
  },
};

// ─── 메인 ──────────────────────────────────────────────────

export function getSipseong(saju: SajuResult): SipseongResult {
  const ilgan = saju.dayStem;

  /** 천간 한 글자의 십성 판정 */
  const judge = (gan: CheonGan): { name: SipseongName; group: SipseongGroup } => {
    const group = getSipseongGroup(ilgan.oheng, gan.oheng);
    return { name: sipseongName(group, gan.yin === ilgan.yin), group };
  };

  const entries: SipseongEntry[] = [];

  // 천간 3자리 (일간 제외)
  const stems: [SipseongEntry['position'], CheonGan][] = [
    ['년간', saju.yearStem],
    ['월간', saju.monthStem],
    ['시간', saju.hourStem],
  ];
  for (const [position, gan] of stems) {
    const { name, group } = judge(gan);
    entries.push({ position, letter: gan.name, hanja: gan.hanja, name, group });
  }

  // 지지 4자리 — 정기 지장간으로 판정
  const branches: [SipseongEntry['position'], typeof saju.yearBranch][] = [
    ['년지', saju.yearBranch],
    ['월지', saju.monthBranch],
    ['일지', saju.dayBranch],
    ['시지', saju.hourBranch],
  ];
  for (const [position, ji] of branches) {
    const jeonggi = getJeonggi(ji);
    const gan = jeonggi ? findGan(jeonggi.gan) : undefined;
    if (!gan) continue;
    const { name, group } = judge(gan);
    entries.push({ position, letter: ji.name, hanja: ji.hanja, name, group });
  }

  // 집계
  const counts = {
    비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0,
    정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0,
  } as Record<SipseongName, number>;
  const groupCounts = {
    비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0,
  } as Record<SipseongGroup, number>;
  for (const e of entries) {
    counts[e.name] += 1;
    groupCounts[e.group] += 1;
  }

  // 월지는 힘이 가장 큰 자리 — 가중 0.5 를 더해 동률을 가른다
  const weighted: Record<SipseongGroup, number> = { ...groupCounts };
  const wolji = entries.find((e) => e.position === '월지');
  if (wolji) weighted[wolji.group] += 0.5;

  const order: SipseongGroup[] = ['비겁', '식상', '재성', '관성', '인성'];
  const sorted = [...order].sort((a, b) => weighted[b] - weighted[a]);
  const dominant = sorted[0];
  const secondary =
    groupCounts[sorted[1]] > 0 && sorted[1] !== dominant ? sorted[1] : null;
  const missing = order.filter((g) => groupCounts[g] === 0);

  const r = GROUP_READING[dominant];
  const missingNote =
    missing.length > 0
      ? missing.map((g) => GROUP_READING[g].missing).join(' ')
      : null;

  return {
    entries,
    counts,
    groupCounts,
    dominant,
    secondary,
    missing,
    headline: r.headline,
    talent: r.talent,
    careers: r.careers,
    moneyStyle: r.moneyStyle,
    workStyle: r.workStyle,
    missingNote,
  };
}
