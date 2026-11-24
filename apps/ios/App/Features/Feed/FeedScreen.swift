import SwiftUI

/// The Discover tab (spec/features/feed.md).
struct FeedScreen: View {
    @State private var viewModel: FeedViewModel

    init(viewModel: FeedViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        content
            .background(AppColors.background)
            .navigationTitle(Strings.feedTitle)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    NavigationLink(value: Route.settings) {
                        Image(AppIcon.settings)
                    }
                    .accessibilityLabel(Strings.feedOpenSettings)
                    .accessibilityIdentifier("feed.openSettings")
                }
            }
            .task { await viewModel.loadIfNeeded() }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error) { Task { await viewModel.load() } }
        case .loaded(let content):
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.xl) {
                    categories(content.categories)
                    trending(content.outfits)
                }
                .padding(.vertical, AppSpacing.lg)
            }
            .refreshable { await viewModel.refresh() }
        }
    }

    private func categories(_ categories: [Category]) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionTitle(Strings.feedCategoriesTitle)
                .padding(.horizontal, AppSpacing.lg)
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: AppSpacing.md) {
                    ForEach(categories) { category in
                        NavigationLink(value: Route.category(category.id)) {
                            CategoryTile(category: category)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(category.name)
                        .accessibilityIdentifier("categoryTile.\(category.id)")
                    }
                }
                .padding(.horizontal, AppSpacing.lg)
            }
            .accessibilityIdentifier("feed.categories")
        }
    }

    @ViewBuilder
    private func trending(_ outfits: [Outfit]) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionTitle(Strings.feedTrendingTitle)
            if outfits.isEmpty {
                EmptyState(icon: AppIcon.discover, title: Strings.feedEmptyTitle, message: Strings.feedEmptyBody)
            } else {
                OutfitGrid(outfits: outfits)
                    .accessibilityIdentifier("feed.outfits")
            }
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

#Preview {
    let container = AppContainer.preview()
    NavigationStack {
        FeedScreen(viewModel: FeedViewModel(repository: container.catalogRepository))
    }
    .environment(container)
}
