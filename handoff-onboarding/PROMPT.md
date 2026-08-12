# Claude Code 에 붙여넣을 명령어

레포를 클론한 폴더에서 `claude` 를 실행한 뒤, 아래를 통째로 붙여넣으세요.
`handoff-onboarding/SPEC.md` 를 레포 루트에 먼저 복사해 두어야 합니다.

---

## 1) 준비 (터미널)

```bash
cd ~/path/to/bujeok-app
git checkout main && git pull

# 이 프로젝트에서 내려받은 handoff-onboarding 폴더를 레포에 복사
cp -R ~/Downloads/handoff-onboarding ./

git checkout -b redesign/onboarding-2-3-4
claude
```

---

## 2) Claude Code 프롬프트 (통째로 복사)

```
handoff-onboarding/SPEC.md 를 읽고 온보딩 2·3·4단계를 리디자인해줘.

대상은 src/app/onboarding/page.tsx 한 파일이고,
StepBirthInfo(2단계) · StepSajuResult(3단계) · 첫 부적 선물(4단계)만 수정한다.
StepWelcome(1단계)은 이미 반영이 끝났으니 절대 건드리지 마.

작업 원칙:
- SPEC.md 의 수치(px, 색상 hex, 투명도, letter-spacing)를 그대로 지켜. 근사치로 바꾸지 마.
- 색은 globals.css 의 --color-* 변수를 쓰고, SPEC 표에 있는 값과 다르면 SPEC 을 따라.
- 새 에셋은 추가하지 마. hanji-bg.jpg / public/zodiac/*.png / hosinbu-gift.png 는 이미 레포에 있다.
- ScrollPicker, FloatingParticles 는 2·3·4단계에서 제거하고,
  다른 파일에서 참조가 없으면 정의도 삭제해.
- 이모지(💡 ⚡ ⚠️)는 SPEC 에 지정된 한자·선 아이콘·텍스트로 대체해.
- getSaju / getSajuYear / getAnimal / getOheng / getSajuReading / getYongsin / isSamjae
  호출부는 지금 로직을 그대로 유지해. 계산은 건드리지 말고 표현만 바꿔.

새 기능 두 가지:
1. 2단계에 성별 선택(坤 여자 / 乾 남자)을 추가한다. 필수 입력이고,
   미선택이면 CTA 를 disabled 로 둔다. user_profile.gender 에 'female'|'male' 로 저장한다.
   ※ 대운 계산 함수가 성별 인자를 받지 않으면 저장만 하고 계산 반영은 하지 마.
      그 경우 무엇을 남겨뒀는지 마지막에 알려줘.
2. 2단계에 양력/음력 토글 UI를 넣는다. 음→양 변환 함수가 레포에 없으면
   음력 버튼을 disabled 로 두고 "준비 중" 을 표시해. 동작하는 척 만들지 마.

작업 순서:
1. 먼저 src/app/onboarding/page.tsx 와 src/app/globals.css 를 읽고,
   지금 구조와 SPEC 의 차이를 요약해서 보여줘. 거기서 한 번 멈춰.
2. 내가 확인하면 2단계부터 순서대로 고치고, 단계마다 npm run build 로 타입 검사를 해.
3. 다 끝나면 변경 요약과 SPEC 완료 기준 체크리스트를 채워서 보여줘.

커밋은 단계별로 나눠서:
  redesign(onboarding): 2단계 생년월일 격자 입력 + 성별 선택
  redesign(onboarding): 3단계 사주 결과 한지 정리
  redesign(onboarding): 4단계 첫 부적 선물 정리
```

---

## 3) 확인 후 푸시

```bash
npm run dev        # http://localhost:3000/onboarding 에서 2→3→4단계 확인
npm run build      # 타입·빌드 확인

git push -u origin redesign/onboarding-2-3-4
```

PR 을 열고 머지하면 끝입니다.

---

## 참고 — 디자인 원본

이 프로젝트의 `suhobu-app.dc.html` 이 실제로 동작하는 원본입니다.
`start` 값을 바꾸면 해당 화면이 뜹니다.

| 화면 | start 값 |
|---|---|
| A1 생년월일 | `birth` |
| A2 사주 결과 | `saju` |
| A3 첫 부적 | `gift` |

`suhobu-all-screens.dc.html` 을 열면 A1~A13 을 한 화면에서 볼 수 있습니다.
