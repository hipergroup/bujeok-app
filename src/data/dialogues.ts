// ============================================================
// 상담 대화 (對話) 트리 — 카테고리별 대화 흐름
// 따뜻하고 지지적인 말투로 작성
// ============================================================

import { TalismanCategory } from './talismans';

/** 대화 단계 */
export interface ConsultStep {
  id: string;
  question: string;
  /** 보기(버튼)로 제시할 선택지 */
  options?: string[];
  /**
   * 자유 입력 "전용" 단계 여부.
   *
   * ⚠️ 참고: options 가 있는 단계에서도 UI 는 항상 "✏️ 직접 입력할게요"를
   * 함께 제공합니다. 보기 중에 자신의 마음에 맞는 것이 없을 수 있기 때문입니다.
   * 즉 freeText 는 "자유 입력만 가능한 단계"를 뜻합니다.
   */
  freeText?: boolean;
  /** 직접 입력 시 보여줄 안내 문구 */
  freeTextPlaceholder?: string;
  next: string | null; // 다음 단계 id (null이면 종료)
  /** 이 단계에서 수집될 키워드 (옵션 선택 시 매핑) */
  keywordMap?: Record<string, string[]>;
}

/**
 * 해당 단계에서 자유 입력을 허용하는지.
 * 모든 단계에서 사용자는 자신의 말로 답할 수 있습니다.
 */
export function allowsFreeText(step: ConsultStep): boolean {
  // options 유무와 관계없이 항상 허용한다.
  return step.freeText !== false;
}

/** 대화 흐름 */
export interface DialogueFlow {
  category: TalismanCategory;
  label: string;
  description: string;
  steps: ConsultStep[];
}

// ─── 수호 (Protection) 대화 흐름 ────────────────────────────

const protectionFlow: DialogueFlow = {
  category: TalismanCategory.Protection,
  label: '수호·액막이',
  description: '불안하거나 나쁜 기운으로부터 보호받고 싶을 때',
  steps: [
    {
      id: 'prot-1',
      question: '요즘 어떤 것이 불안하세요? 편하게 말씀해 주세요 🙏',
      options: ['직장/학교에서의 문제', '인간관계 갈등', '건강 걱정', '알 수 없는 불안감', '나쁜 꿈이 반복돼요'],
      next: 'prot-2',
      keywordMap: {
        '직장/학교에서의 문제': ['직장보호', '구설'],
        '인간관계 갈등': ['구설', '험담'],
        '건강 걱정': ['건강', '불안'],
        '알 수 없는 불안감': ['액운', '귀신'],
        '나쁜 꿈이 반복돼요': ['악몽', '꿈'],
      },
    },
    {
      id: 'prot-2',
      question: '그 상황에서 가장 바라는 것은 무엇인가요? ✨',
      options: ['마음의 평화', '나쁜 기운 차단', '위험으로부터 보호', '관계 회복', '새로운 시작'],
      next: 'prot-3',
      keywordMap: {
        '마음의 평화': ['불안', '스트레스'],
        '나쁜 기운 차단': ['잡귀', '액운'],
        '위험으로부터 보호': ['교통', '여행'],
        '관계 회복': ['구설', '인연'],
        '새로운 시작': ['개운', '행운'],
      },
    },
    {
      id: 'prot-3',
      question: '오늘 기분을 한 단어로 표현해 주실래요? 💭',
      freeText: true,
      next: 'prot-4',
    },
    {
      id: 'prot-4',
      question: '마지막으로, 특별히 보호받고 싶은 상황이 있나요?',
      options: ['여행/이동할 때', '잠잘 때', '사람들 사이에서', '혼자 있을 때', '딱히 없어요'],
      next: null,
      keywordMap: {
        '여행/이동할 때': ['여행', '교통'],
        '잠잘 때': ['악몽', '불면'],
        '사람들 사이에서': ['구설', '험담'],
        '혼자 있을 때': ['귀신', '불안'],
        '딱히 없어요': ['액운'],
      },
    },
  ],
};

