import SwiftUI

/// All outfits in one style (spec/features/category.md).
struct CategoryScreen: View {
    @State private var viewModel: CategoryViewModel

    init(viewModel: CategoryViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        content
            .background(AppColors.background)
            .navigationTitle(viewModel.title)
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
                VStack(alignment: .leading, spacing: AppSpacing.lg) {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Text(content.category.description)
                            .font(AppTypography.body)
                            .foregroundStyle(AppColors.onBackground)
                        Text(Strings.commonOutfitCount(count: content.outfits.count))
                            .font(AppTypography.caption)
                            .foregroundStyle(AppColors.onSurfaceVariant)
                    }
                    if content.outfits.isEmpty {
                        EmptyState(icon: AppIcon.categories, title: Strings.categoryEmptyTitle, message: Strings.categoryEmptyBody)
                    } else {
                        OutfitGrid(outfits: content.outfits)
                            .accessibilityIdentifier("category.outfits")
                    }
                }
                .padding(AppSpacing.lg)
            }
        }
    }
}

#Preview {
    NavigationStack {
        CategoryScreen(viewModel: CategoryViewModel(categoryId: "minimal", repository: InMemoryCatalogRepository()))
    }
}
