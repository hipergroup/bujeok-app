import WidgetKit
import SwiftUI

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
    let savedAt: Date?
}

private func parseISODate(_ s: String) -> Date? {
    let withFraction = ISO8601DateFormatter()
    withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = withFraction.date(from: s) { return d }
    return ISO8601DateFormatter().date(from: s)
}

struct Provider: TimelineProvider {
    private func loadEntry(for date: Date) -> TalismanEntry {
        guard
            let container = FileManager.default.containerURL(
                forSecurityApplicationGroupIdentifier: appGroupID
            ),
            let metaData = try? Data(
                contentsOf: container.appendingPathComponent("widget-meta.json")
            ),
            let meta = try? JSONSerialization.jsonObject(with: metaData) as? [String: Any],
            let imgData = try? Data(
                contentsOf: container.appendingPathComponent("widget-talisman.png")
            ),
            let img = UIImage(data: imgData)
        else {
            return TalismanEntry(date: date, image: nil, name: "수호부", savedAt: nil)
        }
        let savedAt = (meta["savedAt"] as? String).flatMap(parseISODate)
        return TalismanEntry(
            date: date,
            image: img,
            name: meta["name"] as? String ?? "부적",
            savedAt: savedAt
        )
    }

    func placeholder(in context: Context) -> TalismanEntry {
        loadEntry(for: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (TalismanEntry) -> Void) {
        completion(loadEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TalismanEntry>) -> Void) {
        // 매일 자정 항목 — 종이가 하루씩 낡아간다
        var entries: [TalismanEntry] = [loadEntry(for: Date())]
        let cal = Calendar.current
        let todayStart = cal.startOfDay(for: Date())
        for day in 1...7 {
            if let date = cal.date(byAdding: .day, value: day, to: todayStart) {
                entries.append(loadEntry(for: date))
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// ─── View ───────────────────────────────────────────────────

struct TalismanWidgetView: View {
    var entry: TalismanEntry

    /// 0(새 종이) ~ 1(45일 이상) — 낡아가는 정도
    private var age: Double {
        guard let saved = entry.savedAt else { return 0 }
        let days = max(0, entry.date.timeIntervalSince(saved) / 86_400)
        return min(days / 45.0, 1.0)
    }

    var body: some View {
        GeometryReader { geo in
            ZStack {
                if let ui = entry.image {
                    Image(uiImage: ui)
                        .resizable()
                        .scaledToFill()
                        .frame(width: geo.size.width, height: geo.size.height)
                        .clipped()

                    // 세월의 갈변 — 은은하게 진해진다
                    Color(red: 0.48, green: 0.29, blue: 0.20)
                        .opacity(0.10 * age)
                        .blendMode(.multiply)

                    // 가장자리 바램(비네트)
                    RadialGradient(
                        colors: [
                            .clear,
                            Color(red: 0.35, green: 0.20, blue: 0.12)
                                .opacity(0.05 + 0.16 * age),
                        ],
                        center: .center,
                        startRadius: geo.size.width * 0.30,
                        endRadius: geo.size.width * 0.80
                    )
                } else {
                    // 아직 부적이 없을 때
                    VStack(spacing: 10) {
                        RoundedRectangle(cornerRadius: 7)
                            .fill(juhong)
                            .frame(width: 46, height: 46)
                            .overlay(
                                RoundedRectangle(cornerRadius: 5)
                                    .inset(by: 3.5)
                                    .stroke(hanji.opacity(0.9), lineWidth: 1.2)
                            )
                            .overlay(
                                Text("수호\n부")
                                    .font(.system(size: 12, weight: .bold, design: .serif))
                                    .foregroundStyle(hanji)
                                    .multilineTextAlignment(.center)
                            )
                        Text("부적을 만들어 보세요")
                            .font(.system(size: 11, design: .serif))
                            .foregroundStyle(galsaek)
                    }
                    .frame(width: geo.size.width, height: geo.size.height)
                }
            }
        }
        .containerBackground(hanji, for: .widget)
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
