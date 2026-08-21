'use client';

// ============================================================
// 연락기원부 — /yeollak
//
// 소개 → 상대방 떠올리기 → 한마디 봉인하기 → 세 번 호흡하기
// → 마지막 획 잇기(직접 그린다) → 이름 낙관 → 완성
//
// 약속: 봉인한 한마디는 완성 화면에서 한 번 보여준 뒤
// 다시는 화면에 펼치지 않는다.
// ============================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { BackIcon } from '@/components/hanji/motifs';
import { NameStamp } from '@/components/PersonalTalismanView';
import {
  ANSEO_TALISMAN,
  ANSEO_W,
  ANSEO_H,
  STROKE_START,
  STROKE_END,
  STROKE_TOLERANCE,
  anseoBaseArt,
  buildAnseoSVG,
} from '@/lib/anseo';
import {
  createPersonalTalisman,
  saveToCollection,
  markPlacedOnHome,
} from '@/lib/personal-talisman';
import {
  pushTalismanToWidget,
  hasWidgetBridge,
  isWidgetInstalled,
} from '@/lib/widget-bridge';
import WidgetGuideSheet from '@/components/hanji/WidgetGuideSheet';
import type { SavedTalisman } from '@/lib/types';

const GALSAEK = '#7A4A34';
const JUHONG = '#A72B21';

type Step =
  | 'intro'
  | 'recipient'
  | 'sentence'
  | 'breath'
  | 'stroke'
  | 'seal'
  | 'done';

const STEP_ORDER: Step[] = [
  'intro',
  'recipient',
  'sentence',
  'breath',
  'stroke',
  'seal',
  'done',
];

let cachedName: string | undefined;
function loadNameCached(): string {
  if (cachedName === undefined) cachedName = loadName();
  return cachedName;
}
function subscribeName(onChange: () => void) {
  cachedName = undefined;
  onChange();
  return () => {};
}

/** 온보딩 이름 (없으면 '') */
function loadName(): string {
  try {
    const raw = localStorage.getItem('bujeok-user');
    if (raw) return (JSON.parse(raw)?.name || '').trim();
    const p = localStorage.getItem('user_profile');
    if (p) return (JSON.parse(p)?.name || '').trim();
  } catch {
    /* ignore */
  }
  return '';
}

/* ── 세 번 호흡하기 ── */
const BREATHS = [
  '첫 번째 숨에는\n조급함을 내려놓고',
  '두 번째 숨에는\n그 사람을 떠올리고',
  '세 번째 숨에는\n소식이 닿은 순간을 그려보세요',
];