// ─── 재물 (Wealth) 대화 흐름 ────────────────────────────────

const wealthFlow: DialogueFlow = {
  category: TalismanCategory.Wealth,
  label: '재물·사업',
  description: '재물운을 높이고 경제적 안정을 원할 때',
  steps: [
    {
      id: 'wealth-1',
      question: '경제적으로 가장 고민되는 부분은 무엇인가요? 💰',
      options: ['수입이 적어요', '지출이 너무 많아요', '사업이 안 돼요', '취업/이직 고민', '빚 문제가 있어요', '투자 고민'],
      next: 'wealth-2',
      keywordMap: {
        '수입이 적어요': ['돈', '재물'],
        '지출이 너무 많아요': ['돈', '재물'],
        '사업이 안 돼요': ['사업', '장사'],
        '취업/이직 고민': ['취업', '면접'],
        '빚 문제가 있어요': ['빚'],
        '투자 고민': ['돈', '재물', '부동산'],
      },
    },
    {
      id: 'wealth-2',
      question: '재물운에서 가장 원하는 변화는 무엇인가요? 🌟',
      options: ['안정적인 수입', '뜻밖의 횡재', '승진/인정', '새로운 기회', '빚에서 벗어남'],
      next: 'wealth-3',
      keywordMap: {
        '안정적인 수입': ['재물', '돈'],
        '뜻밖의 횡재': ['복권', '당첨', '행운'],
        '승진/인정': ['승진'],
        '새로운 기회': ['취업', '사업'],
        '빚에서 벗어남': ['빚'],
      },
    },
    {
      id: 'wealth-3',
      question: '경제 활동과 관련해서 당신의 현재 상황은요?',
      options: ['직장인', '자영업자', '학생', '구직 중', '프리랜서'],
      next: 'wealth-4',
      keywordMap: {
        '직장인': ['승진', '돈'],
        '자영업자': ['사업', '장사', '매출'],
        '학생': ['돈', '행운'],
        '구직 중': ['취업', '면접'],
        '프리랜서': ['돈', '사업'],
      },
    },
    {
      id: 'wealth-4',
      question: '마지막으로, 돈에 대한 당신의 마음을 들려주세요 💭',
      freeText: true,
      next: null,
    },
  ],
};

// ─── 건강 (Health) 대화 흐름 ────────────────────────────────

const healthFlow: DialogueFlow = {
  category: TalismanCategory.Health,
  label: '건강·치유',
  description: '몸과 마음의 건강을 지키고 싶을 때',
  steps: [
    {
      id: 'health-1',
      question: '건강과 관련해 가장 걱정되는 부분이 있나요? 🍀',
      options: ['몸이 자주 아파요', '마음이 힘들어요', '잠을 잘 못 자요', '수술을 앞두고 있어요', '나쁜 습관을 고치고 싶어요', '전반적으로 기력이 없어요'],
      next: 'health-2',
      keywordMap: {
        '몸이 자주 아파요': ['질병', '병'],
        '마음이 힘들어요': ['불안', '스트레스', '우울'],
        '잠을 잘 못 자요': ['불면', '잠'],
        '수술을 앞두고 있어요': ['수술'],
        '나쁜 습관을 고치고 싶어요': ['금연', '다이어트'],
        '전반적으로 기력이 없어요': ['건강', '장수'],
      },
    },
    {
      id: 'health-2',
      question: '건강을 위해 가장 바라는 것은 무엇인가요? ✨',
      options: ['빠른 쾌유', '마음의 안정', '꾸준한 건강 유지', '나쁜 습관 끊기', '편안한 수면'],
      next: 'health-3',
      keywordMap: {
        '빠른 쾌유': ['질병', '수술'],
        '마음의 안정': ['불안', '스트레스'],
        '꾸준한 건강 유지': ['건강', '장수'],
        '나쁜 습관 끊기': ['금연', '다이어트'],
        '편안한 수면': ['불면', '잠', '악몽'],
      },
    },
    {
      id: 'health-3',
      question: '지금 몸과 마음의 상태를 자유롭게 적어주세요 🌿',
      freeText: true,
      next: 'health-4',
    },
    {
      id: 'health-4',
      question: '이 부적을 누구를 위해 만드시나요? 💛',
      options: ['나 자신을 위해', '가족을 위해', '친구를 위해', '반려동물을 위해'],
      next: null,
      keywordMap: {
        '나 자신을 위해': ['건강'],
        '가족을 위해': ['건강', '효도', '부모'],
        '친구를 위해': ['건강', '인연'],
        '반려동물을 위해': ['반려동물'],
      },
    },
  ],
};

