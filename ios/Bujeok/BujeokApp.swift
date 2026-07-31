import SwiftUI
import WebKit

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
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true
        web.isOpaque = false
        web.backgroundColor = hanjiUIColor
        web.scrollView.backgroundColor = hanjiUIColor
        // viewport-fit=cover + env(safe-area-inset-*)를 웹이 처리하므로 네이티브 인셋은 끈다
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.load(URLRequest(url: appURL))
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let parent: WebView
        init(_ parent: WebView) { self.parent = parent }

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
