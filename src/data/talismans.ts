// ============================================================
// 부적 (符籍) 카탈로그 — 43종 부적 데이터 및 추천 로직
// ============================================================

/** 부적 카테고리 */
export enum TalismanCategory {
  Protection = '수호',
  Wealth = '재물',
  Health = '건강',
  Family = '가정',
  Study = '학업',
  Other = '기타',
}

/** 부적 타입 */
export interface TalismanType {
  id: string;
  name: string;
  hanja: string;
  category: TalismanCategory;
  description: string;
  usage: string;
  symbols: string[];
  colors: string[];
  mantra: string;
}

// ─── 43종 부적 카탈로그 ─────────────────────────────────────

export const TALISMANS: TalismanType[] = [
  // ──── 수호 (Protection) — 10종 ────
  {
    id: 'protect-01',
    name: '잡귀퇴치부',
    hanja: '雜鬼退治符',
    category: TalismanCategory.Protection,
    description: '모든 잡귀와 악한 기운을 물리치는 강력한 수호 부적입니다.',
    usage: '현관문 위에 붙이거나 지갑에 넣어 다니세요.',
    symbols: ['뇌전', '칼', '팔괘'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '급급여율령 잡귀퇴산(急急如律令 雜鬼退散)',
  },
  {
    id: 'protect-02',
    name: '액막이부',
    hanja: '厄防符',
    category: TalismanCategory.Protection,
    description: '한 해의 액운을 막아주고 재앙을 방지하는 부적입니다.',
    usage: '새해 첫날에 만들어 일 년 동안 몸에 지니세요.',
    symbols: ['북두칠성', '구름', '거울'],
    colors: ['#B22222', '#F5E6B8', '#000000'],
    mantra: '천지신명 액운소멸(天地神明 厄運消滅)',
  },
  {
    id: 'protect-03',
    name: '삼재부',
    hanja: '三災符',
    category: TalismanCategory.Protection,
    description: '들삼재, 눌삼재, 날삼재의 재앙을 막아주는 부적입니다.',
    usage: '삼재가 드는 해에 몸에 지니세요.',
    symbols: ['불', '물', '바람', '호랑이'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '삼재소멸 만복래지(三災消滅 萬福來至)',
  },
  {
    id: 'protect-04',
    name: '교통안전부',
    hanja: '交通安全符',
    category: TalismanCategory.Protection,
    description: '길 위에서의 사고와 위험을 막아주는 안전 부적입니다.',
    usage: '차 안이나 자주 쓰는 가방에 넣어두세요.',
    symbols: ['구름', '방패', '별'],
    colors: ['#B22222', '#F5E6B8', '#1E90FF'],
    mantra: '도중안녕 귀거래사(道中安寧 歸去來辭)',
  },
  {
    id: 'protect-05',
    name: '악몽퇴치부',
    hanja: '惡夢退治符',
    category: TalismanCategory.Protection,
    description: '나쁜 꿈과 잠자리의 불안을 없애주는 부적입니다.',
    usage: '베개 밑이나 침대 머리맡에 두세요.',
    symbols: ['달', '별', '연꽃'],
    colors: ['#B22222', '#F5E6B8', '#4B0082'],
    mantra: '안면청신 악몽불침(安眠淸神 惡夢不侵)',
  },
  {
    id: 'protect-06',
    name: '도난방지부',
    hanja: '盜難防止符',
    category: TalismanCategory.Protection,
    description: '도둑과 분실의 재앙을 막아주는 부적입니다.',
    usage: '집이나 사무실 입구에 붙여두세요.',
    symbols: ['자물쇠', '뇌전', '눈'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '재물수호 도적퇴산(財物守護 盜賊退散)',
  },
  {
    id: 'protect-07',
    name: '소송필승부',
    hanja: '訴訟必勝符',
    category: TalismanCategory.Protection,
    description: '송사나 분쟁에서 승리할 수 있도록 돕는 부적입니다.',
    usage: '법적 분쟁이 있을 때 몸에 지니세요.',
    symbols: ['칼', '저울', '용'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '정의필승 송사해결(正義必勝 訟事解決)',
  },
  {
    id: 'protect-08',
    name: '구설방지부',
    hanja: '口舌防止符',
    category: TalismanCategory.Protection,
    description: '험담과 악의적인 소문으로부터 보호해주는 부적입니다.',
    usage: '직장이나 학교에 다닐 때 몸에 지니세요.',
    symbols: ['입술', '자물쇠', '거울'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '구설소멸 시비불침(口舌消滅 是非不侵)',
  },
  {
    id: 'protect-09',
    name: '사업수호부',
    hanja: '事業守護符',
    category: TalismanCategory.Protection,
    description: '사업장의 안녕과 번영을 지켜주는 부적입니다.',
    usage: '사업장이나 사무실에 걸어두세요.',
    symbols: ['용', '구름', '팔괘'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '사업흥왕 만사형통(事業興旺 萬事亨通)',
  },
  {
    id: 'protect-10',
    name: '여행안전부',
    hanja: '旅行安全符',
    category: TalismanCategory.Protection,
    description: '여행 중 안전과 무사귀환을 기원하는 부적입니다.',
    usage: '여행할 때 여권이나 지갑에 넣어 다니세요.',
    symbols: ['나침반', '구름', '별'],
    colors: ['#B22222', '#F5E6B8', '#228B22'],
    mantra: '여행안녕 무사귀환(旅行安寧 無事歸還)',
  },

  // ──── 재물 (Wealth) — 8종 ────
  {
    id: 'wealth-01',
    name: '재물대통부',
    hanja: '財物大通符',
    category: TalismanCategory.Wealth,
    description: '재물운을 크게 열어주는 강력한 재물 부적입니다.',
    usage: '지갑이나 금고 근처에 두세요.',
    symbols: ['금괴', '구름', '용'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '재물대통 금전만래(財物大通 金錢萬來)',
  },
  {
    id: 'wealth-02',
    name: '복권당첨부',
    hanja: '福券當籤符',
    category: TalismanCategory.Wealth,
    description: '행운과 횡재의 기운을 불러오는 부적입니다.',
    usage: '복권 구입 시 함께 지니세요.',
    symbols: ['별', '동전', '무지개'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '횡재수래 만복충만(橫財數來 萬福充滿)',
  },
  {
    id: 'wealth-03',
    name: '사업번창부',
    hanja: '事業繁昌符',
    category: TalismanCategory.Wealth,
    description: '사업이 번창하고 고객이 몰려오게 하는 부적입니다.',
    usage: '사업장 입구나 금전출납기 근처에 두세요.',
    symbols: ['용', '구름', '금괴', '물결'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '사업번창 고객만래(事業繁昌 顧客萬來)',
  },
  {
    id: 'wealth-04',
    name: '취업성공부',
    hanja: '就業成功符',
    category: TalismanCategory.Wealth,
    description: '원하는 직장에 취업할 수 있도록 돕는 부적입니다.',
    usage: '면접 때 몸에 지니세요.',
    symbols: ['문', '열쇠', '별'],
    colors: ['#B22222', '#F5E6B8', '#4169E1'],
    mantra: '취업성공 만사여의(就業成功 萬事如意)',
  },
  {
    id: 'wealth-05',
    name: '승진부',
    hanja: '昇進符',
    category: TalismanCategory.Wealth,
    description: '직장에서의 승진과 인정을 돕는 부적입니다.',
    usage: '회사에 출근할 때 몸에 지니세요.',
    symbols: ['산', '용', '별'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '승진대통 귀인상조(昇進大通 貴人相助)',
  },
  {
    id: 'wealth-06',
    name: '빚청산부',
    hanja: '債務淸算符',
    category: TalismanCategory.Wealth,
    description: '빚과 금전적 어려움에서 벗어나도록 돕는 부적입니다.',
    usage: '지갑에 넣어 항상 지니세요.',
    symbols: ['물결', '칼', '해'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '채무소멸 재물충만(債務消滅 財物充滿)',
  },
  {
    id: 'wealth-07',
    name: '부동산운부',
    hanja: '不動産運符',
    category: TalismanCategory.Wealth,
    description: '부동산 거래에서 좋은 결과를 얻도록 돕는 부적입니다.',
    usage: '부동산 거래 시 몸에 지니세요.',
    symbols: ['산', '집', '나무'],
    colors: ['#B22222', '#F5E6B8', '#8B4513'],
    mantra: '길지길택 만복래지(吉地吉宅 萬福來至)',
  },
  {
    id: 'wealth-08',
    name: '장사번성부',
    hanja: '商賈繁盛符',
    category: TalismanCategory.Wealth,
    description: '장사가 잘되고 매출이 오르도록 돕는 부적입니다.',
    usage: '계산대나 가게 안쪽에 붙여두세요.',
    symbols: ['동전', '물결', '구름'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '장사번성 이익충만(商賈繁盛 利益充滿)',
  },

  // ──── 건강 (Health) — 7종 ────
  {
    id: 'health-01',
    name: '무병장수부',
    hanja: '無病長壽符',
    category: TalismanCategory.Health,
    description: '질병 없이 오래도록 건강하게 해주는 부적입니다.',
    usage: '항상 몸에 지니거나 침실에 걸어두세요.',
    symbols: ['거북', '학', '소나무'],
    colors: ['#B22222', '#F5E6B8', '#228B22'],
    mantra: '무병장수 건강만세(無病長壽 健康萬歲)',
  },
  {
    id: 'health-02',
    name: '질병퇴치부',
    hanja: '疾病退治符',
    category: TalismanCategory.Health,
    description: '현재 앓고 있는 질병의 쾌유를 돕는 부적입니다.',
    usage: '환자의 베개 밑이나 병실에 두세요.',
    symbols: ['불', '칼', '연꽃'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '질병소멸 신체건강(疾病消滅 身體健康)',
  },
  {
    id: 'health-03',
    name: '정신안정부',
    hanja: '精神安定符',
    category: TalismanCategory.Health,
    description: '불안과 스트레스를 가라앉혀 마음의 평화를 주는 부적입니다.',
    usage: '명상할 때 곁에 두거나 항상 지니세요.',
    symbols: ['달', '연꽃', '물결'],
    colors: ['#B22222', '#F5E6B8', '#4B0082'],
    mantra: '심신안정 번뇌소멸(心身安定 煩惱消滅)',
  },
  {
    id: 'health-04',
    name: '수술성공부',
    hanja: '手術成功符',
    category: TalismanCategory.Health,
    description: '수술이 성공적으로 이루어지도록 기원하는 부적입니다.',
    usage: '수술 전후로 환자 곁에 두세요.',
    symbols: ['별', '손', '빛'],
    colors: ['#B22222', '#F5E6B8', '#FFFFFF'],
    mantra: '수술대성 쾌유여래(手術大成 快癒如來)',
  },
  {
    id: 'health-05',
    name: '다이어트부',
    hanja: '減量成功符',
    category: TalismanCategory.Health,
    description: '건강한 식습관과 체중 감량을 돕는 현대적 부적입니다.',
    usage: '냉장고나 식탁 근처에 붙여두세요.',
    symbols: ['나무', '물결', '해'],
    colors: ['#B22222', '#F5E6B8', '#90EE90'],
    mantra: '신체경량 건강미래(身體輕量 健康美麗)',
  },
  {
    id: 'health-06',
    name: '금연부',
    hanja: '禁煙符',
    category: TalismanCategory.Health,
    description: '담배를 끊고 건강을 되찾도록 돕는 부적입니다.',
    usage: '주머니나 담배를 두던 곳에 넣어두세요.',
    symbols: ['바람', '나무', '해'],
    colors: ['#B22222', '#F5E6B8', '#228B22'],
    mantra: '금연성공 폐부건강(禁煙成功 肺腑健康)',
  },
  {
    id: 'health-07',
    name: '불면증치유부',
    hanja: '不眠症治癒符',
    category: TalismanCategory.Health,
    description: '편안한 잠자리와 깊은 수면을 돕는 부적입니다.',
    usage: '베개 밑에 두세요.',
    symbols: ['달', '별', '구름'],
    colors: ['#B22222', '#F5E6B8', '#191970'],
    mantra: '안면숙수 심신안녕(安眠熟睡 心身安寧)',
  },

  // ──── 가정 (Family) — 8종 ────
  {
    id: 'family-01',
    name: '가화만사성부',
    hanja: '家和萬事成符',
    category: TalismanCategory.Family,
    description: '가정의 화목과 모든 일의 성공을 기원하는 부적입니다.',
    usage: '거실이나 가족이 모이는 곳에 걸어두세요.',
    symbols: ['연꽃', '구름', '해'],
    colors: ['#B22222', '#F5E6B8', '#FF69B4'],
    mantra: '가화만사성 부귀영화(家和萬事成 富貴榮華)',
  },
  {
    id: 'family-02',
    name: '부부화합부',
    hanja: '夫婦和合符',
    category: TalismanCategory.Family,
    description: '부부 사이의 화합과 사랑을 돕는 부적입니다.',
    usage: '부부의 침실에 걸어두세요.',
    symbols: ['태극', '원앙', '연꽃'],
    colors: ['#B22222', '#F5E6B8', '#FF1493'],
    mantra: '부부화합 백년해로(夫婦和合 百年偕老)',
  },
  {
    id: 'family-03',
    name: '자녀수호부',
    hanja: '子女守護符',
    category: TalismanCategory.Family,
    description: '자녀의 안전과 건강한 성장을 기원하는 부적입니다.',
    usage: '자녀의 방이나 가방에 넣어주세요.',
    symbols: ['나무', '별', '구름'],
    colors: ['#B22222', '#F5E6B8', '#87CEEB'],
    mantra: '자녀수호 건강성장(子女守護 健康成長)',
  },
  {
    id: 'family-04',
    name: '결혼성사부',
    hanja: '結婚成事符',
    category: TalismanCategory.Family,
    description: '좋은 인연을 만나 결혼에 이르도록 돕는 부적입니다.',
    usage: '침실 화장대나 거울 근처에 두세요.',
    symbols: ['원앙', '연꽃', '달'],
    colors: ['#B22222', '#F5E6B8', '#FF69B4'],
    mantra: '천생연분 결혼성사(天生緣分 結婚成事)',
  },
  {
    id: 'family-05',
    name: '태몽기자부',
    hanja: '胎夢祈子符',
    category: TalismanCategory.Family,
    description: '건강한 아이의 잉태를 기원하는 부적입니다.',
    usage: '부부의 침실에 걸어두세요.',
    symbols: ['석류', '연꽃', '달'],
    colors: ['#B22222', '#F5E6B8', '#FFB6C1'],
    mantra: '기자성취 태평무사(祈子成就 胎平無事)',
  },
  {
    id: 'family-06',
    name: '효도부',
    hanja: '孝道符',
    category: TalismanCategory.Family,
    description: '부모님의 건강과 장수를 기원하는 효도 부적입니다.',
    usage: '부모님 방이나 지갑에 넣어드리세요.',
    symbols: ['학', '소나무', '거북'],
    colors: ['#B22222', '#F5E6B8', '#228B22'],
    mantra: '부모건강 만수무강(父母健康 萬壽無疆)',
  },
  {
    id: 'family-07',
    name: '이사길방부',
    hanja: '移徙吉方符',
    category: TalismanCategory.Family,
    description: '이사할 때 좋은 방향과 길한 기운을 돕는 부적입니다.',
    usage: '이사 당일에 새 집에 가장 먼저 붙이세요.',
    symbols: ['나침반', '집', '구름'],
    colors: ['#B22222', '#F5E6B8'],
    mantra: '이사대길 가택안녕(移徙大吉 家宅安寧)',
  },
  {
    id: 'family-08',
    name: '반려동물수호부',
    hanja: '伴侶動物守護符',
    category: TalismanCategory.Family,
    description: '반려동물의 건강과 안전을 지켜주는 부적입니다.',
    usage: '반려동물의 잠자리 근처에 두세요.',
    symbols: ['발자국', '별', '하트'],
    colors: ['#B22222', '#F5E6B8', '#FF6347'],
    mantra: '반려수호 건강장수(伴侶守護 健康長壽)',
  },

  // ──── 학업 (Study) — 6종 ────
  {
    id: 'study-01',
    name: '시험합격부',
    hanja: '試驗合格符',
    category: TalismanCategory.Study,
    description: '각종 시험에서 합격하도록 돕는 강력한 학업 부적입니다.',
    usage: '시험 당일 몸에 지니세요.',
    symbols: ['붓', '별', '문'],
    colors: ['#B22222', '#F5E6B8', '#4169E1'],
    mantra: '시험합격 금방제일(試驗合格 及第一)',
  },
  {
    id: 'study-02',
    name: '집중력향상부',
    hanja: '集中力向上符',
    category: TalismanCategory.Study,
    description: '학습 집중력을 높이고 산만함을 없애는 부적입니다.',
    usage: '책상 위나 공부하는 곳에 붙여두세요.',
    symbols: ['눈', '별', '불꽃'],
    colors: ['#B22222', '#F5E6B8', '#4B0082'],
    mantra: '정신집중 학업대성(精神集中 學業大成)',
  },
  {
    id: 'study-03',
    name: '암기력부',
    hanja: '暗記力符',
    category: TalismanCategory.Study,
    description: '기억력과 암기력을 강화하는 부적입니다.',
    usage: '교재나 노트 사이에 끼워두세요.',
    symbols: ['뇌', '별', '책'],
    colors: ['#B22222', '#F5E6B8', '#9370DB'],
    mantra: '기억증진 암기만통(記憶增進 暗記萬通)',
  },
  {
    id: 'study-04',
    name: '자격증취득부',
    hanja: '資格證取得符',
    category: TalismanCategory.Study,
    description: '자격증 시험에 합격하도록 돕는 부적입니다.',
    usage: '자격증 시험 준비 기간 동안 책상에 두세요.',
    symbols: ['인장', '별', '붓'],
    colors: ['#B22222', '#F5E6B8', '#2E8B57'],
    mantra: '자격취득 실력발휘(資格取得 實力發揮)',
  },
  {
    id: 'study-05',
    name: '대학합격부',
    hanja: '大學合格符',
    category: TalismanCategory.Study,
    description: '원하는 대학에 합격하도록 돕는 수능/입시 부적입니다.',
    usage: '수험생이 항상 몸에 지니세요.',
    symbols: ['문', '별', '해'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '대학합격 금의환향(大學合格 錦衣還鄕)',
  },
  {
    id: 'study-06',
    name: '창의력부',
    hanja: '創意力符',
    category: TalismanCategory.Study,
    description: '창의력과 영감을 불러오는 부적입니다.',
    usage: '작업실이나 창작하는 공간에 두세요.',
    symbols: ['무지개', '별', '물결'],
    colors: ['#B22222', '#F5E6B8', '#FF8C00'],
    mantra: '창의무한 영감충만(創意無限 靈感充滿)',
  },

  // ──── 기타 (Other) — 4종 ────
  {
    id: 'other-01',
    name: '소원성취부',
    hanja: '所願成就符',
    category: TalismanCategory.Other,
    description: '마음속 소원이 이루어지도록 돕는 만능 부적입니다.',
    usage: '소원을 빌면서 항상 몸에 지니세요.',
    symbols: ['별', '구름', '해', '달'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '소원성취 만사여의(所願成就 萬事如意)',
  },
  {
    id: 'other-02',
    name: '인연부',
    hanja: '因緣符',
    category: TalismanCategory.Other,
    description: '좋은 인연과 귀인을 불러오는 부적입니다.',
    usage: '새로운 만남이 있는 날 몸에 지니세요.',
    symbols: ['실', '매듭', '연꽃'],
    colors: ['#B22222', '#F5E6B8', '#FF69B4'],
    mantra: '귀인상봉 좋은인연(貴人相逢 良緣)',
  },
  {
    id: 'other-03',
    name: '개운부',
    hanja: '開運符',
    category: TalismanCategory.Other,
    description: '막힌 운을 열어주고 새로운 시작을 돕는 부적입니다.',
    usage: '새로운 일을 시작할 때 몸에 지니세요.',
    symbols: ['문', '열쇠', '해', '구름'],
    colors: ['#B22222', '#F5E6B8', '#FFD700'],
    mantra: '개운대통 신운래지(開運大通 新運來至)',
  },
  {
    id: 'other-04',
    name: '행운부',
    hanja: '幸運符',
    category: TalismanCategory.Other,
    description: '일상의 크고 작은 행운을 가져다주는 부적입니다.',
    usage: '항상 지갑이나 핸드폰 케이스에 넣어 다니세요.',
    symbols: ['네잎클로버', '별', '무지개'],
    colors: ['#B22222', '#F5E6B8', '#32CD32'],
    mantra: '행운만래 복덕충만(幸運萬來 福德充滿)',
  },
];

// ─── 키워드 → 부적 매핑 ─────────────────────────────────────

const KEYWORD_MAP: Record<string, string[]> = {
  // 수호
  '귀신': ['protect-01'],
  '잡귀': ['protect-01'],
  '액운': ['protect-02'],
  '삼재': ['protect-03'],
  '교통': ['protect-04'],
  '운전': ['protect-04'],
  '악몽': ['protect-05'],
  '꿈': ['protect-05'],
  '도둑': ['protect-06'],
  '분실': ['protect-06'],
  '소송': ['protect-07'],
  '재판': ['protect-07'],
  '험담': ['protect-08'],
  '구설': ['protect-08'],
  '뒷담화': ['protect-08'],
  '직장보호': ['protect-09'],
  '여행': ['protect-10'],

  // 재물
  '돈': ['wealth-01', 'wealth-06'],
  '재물': ['wealth-01'],
  '복권': ['wealth-02'],
  '당첨': ['wealth-02'],
  '사업': ['wealth-03', 'protect-09'],
  '취업': ['wealth-04'],
  '면접': ['wealth-04'],
  '승진': ['wealth-05'],
  '빚': ['wealth-06'],
  '부동산': ['wealth-07'],
  '집': ['wealth-07', 'family-07'],
  '장사': ['wealth-08'],
  '매출': ['wealth-08'],

  // 건강
  '건강': ['health-01'],
  '장수': ['health-01'],
  '질병': ['health-02'],
  '병': ['health-02'],
  '불안': ['health-03', 'protect-05'],
  '스트레스': ['health-03'],
  '우울': ['health-03'],
  '수술': ['health-04'],
  '다이어트': ['health-05'],
  '살': ['health-05'],
  '금연': ['health-06'],
  '담배': ['health-06'],
  '불면': ['health-07'],
  '잠': ['health-07'],

  // 가정
  '가정': ['family-01'],
  '가족': ['family-01'],
  '부부': ['family-02'],
  '결혼생활': ['family-02'],
  '자녀': ['family-03'],
  '아이': ['family-03', 'family-05'],
  '결혼': ['family-04'],
  '연애': ['family-04', 'other-02'],
  '임신': ['family-05'],
  '부모': ['family-06'],
  '효도': ['family-06'],
  '이사': ['family-07'],
  '반려동물': ['family-08'],
  '강아지': ['family-08'],
  '고양이': ['family-08'],

  // 학업
  '시험': ['study-01'],
  '합격': ['study-01', 'study-05'],
  '집중': ['study-02'],
  '공부': ['study-02', 'study-03'],
  '암기': ['study-03'],
  '자격증': ['study-04'],
  '대학': ['study-05'],
  '수능': ['study-05'],
  '창의': ['study-06'],

  // 기타
  '소원': ['other-01'],
  '인연': ['other-02'],
  '귀인': ['other-02'],
  '개운': ['other-03'],
  '행운': ['other-04'],
  '운': ['other-03', 'other-04'],
};

/**
 * 카테고리 & 키워드 기반 부적 추천
 */
export function getTalismanRecommendation(
  category: TalismanCategory | null,
  keywords: string[]
): TalismanType {
  // 1. 키워드 매칭으로 후보 수집
  const candidateIds = new Set<string>();
  for (const kw of keywords) {
    for (const [mapKey, ids] of Object.entries(KEYWORD_MAP)) {
      if (kw.includes(mapKey) || mapKey.includes(kw)) {
        ids.forEach((id) => candidateIds.add(id));
      }
    }
  }

  // 2. 카테고리 필터링
  let candidates = TALISMANS.filter((t) => candidateIds.has(t.id));
  if (category) {
    const categoryFiltered = candidates.filter((t) => t.category === category);
    if (categoryFiltered.length > 0) {
      candidates = categoryFiltered;
    }
  }

  // 3. 후보가 없으면 카테고리 기반 랜덤
  if (candidates.length === 0) {
    if (category) {
      candidates = TALISMANS.filter((t) => t.category === category);
    }
    if (candidates.length === 0) {
      candidates = TALISMANS;
    }
  }

  // 4. 키워드 매칭 점수 기반 정렬
  candidates.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    for (const kw of keywords) {
      if (a.description.includes(kw) || a.name.includes(kw)) scoreA += 2;
      if (b.description.includes(kw) || b.name.includes(kw)) scoreB += 2;
      for (const [mapKey, ids] of Object.entries(KEYWORD_MAP)) {
        if (kw.includes(mapKey) || mapKey.includes(kw)) {
          if (ids.includes(a.id)) scoreA += 1;
          if (ids.includes(b.id)) scoreB += 1;
        }
      }
    }
    return scoreB - scoreA;
  });

  return candidates[0];
}

/**
 * 카테고리별 랜덤 부적 반환
 */
export function getRandomTalisman(
  category?: TalismanCategory
): TalismanType {
  let pool = TALISMANS;
  if (category) {
    pool = TALISMANS.filter((t) => t.category === category);
    if (pool.length === 0) pool = TALISMANS;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
