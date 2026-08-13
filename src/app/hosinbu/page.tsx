'use client';

// ============================================================
// 호신부 다시 모시기 — 사흘을 지키고 떠난 호신부를 새로 모시는 구매 루트
// ------------------------------------------------------------
// ⚠️ 실제 결제는 아직 미연동 — 지금은 버튼을 누르면 바로 지급된다.
//    (kkumi 와 같은 순서: 플로우 먼저, 결제 연동은 나중에)
//    가격 표기는 자리표시자. 연동 시 이 파일의 handlePurchase 만 감싸면 된다.
// ============================================================

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import HanjiBackground from '@/components/hanji/HanjiBackground';
import TraditionalHeader from '@/components/hanji/TraditionalHeader';
import TraditionalButton from '@/components/hanji/TraditionalButton';
import { BackIcon } from '@/components/hanji/motifs';
import { getTalismanById } from '@/data/talismans';
import { GIFT_ID, clearGiftDeparted, loadCollection } from '@/lib/collection';
import { hasWidgetBridge, pushTalismanToWidget } from '@/lib/widget-bridge';
import hosinbuImg from '../../../public/talismans/hosinbu-gift.png';

const MEOK = '#2E2E2E';
const GALSAEK = '#7A4A34';

/** 자리표시자 가격 — 결제 연동 시 스토어 상품 가격으로 대체 */
const PRICE_LABEL = '₩1,900';

export default function HosinbuPage() {
  const router = useRouter();
  const [granted, setGranted] = useState(false);
  const alreadyHave = loadCollection().some((t) => t.id === GIFT_ID);

  const handlePurchase = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const catalog = getTalismanById('protect-04'); // 43종 카탈로그의 호신부
      const blob = await (await fetch(hosinbuImg.src)).blob();
      const dataUri = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
      });
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560"><image href="${dataUri}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/></svg>`;
      const entry = {
        ...catalog,
        id: GIFT_ID,
        savedAt: now,
        note: '다시 곁으로 — 몸과 마음의 평안을 지켜드릴게요',
        svg,
      };
      const list: { id?: string }[] = JSON.parse(
        localStorage.getItem('bujeok-collection') || '[]'
      );
      localStorage.setItem(
        'bujeok-collection',
        JSON.stringify([entry, ...list.filter((t) => t.id !== GIFT_ID)])
      );
      clearGiftDeparted();
      if (hasWidgetBridge()) {
        void pushTalismanToWidget(svg, {
          name: '호신부',
          hanja: '護身符',
          savedAt: now,
          agingDays: 3, // 새로 모신 호신부도 사흘에 걸쳐 낡아간다
        });
      }
      setGranted(true);
      setTimeout(() => router.push('/collection'), 2200);
    } catch {
      alert('부적을 모시지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  }, [router]);

  return (
    <HanjiBackground>
      <TraditionalHeader
        left={
          <button onClick={() => router.back()} aria-label="뒤로가기">
            <BackIcon size={20} />
          </button>
        }
        title="호신부 모시기"
      />

      <div
        className="flex flex-col items-center text-center"
        style={{ padding: '28px 26px 48px' }}
      >
        <motion.div
          className="relative mx-auto"
          style={{ width: 200 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="pointer-events-none absolute"
            style={{
              inset: -14,
              background:
                'radial-gradient(ellipse at center, rgba(167,43,33,0.2) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />
          <Image
            src={hosinbuImg}
            alt="호신부 부적"
            priority
            className="relative h-auto w-full"
            style={{
              filter:
                'drop-shadow(0 2px 6px rgba(122,74,52,0.35)) drop-shadow(0 10px 24px rgba(122,74,52,0.25))',
            }}
          />
        </motion.div>

        <p
          className="font-serif-kr"
          style={{ marginTop: 24, fontSize: 20, color: MEOK }}
        >
          호신부{' '}
          <span style={{ fontSize: 12, color: 'rgba(122,74,52,0.7)' }}>
            護身符
          </span>
        </p>

        <p
          style={{
            marginTop: 12,
            maxWidth: 290,
            fontSize: 13,
            lineHeight: 2.05,
            color: `${MEOK}BB`,
          }}
        >
          {granted
            ? '호신부가 다시 곁에 왔습니다. 부적함으로 모셔갈게요.'
            : alreadyHave
              ? '호신부가 아직 곁을 지키고 있어요. 사흘이 지나 떠난 뒤에 다시 모실 수 있습니다.'
              : '사흘을 지키고 떠난 호신부를 다시 모실 수 있어요. 새로 모신 호신부도 사흘 동안 곁을 지킵니다.'}
        </p>

        <div className="w-full" style={{ marginTop: 32, maxWidth: 320 }}>
          {granted ? (
            <p
              className="font-serif-kr text-center"
              style={{ fontSize: 15, color: GALSAEK }}
            >
              부적함에 모셨습니다
            </p>
          ) : (
            <TraditionalButton
              onClick={!alreadyHave ? handlePurchase : undefined}
              disabled={alreadyHave}
              className="rounded-lg"
            >
              {alreadyHave
                ? '아직 곁에 있어요'
                : `${PRICE_LABEL} · 호신부 다시 모시기`}
            </TraditionalButton>
          )}
        </div>
      </div>
    </HanjiBackground>
  );
}
