import SwiftUI

@main
struct AppMain: App {
    @State private var container = AppContainer.forLaunch(.current)

    init() {
        AppFonts.register()
        // Photos are the app; keep enough of them cached that scrolling back doesn't refetch.
        URLCache.shared = URLCache(memoryCapacity: 64 * 1024 * 1024, diskCapacity: 256 * 1024 * 1024)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(container)
        }
    }
}
