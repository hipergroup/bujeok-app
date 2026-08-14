'use client';

import { motion } from 'framer-motion';
import { SON_DIRECTION_LABEL } from '@/lib/calendar/sonnal';
import { formatDate, formatLunar } from './RecommendationCard';
import type { DayCandidate } from '@/types/good-day';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

/**
 * 근거 보기 — 공식 달력 사실과 수호부의 해석을 나눠서 보여준다.
 * 둘을 섞어 모두 객관적 사실인 것처럼 보이지 않게 하기 위함이다.
 */
export default function ReasonSheet({
  candidate,
  source,
  rulesVersion,
  onClose,
}: {
  candidate: DayCandidate;
  source: string;
  rulesVersion: string;
  onClose: () => void;
}) {
  const calendarFacts = candidate.factors.filter((f) => f.kind === 'calendar');
  const interpretations = candidate.factors.filter(
    (f) => f.kind === 'interpretation'
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end"
      style={{ background: 'rgba(46,46,46,0.35)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-h-[82dvh] w-full overflow-y-auto"
        style={{
          background: '#FDFAF0',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: '20px 20px 34px',
        }}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(122,74,52,0.25)' }}
        />

        <h3 className="font-serif-kr" style={{ fontSize: 17, color: MEOK }}>
          왜 이 날인가요?
        </h3>
        <p style={{ marginTop: 4, fontSize: 12, color: `${GALSAEK}CC` }}>
          {formatDate(candidate)}
        </p>

        {/* 확인 가능한 달력 정보 */}
        <section
          className="rounded-xl"
          style={{
            marginTop: 16,
            padding: '14px 16px',
            background: 'rgba(122,74,52,0.05)',
            border: '1px solid rgba(122,74,52,0.18)',
          }}
        >
          <p className="font-bold" style={{ fontSize: 11.5, color: GALSAEK }}>
            확인 가능한 달력 정보
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            <Row label="음력" value={formatLunar(candidate)} />
            {candidate.calendar.iljin && (
              <Row label="일진" value={candidate.calendar.iljin} />
            )}
            <Row
              label="손"
              value={
                candidate.son === 'none'
                  ? '손 없는 날'
                  : `${SON_DIRECTION_LABEL[candidate.son]}에 손`
              }
            />
            {candidate.calendar.solarTerm && (
              <Row label="절기" value={candidate.calendar.solarTerm} />
            )}
            {candidate.calendar.holiday && (
              <Row label="공휴일" value={candidate.calendar.holidayName ?? '공휴일'} />
            )}
            {calendarFacts.map((f) => (
              <Row
                key={f.rule}
                label="일정"
                value={`${f.label} (${f.delta > 0 ? '+' : ''}${f.delta})`}
              />
            ))}
          </ul>
          <p style={{ marginTop: 10, fontSize: 10.5, color: `${GALSAEK}AA` }}>
            출처 · {source}
          </p>
        </section>

        {/* 수호부의 맞춤 해석 */}
        <section
          className="rounded-xl"
          style={{
            marginTop: 12,
            padding: '14px 16px',
            background: 'rgba(167,43,33,0.05)',
            border: '1px solid rgba(167,43,33,0.22)',
          }}
        >
          <p className="font-bold" style={{ fontSize: 11.5, color: JUHONG }}>
            수호부의 맞춤 해석
          </p>
          {interpretations.length === 0 ? (
            <p style={{ marginTop: 8, fontSize: 12.5, color: `${MEOK}AA` }}>
              이 날짜에는 특별히 두드러지는 관계가 없어, 무난한 날로 봅니다.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {interpretations.map((f) => (
                <Row
                  key={f.rule}
                  label={f.delta > 0 ? '도움' : '주의'}
                  value={`${f.label} (${f.delta > 0 ? '+' : ''}${f.delta})`}
                />
              ))}
            </ul>
          )}
          <p style={{ marginTop: 10, fontSize: 10.5, lineHeight: 1.6, color: `${GALSAEK}AA` }}>
            전통적으로 확정된 공식이 아니라, 회원님의 사주에 맞춰 수호부가 정한
            해석 기준입니다. (기준 버전 {rulesVersion})
          </p>
        </section>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full"
          style={{ padding: '12px 0', fontSize: 13, color: `${GALSAEK}CC` }}
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline gap-2">
      <span
        className="shrink-0"
        style={{ width: 44, fontSize: 11, color: `${GALSAEK}AA` }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.6, color: `${MEOK}DD` }}>
        {value}
      </span>
    </li>
  );
}