// ─── 가정 (Family) 대화 흐름 ────────────────────────────────

const familyFlow: DialogueFlow = {
  category: TalismanCategory.Family,
  label: '가정·인연',
  description: '가정의 화목과 좋은 인연을 기원할 때',
  steps: [
    {
      id: 'family-1',
      question: '가정이나 인연에서 가장 소중하게 여기는 것은 무엇인가요? 🏠',
      options: ['가족의 화목', '부부/연인 관계', '자녀의 행복', '좋은 인연 만남', '부모님 건강'],
      next: 'family-2',
      keywordMap: {
        '가족의 화목': ['가정', '가족'],
        '부부/연인 관계': ['부부', '결혼생활'],
        '자녀의 행복': ['자녀', '아이'],
        '좋은 인연 만남': ['결혼', '연애', '인연'],
        '부모님 건강': ['부모', '효도'],
      },
    },
    {
      id: 'family-2',
      question: '요즘 가정에서 고민이 되는 부분이 있다면요? 💭',
      options: ['가족 간 갈등', '외로움', '결혼 고민', '육아 스트레스', '이사/주거 문제', '특별한 고민은 없어요'],
      next: 'family-3',
      keywordMap: {
        '가족 간 갈등': ['가정', '가족'],
        '외로움': ['인연', '연애'],
        '결혼 고민': ['결혼'],
        '육아 스트레스': ['자녀', '아이'],
        '이사/주거 문제': ['이사', '집'],
        '특별한 고민은 없어요': ['가정'],
      },
    },
    {
      id: 'family-3',
      question: '가정의 행복을 위해 가장 바라는 것은 무엇인가요? 🌸',
      options: ['서로 이해하기', '건강한 가족', '좋은 집', '아이 태어남', '반려동물과 행복'],
      next: 'family-4',
      keywordMap: {
        '서로 이해하기': ['부부', '가족'],
        '건강한 가족': ['건강', '가정'],
        '좋은 집': ['이사', '집', '부동산'],
        '아이 태어남': ['임신', '아이'],
        '반려동물과 행복': ['반려동물'],
      },
    },
    {
      id: 'family-4',
      question: '사랑하는 사람에게 하고 싶은 한마디를 적어주세요 💕',
      freeText: true,
      next: null,
    },
  ],
};

// ─── 학업 (Study) 대화 흐름 ─────────────────────────────────

