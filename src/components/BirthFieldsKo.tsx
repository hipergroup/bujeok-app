'use client';

// ============================================================
// 생년월일시 입력 한 벌 — 전부 우리 글로
// ------------------------------------------------------------
// 숫자만 덩그러니 놓인 입력(年 月 日 · 0~23 시)은 무엇을 넣어야 할지
// 애매해서, 골라 넣는 방식으로 바꾼다. 시각은 십이지시를 사람 말로
// 보여준다 — "저녁 5시 ~ 7시 (유시)".
// ============================================================

import { HOUR_BRANCHES, HOUR_UNKNOWN } from '@/lib/birth-hour';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

export interface BirthValue {
  year: number;
  month: number;
  day: number;
  /** 사주 계산용 시(0-23). HOUR_UNKNOWN(-1) = 모름 */
  hour: number;
  gender?: 'M' | 'F';
}

const selectCls = 'w-full appearance-none rounded-lg border bg-transparent px-2 py-2 text-[13px] outline-none';
const selectStyle: React.CSSProperties = {
  borderColor: 'rgba(122,74,52,0.30)',
  color: MEOK,
  background: 'rgba(255,255,255,0.5)',
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-bold" style={{ color: `${GALSAEK}CC` }}>
      {children}
    </span>
  );
}

export default function BirthFieldsKo({
  value,
  onChange,
  showGender = false,
}: {
  value: BirthValue;
  onChange: (v: BirthValue) => void;
  showGender?: boolean;
}) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1929 }, (_, i) => thisYear - i);
  const daysInMonth = new Date(value.year, value.month, 0).getDate();

  const patch = (p: Partial<BirthValue>) => {
    const next = { ...value, ...p };
    const max = new Date(next.year, next.month, 0).getDate();
    if (next.day > max) next.day = max;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>태어난 날</Label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={value.year}
            onChange={(e) => patch({ year: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
            aria-label="태어난 해"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={value.month}
            onChange={(e) => patch({ month: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
            aria-label="태어난 달"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <select
            value={value.day}
            onChange={(e) => patch({ day: Number(e.target.value) })}
            className={selectCls}
            style={selectStyle}
            aria-label="태어난 날짜"
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>태어난 시각</Label>
        <select
          value={value.hour}
          onChange={(e) => patch({ hour: Number(e.target.value) })}
          className={selectCls}
          style={selectStyle}
          aria-label="태어난 시각"
        >
          <option value={HOUR_UNKNOWN}>모르겠어요 (시주를 빼고 봅니다)</option>
          {HOUR_BRANCHES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.range} · {b.name}
            </option>
          ))}
        </select>
      </div>

      {showGender && (
        <div>
          <Label>성별</Label>
          <div className="flex gap-1.5">
            {(['F', 'M'] as const).map((g) => {
              const on = value.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => patch({ gender: g })}
                  className="flex-1 rounded-lg py-2 text-[12.5px]"
                  style={{
                    color: on ? '#A72B21' : `${MEOK}AA`,
                    background: on ? 'rgba(167,43,33,0.07)' : 'rgba(255,253,248,0.7)',
                    border: on
                      ? '1px solid rgba(167,43,33,0.45)'
                      : '1px solid rgba(122,74,52,0.24)',
                  }}
                >
                  {g === 'F' ? '여자' : '남자'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
