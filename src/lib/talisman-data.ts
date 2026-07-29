import { TalismanInfo } from './types';

export const TALISMAN_ENCYCLOPEDIA: TalismanInfo[] = [
  // ── 수호 (Protection) ──
  { id: 'byeoksa', name: '벽사부', hanja: '辟邪符', category: '수호', description: '사악한 기운을 물리치고 나쁜 것들을 쫓아내는 부적입니다.', whenToUse: '불길한 일이 연이어 일어나거나, 집안에 나쁜 기운이 느껴질 때 사용합니다.', symbolsExplained: '호랑이 문양과 팔괘가 결합되어 강력한 벽사의 힘을 나타냅니다.', howToUse: '대문이나 현관 위에 붙여두면 나쁜 기운이 들어오는 것을 막아줍니다.', svgKey: 'byeoksa' },
  { id: 'hosin', name: '호신부', hanja: '護身符', category: '수호', description: '몸을 보호하고 위험으로부터 지켜주는 부적입니다.', whenToUse: '여행을 떠나거나, 위험한 상황이 예상될 때 지니고 다닙니다.', symbolsExplained: '방패 형태의 문양이 사방의 위험을 막아주는 것을 상징합니다.', howToUse: '지갑이나 가방에 넣어 항상 몸에 지니고 다닙니다.', svgKey: 'hosin' },
  { id: 'aksalmang', name: '악살방지부', hanja: '惡煞防止符', category: '수호', description: '악살(나쁜 운)을 방지하고 액운을 막는 부적입니다.', whenToUse: '삼재가 들었거나, 운이 좋지 않다고 느낄 때 사용합니다.', symbolsExplained: '천부인 문양과 주문이 결합되어 나쁜 기운을 차단합니다.', howToUse: '베개 밑이나 침대 머리맡에 놓아둡니다.', svgKey: 'aksalmang' },
  { id: 'samjae', name: '삼재소멸부', hanja: '三災消滅符', category: '수호', description: '삼재(수재, 화재, 풍재)를 소멸시키는 강력한 수호 부적입니다.', whenToUse: '삼재 해에 해당할 때 반드시 갖추어야 하는 부적입니다.', symbolsExplained: '세 개의 불꽃이 물에 의해 꺼지는 형상을 담고 있습니다.', howToUse: '올해의 삼재 방위에 붙여두거나 몸에 지닙니다.', svgKey: 'samjae' },
  { id: 'jaeaek', name: '재액소멸부', hanja: '災厄消滅符', category: '수호', description: '재앙과 액운을 소멸시키는 부적입니다.', whenToUse: '큰 일을 앞두고 있거나 불안감이 클 때 사용합니다.', symbolsExplained: '팔방의 기운을 모아 재액을 녹이는 문양입니다.', howToUse: '몸에 지니거나 중요한 장소에 붙입니다.', svgKey: 'jaeaek' },
  { id: 'hwabu', name: '화재방지부', hanja: '火災防止符', category: '수호', description: '화재를 예방하고 불의 재앙을 막아주는 부적입니다.', whenToUse: '주방이나 화기를 자주 사용하는 곳에 필요합니다.', symbolsExplained: '물(水) 기운의 문양이 화(火) 기운을 제어합니다.', howToUse: '주방이나 보일러실 근처에 붙여둡니다.', svgKey: 'hwabu' },
  { id: 'dochuk', name: '도축부', hanja: '都祝符', category: '수호', description: '잡귀를 물리치는 강력한 축귀 부적입니다.', whenToUse: '귀신이 나타나는 느낌이 들거나 악몽에 시달릴 때 사용합니다.', symbolsExplained: '천상의 장군 문양이 잡귀를 물리치는 힘을 나타냅니다.', howToUse: '침실 문 위나 베개 밑에 놓습니다.', svgKey: 'dochuk' },

  // ── 재물 (Wealth) ──
  { id: 'chobok', name: '초복부', hanja: '招福符', category: '재물', description: '복을 불러오고 행운이 가득하게 해주는 부적입니다.', whenToUse: '새해가 시작되거나, 새로운 출발을 할 때 사용합니다.', symbolsExplained: '박쥐 문양(福)과 구름 문양이 하늘의 복을 의미합니다.', howToUse: '거실이나 자주 머무는 공간에 붙여둡니다.', svgKey: 'chobok' },
  { id: 'jaemul', name: '재물부', hanja: '財物符', category: '재물', description: '재물운을 높이고 금전적 풍요를 가져다주는 부적입니다.', whenToUse: '사업을 시작하거나 금전적으로 어려울 때 사용합니다.', symbolsExplained: '엽전 문양과 풍요의 상징인 곡식 무늬가 결합되어 있습니다.', howToUse: '지갑 안이나 금고 위에 놓아둡니다.', svgKey: 'jaemul' },
  { id: 'saeopbun', name: '사업번창부', hanja: '事業繁昌符', category: '재물', description: '사업이 번창하고 성공하도록 도와주는 부적입니다.', whenToUse: '새로운 사업을 시작하거나 사업이 부진할 때 사용합니다.', symbolsExplained: '용 문양이 상승하는 기운과 성공을 상징합니다.', howToUse: '사무실 책상이나 매장 금고 근처에 놓습니다.', svgKey: 'saeopbun' },
  { id: 'chwijikseonggong', name: '취직성공부', hanja: '就職成功符', category: '재물', description: '취직이 잘 되고 직장에서 승진하도록 돕는 부적입니다.', whenToUse: '취직 준비 중이거나 승진을 앞두고 있을 때 사용합니다.', symbolsExplained: '문(門) 문양이 새로운 길이 열리는 것을 상징합니다.', howToUse: '이력서와 함께 두거나 면접 시 몸에 지닙니다.', svgKey: 'chwijikseonggong' },
  { id: 'hoengjaesoo', name: '횡재수부', hanja: '橫財數符', category: '재물', description: '뜻밖의 재물을 얻게 해주는 횡재 부적입니다.', whenToUse: '복권을 사거나 투자를 할 때, 행운이 필요할 때 사용합니다.', symbolsExplained: '별과 달 문양이 하늘의 은총을 의미합니다.', howToUse: '지갑에 넣어 항상 지니고 다닙니다.', svgKey: 'hoengjaesoo' },
  { id: 'nojeok', name: '노적부', hanja: '露積符', category: '재물', description: '곡식이 쌓이듯 재산이 불어나게 해주는 부적입니다.', whenToUse: '저축을 시작하거나 재산을 불리고 싶을 때 사용합니다.', symbolsExplained: '산처럼 쌓인 곡식 문양이 재산 축적을 상징합니다.', howToUse: '통장이나 금고 위에 올려놓습니다.', svgKey: 'nojeok' },

  // ── 건강 (Health) ──
  { id: 'mubyeong', name: '무병장수부', hanja: '無病長壽符', category: '건강', description: '병 없이 오래 건강하게 살도록 돕는 부적입니다.', whenToUse: '어르신께 드리거나, 건강이 염려될 때 사용합니다.', symbolsExplained: '십장생 문양이 영원한 생명과 건강을 상징합니다.', howToUse: '침실이나 거실에 붙여두고 매일 아침 한 번씩 바라봅니다.', svgKey: 'mubyeong' },
  { id: 'chibyeong', name: '치병부', hanja: '治病符', category: '건강', description: '질병을 치료하고 건강을 회복하는 데 도움을 주는 부적입니다.', whenToUse: '아픈 곳이 있거나 회복이 필요할 때 사용합니다.', symbolsExplained: '약초 문양과 치유의 기운이 담긴 주문이 새겨져 있습니다.', howToUse: '아픈 부위 가까이에 두거나 베개 밑에 놓습니다.', svgKey: 'chibyeong' },
  { id: 'jeongshin', name: '정신안정부', hanja: '精神安定符', category: '건강', description: '마음을 안정시키고 정신적 평화를 가져다주는 부적입니다.', whenToUse: '불안하거나 스트레스가 심할 때, 마음의 평화가 필요할 때 사용합니다.', symbolsExplained: '연꽃 문양이 맑은 마음과 정신의 평화를 나타냅니다.', howToUse: '명상 시 가까이 두거나, 자주 보이는 곳에 놓습니다.', svgKey: 'jeongshin' },
  { id: 'anmyeon', name: '안면부', hanja: '安眠符', category: '건강', description: '편안한 수면을 돕고 악몽을 막아주는 부적입니다.', whenToUse: '불면증이 있거나 악몽에 시달릴 때 사용합니다.', symbolsExplained: '달과 구름 문양이 편안한 밤을 상징합니다.', howToUse: '베개 밑이나 침대 머리맡에 놓아둡니다.', svgKey: 'anmyeon' },
  { id: 'haedog', name: '해독부', hanja: '解毒符', category: '건강', description: '몸속 독소를 해소하고 기운을 정화하는 부적입니다.', whenToUse: '몸이 무겁거나 피로가 심할 때 사용합니다.', symbolsExplained: '물 흐르는 문양이 정화와 해독을 상징합니다.', howToUse: '물을 마시는 컵 근처에 놓아둡니다.', svgKey: 'haedog' },
  { id: 'yeokbyeong', name: '역병퇴치부', hanja: '疫病退治符', category: '건강', description: '전염병과 역병을 물리치는 강력한 부적입니다.', whenToUse: '전염병이 유행하거나 면역력이 걱정될 때 사용합니다.', symbolsExplained: '창과 방패 문양이 질병과의 싸움을 나타냅니다.', howToUse: '현관이나 자주 출입하는 문에 붙여둡니다.', svgKey: 'yeokbyeong' },

  // ── 가정 (Family) ──
  { id: 'gajeong', name: '가정화목부', hanja: '家庭和睦符', category: '가정', description: '가족 간의 화합과 평화를 가져다주는 부적입니다.', whenToUse: '가족 간 갈등이 있거나 화목한 가정을 원할 때 사용합니다.', symbolsExplained: '원형 문양 안에 가족을 상징하는 네 방위가 조화를 이룹니다.', howToUse: '가족이 모이는 거실이나 식탁 근처에 붙입니다.', svgKey: 'gajeong' },
  { id: 'bubugeumseul', name: '부부금슬부', hanja: '夫婦琴瑟符', category: '가정', description: '부부 사이를 금슬 좋게 만들어주는 부적입니다.', whenToUse: '부부 관계가 소원해졌거나 사랑을 되찾고 싶을 때 사용합니다.', symbolsExplained: '원앙새 한 쌍이 영원한 사랑과 화합을 상징합니다.', howToUse: '부부 침실에 한 쌍으로 놓아둡니다.', svgKey: 'bubugeumseul' },
  { id: 'deuknam', name: '득남부', hanja: '得男符', category: '가정', description: '아들을 얻고자 할 때 사용하는 전통 부적입니다.', whenToUse: '임신을 준비하거나 자녀를 간절히 원할 때 사용합니다.', symbolsExplained: '삼태극 문양이 새 생명의 탄생을 나타냅니다.', howToUse: '침실에 놓거나 몸에 지니고 다닙니다.', svgKey: 'deuknam' },
  { id: 'sunsan', name: '순산부', hanja: '順産符', category: '가정', description: '순탄한 출산을 돕고 산모와 아기를 보호하는 부적입니다.', whenToUse: '출산을 앞두고 있을 때 사용합니다.', symbolsExplained: '호리병 문양이 안전한 출산을 기원합니다.', howToUse: '산모의 침대 머리맡에 놓아둡니다.', svgKey: 'sunsan' },
  { id: 'jasikseonggong', name: '자식성공부', hanja: '子息成功符', category: '가정', description: '자녀가 성공적인 삶을 살도록 돕는 부적입니다.', whenToUse: '자녀의 중요한 시험이나 인생 전환점에 사용합니다.', symbolsExplained: '잉어가 용문을 뛰어넘는 문양이 성공을 상징합니다.', howToUse: '자녀의 방이나 책상 위에 놓아둡니다.', svgKey: 'jasikseonggong' },
  { id: 'gaun', name: '가운융성부', hanja: '家運隆盛符', category: '가정', description: '집안의 운이 융성하여 대대로 번영하는 부적입니다.', whenToUse: '집안 운이 안 좋다고 느껴지거나 새 집으로 이사할 때 사용합니다.', symbolsExplained: '산과 물이 어우러진 문양이 풍수의 길한 기운을 나타냅니다.', howToUse: '집의 중심이 되는 곳에 붙여둡니다.', svgKey: 'gaun' },

  // ── 학업 (Study) ──
  { id: 'hapgyeok', name: '합격부', hanja: '合格符', category: '학업', description: '시험에 합격하고 좋은 결과를 얻도록 돕는 부적입니다.', whenToUse: '수능, 자격증, 면접 등 중요한 시험을 앞두고 있을 때 사용합니다.', symbolsExplained: '문(門)을 여는 열쇠 문양이 합격의 문이 열리는 것을 상징합니다.', howToUse: '시험장에 가져가거나 수험표와 함께 둡니다.', svgKey: 'hapgyeok' },
  { id: 'hageopseongchwi', name: '학업성취부', hanja: '學業成就符', category: '학업', description: '학업 성적이 오르고 공부에 집중하도록 돕는 부적입니다.', whenToUse: '공부에 집중이 안 되거나 성적을 올리고 싶을 때 사용합니다.', symbolsExplained: '붓과 책 문양이 학문의 성취를 나타냅니다.', howToUse: '책상 위나 필통 안에 넣어둡니다.', svgKey: 'hageopseongchwi' },
  { id: 'jipjungryeok', name: '집중력강화부', hanja: '集中力強化符', category: '학업', description: '집중력을 높이고 산만함을 방지하는 부적입니다.', whenToUse: '집중이 되지 않거나 중요한 작업을 해야 할 때 사용합니다.', symbolsExplained: '한 점으로 모이는 빛 문양이 집중의 힘을 상징합니다.', howToUse: '모니터 옆이나 책상 위에 놓아둡니다.', svgKey: 'jipjungryeok' },
  { id: 'jijie', name: '지혜부', hanja: '智慧符', category: '학업', description: '지혜를 넓히고 통찰력을 높여주는 부적입니다.', whenToUse: '어려운 결정을 내려야 하거나 깊은 사고가 필요할 때 사용합니다.', symbolsExplained: '문수보살의 지혜를 상징하는 연꽃과 칼 문양입니다.', howToUse: '명상 시 가까이 두거나 서재에 놓아둡니다.', svgKey: 'jijie' },
  { id: 'gigak', name: '기억력부', hanja: '記憶力符', category: '학업', description: '기억력을 증진시키고 건망증을 줄여주는 부적입니다.', whenToUse: '시험 공부 중이거나 기억력이 필요한 일을 할 때 사용합니다.', symbolsExplained: '뇌를 상징하는 구불구불한 문양이 기억의 연결을 나타냅니다.', howToUse: '공부하는 책상 위에 놓아둡니다.', svgKey: 'gigak' },
  { id: 'changjak', name: '창작영감부', hanja: '創作靈感符', category: '학업', description: '창작 활동에 영감을 불어넣어주는 부적입니다.', whenToUse: '예술 활동, 글쓰기, 아이디어가 필요할 때 사용합니다.', symbolsExplained: '봉황 문양이 하늘의 영감과 창조력을 상징합니다.', howToUse: '작업실이나 창작 공간에 놓아둡니다.', svgKey: 'changjak' },

  // ── 기타 (Other) ──
  { id: 'yeonae', name: '연애운부', hanja: '戀愛運符', category: '기타', description: '좋은 인연을 만나고 사랑이 이루어지도록 돕는 부적입니다.', whenToUse: '좋은 사람을 만나고 싶거나 짝사랑이 이루어지길 바랄 때 사용합니다.', symbolsExplained: '나비 한 쌍과 꽃 문양이 아름다운 인연을 상징합니다.', howToUse: '지갑이나 핸드폰 케이스에 넣어 항상 지닙니다.', svgKey: 'yeonae' },
  { id: 'inbok', name: '인복부', hanja: '人福符', category: '기타', description: '좋은 사람들을 만나고 인복이 넘치게 해주는 부적입니다.', whenToUse: '대인관계가 어렵거나 좋은 인연이 필요할 때 사용합니다.', symbolsExplained: '다섯 사람이 원을 이루는 문양이 화합을 상징합니다.', howToUse: '명함 지갑이나 가방에 넣어 다닙니다.', svgKey: 'inbok' },
  { id: 'songsa', name: '송사필승부', hanja: '訟事必勝符', category: '기타', description: '소송이나 분쟁에서 반드시 이기도록 돕는 부적입니다.', whenToUse: '법적 분쟁이나 중요한 협상을 앞두고 있을 때 사용합니다.', symbolsExplained: '저울 문양이 정의와 승리를 나타냅니다.', howToUse: '서류와 함께 두거나 법원 방문 시 지닙니다.', svgKey: 'songsa' },
  { id: 'yehaeng', name: '여행안전부', hanja: '旅行安全符', category: '기타', description: '여행 중 안전을 지켜주고 무사귀환을 돕는 부적입니다.', whenToUse: '먼 길을 떠나거나 해외여행을 할 때 사용합니다.', symbolsExplained: '구름과 길 문양이 안전한 여정을 상징합니다.', howToUse: '여행 가방이나 여권 케이스에 넣어둡니다.', svgKey: 'yehaeng' },
  { id: 'haewon', name: '해원부', hanja: '解冤符', category: '기타', description: '원한과 억울함을 풀어주는 부적입니다.', whenToUse: '억울한 일을 당했거나 마음의 응어리를 풀고 싶을 때 사용합니다.', symbolsExplained: '매듭이 풀리는 문양이 원한의 해소를 나타냅니다.', howToUse: '조용한 곳에서 마음을 가라앉히며 바라봅니다.', svgKey: 'haewon' },
  { id: 'obang', name: '오방부', hanja: '五方符', category: '기타', description: '동서남북과 중앙 다섯 방향의 기운을 조화시키는 부적입니다.', whenToUse: '이사하거나 새로운 공간을 정화할 때 사용합니다.', symbolsExplained: '다섯 색의 방위 문양이 공간의 조화를 상징합니다.', howToUse: '집의 중심에 놓거나 각 방향에 작은 부적을 배치합니다.', svgKey: 'obang' },
  { id: 'taepyeong', name: '태평부', hanja: '太平符', category: '기타', description: '세상의 태평과 개인의 평안을 기원하는 부적입니다.', whenToUse: '마음의 평화가 필요하거나 세상이 안정되길 바랄 때 사용합니다.', symbolsExplained: '태극 문양과 구름이 어우러져 태평성대를 나타냅니다.', howToUse: '거실이나 명상 공간에 걸어둡니다.', svgKey: 'taepyeong' },
  { id: 'gwanjae', name: '관재해소부', hanja: '官災解消符', category: '기타', description: '관청으로부터의 재앙을 해소하는 부적입니다.', whenToUse: '공무 관련 문제가 있거나 관공서 일이 꼬일 때 사용합니다.', symbolsExplained: '구름이 걷히는 문양이 관재의 해소를 상징합니다.', howToUse: '서류함이나 서재에 놓아둡니다.', svgKey: 'gwanjae' },
  { id: 'gilmong', name: '길몽부', hanja: '吉夢符', category: '기타', description: '좋은 꿈을 꾸게 하고 꿈을 통해 길한 징조를 얻는 부적입니다.', whenToUse: '중요한 결정 전에 좋은 꿈으로 지침을 얻고 싶을 때 사용합니다.', symbolsExplained: '초승달과 별 문양이 꿈의 세계와 길함을 상징합니다.', howToUse: '베개 밑에 놓고 잠자리에 듭니다.', svgKey: 'gilmong' },
  { id: 'toji', name: '토지부', hanja: '土地符', category: '기타', description: '토지와 관련된 일이 잘 풀리도록 돕는 부적입니다.', whenToUse: '부동산 거래나 건축, 이사 등 땅과 관련된 일이 있을 때 사용합니다.', symbolsExplained: '산과 땅의 문양이 토지신의 보호를 나타냅니다.', howToUse: '해당 토지에 묻거나 계약서와 함께 둡니다.', svgKey: 'toji' },
];

export const TOTAL_TALISMAN_COUNT = TALISMAN_ENCYCLOPEDIA.length;
