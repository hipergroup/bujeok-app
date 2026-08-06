import WidgetKit
import SwiftUI
import ImageIO

// ============================================================
// 수호부 홈 화면 위젯 — "당신의 하루를 지켜주는 작은 부적"
// 앱(웹뷰 브리지)이 App Group에 기록한 최신 부적을 보여준다.
// 시간이 지나면 종이가 아주 살짝 낡아간다 (45일에 걸쳐 은은한 갈변).
// ============================================================

private let appGroupID = "group.com.juno.bujeok"

private let hanji = Color(red: 242 / 255, green: 230 / 255, blue: 204 / 255)
private let juhong = Color(red: 167 / 255, green: 43 / 255, blue: 33 / 255)
private let galsaek = Color(red: 122 / 255, green: 74 / 255, blue: 52 / 255)

// ─── Timeline ───────────────────────────────────────────────

struct TalismanEntry: TimelineEntry {
    let date: Date
    let image: UIImage?
    let name: String
    let hanja: String
    let note: String
    let savedAt: Date?
    /// 종이가 다 낡기까지 걸리는 기간(일) — 선물 부적 3일, 기본 45일
    let agingDays: Double
}

private func parseISODate(_ s: String) -> Date? {
    let withFraction = ISO8601DateFormatter()
    withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = withFraction.date(from: s) { return d }
    return ISO8601DateFormatter().date(from: s)
}

/// 공유 저장소에서 한 번만 읽는 부적 데이터 — 타임라인 엔트리들이 이미지를 공유한다
private struct SharedTalisman {
    let image: UIImage
    let name: String
    let hanja: String
    let note: String
    let savedAt: Date?
    let agingDays: Double
}

/// 큰 원본이 와도 위젯 메모리 한도(약 30MB)를 넘지 않게 축소 디코딩한다.
/// UIImage(data:)로 원본 전체를 디코딩하면 3배율 PNG에서 한도를 넘어
/// 타임라인 생성이 실패하고 위젯이 이전(빈) 스냅샷에 머물 수 있다.
private func downsampledImage(_ url: URL, maxPixel: CGFloat) -> UIImage? {
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
    let opts: [CFString: Any] = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: maxPixel,
    ]
    guard let cg = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary) else {
        return nil
    }
    return UIImage(cgImage: cg)
}

private func loadShared() -> SharedTalisman? {
    guard
        let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupID
        ),
        let metaData = try? Data(
            contentsOf: container.appendingPathComponent("widget-meta.json")
        ),
        let meta = try? JSONSerialization.jsonObject(with: metaData) as? [String: Any],
        let img = downsampledImage(
            container.appendingPathComponent("widget-talisman.png"),
            maxPixel: 1200
        )
    else { return nil }
    return SharedTalisman(
        image: img,
        name: meta["name"] as? String ?? "부적",
        hanja: meta["hanja"] as? String ?? "",
        note: meta["note"] as? String ?? "",
        savedAt: (meta["savedAt"] as? String).flatMap(parseISODate),
        agingDays: meta["agingDays"] as? Double ?? 45
    )
}

struct Provider: TimelineProvider {
    private func entry(for date: Date, shared: SharedTalisman?) -> TalismanEntry {
        TalismanEntry(
            date: date,
            image: shared?.image,
            name: shared?.name ?? "수호부",
            hanja: shared?.hanja ?? "",
            note: shared?.note ?? "",
            savedAt: shared?.savedAt,
            agingDays: shared?.agingDays ?? 45
        )
    }

    func placeholder(in context: Context) -> TalismanEntry {
        entry(for: Date(), shared: loadShared())
    }

