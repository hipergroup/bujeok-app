'use client';

// 운세 산정 기준 공개 — 무엇을 보고, 무엇은 보지 않는지 밝힌다.
// 숨기지 않는 것이 신뢰의 바탕이라 따로 화면을 뒀다.

import Link from 'next/link';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import BottomTab from '@/components/BottomTab';
import { BackIcon } from '@/components/hanji/motifs';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const JUHONG = '#A72B21';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 22 }}>
      <h2
        className="font-serif-kr font-bold"
        style={{ fontSize: 15, color: MEOK, marginBottom: 8 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col" style={{ gap: 7 }}>
      {items.map((t) => (
        <li key={t} className="flex items-start" style={{ gap: 7 }}>
          <span
            className="shrink-0"
            style={{ marginTop: 7, fontSize: 5, color: JUHONG, opacity: 0.7 }}
          >
            ●
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.8, color: `${MEOK}CC` }}>
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function FortuneKijunPage() {
  return (
    <HanjiBackground>
      <div className="mx-auto min-h-dvh w-full max-w-lg pb-32">
        <TraditionalHeader
          title="운세 산정 기준"
          showSeal
          left={
            <Link href="/" aria-label="뒤로가기">
              <BackIcon size={20} />
            </Link>
          }
        />

        <main className="px-5" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 13, lineHeight: 1.85, color: `${GALSAEK}DD` }}>
            수호부의 오늘의 운세는 두 단계로 만듭니다. 먼저 만세력으로{' '}
            <b style={{ color: MEOK }}>규칙에 따라 계산</b>하고, 그 계산 결과에
            맞는 문장을 고릅니다. 문장을 그때그때 지어내지 않기 때문에 같은 날
            여러 번 보셔도 결과가 달라지지 않습니다.
          </p>

          <Section title="무엇을 보고 계산하나요">
            <Bullets
              items={[
                '생년월일과 태어난 시각 (양력·음력, 윤달 포함)',
                '그것으로 세운 사주팔자 — 연주·월주·일주·시주',
                '오늘의 연주·월주·일주 (일운이 월운·세운 위에 겹칩니다)',
                '나의 일간(日干)과 오늘 천간의 십성 관계',
                '오행의 보완과 과다 — 사주에 부족한 기운과 넘치는 기운',
                '나의 일지와 오늘 일지의 관계 — 합·충·형·파·해',
              ]}
            />
          </Section>

          <Section title="오늘의 흐름은 이렇게 정합니다">
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.85,
                color: `${MEOK}CC`,
                marginBottom: 9,
              }}
            >
              두 가지만 봅니다. 오늘 들어오는 기운이 나에게 필요한 기운인지
              (용신·희신·기신), 그리고 나의 일지와 오늘 일지가 어떤 관계인지
              (합이면 순하고 충·형이면 어긋납니다). 이 둘을 더해 네 가지 중
              하나로 말씀드립니다.
            </p>
            <Bullets
              items={[
                '흐름이 좋은 날',
                '차분히 나아갈 날',
                '신중함이 필요한 날',
                '잠시 쉬어갈 날',
              ]}
            />
            <p
              style={{
                marginTop: 9,
                fontSize: 11.5,
                lineHeight: 1.8,
                color: `${GALSAEK}AA`,
              }}
            >
              87점처럼 숫자로 보여드리지 않습니다. 소수점까지 맞아떨어지는 듯한
              점수는 실제보다 정확해 보이게 만들기 때문입니다.
            </p>
          </Section>

          <Section title="지키는 약속">
            <Bullets
              items={[
                '같은 분이 하루에 몇 번 들어오셔도 같은 결과를 보여드립니다.',
                '자정이 지나면 다음 날 운세로 바뀝니다.',
                '태어난 시각을 모르시면 시주(時柱)를 빼고 풀며, 그 사실을 화면에 밝힙니다.',
                '같은 문구가 며칠 연속 나오지 않도록 최근 14일 문구를 피합니다.',
                '`무조건 ~합니다` 같은 단정하는 표현은 쓰지 않습니다.',
                '의료·투자·계약을 대신 결정해드리지 않습니다. 참고로만 말씀드립니다.',
                '계산에서 나오지 않은 내용은 문장에 넣지 않습니다.',
              ]}
            />
          </Section>

          <Section title="이건 하지 않습니다">
            <Bullets
              items={[
                '운세 결과를 서버로 보내거나 저장하지 않습니다. 모두 이 기기 안에서 계산합니다.',
                '겁을 주어 부적을 권하지 않습니다. 추천은 사주에 필요한 기운을 근거로 합니다.',
                '매일 새 부적을 만들게 하지 않습니다. 이미 지니신 부적이 오늘 맞으면 그대로 권합니다.',
              ]}
            />
          </Section>

          <p
            style={{
              marginTop: 26,
              fontSize: 11.5,
              lineHeight: 1.85,
              color: `${GALSAEK}AA`,
            }}
          >
            운세는 오늘의 흐름을 헤아려보는 참고입니다. 중요한 결정은 늘
            회원님의 사정과 판단이 먼저입니다.
          </p>
        </main>

        <BottomTab />
      </div>
    </HanjiBackground>
  );
}
