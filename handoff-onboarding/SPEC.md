# 온보딩 2·3·4단계 한지 리디자인 — 구현 스펙

대상 파일: `src/app/onboarding/page.tsx`
적용 범위: `StepBirthInfo`(2단계) · `StepSajuResult`(3단계) · 첫 부적 선물(4단계)
1단계 `StepWelcome`은 이미 반영 완료 — **건드리지 않는다.**

새로 추가할 에셋 없음. 아래 파일이 모두 레포에 이미 있다.
`public/brand/hanji-bg.jpg` · `public/zodiac/*.png`(AnimalMotif 경유) · `public/talismans/hosinbu-gift.png`

---

## 0. 공통 규칙

### 토큰 (globals.css 변수 그대로)
| 이름 | 값 | 용도 |
|---|---|---|
| `--color-juhong` | `#A72B21` | 주요 강조·CTA·인장 |
| `--color-juhong-deep` | `#7E1D16` | CTA 테두리 |
| `--color-juhong-tint` | `#FBF3E0` | CTA 글자 |
| `--color-meok` | `#2E2E2E` | 본문 |
| `--color-galsaek` | `#7A4A34` | 보조 텍스트·카드 머리 |
| `--color-ssuk` | `#6B7D63` | 강점 블록 |
| `--color-hwang` | `#DAA017` | 주의 블록 |
| 한지 바탕 | `#F2E7CE` + `hanji-bg.jpg 22% 92% / 190% auto no-repeat` | 전 화면 |
| 카드 바탕 | `rgba(255,253,248,.82)` | 모든 카드 |
| 카드 테두리 | `1px solid rgba(122,74,52,.2)` | 모든 카드 |

오행 색은 기존 `OHENG_COLORS` 상수를 그대로 쓴다.

### 폰트
- 제목·한자: `font-serif-kr` (Song Myung 계열)
- 본문: 기본 (Gowun Batang)
- 한자 letter-spacing `.14em`, 카드 머리표는 12px `--color-galsaek`

### 이번에 걷어낼 것 (2·3·4단계 전부)
1. **`ScrollPicker` 컴포넌트 삭제** — 3열 휠은 390px 폭에서 값이 가려진다. 격자 입력으로 대체.
2. **`FloatingParticles` 호출 전부 제거** — 한지 질감과 충돌. 컴포넌트 정의도 다른 데서 안 쓰면 삭제.
3. **골드 그라데이션 CTA 제거** — `linear-gradient(135deg, GOLD, GOLD_DARK)` → `TraditionalButton` 사용.
4. **이모지 제거** — `💡`, `⚡`, `⚠️`, `✓`, `●` → 아래 각 항목에 지정된 대체 표기.
5. **`rounded-2xl`(16px) → `rounded-xl`(12px)** 로 통일. 부적 종이만 `rounded-[3px]`.

### CTA 공통
`TraditionalButton` 을 그대로 쓰되 각지지 않게 `rounded-lg`(8px)를 덧댄다.
```
border: 1px solid var(--color-juhong-deep);
box-shadow: inset 0 0 0 1px rgba(247,233,207,.35), 0 8px 22px rgba(167,43,33,.25);
padding: 17px; font-size: 16px; letter-spacing: .08em;
```

### 진행 표시 (2·3·4단계 공통)
`ProgressBar` 를 아래로 교체한다. 화면 상단 `padding: 56px 26px 0` 안쪽 첫 요소.
```
[■■■■][■■■■][·][·]   2 / 4
```
- 완료·현재 단계: `width:22px; height:3px; background:#A72B21`
- 미완료: `width:5px; height:3px; background:rgba(122,74,52,.3)`
- gap 5px, 오른쪽 끝에 `2 / 4` (11px, `rgba(46,46,46,.35)`)

---

## 1. A1 — 2단계 생년월일 (`StepBirthInfo`)

컨테이너: `padding: 56px 26px 40px`, 세로 스크롤.