const studyFlow: DialogueFlow = {
  category: TalismanCategory.Study,
  label: '학업·시험',
  description: '시험 합격과 학업 성취를 기원할 때',
  steps: [
    {
      id: 'study-1',
      question: '어떤 학업/시험 목표가 있으신가요? 📚',
      options: ['대입 수능/입시', '자격증 시험', '승진 시험', '어학 시험', '기타 공부', '특별한 시험은 없어요'],
      next: 'study-2',
      keywordMap: {
        '대입 수능/입시': ['수능', '대학', '합격'],
        '자격증 시험': ['자격증', '시험'],
        '승진 시험': ['승진', '시험'],
        '어학 시험': ['시험', '합격'],
        '기타 공부': ['공부', '집중'],
        '특별한 시험은 없어요': ['공부', '창의'],
      },
    },
    {
      id: 'study-2',
      question: '공부할 때 가장 어려운 점은 무엇인가요? 🤔',
      options: ['집중이 안 돼요', '암기가 어려워요', '시간이 부족해요', '의욕이 없어요', '불안해서 공부가 안 돼요'],
      next: 'study-3',
      keywordMap: {
        '집중이 안 돼요': ['집중'],
        '암기가 어려워요': ['암기'],
        '시간이 부족해요': ['집중', '공부'],
        '의욕이 없어요': ['공부', '행운'],
        '불안해서 공부가 안 돼요': ['불안', '시험'],
      },
    },
    {
      id: 'study-3',
      question: '시험/학업에서 가장 바라는 결과는요? ⭐',
      options: ['반드시 합격!', '성적 향상', '꾸준한 실력 쌓기', '창의적 아이디어', '좋은 학습 습관'],
      next: 'study-4',
      keywordMap: {
        '반드시 합격!': ['합격', '시험'],
        '성적 향상': ['공부', '집중'],
        '꾸준한 실력 쌓기': ['공부'],
        '창의적 아이디어': ['창의'],
        '좋은 학습 습관': ['집중', '공부'],
      },
    },
    {
      id: 'study-4',
      question: '합격/성취 후 가장 하고 싶은 것을 적어주세요! ✍️',
      freeText: true,
      next: null,
    },
  ],
};

// ─── 기타 (Other) 대화 흐름 ─────────────────────────────────

const otherFlow: DialogueFlow = {
  category: TalismanCategory.Other,
  label: '소원·행운',
  description: '특별한 소원이 있거나 전반적인 행운을 기원할 때',
  steps: [
    {
      id: 'other-1',
      question: '오늘 부적을 만들게 된 특별한 이유가 있나요? 🌈',
      options: ['소원을 이루고 싶어요', '운을 바꾸고 싶어요', '좋은 인연을 만나고 싶어요', '그냥 재미로!', '선물하려고요'],
      next: 'other-2',
      keywordMap: {
        '소원을 이루고 싶어요': ['소원'],
        '운을 바꾸고 싶어요': ['개운', '운'],
        '좋은 인연을 만나고 싶어요': ['인연', '귀인'],
        '그냥 재미로!': ['행운'],
        '선물하려고요': ['행운', '소원'],
      },
    },
    {
      id: 'other-2',
      question: '요즘 삶에서 가장 아쉬운 부분이 있다면요? 💫',
      options: ['행운이 부족해요', '좋은 사람이 없어요', '변화가 필요해요', '뭔가 막혀있는 느낌', '전부 다 좋아요!'],
      next: 'other-3',
      keywordMap: {
        '행운이 부족해요': ['행운'],
        '좋은 사람이 없어요': ['인연', '귀인'],
        '변화가 필요해요': ['개운'],
        '뭔가 막혀있는 느낌': ['개운', '운'],
        '전부 다 좋아요!': ['행운', '소원'],
      },
    },
    {
      id: 'other-3',
      question: '이루고 싶은 소원을 자유롭게 적어주세요 🙏✨',
      freeText: true,
      next: 'other-4',
    },
    {
      id: 'other-4',
      question: '마지막으로, 부적의 느낌은 어떤 것이 좋으세요?',
      options: ['전통적이고 신비로운 느낌', '귀엽고 현대적인 느낌', '심플하고 깔끔한 느낌'],
      next: null,
    },
  ],
};

// ─── 연애 (Love) 대화 흐름 ──────────────────────────────────
// ⚠️ 원칙: 부적은 상대를 조종하거나 되돌리는 것이 아니라
//    나의 마음을 다독이고 좋은 인연을 맞이할 준비를 돕는 것.
//    이별의 마음은 재회 집착이 아닌 치유(상사부·인연부)로 안내한다.

