import SwiftUI
import UIKit

/// The navigation root: four tabs, each with its own navigation stack. Also applies the chosen
/// appearance to every window.
struct RootView: View {
    @Environment(AppContainer.self) private var container
    @State private var selection: AppTab
    @State private var paths: [AppTab: [Route]]
    private let options: LaunchOptions

    init(options: LaunchOptions = .current) {
        self.options = options
        _selection = State(initialValue: options.initialTab)
        _paths = State(initialValue: [options.initialTab: options.initialPath])
    }

    var body: some View {
        TabView(selection: tabSelection) {
            ForEach(AppTab.allCases) { tab in
                NavigationStack(path: path(for: tab)) {
                    root(for: tab)
                        .navigationDestination(for: Route.self) { route in
                            destination(for: route)
                        }
                }
                .tabItem {
                    Label {
                        Text(tab.title)
                    } icon: {
                        Image(tab.icon)
                    }
                }
                .tag(tab)
            }
        }
        .tint(AppColors.primary)
        .onChange(of: container.settingsRepository.appearance, initial: true) { _, appearance in
            apply(appearance)
        }
    }

    /// Choosing the current tab again pops it back to its root (spec/navigation.md).
    private var tabSelection: Binding<AppTab> {
        Binding(
            get: { selection },
            set: { tab in
                if tab == selection {
                    paths[tab] = []
                }
                selection = tab
            }
        )
    }

    private func path(for tab: AppTab) -> Binding<[Route]> {
        Binding(
            get: { paths[tab] ?? [] },
            set: { paths[tab] = $0 }
        )
    }

    @ViewBuilder
    private func root(for tab: AppTab) -> some View {
        switch tab {
        case .discover:
            FeedScreen(viewModel: FeedViewModel(repository: container.catalogRepository))
        case .search:
            SearchScreen(viewModel: SearchViewModel(repository: container.catalogRepository))
        case .collections:
            CollectionsScreen(viewModel: CollectionsViewModel(repository: container.collectionsRepository))
        case .wardrobe:
            WardrobeScreen(
                viewModel: WardrobeViewModel(repository: container.wardrobeRepository),
                initialEditorItemId: options.initialWardrobeEditorItemId
            )
        }
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .category(let categoryId):
            CategoryScreen(viewModel: CategoryViewModel(categoryId: categoryId, repository: container.catalogRepository))
        case .outfitDetail(let outfitId):
            OutfitDetailScreen(viewModel: OutfitDetailViewModel(
                outfitId: outfitId,
                catalog: container.catalogRepository,
                collections: container.collectionsRepository
            ))
        case .collectionDetail(let collectionId):
            CollectionDetailScreen(
                viewModel: CollectionDetailViewModel(collectionId: collectionId, repository: container.collectionsRepository),
                presentsEditor: options.presentsCollectionEditor(for: collectionId)
            )
        case .settings:
            SettingsScreen(viewModel: SettingsViewModel(repository: container.settingsRepository))
        }
    }

    /// Overrides the style on the windows themselves, so sheets and alerts follow too.
    private func apply(_ appearance: Appearance) {
        for case let scene as UIWindowScene in UIApplication.shared.connectedScenes {
            for window in scene.windows {
                window.overrideUserInterfaceStyle = appearance.interfaceStyle
            }
        }
    }
}