### 1-1. 제목
```
태어난 날을
알려주세요
```
serif-kr 25px / line-height 1.5, 진행 표시 아래 `margin-top:26px`.

부제 (10px 아래, 12.5px, `rgba(46,46,46,.45)`, line-height 1.8):
```
만세력(萬歲曆)으로 정확히 풀어드릴게요.
입력한 정보는 이 기기에만 저장됩니다.
```

### 1-2. 생년월일 카드 `生年月日`
카드 머리 (`padding:10px 16px`, `background:rgba(122,74,52,.06)`, 아래 `1px solid rgba(122,74,52,.16)`):
- 왼쪽: `生年月日`
- 오른쪽: **양력 / 음력 토글** — 새 기능. 6px 라운드 박스에 2칸, 선택 시 `#A72B21` 바탕 + `#FBF3E0` 글자.
  - 음력 선택 시 `getSaju` 호출 전에 음→양 변환이 필요하다. 변환 함수가 없으면 **음력 토글을 비활성(disabled + "준비 중") 처리**하고 UI만 남길 것. 없는 기능을 되는 척하지 말 것.

본문 (`padding:18px 16px`, `grid-cols-[1.5fr_1fr_1fr]`, gap 10px) — 세 칸 모두 밑줄 입력:
- 숫자 22px `tabular-nums`, 오른쪽에 `年` `月` `日` (12px, `rgba(46,46,46,.4)`)
- 밑줄 `1.5px solid rgba(122,74,52,.32)`, `padding-bottom:8px`
- `<input type="number" inputMode="numeric">` 로 직접 타이핑. 범위: 년 1900~올해, 월 1~12, 일 1~해당 월 말일. 범위를 벗어나면 클램프.

### 1-3. 시진 카드 `時辰`
머리표 `時辰` + 보조 "태어난 시각".

본문: **12지시 4×3 그리드**. `gap:1px` + 컨테이너 `background:rgba(122,74,52,.14)` 로 격자선을 만든다(칸 배경은 `rgba(255,253,248,.9)`).

각 칸: 지지 한자 17px serif-kr / 아래 시간대 9.5px `rgba(46,46,46,.4)`
```
子 23-01   丑 01-03   寅 03-05   卯 05-07
辰 07-09   巳 09-11   午 11-13   未 13-15
申 15-17   酉 17-19   戌 19-21   亥 21-23
```
선택 칸: `background:rgba(167,43,33,.08)` + `box-shadow: inset 0 0 0 1.5px #A72B21`, 한자 색 `#A72B21`.

그리드 아래 전폭 한 줄 (`border-top:1px solid rgba(122,74,52,.14)`, `padding:12px`, 가운데 정렬, 12.5px):
`시각을 모르겠어요` — 선택 시 `HOUR_UNKNOWN`, 글자 `#A72B21` + 바탕 `rgba(167,43,33,.05)`.

기존 `HOURS` 상수의 `value`(0,2,4…22, -1)를 그대로 쓴다.

### 1-4. 성별 카드 `性別` — **신규**
머리표 `性別` + 보조 "대운의 방향이 달라져요".

본문 2칸 (`grid-cols-2`, gap 10px, 각 `padding:14px 0`, 9px 라운드):
- 왼쪽 `坤` + `여자`, 오른쪽 `乾` + `남자` (한자 19px serif-kr, 라벨 14px, gap 9px, 가운데 정렬)
- 미선택: 테두리 `rgba(122,74,52,.24)`, 바탕 `rgba(255,253,248,.7)`, 한자 `rgba(122,74,52,.65)`
- 선택: 테두리 `rgba(167,43,33,.45)`, 바탕 `rgba(167,43,33,.06)`, 한자·라벨 `#A72B21`

**필수 입력.** 대운 순행/역행이 성별로 갈리므로 미선택 시 CTA를 `disabled` 처리한다.
저장은 `user_profile.gender` (`'female' | 'male'`) — `/saju` 페이지의 gender 저장 패턴과 같은 키를 쓴다.

