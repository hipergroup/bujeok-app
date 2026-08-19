# 온보딩 배경지 불일치 수정

## 증상
온보딩 1단계와 2·3·4단계의 한지 배경이 다른 종이처럼 보인다.

## 원인
같은 `public/brand/hanji-bg.jpg` 를 쓰지만 **크롭과 배율이 다르다.**

| 위치 | 코드 | 배경 지정 |
|---|---|---|
| 1단계 | `src/app/onboarding/page.tsx` StepWelcome 내부 (약 245행) | `#F2E7CE url(hanjiBg) 22% 92% / 190% auto no-repeat` |
| 2·3·4단계 | `src/components/hanji/HanjiBackground.tsx` | `cover` + `center top` |

1단계는 종이의 왼쪽 아래(구름·바램이 있는 부분)를 190%로 확대해 쓰고,
`HanjiBackground` 는 종이 위쪽을 화면에 꽉 채운다. 그래서 결이 다르게 보인다.

## 수정 방향
**HanjiBackground 를 기준으로 통일한다.** 배경 지정은 한 군데만 두고,
StepWelcome 의 자체 배경은 없앤다.

### 1. `src/components/hanji/HanjiBackground.tsx`

고정 배경 div 의 style 을 1단계와 같은 값으로 바꾼다.

```diff
       <div
         aria-hidden
         className="pointer-events-none fixed inset-0 z-0"
         style={{
-          backgroundImage: `url(${hanjiPaper.src})`,
-          backgroundSize: 'cover',
-          // 화면 맨 위부터 꽉 차게 — 종이의 윗부분(구름·낙관)이 잘리지 않는다
-          backgroundPosition: 'center top',
-          backgroundRepeat: 'no-repeat',
+          // 온보딩 1단계와 같은 크롭 — 종이 왼쪽 아래의 구름·바램이 화면에 온다.
+          // 이 값은 디자인 기준이므로 앱 전체에서 이 한 군데만 유지한다.
+          background: `#F2E7CE url(${hanjiPaper.src}) 22% 92% / 190% auto no-repeat`,
         }}
       />
```

주석도 함께 고칠 것. 기존 주석이 `center top` 을 설명하고 있어 그대로 두면 거짓말이 된다.

### 2. `src/app/onboarding/page.tsx` — StepWelcome (약 238~248행)

StepWelcome 이 직접 깔던 배경 div 를 제거하고, 페이지 최상위의
`HanjiBackground` 가 깔아주는 배경을 그대로 쓴다.

- 약 245행의 `background: `#F2E7CE url(${hanjiBg.src}) 22% 92% / 190% auto no-repeat`` 를 가진
  배경 전용 div 를 삭제한다.
- 그 div 만 없애고, 안의 워드마크·태그라인·壹貳參 목록은 건드리지 않는다.
- 삭제 후 `hanjiBg` import(17행)가 이 파일에서 더 쓰이지 않으면 import 도 지운다.
- StepWelcome 이 `HanjiBackground` 로 감싸인 트리 안에 있는지 확인할 것.
  감싸여 있지 않다면 배경 div 를 지우는 대신 위 1번과 **똑같은 값**으로 맞춘다.

## 확인
1. `npm run build` 로 타입 검사.
2. 1 → 2 → 3 → 4단계를 차례로 넘기며 배경 결이 이어지는지 본다.
   종이가 화면에 고정(`fixed`)되어 있으므로 단계가 바뀌어도 결이 움직이지 않아야 한다.
3. 스크롤이 긴 3단계(사주 결과)에서 종이가 따라 흐르지 않는지 확인.

## 하지 말 것
- 새 이미지 추가나 `hanji-bg.jpg` 재가공.
- `--color-hanji` 값(`#F2E7CE`) 변경 — themeColor·iOS 배경과 같은 값이다.
- 단계별로 배경을 다르게 두는 방식. 배경 지정은 `HanjiBackground` 한 군데에만 있어야 한다.
