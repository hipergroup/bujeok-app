'use client';

import { useState } from 'react';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { getPurposeSpec } from '@/lib/good-day/purposeRules';
import { DIRECTION_LABEL } from '@/types/good-day';
import type {
  DateConditions,
  GoodDayPurpose,
  MoveDirection,
  PartnerInput,
} from '@/types/good-day';

const JUHONG = '#A72B21';
const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';
const CARD = {
  background: 'rgba(255,253,248,0.82)',
  border: '1px solid rgba(122,74,52,0.2)',
} as const;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * 년·월·일 한글 선택 — 브라우저의 <input type="date">는 기기 언어를 따라
 * 영어(mm/dd/yyyy)로 보이는 일이 있어, 우리 글로 직접 고른다.
 */
function KoreanDateSelect({
  value,
  onChange,
}: {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
}) {
  const [y, m, d] = value.split('-').map(Number);
  const thisYear = new Date().getFullYear();
  const years = [thisYear, thisYear + 1, thisYear + 2];
  const daysInMonth = new Date(y, m, 0).getDate();

  const set = (ny: number, nm: number, nd: number) => {
    const max = new Date(ny, nm, 0).getDate();
    const day = Math.min(nd, max);
    onChange(
      `${ny}-${String(nm).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    );
  };

  const selStyle: React.CSSProperties = {
    fontSize: 14,
    color: MEOK,
    borderBottom: '1px solid rgba(122,74,52,0.28)',
    paddingBottom: 6,
    background: 'transparent',
    appearance: 'none',
    WebkitAppearance: 'none',
    textAlign: 'center',
  };

  return (
    <span className="flex flex-1 items-center gap-1">
      <select
        value={y}
        onChange={(e) => set(Number(e.target.value), m, d)}
        className="min-w-0 flex-[1.4] outline-none"
        style={selStyle}
        aria-label="년"
      >
        {years.map((yy) => (
          <option key={yy} value={yy}>
            {yy}년
          </option>
        ))}
      </select>
      <select
        value={m}
        onChange={(e) => set(y, Number(e.target.value), d)}
        className="min-w-0 flex-1 outline-none"
        style={selStyle}
        aria-label="월"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => (
          <option key={mm} value={mm}>
            {mm}월
          </option>
        ))}
      </select>
      <select
        value={d}
        onChange={(e) => set(y, m, Number(e.target.value))}
        className="min-w-0 flex-1 outline-none"
        style={selStyle}
        aria-label="일"
      >
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dd) => (
          <option key={dd} value={dd}>
            {dd}일
          </option>
        ))}
      </select>
    </span>
  );
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function Head({ hanja, sub }: { hanja: string; sub?: string }) {
  return (
    <div
      className="flex items-baseline gap-2"
      style={{
        padding: '10px 16px',
        background: 'rgba(122,74,52,0.06)',
        borderBottom: '1px solid rgba(122,74,52,0.16)',
      }}
    >
      <span
        className="font-serif-kr"
        style={{ fontSize: 12, color: GALSAEK, letterSpacing: '0.14em' }}
      >
        {hanja}
      </span>
      {sub && <span style={{ fontSize: 11, color: 'rgba(46,46,46,0.42)' }}>{sub}</span>}
    </div>
  );
}

function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg"
      style={{
        padding: '9px 12px',
        fontSize: 12.5,
        color: on ? JUHONG : `${MEOK}AA`,
        background: on ? 'rgba(167,43,33,0.07)' : 'rgba(255,253,248,0.7)',
        border: on
          ? '1px solid rgba(167,43,33,0.45)'
          : '1px solid rgba(122,74,52,0.24)',
      }}
    >
      {label}
    </button>
  );
}

export default function DateConditionForm({
  purpose,
  onSubmit,
}: {
  purpose: GoodDayPurpose;
  onSubmit: (c: DateConditions) => void;
}) {
  const spec = getPurposeSpec(purpose);
  const today = new Date();

  const [from, setFrom] = useState(iso(today));
  const [to, setTo] = useState(iso(addMonths(today, Math.min(2, spec.maxMonths))));
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [preferWeekend, setPreferWeekend] = useState(false);
  const [includeHolidays, setIncludeHolidays] = useState(true);
  const [moveDirection, setMoveDirection] = useState<MoveDirection>('unknown');
  const [onlySon, setOnlySon] = useState(false);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);

  // 상대방
  const [pYear, setPYear] = useState(1995);
  const [pMonth, setPMonth] = useState(1);
  const [pDay, setPDay] = useState(1);
  const [pHour, setPHour] = useState<number | null>(null);
  const [pGender, setPGender] = useState<'M' | 'F'>('M');
  const [usePartner, setUsePartner] = useState(spec.partner === 'required');

  const maxTo = iso(addMonths(new Date(from), spec.maxMonths));
  const rangeTooLong = to > maxTo;
  const partnerNeeded = spec.partner === 'required';
  const canSubmit = from <= to && !rangeTooLong;

  const submit = () => {
    const partner: PartnerInput | undefined =
      (partnerNeeded || usePartner) && spec.partner !== 'none'
        ? {
            year: pYear,
            month: pMonth,
            day: pDay,
            hour: pHour,
            gender: pGender,
            calendar: 'solar',
          }
        : undefined;

    onSubmit({
      from,
      to,
      weekdays,
      preferWeekend,
      includeHolidays,
      ...(purpose === 'move'
        ? { moveDirection, onlySonEomneunNal: onlySon }
        : {}),
      ...(purpose === 'contract' ? { weekdaysOnly } : {}),
      ...(purpose === 'wedding' ? { preferWeekend: true } : {}),
      partner,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 조회 기간 */}
      <div className="overflow-hidden rounded-xl" style={CARD}>
        <Head hanja="期間" sub="언제부터 언제까지 볼까요" />
        <div style={{ padding: '16px' }} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0" style={{ fontSize: 12, color: `${GALSAEK}AA` }}>
              부터
            </span>
            <KoreanDateSelect value={from} onChange={setFrom} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-9 shrink-0" style={{ fontSize: 12, color: `${GALSAEK}AA` }}>
              까지
            </span>
            <KoreanDateSelect value={to} onChange={setTo} />
          </div>
        </div>
        {rangeTooLong && (
          <p style={{ padding: '0 16px 12px', fontSize: 11.5, color: JUHONG }}>
            이 목적은 최대 {spec.maxMonths}개월까지 볼 수 있어요.
          </p>
        )}
      </div>

      {/* 요일 */}
      <div className="overflow-hidden rounded-xl" style={CARD}>
        <Head hanja="曜日" sub="가능한 요일 (안 고르면 전체)" />
        <div style={{ padding: '14px 16px' }} className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((w, i) => (
            <Toggle
              key={w}
              on={weekdays.includes(i)}
              label={w}
              onClick={() =>
                setWeekdays((prev) =>
                  prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                )
              }
            />
          ))}
        </div>
        <div
          style={{ padding: '0 16px 14px' }}
          className="flex flex-wrap gap-1.5"
        >
          <Toggle
            on={preferWeekend}
            label="주말 우선"
            onClick={() => setPreferWeekend((v) => !v)}
          />
          <Toggle
            on={includeHolidays}
            label="공휴일 포함"
            onClick={() => setIncludeHolidays((v) => !v)}
          />
          {purpose === 'contract' && (
            <Toggle
              on={weekdaysOnly}
              label="평일만"
              onClick={() => setWeekdaysOnly((v) => !v)}
            />
          )}
        </div>
      </div>

      {/* 이사 — 방향 */}
      {purpose === 'move' && (
        <div className="overflow-hidden rounded-xl" style={CARD}>
          <Head hanja="方位" sub="어느 쪽으로 옮기시나요" />
          <div style={{ padding: '14px 16px' }} className="flex flex-wrap gap-1.5">
            {(['east', 'west', 'south', 'north', 'unknown'] as MoveDirection[]).map(
              (d) => (
                <Toggle
                  key={d}
                  on={moveDirection === d}
                  label={DIRECTION_LABEL[d]}
                  onClick={() => setMoveDirection(d)}
                />
              )
            )}
          </div>
          <div style={{ padding: '0 16px 14px' }}>
            <Toggle
              on={onlySon}
              label="손 없는 날만 보기"
              onClick={() => setOnlySon((v) => !v)}
            />
            {moveDirection === 'unknown' && (
              <p style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.6, color: `${GALSAEK}AA` }}>
                방향을 모르실 때는 손의 방향을 따지지 않고, 손 없는 날인지만 알려드려요.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 상대방 */}
      {spec.partner !== 'none' && (
        <div className="overflow-hidden rounded-xl" style={CARD}>
          <Head
            hanja="相對"
            sub={partnerNeeded ? '두 분의 사주를 함께 봅니다' : '넣으면 함께 봅니다 (선택)'}
          />
          <div style={{ padding: '14px 16px' }}>
            {!partnerNeeded && (
              <div className="mb-3">
                <Toggle
                  on={usePartner}
                  label="상대방 정보 넣기"
                  onClick={() => setUsePartner((v) => !v)}
                />
              </div>
            )}
            {(partnerNeeded || usePartner) && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pYear}
                    onChange={(e) => setPYear(Number(e.target.value))}
                    aria-label="상대방 태어난 해"
                    className="w-full bg-transparent tabular-nums outline-none"
                    style={{ fontSize: 18, color: MEOK, borderBottom: '1.5px solid rgba(122,74,52,0.32)', paddingBottom: 6 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(46,46,46,0.4)' }}>年</span>
                  <input
                    type="number"
                    value={pMonth}
                    onChange={(e) => setPMonth(Number(e.target.value))}
                    aria-label="상대방 태어난 달"
                    className="w-full bg-transparent tabular-nums outline-none"
                    style={{ fontSize: 18, color: MEOK, borderBottom: '1.5px solid rgba(122,74,52,0.32)', paddingBottom: 6 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(46,46,46,0.4)' }}>月</span>
                  <input
                    type="number"
                    value={pDay}
                    onChange={(e) => setPDay(Number(e.target.value))}
                    aria-label="상대방 태어난 날"
                    className="w-full bg-transparent tabular-nums outline-none"
                    style={{ fontSize: 18, color: MEOK, borderBottom: '1.5px solid rgba(122,74,52,0.32)', paddingBottom: 6 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(46,46,46,0.4)' }}>日</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Toggle on={pGender === 'F'} label="坤 여자" onClick={() => setPGender('F')} />
                  <Toggle on={pGender === 'M'} label="乾 남자" onClick={() => setPGender('M')} />
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Toggle
                    on={pHour === null}
                    label="태어난 시간 모름"
                    onClick={() => setPHour(pHour === null ? 12 : null)}
                  />
                  {pHour !== null && (
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={pHour}
                      onChange={(e) => setPHour(Number(e.target.value))}
                      aria-label="상대방 태어난 시"
                      className="w-16 bg-transparent tabular-nums outline-none"
                      style={{ fontSize: 14, color: MEOK, borderBottom: '1px solid rgba(122,74,52,0.28)' }}
                    />
                  )}
                </div>
                {pHour === null && (
                  <p style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.6, color: `${GALSAEK}AA` }}>
                    시간을 모르셔도 괜찮아요. 시주를 빼고 나머지로 봅니다.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <TraditionalButton onClick={submit} disabled={!canSubmit} className="rounded-lg">
          좋은 날 찾아보기
        </TraditionalButton>
      </div>
    </div>
  );
}