### 1-5. 이름 카드 `姓名`
한 줄. 머리표 `姓名` + 밑줄 input.
placeholder: `이름 (선택 · 낙관에 새겨져요)` — 15px, 밑줄 `1px solid rgba(122,74,52,.28)`.

### 1-6. 띠 미리보기
`margin-top:20px`, 테두리 `rgba(143,107,20,.35)`, 바탕 `rgba(255,250,236,.55)`, 12px 라운드, `padding:14px 16px`, 가로 flex gap 14px.
- 왼쪽: `AnimalMotif` 대신 **띠 일러스트 PNG 46×46** (`getAnimal().name` → `public/zodiac/{한글}.png`)
- 오른쪽 위: `{간지}년 · {띠}띠` (serif-kr 16px) 예) `丙子년 · 쥐띠`
- 오른쪽 아래: 11px `rgba(46,46,46,.45)`
  - 입춘 이후: `입춘(立春) 이후 출생이라 사주 연도도 {year}년입니다`
  - 입춘 이전: `입춘(立春) 전 출생이라 사주상 {sajuYear}년생으로 봅니다`

입력이 바뀔 때마다 갱신 — 지금 코드의 `useMemo(getAnimal / getSajuYear)` 그대로 쓴다.

### 1-7. CTA
`사주 풀이 보기` — `margin-top:24px`.

---

## 2. A2 — 3단계 사주 결과 (`StepSajuResult`)

컨테이너 `padding: 56px 22px 40px`. 섹션 간격 14px. 섹션 번호 뱃지는 기존 `SectionLabel` 유지하되 원형 19px `#A72B21` / 11px `#F6EDD9`.

### 2-1. 제목 (가운데)
`당신의 사주 풀이` serif-kr 24px / 아래 7px에 `어려운 말은 빼고, 쉽게 풀어드릴게요` 11.5px.
**`LotusMotif` 아이콘은 뺀다.**

### 2-2. 헤드라인 카드
`padding:22px 18px`, 가운데 정렬, 14px 라운드.
- 띠 일러스트 112×112 (PNG)
- 6px 아래: 알약 뱃지 `{띠}띠 {지지}` — 테두리 `rgba(167,43,33,.32)`, 바탕 `rgba(167,43,33,.07)`, 11.5px
- 14px 아래: `reading.headline` serif-kr 19px / line-height 1.6
- 12px 아래: `traits` 4개 — 알약, 테두리 `rgba(122,74,52,.22)`, 바탕 `rgba(122,74,52,.07)`, 11px
- 14px 아래: `animal.description` 12.5px / 1.85
- 16px 아래: 64×1px 구분선 `rgba(122,74,52,.24)`
- 12px 아래: `{sajuYear}년 {간지}년생 · {시진}({한자})` 11px `rgba(46,46,46,.38)`

`MountainMotif` 워터마크 제거. 띠 일러스트가 이미 그 역할을 한다.

### 2-3. ① 나를 나타내는 글자 (일간)
- 92×92 박스, 14px 라운드, `background:{ilganColor}14`, 테두리 `1.5px {ilganColor}61`
  - 한자 40px serif-kr `{ilganColor}` / 아래 5px `{천간} · {오행}` 10.5px
- 14px 아래: `당신은 {symbol} 같은 사람이에요` serif-kr 17px, symbol만 `{ilganColor}`
- 8px 아래: `#{keyword}` 알약
- 16px 아래 **강점 블록**: 테두리 `rgba(107,125,99,.28)`, 바탕 `rgba(107,125,99,.09)`, 10px 라운드
  - 머리 `이런 점이 강해요` 11.5px `#5C7350` bold
  - 항목 3개, 앞에 `✓` → **`#5C7350` 색 텍스트 그대로 유지**(이모지 아님, 유니코드 체크는 허용)
