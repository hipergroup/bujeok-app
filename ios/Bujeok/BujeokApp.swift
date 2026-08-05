import SwiftUI
import WebKit
import WidgetKit
import os

/// 위젯과 공유하는 App Group
private let appGroupID = "group.com.juno.bujeok"

/// 브릿지 진단 로그 — `pymobiledevice3 syslog live` 또는 Console.app에서 확인
private let bridgeLog = Logger(subsystem: "com.juno.bujeok", category: "bridge")

/// 배포된 웹앱을 여는 네이티브 껍데기.
/// 웹(main 푸시 → GitHub Pages)만 갱신되면 앱 재설치 없이 내용이 바뀐다.
private let appURL = URL(string: "https://hipergroup.github.io/bujeok-app/")!

/// 한지색 — 웹 테마(#F2E6CC)와 동일하게 맞춰 로딩 중 흰 화면 깜빡임을 없앤다.
private let hanjiUIColor = UIColor(red: 242 / 255, green: 230 / 255, blue: 204 / 255, alpha: 1)

@main
struct BujeokApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var loadFailed = false
    @State private var reloadToken = 0

    var body: some View {
        ZStack {
            Color(hanjiUIColor).ignoresSafeArea()
            WebView(loadFailed: $loadFailed)
                .id(reloadToken)
                .ignoresSafeArea()
            if loadFailed {
                VStack(spacing: 16) {
                    Text("연결이 잠시 끊겼어요")
                        .font(.headline)
                    Text("네트워크를 확인한 뒤 다시 시도해 주세요.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Button("다시 시도") {
                        loadFailed = false
                        reloadToken += 1
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(32)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20))
            }
        }
    }
}

struct WebView: UIViewRepresentable {
    @Binding var loadFailed: Bool

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        // 웹 → 네이티브 위젯 브리지: 부적 저장 시 PNG·메타를 App Group에 기록
        config.userContentController.add(context.coordinator, name: "widgetBridge")
        bridgeLog.notice("widgetBridge handler registered")
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true
        web.isOpaque = false
        web.backgroundColor = hanjiUIColor
        web.scrollView.backgroundColor = hanjiUIColor
        // viewport-fit=cover + env(safe-area-inset-*)를 웹이 처리하므로 네이티브 인셋은 끈다
        web.scrollView.contentInsetAdjustmentBehavior = .never
        // 개발 서명 빌드 진단용: Safari/pymobiledevice3 웹 인스펙터 연결 허용
        web.isInspectable = true
        // 항상 서버와 재검증(ETag 304) — 배포 직후에도 옛 캐시 페이지가 뜨지 않게
        web.load(URLRequest(url: appURL, cachePolicy: .reloadRevalidatingCacheData))
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        let parent: WebView
        init(_ parent: WebView) { self.parent = parent }

        /// 웹이 보낸 부적(PNG base64 + 메타)을 위젯 공유 저장소에 기록
        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            let rawBody = message.body as? [String: Any]

            // 웹 쪽 진단 메시지는 로그만 남긴다
            if let dbg = rawBody?["debug"] as? String {
                bridgeLog.notice("web: \(dbg, privacy: .public)")
                return
            }
            bridgeLog.notice(
                "talisman message received (png \((rawBody?["png"] as? String)?.count ?? -1) chars)"
            )

            guard message.name == "widgetBridge",
                  let body = rawBody,
                  let pngBase64 = body["png"] as? String,
                  let data = Data(base64Encoded: pngBase64),
                  let container = FileManager.default.containerURL(
                    forSecurityApplicationGroupIdentifier: appGroupID
                  )
            else {
                bridgeLog.error("talisman message rejected (payload or app-group)")
                return
            }

            let meta: [String: Any] = [
                "name": body["name"] as? String ?? "부적",
                "hanja": body["hanja"] as? String ?? "",
                "note": body["note"] as? String ?? "",
                "savedAt": body["savedAt"] as? String
                    ?? ISO8601DateFormatter().string(from: Date()),
            ]
            try? data.write(to: container.appendingPathComponent("widget-talisman.png"))
            if let metaData = try? JSONSerialization.data(withJSONObject: meta) {
                try? metaData.write(to: container.appendingPathComponent("widget-meta.json"))
            }
            WidgetCenter.shared.reloadAllTimelines()
            bridgeLog.notice("widget files written, timelines reloaded")
        }

        /// 페이지 로드 완료 시 JS 컨텍스트에서 브릿지가 보이는지 자가 진단
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript(
                "!!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.widgetBridge)"
            ) { result, error in
                bridgeLog.notice(
                    "js-probe bridgeVisible=\(String(describing: result), privacy: .public) error=\(String(describing: error), privacy: .public)"
                )
            }
        }

        // tel:(위기 지원 전화)·mailto: 등 웹뷰가 못 여는 스킴은 시스템으로 넘긴다
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            if let url = navigationAction.request.url,
               let scheme = url.scheme?.lowercased(),
               scheme != "http", scheme != "https", scheme != "about", scheme != "blob" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        // target=_blank 링크는 같은 웹뷰에서 연다
        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation!,
            withError error: Error
        ) {
            parent.loadFailed = true
        }
    }
}
