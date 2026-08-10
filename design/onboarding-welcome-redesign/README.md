# Handoff: 수호부 온보딩 첫 화면 리디자인

## Overview

`hipergroup/bujeok-app` 의 온보딩 1단계(웰컴) 화면을 전통 한지 방향으로 리디자인한 결과물입니다. 기존 화면은 베이지 배경 위에 베이지 카드가 얹혀 대비가 약하고 카드 그리드가 단조로웠습니다. 이번 리디자인은 한지 질감 배경 위에 먹(#2E2E2E)·인주(#A72B21)·황토금(#8F6B14) 세 색만 쓰고, 붓글씨 워드마크와 오방색 노리개·구름/팔괘·장승 삽화를 배치해 전통적 인상을 강화했습니다.

이 문서는 **온보딩 1단계만** 픽셀 단위로 규정합니다. 나머지 온보딩 2~4단계, 홈, 부적 만들기 등은 같은 색 토큰·폰트만 적용하면 되며 레이아웃 변경은 이 핸드오프 범위가 아닙니다 (`reference/` 의 프로토타입에 함께 들어 있으니 참고용으로만 보세요).

## About the Design Files

`reference/` 폴더의 HTML 파일은 **디자인 레퍼런스**입니다 — 의도한 외형과 동작을 보여주는 프로토타입이지, 그대로 복사해 넣을 프로덕션 코드가 아닙니다.

작업의 목표는 이 HTML 디자인을 **대상 코드베이스의 기존 환경(Next.js + React + Tailwind)에서, 그 코드베이스의 기존 패턴과 라이브러리로 다시 구현**하는 것입니다. HTML을 그대로 올리지 마세요.

`reference/support.js` 는 프로토타입 렌더링용 런타임이며 프로덕션과 무관합니다. 열어볼 필요 없습니다.

## Fidelity

**High-fidelity (hifi)** 입니다. 아래의 색상·타이포·간격·수치는 최종값이며, 그대로 재현하는 것이 목표입니다. 임의로 반올림하거나 가장 가까운 Tailwind 클래스로 치환하지 마세요 (§Tailwind 주의 참고).

## Screens / Views

### 온보딩 1단계 — 웰컴

- **Name**: Onboarding Step 1 (Welcome)
- **Purpose**: 앱의 첫인상을 전달하고, 세 가지 핵심 가치를 보여준 뒤 온보딩을 시작시킨다.
- **Frame**: 390 × 844 (iPhone 기준). 아래 모든 좌표는 이 프레임 기준의 절대값입니다.

#### Layout

프레임 전체가 한지 배경. 컨테이너는 세로 flex, `padding: 64px 30px 34px`, `box-sizing: border-box`.

```
┌─ 390 × 844 ───────────────────────────┐
│  [노리개 + 밧줄]        [구름·팔괘]    │  ← 둘 다 absolute, 프레임 밖으로 걸침
│                                        │
│           (flex: 1, 중앙 정렬)         │
│              워드마크 248px            │
│           오늘의 마음을 지키는 부적     │
│              매듭 구분선 250px         │
│                                        │
│         壹 │ 만세력 기반…              │
│         貳 │ 마음을 담아…    [장승]    │
│         參 │ 오늘의 마음을…            │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │            시작하기               │  │  ← CTA
│  └──────────────────────────────────┘  │
│              ▬ · · ·                   │  ← 인디케이터
└────────────────────────────────────────┘
```

레이어 순서(뒤 → 앞): 한지 배경 → 구름·팔괘 → 장승 → 노리개 → 본문(워드마크·소제목·구분선·소개 3줄) → CTA·인디케이터.

노리개는 워드마크와 **겹쳐도 됩니다** (의도된 연출). 워드마크가 위에 옵니다.

#### Components

**1. 한지 배경**

```css
background: #F2E7CE url(/brand/hanji-bg.jpg) 22% 92% / 190% auto no-repeat;
```

`background-position` 은 배경 이미지 안의 무늬(구름·낙관)를 피해 평평한 결만 보이도록 고른 값입니다. 임의로 바꾸면 원치 않는 그림이 들어옵니다.

**2. 오방색 노리개 + 밧줄**

래퍼(위치·크기·흔들림 담당):
```css
position: absolute;
left: -30px;
top: 78px;
width: 215px;
transform-origin: 100px -78px;   /* = (width × 0.465, -top) — 밧줄 상단이 회전축 */
animation: sway 6.5s ease-in-out infinite;
```

밧줄 (래퍼의 **첫 자식**, 노리개 이미지보다 앞에 위치):
```css
position: absolute;
left: 45.2%;
width: 2.2%;                     /* 노리개 폭 대비 비율 — 크기 바꿔도 두께가 따라옴 */
top: -84px;                      /* = -(top + 6) */
height: 86px;                    /* = top + 8, 프레임 상단까지 닿게 */
background: url(/brand/rope.png) center top / 100% auto repeat-y;
filter: brightness(.95) saturate(1.05) hue-rotate(-4deg);
```

노리개 이미지:
```css
width: 100%; height: auto; display: block;
```
`assets/norigae.png`

흔들림:
```css
@keyframes sway {
  0%, 100% { transform: rotate(-1.6deg); }
  50%      { transform: rotate(1.6deg); }
}
```

> **밧줄 타일 주의**: `rope.png` 는 49 × 72px 이며, 원본 밧줄의 **꼬임 한 주기**를 정확히 잘라낸 타일입니다. 반드시 `repeat-y` 로만 쓰세요 — 세로로 늘리거나(`100% 100%`) `repeat` 로 바꾸면 이음매가 보입니다. `left: 45.2%` / `width: 2.2%` 는 노리개 그림에 실제로 그려진 밧줄의 픽셀 위치·두께를 측정해 맞춘 값입니다.

**3. 구름 · 팔괘 (오른쪽 위)**

```css
position: absolute; top: 30px; right: -46px; width: 295px;
height: auto; display: block; pointer-events: none;
```
`assets/cloud-trigram.png`

**4. 장승 (오른쪽 아래)**

```css
position: absolute; bottom: 124px; right: 0; width: 220px;
height: auto; display: block; opacity: .9; pointer-events: none;
```
`assets/jangseung.png`

**5. 워드마크**

```css
width: 248px; height: auto; display: block;
```
`assets/wordmark-mark.png` — 붓글씨 "수호부" + 守護符印 낙관. 투명 PNG.

등장 애니메이션:
```css
animation: inkin .7s ease both;

@keyframes inkin {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
```

**6. 소제목**

내용: `오늘의 마음을 지키는 부적`
```css
margin-top: 22px;
font-size: 14px;
color: rgba(46, 46, 46, .55);
letter-spacing: .04em;
```

**7. 매듭 문양 구분선**

```css
width: 250px; height: auto; display: block;
margin-top: 20px;
opacity: .85;
```
`assets/divider.png` — 가운데 매듭 문양이 있는 금색 가로선. 원본의 크로마키 배경은 제거된 상태입니다.

**8. 소개 3줄**

목록 컨테이너:
```css
margin-top: 54px;
padding-left: 34px;
display: flex;
flex-direction: column;
gap: 14px;
width: 100%;
box-sizing: border-box;
```

각 줄:
```css
display: flex; align-items: center; gap: 12px; text-align: left;
```

숫자 한자 (壹 / 貳 / 參):
```css
font-family: 'Song Myung', serif;
font-size: 16px;
color: #7A4A34;
width: 20px;
flex: none;
text-align: center;
```

세로 구분선 (한자와 설명 사이, 줄마다 하나):
```css
flex: none;
width: 1px;
height: 16px;
background: rgba(122, 74, 52, .35);
```

설명 글씨:
```css
font-size: 13.5px;
color: rgba(46, 46, 46, .72);
letter-spacing: -.02em;
```

문구 — **그대로 사용**:

| | 한자 | 문구 |
|---|---|---|
| 1 | 壹 | 만세력 기반 정확한 사주 풀이 |
| 2 | 貳 | 마음을 담아 만드는 나만의 부적 |
| 3 | 參 | 오늘의 마음을 나누는 다정한 상담 |

> 壹·貳·參 은 1·2·3의 갖은자(격식체 숫자)입니다.

**9. CTA 버튼**

내용: `시작하기` (2단계 `사주 풀이 보기`, 3단계 `첫 부적 받기`, 4단계 `부적함에 담고 시작`)

```css
flex: 1;
background: #A72B21;
color: #FBF3E0;
text-align: center;
padding: 17px;
font-size: 16px;
letter-spacing: .08em;
cursor: pointer;
border: 1px solid #7E1D16;
box-shadow: inset 0 0 0 1px rgba(247, 233, 207, .35),
            0 8px 22px rgba(167, 43, 33, .25);
```

CTA 행: `display: flex; gap: 10px; margin-top: 24px;`
2단계부터는 왼쪽에 뒤로가기 버튼이 붙습니다:
```css
width: 52px; display: flex; align-items: center; justify-content: center;
border: 1px solid rgba(122, 74, 52, .3);
color: rgba(46, 46, 46, .6); font-size: 16px; cursor: pointer;
```
(내용: `‹`)

**10. 페이지 인디케이터**

```css
/* 컨테이너 */
display: flex; gap: 5px; justify-content: center; margin-top: 16px;

/* 현재 단계 */
width: 18px; height: 5px; background: #A72B21; transition: all .3s;

/* 나머지 */
width: 5px;  height: 5px; background: rgba(122, 74, 52, .3); transition: all .3s;
```

총 4개 (온보딩 4단계).

## Interactions & Behavior

- **CTA 탭** → 다음 온보딩 단계로. 4단계에서 탭하면 홈으로 진입.
- **뒤로가기(‹) 탭** → 이전 단계로. 1단계에서는 표시하지 않음.
- **노리개 흔들림** — `sway` 키프레임, 6.5초 주기 무한 반복, `ease-in-out`. 회전축은 밧줄 최상단(프레임 밖). 사용자 조작과 무관하게 상시 재생.
- **단계 전환 애니메이션** — 각 단계 콘텐츠에 `inkin .5s ease both` (1단계만 `.7s`).
- **인디케이터** — 활성 점이 `width: 5px → 18px` 로 `.3s` 전환.
- 로딩/에러 상태 없음. 폼 검증 없음 (2단계 생년월일 입력부터 발생).
- 반응형 — 390 × 844 고정 설계. 더 좁은 기기에서는 좌우 `padding` 을 30px → 24px 로 줄이고, 장식(노리개·구름·장승)은 비율 유지한 채 축소하세요. 장식은 모두 `pointer-events: none` 이라 축소해도 조작을 방해하지 않습니다.

## State Management

이 화면에 필요한 상태는 하나뿐입니다.

| 변수 | 타입 | 초기값 | 설명 |
|---|---|---|---|
| `step` | `0 \| 1 \| 2 \| 3` | `0` | 현재 온보딩 단계 |

전이:
- CTA 탭 → `step < 3` 이면 `step + 1`, `step === 3` 이면 홈으로 라우팅
- 뒤로가기 탭 → `step - 1`

데이터 페칭 없음. 2단계(생년월일)부터 사주 계산 상태가 추가되지만 이 핸드오프 범위 밖입니다.

## Design Tokens

### Colors

| 토큰 | 값 | 용도 |
|---|---|---|
| `--paper` | `#F2E7CE` | 한지 바탕 |
| `--ink` | `#2E2E2E` | 먹 — 본문·제목 |
| `--vermilion` | `#A72B21` | 인주 — CTA·강조 |
| `--vermilion-deep` | `#7E1D16` | CTA 테두리 |
| `--vermilion-tint` | `#FBF3E0` | CTA 위 글자 |
| `--ochre` | `#8F6B14` | 황토 금 — 보조 강조 |
| `--sepia` | `#7A4A34` | 갈색 — 숫자 한자·구분선 |
| `--paper-card` | `#FDFAF0` | 부적 종이 (다른 화면) |

투명도 파생값: 본문 `rgba(46,46,46,.72)`, 보조문 `.55`, 흐린 라벨 `.42`, 테두리 `rgba(122,74,52,.3)`, 세로 구분선 `rgba(122,74,52,.35)`.

기존 베이지 계열 변수를 위 값으로 교체하세요.

### Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Song+Myung&display=swap" rel="stylesheet">
```

- 본문 · UI: `'Gowun Batang', serif`
- 한자 · 제목 · 숫자: `'Song Myung', serif`

| 역할 | 크기 | 색 | 자간 |
|---|---|---|---|
| 소제목 | 14px | `rgba(46,46,46,.55)` | `.04em` |
| 소개 설명 | 13.5px | `rgba(46,46,46,.72)` | `-.02em` |
| 숫자 한자 | 16px | `#7A4A34` | — |
| CTA | 16px | `#FBF3E0` | `.08em` |

### Spacing

수직 리듬: `14 / 16 / 20 / 22 / 24 / 34 / 54` px
컨테이너 패딩: `64px 30px 34px`
줄 내부 좌우 간격: `12px`

### Border radius / Shadow

- 각지게 유지 — 카드·버튼 모두 `border-radius: 0`. (프레임 자체의 `38px` 은 기기 목업용이며 앱에 넣지 않습니다.)
- CTA 그림자: `inset 0 0 0 1px rgba(247,233,207,.35), 0 8px 22px rgba(167,43,33,.25)`

## Assets

모두 `assets/` 에 있으며 저장소 `public/brand/` 로 복사하면 됩니다.

| 파일 | 크기 | 용도 | 비고 |
|---|---|---|---|
| `hanji-bg.jpg` | 900 × 1599 | 전 화면 한지 배경 | 저장소 원본 (`public/brand/hanji-bg.jpg`) |
| `wordmark-mark.png` | — | 붓글씨 워드마크 | 저장소 원본 |
| `norigae.png` | — | 오방색 노리개 | 사용자 제공, 투명 PNG |
| `cloud-trigram.png` | — | 구름·팔괘 | 사용자 제공, 투명 PNG |
| `jangseung.png` | — | 장승 | 사용자 제공, 투명 PNG |
| `rope.png` | 49 × 72 | 밧줄 세로 반복 타일 | 사용자 제공 원본에서 꼬임 1주기 추출 · `repeat-y` 전용 |
| `divider.png` | 1690 × 127 | 매듭 문양 구분선 | 사용자 제공 원본에서 크로마키 제거 |

## Tailwind 주의

이 코드베이스는 Tailwind를 씁니다. 아래 값들은 기본 스케일에 없으므로 `tailwind.config` 에 추가하거나 인라인 `style` 로 두세요. 가장 가까운 클래스로 반올림하면 시안과 눈에 띄게 달라집니다.

- `letter-spacing`: `-.02em`, `.04em`, `.08em`
- `font-size`: `13.5px`
- `width`: `2.2%` (밧줄), `18px` (활성 인디케이터)
- `background-position`: `22% 92%` / `background-size`: `190% auto`
- 커스텀 그림자 2종

## Files

| 파일 | 설명 |
|---|---|
| `reference/수호부 화면.dc.html` | 화면 하나짜리 프로토타입. **이 문서가 규정하는 온보딩 1단계의 원본**입니다. 온보딩 2~4단계, 홈, 부적 만들기, 부적함, 도감, 마이페이지, 위젯까지 15개 화면이 모두 들어 있습니다. |
| `reference/수호부 전체화면.dc.html` | 위 15개 화면을 한 판에 펼쳐 보여주는 파일. 전체 흐름 파악용. |
| `reference/support.js` | 프로토타입 런타임. 프로덕션과 무관. |

브라우저에서 `수호부 전체화면.dc.html` 을 열면 15개 화면이 모두 동작 상태로 보입니다.

## 반영 순서 제안

1. `assets/` → 저장소 `public/brand/` 복사
2. `src/app/globals.css` — 색 토큰 교체, 폰트 링크 추가
3. `src/app/onboarding/page.tsx` — 1단계 레이아웃 교체
4. 나머지 온보딩 3단계 · 홈 — 같은 토큰·폰트만 적용 (레이아웃 변경 없음)