- 10px 아래 **주의 블록**: 테두리 `rgba(218,160,23,.34)`, 바탕 `rgba(218,160,23,.1)`
  - 머리 `여기를 돌보면 더 좋아져요` 11.5px `#9A6F0F`
  - 본문 12.5px / 1.7 — 항목 1~2개를 문장으로 이어 쓴다

### 2-4. ② 내 인생의 네 기둥
- 부제 `기둥마다 인생의 다른 시기를 맡고 있어요. 눌러보세요.` 11.5px
- 4칸 그리드 gap 8px, **시주 → 일주 → 월주 → 년주 순서** (지금 코드 순서 유지)
- 각 칸: 8px 라운드 박스 (`padding:11px 0`)
  - 일주: 바탕 `rgba(167,43,33,.08)`, 테두리 `1.5px rgba(167,43,33,.42)`, 위에 `나 자신` 알약 (8.5px, `#A72B21` 바탕)
  - 나머지: 바탕 `rgba(122,74,52,.05)`, 테두리 `1.5px rgba(122,74,52,.16)`
  - 천간 20px → 18×1px 선 → 지지 20px, 각각 `OHENG_COLORS`
  - 박스 아래: 기둥명 11px bold / 담당 영역 9px `rgba(122,74,52,.6)`
- 선택된 칸은 바깥 래퍼에 `background:rgba(167,43,33,.06)` + `inset 0 0 0 1px rgba(167,43,33,.28)`
- 아래 펼침 블록: 테두리 `rgba(167,43,33,.22)`, 바탕 `rgba(167,43,33,.05)`
  - `{기둥명}` + `{연령대}` 알약 + `{담당}` / 본문 12.5px
  - **접기 없이 항상 하나는 열려 있게** (초기값 일주). 지금처럼 `null` 로 시작하면 빈 자리가 생긴다.
- 시간 미상 주석은 그대로 유지 (10.5px)

### 2-5. ③ 내 안의 다섯 기운 (오행)
- 5칸 그리드 gap 6px, `align-items:end`
- 칸 구성 (위→아래): 점수 11px bold → 막대 → 오행명 13px serif-kr → 태그 알약 9.5px
- 막대: 높이 `max(score/max*88, 6)px`, `max-width:34px`, 위쪽만 5px 라운드,
  `linear-gradient(to top, {color}DD, {color}77)`, 최댓값 칸만 `box-shadow: 0 0 0 1.5px {color}`
- **`OHENG_META` 의 Motif 아이콘은 뺀다** — 5칸에 아이콘·숫자·막대·이름·태그까지 넣으면 과밀하다
- 아래 요약 블록: `{우세}` 알약 + `균형 · {BALANCE_TAG}` 알약 + `oheng.summary` 12.5px/1.8
- **`💡 advice` 줄과 `⚡ 보충` 블록은 3단계에서 뺀다.** 용신 카드와 내용이 겹친다 — `/saju` 풀이 화면으로 넘긴다.

### 2-6. 용신 카드
테두리 `{yongsinColor}52`, 바탕 `{yongsinColor}0F`, 14px 라운드, `padding:16px`.
- 왼쪽 56px 원 `background:{yongsinColor}`: 한자 23px `#F6EDD9` / 아래 한글 9px
- 오른쪽: `나에게 필요한 기운` 알약 + `용신(用神)` 10px
  - `지금 가장 잘 맞는 기운은 {오행}이에요` serif-kr 14.5px
- 12px 아래: `yongsin.headline` 12.5px / 1.8
- 기존의 "자세한 풀이는 내 사주 풀이에" 안내 문구는 유지해도 좋고, 빼도 좋다

### 2-7. 삼재 카드 (해당 시에만)
테두리 `rgba(167,43,33,.34)`, 바탕 `rgba(167,43,33,.06)`, 가로 flex gap 13px.
- 왼쪽 34×34 박스 8px 라운드, 테두리 `rgba(167,43,33,.35)`, 한자 `災` 16px `#A72B21` — **`⚠️` 대체**
- 오른쪽: `올해는 삼재(三災)의 해입니다 · {type}` 13px bold `#A72B21`
  - 7px 아래 본문 12.5px / 1.8
  - 문구는 겁주지 않게: `큰일이 난다는 뜻이 아니라, 벌였던 일을 정리하고 지키는 해라는 뜻이에요.`