function BreathStep({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const finished = !!reduced || idx >= BREATHS.length;

  useEffect(() => {
    if (reduced || idx >= BREATHS.length) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 4600);
    return () => clearTimeout(t);
  }, [idx, reduced]);

  return (
    <div className="flex flex-col items-center pt-6">
      <p className="mb-8 text-center font-serif-kr text-[15px] leading-relaxed text-[var(--color-meok)]">
        이제 세 번 천천히 숨을 고르세요.
      </p>

      {!reduced && (
        <motion.div
          className="mb-10 rounded-full"
          style={{
            width: 120,
            height: 120,
            border: '2px solid rgba(167,43,33,0.4)',
            background: 'rgba(167,43,33,0.06)',
          }}
          animate={{ scale: [1, 1.32, 1] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="h-16 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={Math.min(idx, BREATHS.length - 1)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6 }}
            className="whitespace-pre-line font-serif-kr text-sm leading-relaxed text-[var(--color-galsaek)]"
          >
            {reduced
              ? BREATHS.join('\n').replace(/\n/g, ' ')
              : BREATHS[Math.min(idx, BREATHS.length - 1)]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex gap-1.5">
        {BREATHS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full transition-colors duration-700"
            style={{
              backgroundColor:
                i < idx || finished ? 'var(--color-juhong)' : 'rgba(122,74,52,0.25)',
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 w-full max-w-[240px]"
          >
            <p className="mb-4 text-center text-xs leading-relaxed text-[var(--color-galsaek)]">
              마음이 고요해지면
              <br />
              기러기가 길을 찾기 시작합니다.
            </p>
            <TraditionalButton onClick={onDone}>길을 이으러 가기</TraditionalButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 마지막 획 잇기 ── */
function StrokeStep({
  onDone,
}: {
  onDone: (path: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [livePath, setLivePath] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [donePath, setDonePath] = useState('');

  const { base, guide } = useMemo(() => anseoBaseArt(), []);

  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ANSEO_W,
      y: ((e.clientY - r.top) / r.height) * ANSEO_H,
    };
  };

  const near = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    Math.hypot(p.x - q.x, p.y - q.y) <= STROKE_TOLERANCE;

  /* 점들을 중간점 이차 곡선으로 이어 붓 획처럼 부드럽게 */
  const pathOf = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M${pts[0].x.toFixed(0)} ${pts[0].y.toFixed(0)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q${pts[i].x.toFixed(0)} ${pts[i].y.toFixed(0)} ${mx.toFixed(0)} ${my.toFixed(0)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L${last.x.toFixed(0)} ${last.y.toFixed(0)}`;
    return d;
  };

  const start = (e: React.PointerEvent) => {
    if (donePath) return;
    const p = toLocal(e);
    if (!p) return;
    if (!near(p, STROKE_START)) {
      setMessage('위쪽 기러기 곁에서 시작해 주세요');
      return;
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointsRef.current = [p];
    setDrawing(true);
    setMessage(null);
    setLivePath('');
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing || donePath) return;
    const p = toLocal(e);
    if (!p) return;
    const pts = pointsRef.current;
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 3) return;
    pts.push(p);
    setLivePath(pathOf(pts));
  };

  const end = () => {
    if (!drawing || donePath) return;
    setDrawing(false);
    const pts = pointsRef.current;
    const lastPt = pts[pts.length - 1];
    if (pts.length < 8 || !lastPt || !near(lastPt, STROKE_END)) {
      // 붓이 중간에 떨어졌다 — 나무라지 않고 다시 청한다
      setLivePath('');
      pointsRef.current = [];
      setMessage('붓이 도중에 떨어졌어요. 천천히, 아래 기러기까지 이어주세요.');
      return;
    }
    const d = pathOf(pts);
    setDonePath(d);
    setMessage(null);
    try {
      navigator.vibrate?.(25);
    } catch {
      /* noop */
    }
    setTimeout(() => onDone(d), 900);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="mb-1 text-center font-serif-kr text-[15px] font-bold text-[var(--color-meok)]">
        두 기러기 사이에는
        <br />
        아직 한 획의 길이 비어 있습니다.
      </p>
      <p className="mb-4 text-center text-xs leading-relaxed text-[var(--color-galsaek)]">
        붓을 떼지 말고 천천히 이어주세요.
      </p>

      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{
          maxWidth: 280,
          boxShadow: '0 8px 26px rgba(43,24,16,0.22)',
          touchAction: 'none',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ANSEO_W} ${ANSEO_H}`}
          className="block w-full select-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          dangerouslySetInnerHTML={{
            __html: `${base}${donePath ? '' : guide}
            ${donePath ? '' : `
              <circle cx="${STROKE_START.x}" cy="${STROKE_START.y}" r="13" fill="rgba(167,43,33,0.14)" stroke="${'#A72B21'}" stroke-width="1.5">
                <animate attributeName="r" values="10;14;10" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="${STROKE_END.x}" cy="${STROKE_END.y}" r="11" fill="none" stroke="${'#A72B21'}" stroke-width="1.5" stroke-dasharray="3 4"/>`}
            ${livePath || donePath ? `<path d="${donePath || livePath}" fill="none" stroke="#A72B21" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>` : ''}`,
          }}
        />
      </div>

      <p
        className="mt-4 h-8 text-center text-xs leading-relaxed"
        style={{ color: message ? JUHONG : `${GALSAEK}AA` }}
      >
        {donePath
          ? '당신이 그은 붉은 획이 두 사람 사이에 소식이 오갈 길이 됩니다.'
          : message ?? '위쪽 기러기의 붉은 원에서 시작해 아래 기러기까지'}
      </p>
    </div>
  );
}

/* ── 페이지 ── */
export default function YeollakPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const userName = useSyncExternalStore(subscribeName, loadNameCached, () => '');
  const [alias, setAlias] = useState('');
  const [sentence, setSentence] = useState('');
  const [strokePath, setStrokePath] = useState('');
  const [result, setResult] = useState<SavedTalisman | null>(null);
  const [widgetDone, setWidgetDone] = useState(false);
  const [showWidgetGuide, setShowWidgetGuide] = useState(false);

  const displayName = userName || '당신';

  const back = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i <= 0 || step === 'done') router.push('/talisman');
    else setStep(STEP_ORDER[i - 1]);
  };

  /* 낙관을 찍는 순간 — 기록을 만들고 바로 부적함에 담는다 (잃어버리지 않게) */
  const complete = useCallback(() => {
    const saved = createPersonalTalisman({
      talisman: ANSEO_TALISMAN,
      ownerName: userName,
      wishText: '', // 봉인한 한마디는 공개 염원 자리에 두지 않는다
      recommendationReason:
        '오래 기다린 소식이 길을 잃지 않기를 바라는 마음으로 청한 부적이에요.',
    });
    saved.anseo = {
      recipientAlias: alias.trim().slice(0, 12),
      sealedText: sentence.trim().slice(0, 60),
      strokePath,
    };
    saveToCollection(saved);
    setResult(saved);
    setStep('done');
  }, [userName, alias, sentence, strokePath]);

  const handleWidget = useCallback(async () => {
    if (!result || widgetDone) return;
    markPlacedOnHome(result.id);
    void pushTalismanToWidget(buildAnseoSVG(result), {
      name: result.name,
      hanja: result.hanja,
      savedAt: result.savedAt,
      agingDays: 7, // 7일 동안 지니는 부적
    });
    setWidgetDone(true);
    if (hasWidgetBridge() && isWidgetInstalled() === false) {
      setTimeout(() => setShowWidgetGuide(true), 500);
    }
  }, [result, widgetDone]);

  const doneSvg = useMemo(
    () => (result ? buildAnseoSVG(result) : ''),
    [result]
  );

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          step === 'stroke' || step === 'seal' ? undefined : (
            <button onClick={back} aria-label="뒤로가기">
              <BackIcon size={20} />
            </button>
          )
        }
        title="연락기원부"
      />

      <main className="mx-auto w-full max-w-md flex-1 px-6 pb-24">
        <AnimatePresence mode="wait">
          {/* ── 소개 ── */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center pt-4 text-center"
            >
              <h2 className="font-brush text-[24px] text-[var(--color-meok)]">
                연락기원부
              </h2>
              <p className="mt-1 text-[11px] text-[var(--color-galsaek)] opacity-80">
                雁書符 · 기러기가 기다리던 소식을 전해오는 부적
              </p>

              <p className="mt-7 font-serif-kr text-[13.5px] leading-[2] text-[var(--color-meok)]">
                옛사람들은 멀리서 도착한 편지를
                <br />
                안서(雁書), 기러기가 전해온 글이라 불렀습니다.
              </p>
              <p className="mt-5 font-serif-kr text-[13px] leading-[2] text-[var(--color-galsaek)]">
                계절이 바뀌고 먼 길을 돌아서도
                <br />
                돌아갈 곳을 잊지 않는 새에게
                <br />
                아직 전하지 못한 마음을 맡긴 것입니다.
              </p>
              <p className="mt-7 font-serif-kr text-[14px] font-bold leading-relaxed text-[var(--color-juhong)]">
                오늘, 오래 기다린 한 사람을 떠올려 주세요.
              </p>

              <div className="mt-9 w-full max-w-[250px]">
                <TraditionalButton onClick={() => setStep('recipient')}>
                  마음을 담아 부적 만들기
                </TraditionalButton>
              </div>
            </motion.div>
          )}

          {/* ── 상대방 떠올리기 ── */}
          {step === 'recipient' && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col pt-4"
            >
              <h2 className="text-center font-brush text-[21px] leading-snug text-[var(--color-meok)]">
                누구의 소식을
                <br />
                기다리고 있나요?
              </h2>
              <p className="mt-4 text-center text-xs leading-[1.9] text-[var(--color-galsaek)]">
                이름을 모두 적지 않아도 괜찮습니다.
                <br />
                마음은 이미 그 사람이 누구인지 알고 있으니까요.
              </p>

              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value.slice(0, 12))}
                placeholder="이니셜 또는 나만 아는 별칭"
                className="mt-8 w-full rounded-xl px-4 py-3.5 text-center font-serif-kr text-[16px] text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
                style={{
                  border: '1.5px solid rgba(122,74,52,0.4)',
                  backgroundColor: 'rgba(255,251,240,0.9)',
                }}
              />

              <div className="mt-8">
                <TraditionalButton
                  onClick={() => setStep('sentence')}
                  disabled={!alias.trim()}
                >
                  다음
                </TraditionalButton>
              </div>
            </motion.div>
          )}

          {/* ── 한마디 봉인하기 ── */}
          {step === 'sentence' && (
            <motion.div
              key="sentence"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col pt-4"
            >
              <h2 className="text-center font-brush text-[21px] leading-snug text-[var(--color-meok)]">
                그 사람에게 닿기를 바라는 말을
                <br />한 문장만 적어주세요.
              </h2>
              <p className="mt-4 text-center text-xs leading-[1.9] text-[var(--color-galsaek)]">
                여러 소원을 적으면 마음의 길이 흐려집니다.
                <br />
                지금 가장 간절한 말 하나면 충분합니다.
              </p>

              <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value.slice(0, 60))}
                rows={3}
                placeholder="그 사람에게 전하고 싶은 한마디"
                className="mt-8 w-full resize-none rounded-xl px-4 py-3.5 text-center font-serif-kr text-[15px] leading-relaxed text-[var(--color-meok)] placeholder-[var(--color-galsaek)]/40 focus:outline-none"
                style={{
                  border: '1.5px solid rgba(122,74,52,0.4)',
                  backgroundColor: 'rgba(255,251,240,0.9)',
                }}
              />
              <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--color-galsaek)] opacity-75">
                이 문장은 부적 속에 접혀
                <br />
                누구에게도 보이지 않습니다.
              </p>

              <div className="mt-7">
                <TraditionalButton
                  onClick={() => setStep('breath')}
                  disabled={!sentence.trim()}
                >
                  한마디 봉인하기
                </TraditionalButton>
              </div>
            </motion.div>
          )}

          {/* ── 세 번 호흡하기 ── */}
          {step === 'breath' && (
            <motion.div
              key="breath"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <BreathStep onDone={() => setStep('stroke')} />
            </motion.div>
          )}

          {/* ── 마지막 획 잇기 ── */}
          {step === 'stroke' && (
            <motion.div
              key="stroke"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="pt-2"
            >
              <StrokeStep
                onDone={(d) => {
                  setStrokePath(d);
                  setStep('seal');
                }}
              />
            </motion.div>
          )}

          {/* ── 이름 낙관 ── */}
          {step === 'seal' && (
            <motion.div
              key="seal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center pt-6 text-center"
            >
              <p className="font-serif-kr text-[15px] leading-relaxed text-[var(--color-meok)]">
                마지막으로 당신의 이름을 찍습니다.
              </p>
              <div className="mt-8">
                <NameStamp
                  text={userName ? [...userName.replace(/\s+/g, '')].slice(0, 4).join('') : '수호부'}
                  side={76}
                  rotation={1.2}
                />
              </div>
              <p className="mt-8 font-serif-kr text-[13px] leading-[2] text-[var(--color-galsaek)]">
                이 순간부터 이 부적은
                <br />
                누구의 것도 아닌,
              </p>
              <p className="mt-3 font-serif-kr text-[14px] font-bold leading-[2] text-[var(--color-meok)]">
                오직 {displayName}님의 기다림과
                <br />한 문장의 소원을 담은 부적이 됩니다.
              </p>
              <div className="mt-9 w-full max-w-[250px]">
                <TraditionalButton onClick={complete}>낙관 찍기</TraditionalButton>
              </div>
            </motion.div>
          )}

          {/* ── 완성 ── */}
          {step === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center pt-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring', damping: 20 }}
                className="w-full overflow-hidden rounded-xl"
                style={{ maxWidth: 250, boxShadow: '0 10px 30px rgba(43,24,16,0.25)' }}
                dangerouslySetInnerHTML={{ __html: doneSvg }}
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 text-center"
              >
                <h2 className="font-serif-kr text-[17px] font-bold leading-relaxed text-[var(--color-meok)]">
                  {displayName}님의 연락기원부가
                  <br />
                  완성되었습니다.
                </h2>
                <p className="mt-4 font-serif-kr text-[13px] leading-[2] text-[var(--color-galsaek)]">
                  두 마리 기러기 사이에
                  <br />
                  <span className="text-[var(--color-juhong)]">
                    “{result.anseo?.sealedText}”
                  </span>
                  을 봉했습니다.
                </p>
                <p className="mt-4 text-[12px] leading-[1.9] text-[var(--color-galsaek)]">
                  한 마리는 당신의 마음을 싣고 떠났고,
                  <br />
                  다른 한 마리는 돌아올 소식을 기다립니다.
                  <br />
                  당신이 그은 마지막 붉은 획을 따라
                  <br />
                  아직 닿지 못한 말이 길을 찾고 있습니다.
                </p>
                <p className="mt-4 font-serif-kr text-[13px] font-bold text-[var(--color-meok)]">
                  이제 조급한 마음은 이 부적에 내려두세요.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-7 flex w-full max-w-xs flex-col gap-3"
              >
                {widgetDone ? (
                  <div
                    className="w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]"
                    style={{ border: '1px solid rgba(107,125,99,0.5)' }}
                  >
                    ✓ 위젯에 지녔습니다
                  </div>
                ) : (
                  <TraditionalButton onClick={handleWidget}>
                    위젯에 지니기
                  </TraditionalButton>
                )}
                <button
                  onClick={() => router.push('/collection')}
                  className="w-full rounded-lg py-3 font-serif-kr text-sm font-bold text-[var(--color-juhong)]"
                  style={{
                    border: '1.5px solid var(--color-juhong)',
                    backgroundColor: 'rgba(246,237,217,0.7)',
                  }}
                >
                  부적함에서 보기
                </button>
              </motion.div>

              {/* 지니는 법 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-8 w-full max-w-xs rounded-xl px-4 py-4"
                style={{
                  border: '1px solid rgba(122,74,52,0.3)',
                  backgroundColor: 'rgba(255,251,240,0.75)',
                }}
              >
                <p className="mb-2 font-serif-kr text-[12px] font-bold text-[var(--color-meok)]">
                  지니는 법
                </p>
                <p className="text-[11.5px] leading-[1.9] text-[var(--color-galsaek)]">
                  오늘부터 7일 동안 이 부적 한 장을 위젯에 지녀주세요.
                  봉인한 문장은 다시 열어보지 말고, 마음이 흔들릴 때
                  부적을 한 번 바라보세요.
                  <br />
                  <br />
                  소식이 닿는 날에는 부적함으로 돌아와{' '}
                  <b style={{ color: JUHONG }}>‘소식이 닿았어요’</b>를
                  눌러주세요. 그날의 날짜와 함께 마지막 붉은 도착인이
                  찍힙니다.
                </p>
              </motion.div>

              <p className="mt-6 max-w-xs text-center text-[10px] leading-[1.7] text-[var(--color-galsaek)] opacity-60">
                수호부는 전통 부적의 상징과 구성을 바탕으로 만든 디지털 기원
                콘텐츠입니다. 개인의 마음을 다독이고 염원을 기억하기 위한
                용도로 이용해주세요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showWidgetGuide && (
          <WidgetGuideSheet onClose={() => setShowWidgetGuide(false)} />
        )}
      </AnimatePresence>
    </HanjiBackground>
  );
}
