// ============================================================
// 데이터 백업 / 복원
// localStorage에만 존재하는 사용자 데이터(부적함·사주 정보 등)를
// JSON 파일로 내보내고, 파일에서 다시 불러온다.
// 기기 변경·브라우저 데이터 삭제로 소중한 기록이 사라지는 일을 막는다.
// ============================================================

/** 백업 포맷 버전 (포맷이 바뀌면 올린다) */
export const BACKUP_VERSION = 1;

/**
 * 앱이 사용하는 localStorage 키 전체 목록 (화이트리스트).
 * 복원 시 이 목록에 없는 키는 무시해 이물질 주입을 막는다.
 *
 * - bujeok-user            : 온보딩이 저장하는 사용자·사주 데이터 (onboarding/page.tsx)
 * - user_profile           : 홈 화면이 참조하는 프로필 (page.tsx, saju, talisman, mypage)
 * - onboarding_completed   : 온보딩 완료 플래그 (page.tsx)
 * - bujeok-collection      : 부적함 — 수집한 부적 목록 (collection, encyclopedia, talisman)
 * - bujeok_app_v1          : 공용 스토어 — 프로필·부적·운세·감정 기록 (lib/store.ts)
 * - bujeok-visit-log       : 연속 방문 기록 (mypage/page.tsx)
 */
export const APP_STORAGE_KEYS = [
  'bujeok-user',
  'user_profile',
  'onboarding_completed',
  'bujeok-collection',
  'bujeok_app_v1',
  'bujeok-visit-log',
] as const;

export interface BackupData {
  version: number; // 백업 포맷 버전 = 1
  exportedAt: string; // ISO 날짜
  app: 'bujeok-app';
  data: Record<string, unknown>; // 앱 localStorage 키 전체
}

export interface RestoreResult {
  ok: boolean;
  restoredKeys: string[];
  error?: string;
}

/** 앱 데이터 전체를 백업 객체로 모은다 */
export function createBackup(): BackupData {
  const data: Record<string, unknown> = {};

  if (typeof window !== 'undefined') {
    for (const key of APP_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      // JSON으로 저장된 값은 파싱해 담고, 아니면 문자열 그대로 담는다
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'bujeok-app',
    data,
  };
}

/** 백업을 JSON 파일로 다운로드: bujeok-backup-YYYY-MM-DD.json */
export function downloadBackup(): void {
  if (typeof window === 'undefined') return;

  const backup = createBackup();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bujeok-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 파싱된 JSON을 검증하고 localStorage에 복원한다.
 * 성공 시 페이지를 새로고침해 상태를 갱신한다.
 */
export function restoreBackup(json: unknown): RestoreResult {
  if (typeof window === 'undefined') {
    return { ok: false, restoredKeys: [], error: '브라우저에서만 사용할 수 있어요.' };
  }

  // ── 검증 ──
  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    return {
      ok: false,
      restoredKeys: [],
      error: '백업 파일의 모양이 낯설어요. 수호부에서 내보낸 파일이 맞는지 확인해 주세요.',
    };
  }

  const candidate = json as Partial<BackupData>;

  if (candidate.app !== 'bujeok-app') {
    return {
      ok: false,
      restoredKeys: [],
      error: '수호부에서 내보낸 백업 파일이 아닌 것 같아요.',
    };
  }

  if (typeof candidate.version !== 'number' || candidate.version > BACKUP_VERSION) {
    return {
      ok: false,
      restoredKeys: [],
      error: '더 새로운 버전의 앱에서 만든 파일이에요. 앱을 업데이트한 뒤 다시 시도해 주세요.',
    };
  }

  if (
    candidate.data === null ||
    typeof candidate.data !== 'object' ||
    Array.isArray(candidate.data)
  ) {
    return {
      ok: false,
      restoredKeys: [],
      error: '백업 파일 안에 데이터가 보이지 않아요.',
    };
  }

  // ── 화이트리스트에 있는 키만 복원 ──
  const restoredKeys: string[] = [];
  const knownKeys = new Set<string>(APP_STORAGE_KEYS);

  for (const [key, value] of Object.entries(candidate.data)) {
    if (!knownKeys.has(key)) continue; // 알 수 없는 키는 조용히 무시
    if (value === undefined || value === null) continue;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      restoredKeys.push(key);
    } catch {
      // 개별 키 저장 실패는 건너뛴다 (용량 초과 등)
    }
  }

  if (restoredKeys.length === 0) {
    return {
      ok: false,
      restoredKeys: [],
      error: '파일에서 되찾을 수 있는 데이터가 없었어요.',
    };
  }

  return { ok: true, restoredKeys };
}

/** File 객체를 읽어 복원한다 */
export function restoreFromFile(file: File): Promise<RestoreResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as unknown;
        resolve(restoreBackup(parsed));
      } catch {
        resolve({
          ok: false,
          restoredKeys: [],
          error: '파일을 읽지 못했어요. 수호부 백업 파일(.json)이 맞는지 확인해 주세요.',
        });
      }
    };
    reader.onerror = () => {
      resolve({
        ok: false,
        restoredKeys: [],
        error: '파일을 여는 데 실패했어요. 다시 한번 시도해 주세요.',
      });
    };
    reader.readAsText(file);
  });
}