    func getSnapshot(in context: Context, completion: @escaping (TalismanEntry) -> Void) {
        completion(entry(for: Date(), shared: loadShared()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TalismanEntry>) -> Void) {
        // 이미지는 한 번만 읽고 모든 항목이 공유한다
        let shared = loadShared()
        var entries: [TalismanEntry] = [entry(for: Date(), shared: shared)]
        let cal = Calendar.current
        if (shared?.agingDays ?? 45) <= 7 {
            // 짧게 낡는 부적(선물 3일)은 6시간 간격으로 부드럽게
            for step in 1...12 {
                if let date = cal.date(byAdding: .hour, value: step * 6, to: Date()) {
                    entries.append(entry(for: date, shared: shared))
                }
            }
        } else {
            // 기본 부적은 매일 자정 — 종이가 하루씩 낡아간다
            let todayStart = cal.startOfDay(for: Date())
            for day in 1...7 {
                if let date = cal.date(byAdding: .day, value: day, to: todayStart) {
                    entries.append(entry(for: date, shared: shared))
                }
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// ─── View ───────────────────────────────────────────────────

/// 부적 한 장 — 종이 비율 그대로 잘리지 않게, 세월의 갈변과 그림자를 함께 그린다
private struct TalismanPaper: View {
    let image: UIImage
    let age: Double

    var body: some View {
        let ratio = image.size.height > 0 ? image.size.width / image.size.height : 360.0 / 560.0
        Image(uiImage: image)
            .resizable()
            .aspectRatio(ratio, contentMode: .fit)
            .overlay(
                // 종이 영역에만 얹히는 세월의 흔적 (갈변 + 가장자리 바램)
                GeometryReader { g in
                    ZStack {
                        Color(red: 0.48, green: 0.29, blue: 0.20)
                            .opacity(0.10 * age)
                            .blendMode(.multiply)
                        RadialGradient(
                            colors: [
                                .clear,
                                Color(red: 0.35, green: 0.20, blue: 0.12)
                                    .opacity(0.05 + 0.16 * age),
                            ],
                            center: .center,
                            startRadius: g.size.width * 0.35,
                            endRadius: g.size.width * 0.95
                        )
                    }
                }
            )
            .shadow(
                color: Color(red: 0.35, green: 0.20, blue: 0.12).opacity(0.30),
                radius: 5, y: 2
            )
    }
}

/// 수호부 낙관 (빈 상태용)
private struct SealMark: View {
    var size: CGFloat = 46

    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.15)
            .fill(juhong)
            .frame(width: size, height: size)
            .overlay(
                RoundedRectangle(cornerRadius: size * 0.11)
                    .inset(by: size * 0.076)
                    .stroke(hanji.opacity(0.9), lineWidth: 1.2)
            )
            .overlay(
                Text("수호\n부")
                    .font(.system(size: size * 0.26, weight: .bold, design: .serif))
                    .foregroundStyle(hanji)
                    .multilineTextAlignment(.center)
            )
    }
}

struct TalismanWidgetView: View {
    @Environment(\.widgetFamily) private var family
    var entry: TalismanEntry

    /// 0(새 종이) ~ 1(기간 경과) — 낡아가는 정도. 기간은 부적마다 다르다(선물 3일, 기본 45일)
    private var age: Double {
        guard let saved = entry.savedAt else { return 0 }
        let days = max(0, entry.date.timeIntervalSince(saved) / 86_400)
        return min(days / max(entry.agingDays, 1), 1.0)
    }

    /// 지닌 날수 (당일 = 1일째)
    private var heldDays: Int {
        guard let saved = entry.savedAt else { return 1 }
        let cal = Calendar.current
        let from = cal.startOfDay(for: saved)
        let to = cal.startOfDay(for: entry.date)
        return max(1, (cal.dateComponents([.day], from: from, to: to).day ?? 0) + 1)
    }

    var body: some View {
        Group {
            switch family {
            case .systemMedium: mediumBody
            case .systemLarge: largeBody
            default: smallBody
            }
        }
        .containerBackground(hanji, for: .widget)
    }

    // ── 작게: 부적 한 장으로 꽉 채운다 ──
    private var smallBody: some View {
        Group {
            if let ui = entry.image {
                TalismanPaper(image: ui, age: age)
                    .padding(7)
            } else {
                VStack(spacing: 9) {
                    SealMark(size: 44)
                    Text("부적을 만들어 보세요")
                        .font(.system(size: 11, design: .serif))
                        .foregroundStyle(galsaek)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // ── 중간: 가로가 넓으므로 부적 + 이름·기원 문구를 나란히 ──
    private var mediumBody: some View {
        Group {
            if let ui = entry.image {
                HStack(spacing: 14) {
                    TalismanPaper(image: ui, age: age)
                        .padding(.vertical, 10)
                    infoColumn(alignment: .leading, compact: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 14)
            } else {
                HStack(spacing: 14) {
                    SealMark(size: 48)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("수호부")
                            .font(.system(size: 15, weight: .bold, design: .serif))
                            .foregroundStyle(juhong)
                        Text("당신의 하루를 지켜주는 작은 부적")
                            .font(.system(size: 12, design: .serif))
                            .foregroundStyle(galsaek)
                    }
                }
                .padding(.horizontal, 16)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // ── 크게: 부적을 크게 두고 아래에 이름·기원 문구 ──
    private var largeBody: some View {
        Group {
            if let ui = entry.image {
                VStack(spacing: 10) {
                    TalismanPaper(image: ui, age: age)
                        .frame(maxHeight: .infinity)
                    infoColumn(alignment: .center, compact: false)
                }
                .padding(.horizontal, 16)
                .padding(.top, 14)
                .padding(.bottom, 16)
            } else {
                VStack(spacing: 12) {
                    SealMark(size: 62)
                    Text("부적을 만들어 보세요")
                        .font(.system(size: 15, weight: .bold, design: .serif))
                        .foregroundStyle(juhong)
                    Text("오늘의 마음을 담아\n나만의 부적을 만들 수 있어요")
                        .font(.system(size: 12, design: .serif))
                        .foregroundStyle(galsaek)
                        .multilineTextAlignment(.center)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // ── 이름 · 한자 · 기원 문구 · 지닌 날수 ──
    private func infoColumn(
        alignment: HorizontalAlignment,
        compact: Bool
    ) -> some View {
        VStack(alignment: alignment, spacing: compact ? 4 : 5) {
            HStack(spacing: 5) {
                Text(entry.name)
                    .font(.system(size: compact ? 15 : 17, weight: .bold, design: .serif))
                    .foregroundStyle(juhong)
                if !entry.hanja.isEmpty {
                    Text(entry.hanja)
                        .font(.system(size: compact ? 10 : 11, design: .serif))
                        .foregroundStyle(galsaek.opacity(0.75))
                }
            }

            if !entry.note.isEmpty {
                Text("\u{201C}\(entry.note)\u{201D}")
                    .font(.system(size: compact ? 12 : 13, design: .serif))
                    .foregroundStyle(Color(red: 46 / 255, green: 46 / 255, blue: 46 / 255))
                    .lineSpacing(2)
                    .lineLimit(compact ? 3 : 2)
                    .multilineTextAlignment(alignment == .center ? .center : .leading)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Text("\(heldDays)일째 지니는 중")
                .font(.system(size: compact ? 10 : 11, design: .serif))
                .foregroundStyle(galsaek.opacity(0.7))
        }
    }
}

// ─── Widget ─────────────────────────────────────────────────

struct BujeokWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "BujeokTalisman", provider: Provider()) { entry in
            TalismanWidgetView(entry: entry)
        }
        .configurationDisplayName("수호부")
        .description("당신의 하루를 지켜주는 작은 부적.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

@main
struct BujeokWidgetBundle: WidgetBundle {
    var body: some Widget {
        BujeokWidget()
    }
}
