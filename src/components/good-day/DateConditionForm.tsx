'use client';

import { useState } from 'react';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import BirthFieldsKo, { type BirthValue } from '@/components/BirthFieldsKo';
import { getPurposeSpec } from '@/lib/good-day/purposeRules';
import { HOUR_UNKNOWN } from '@/lib/birth-hour';
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

function Head({ title, sub }: { title: string; sub?: string }) {
  return (
    <div
      className="flex items-baseline gap-2"
      style={{
        padding: '10px 16px',
        background: 'rgba(122,74,52,0.06)',
        borderBottom: '1px solid rgba(122,74,52,0.16)',
      }}
    >
      <span className="font-serif-kr font-bold" style={{ fontSize: 12.5, color: GALSAEK }}>
        {title}
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
  myName,
  mySummary,
}: {
  purpose: GoodDayPurpose;
  onSubmit: (c: DateConditions) => void;
  /** 저장된 내 프로필 — 있으면 "나" 자리를 채운다 */
  myName?: string;
  /** "1995년 3월 2일 · 저녁 5시 ~ 7시 (유시)" */
  mySummary?: string;
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

  // 첫 번째 사람 — 기본은 저장된 내 사주. 다른 사람으로 바꿔 볼 수 있다.
  const [useOther, setUseOther] = useState(!mySummary);
  const [self, setSelf] = useState<BirthValue>({
    year: 1995,
    month: 1,
    day: 1,
    hour: HOUR_UNKNOWN,
    gender: 'F',
  });

  // 두 번째 사람 (상대)
  const [partnerBirth, setPartnerBirth] = useState<BirthValue>({
    year: 1995,
    month: 1,
    day: 1,
    hour: HOUR_UNKNOWN,
    gender: 'M',
  });
  const [usePartner, setUsePartner] = useState(spec.partner === 'required');

  const maxTo = iso(addMonths(new Date(from), spec.maxMonths));
  const rangeTooLong = to > maxTo;
  const partnerNeeded = spec.partner === 'required';
  const canSubmit = from <= to && !rangeTooLong;

  /** BirthValue → 계산에 넘기는 모양 (모름은 null) */
  const toInput = (b: BirthValue, fallbackGender: 'M' | 'F'): PartnerInput => ({
    year: b.year,
    month: b.month,
    day: b.day,
    hour: b.hour === HOUR_UNKNOWN ? null : b.hour,
    gender: b.gender ?? fallbackGender,
    calendar: 'solar',
  });

  const submit = () => {
    const partner: PartnerInput | undefined =
      (partnerNeeded || usePartner) && spec.partner !== 'none'
        ? toInput(partnerBirth, 'M')
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
      // 내 사주 대신 다른 사람으로 볼 때만 넘긴다
      ...(useOther ? { self: toInput(self, 'F') } : {}),
      partner,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 누구의 날인가 — 기본은 내 사주, 다른 사람으로도 볼 수 있다 */}
      {spec.partner !== 'none' && (
        <div className="overflow-hidden rounded-xl" style={CARD}>
          <Head
            title={partnerNeeded ? '첫 번째 사람' : '누구의 날인가요'}
            sub={useOther ? '사주를 직접 넣어요' : '저장된 내 사주로 봅니다'}
          />
          <div style={{ padding: '14px 16px' }}>
            {mySummary && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Toggle on={!useOther} label={myName ? `${myName} (나)` : '내 사주'} onClick={() => setUseOther(false)} />
                <Toggle on={useOther} label="다른 사람" onClick={() => setUseOther(true)} />
              </div>
            )}
            {!useOther && mySummary ? (
              <p style={{ fontSize: 12.5, lineHeight: 1.7, color: `${MEOK}CC` }}>{mySummary}</p>
            ) : (
              <>
                {!mySummary && (
                  <p style={{ marginBottom: 10, fontSize: 11.5, lineHeight: 1.6, color: `${GALSAEK}AA` }}>
                    저장된 사주가 없어 직접 넣어요.
                  </p>
                )}
                <BirthFieldsKo value={self} onChange={setSelf} showGender />
              </>
            )}
          </div>
        </div>
      )}

      {/* 조회 기간 */}
      <div className="overflow-hidden rounded-xl" style={CARD}>
        <Head title="기간" sub="언제부터 언제까지 볼까요" />
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
        <Head title="요일" sub="가능한 요일 (안 고르면 전체)" />
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
          <Head title="방향" sub="어느 쪽으로 옮기시나요" />
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
            title={partnerNeeded ? '두 번째 사람' : '상대방'}
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
                <BirthFieldsKo
                  value={partnerBirth}
                  onChange={setPartnerBirth}
                  showGender
                />
                {partnerBirth.hour === HOUR_UNKNOWN && (
                  <p style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.6, color: `${GALSAEK}AA` }}>
                    시각을 모르셔도 괜찮아요. 시주를 빼고 나머지로 봅니다.
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