- 흔들리는 `animate rotate` 제거.

### 2-8. CTA
`첫 부적 받기` — `margin-top:24px`.

---

## 3. A3 — 4단계 첫 부적 선물

세로 가운데 정렬. `padding: 56px 26px 40px`, `flex-col`, 본문 영역 `flex:1` 가운데.

- 진행 표시 (4/4, 네 칸 모두 채움)
- `첫 만남의 선물` 12px `rgba(46,46,46,.45)` letter-spacing .14em
- 12px 아래 serif-kr 25px / 1.55:
  ```
  삼재를 지나는 당신께
  호신부를 드립니다
  ```
  - 삼재가 아니면: `오늘부터 당신 곁에 / 호신부를 드립니다`
- 30px 아래 **호신부 이미지** (`hosinbu-gift.png`, width 214px)
  - 뒤에 숨빛: `radial-gradient(ellipse at center, rgba(167,43,33,.22), transparent 70%)`, `blur(24px)`, `inset:-14px`
  - 숨빛만 `breathe` 애니메이션 (3s, opacity .45↔.9 / scale .97↔1.03)
  - 그림자: `drop-shadow(0 2px 6px rgba(122,74,52,.35)) drop-shadow(0 10px 24px rgba(122,74,52,.25))`
  - **인장은 붙이지 않는다.** (앱이 주는 기성 부적이라 낙관 자리가 아니다)
  - 기존 `HosinbuTalisman` 의 `rotateY(90deg)` 회전 등장 → `opacity + translateY(18px)` 로 교체
- 26px 아래: `호신부` serif-kr 18px + `護身符` 12px `rgba(122,74,52,.7)`
- 12px 아래: 본문 13px / 2.05, `max-width:290px`
  ```
  몸과 마음을 지키는 부적이에요. 예로부터 먼 길을 떠나는 이의 품에 넣어
  보내던 것으로, 삼재의 해를 지날 때 곁에 두었습니다.
  ```
- 20px 아래: 알약 3개 `삼재의 해` `몸과 마음` `늘 지니는 부적` (11.5px, 테두리 `rgba(122,74,52,.26)`)
- 하단: CTA `부적함에 모시기` + 그 아래 12px 텍스트 링크 `위젯으로 두기`

---

## 4. 데이터 배선

| 항목 | 저장 위치 | 비고 |
|---|---|---|
| 생년월일시 | 기존 `saveProfile` 그대로 | 변경 없음 |
| 이름 | 기존 그대로 | 변경 없음 |
| **성별** | `user_profile.gender: 'female' \| 'male'` | 신규. `/saju` 의 gender 저장 패턴과 동일 키 |
| 양력/음력 | `user_profile.calendar: 'solar' \| 'lunar'` | 변환 함수 없으면 UI만, 저장 안 함 |

대운 계산에 성별이 필요하다면 `getDaeun` 계열 호출부에 넘겨준다. 지금 시그니처가 성별을 안 받으면 **이번 작업에서는 저장만 하고 계산 반영은 하지 않는다** — 별도 이슈로 남긴다.

---

## 5. 완료 기준

- [ ] 2·3·4단계에서 `ScrollPicker` · `FloatingParticles` · 골드 그라데이션 · 이모지가 모두 사라졌다
- [ ] 성별 미선택 시 2단계 CTA가 비활성이다
- [ ] 390px / 430px 폭 모두에서 12지시 4열이 깨지지 않는다
- [ ] 3단계 네 기둥이 처음부터 일주가 열린 상태다
- [ ] 4단계 호신부에 인장이 없다
- [ ] 1단계 `StepWelcome` 은 diff에 나타나지 않는다