const loveFlow: DialogueFlow = {
  category: TalismanCategory.Love,
  label: '연애·인연',
  description: '설레는 마음을 응원하고 좋은 인연을 기원할 때',
  steps: [
    {
      id: 'love-1',
      question: '지금 마음은 어떤 계절인가요? 🌸',
      options: ['좋은 사람을 만나고 싶어요', '짝사랑 중이에요', '썸타는 중이에요', '연애하고 있어요', '이별의 마음을 안고 있어요'],
      next: 'love-2',
      keywordMap: {
        '좋은 사람을 만나고 싶어요': ['인연', '만남'],
        '짝사랑 중이에요': ['짝사랑', '마음전달'],
        '썸타는 중이에요': ['썸', '설레임'],
        '연애하고 있어요': ['연인', '화합'],
        // 이별은 재회 집착이 아닌 치유(상사부)로 — '재회' 키워드는 쓰지 않는다
        '이별의 마음을 안고 있어요': ['이별', '그리움'],
      },
    },
    {
      id: 'love-2',
      question: '그 마음을 조금 더 들려주실래요? 💭',
      options: ['설레서 잠이 안 와요', '용기가 안 나요', '불안하고 조심스러워요', '서운하고 지쳤어요', '담담하게 기다리는 중이에요'],
      next: 'love-3',
      keywordMap: {
        '설레서 잠이 안 와요': ['썸', '데이트'],
        '용기가 안 나요': ['고백', '짝사랑'],
        '불안하고 조심스러워요': ['짝사랑', '인연'],
        '서운하고 지쳤어요': ['연인', '권태기'],
        '담담하게 기다리는 중이에요': ['그리움', '짝사랑'],
      },
    },
    {
      id: 'love-3',
      question: '이 부적에 어떤 바람을 담을까요? ✨',
      options: ['좋은 인연이 닿기를', '내 마음이 전해지기를', '서로 오래 다정하기를', '마음이 편안해지기를'],
      next: 'love-4',
      keywordMap: {
        '좋은 인연이 닿기를': ['인연', '만남'],
        '내 마음이 전해지기를': ['고백', '짝사랑'],
        '서로 오래 다정하기를': ['연인', '커플'],
        '마음이 편안해지기를': ['그리움', '인연'],
      },
    },
    {
      id: 'love-4',
      question: '마지막으로, 응원받고 싶은 마음을 한 줄로 적어주세요 💌',
      freeText: true,
      next: null,
    },
  ],
};

// ─── 전체 대화 흐름 모음 ────────────────────────────────────

export const DIALOGUE_FLOWS: DialogueFlow[] = [
  protectionFlow,
  wealthFlow,
  healthFlow,
  familyFlow,
  studyFlow,
  loveFlow,
  otherFlow,
];

/**
 * 카테고리로 대화 흐름 검색
 */
export function getDialogueFlow(
  category: TalismanCategory
): DialogueFlow | undefined {
  return DIALOGUE_FLOWS.find((f) => f.category === category);
}

/**
 * 대화 흐름에서 특정 단계 검색
 */
export function getStep(
  flow: DialogueFlow,
  stepId: string
): ConsultStep | undefined {
  return flow.steps.find((s) => s.id === stepId);
}

/**
 * 대화 응답에서 키워드 추출
 * @param flow 대화 흐름
 * @param responses stepId → 선택한 옵션 또는 자유 텍스트 매핑
 */
export function extractKeywords(
  flow: DialogueFlow,
  responses: Record<string, string>
): string[] {
  const keywords: string[] = [];

  for (const step of flow.steps) {
    const response = responses[step.id];
    if (!response) continue;

    // 옵션 선택 시 keywordMap에서 키워드 추출
    if (step.keywordMap && step.keywordMap[response]) {
      keywords.push(...step.keywordMap[response]);
    }

    // 자유 텍스트에서 키워드 매핑 (간단한 포함 검사)
    if (step.freeText && response) {
      const allKeywords = [
        '건강', '돈', '사랑', '시험', '합격', '가족', '직장',
        '불안', '행운', '소원', '인연', '결혼', '취업', '승진',
        '사업', '질병', '수술', '꿈', '악몽', '이사', '여행',
        '공부', '집중', '스트레스', '우울', '외로', '감사',
        '희망', '평화', '용기', '사랑', '행복',
      ];
      for (const kw of allKeywords) {
        if (response.includes(kw)) {
          keywords.push(kw);
        }
      }
    }
  }

  // 중복 제거
  return [...new Set(keywords)];
}
