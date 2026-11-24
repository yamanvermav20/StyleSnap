import SwiftUI

/// The Collections tab (spec/features/collections.md).
struct CollectionsScreen: View {
    @Environment(AppContainer.self) private var container
    @State private var viewModel: CollectionsViewModel
    @State private var isEditorPresented = false
    @State private var hasAppeared = false

    private let columns = [GridItem(.adaptive(minimum: AppSize.cardImage / 1.5), spacing: AppSpacing.md, alignment: .top)]

    init(viewModel: CollectionsViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        content
            .background(AppColors.background)
            .navigationTitle(Strings.collectionsTitle)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        isEditorPresented = true
                    } label: {
                        Image(AppIcon.add)
                    }
                    .accessibilityLabel(Strings.collectionsAdd)
                    .accessibilityIdentifier("collections.add")
                }
            }
            .onAppear {
                let first = !hasAppeared
                hasAppeared = true
                Task { first ? await viewModel.load() : await viewModel.reload() }
            }
            .sheet(isPresented: $isEditorPresented) {
                CollectionEditorScreen(
                    viewModel: CollectionEditorViewModel(collection: nil, repository: container.collectionsRepository)
                ) { created in
                    viewModel.created(created)
                }
            }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error) { Task { await viewModel.load() } }
        case .loaded(let collections) where collections.isEmpty:
            EmptyState(
                icon: AppIcon.collections, title: Strings.collectionsEmptyTitle, message: Strings.collectionsEmptyBody,
                actionTitle: Strings.collectionsEmptyAction
            ) {
                isEditorPresented = true
            }
        case .loaded(let collections):
            ScrollView {
                LazyVGrid(columns: columns, alignment: .leading, spacing: AppSpacing.xl) {
                    ForEach(collections) { collection in
                        NavigationLink(value: Route.collectionDetail(collection.id)) {
                            CollectionCard(collection: collection)
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("collectionCard.\(collection.id)")
                    }
                }
                .accessibilityElement(children: .contain)
                .accessibilityIdentifier("collections.list")
                .padding(AppSpacing.lg)
            }
            .refreshable { await viewModel.reload() }
        }
    }
}

/// A collection as a card: a 2 × 2 collage of its covers, its name and outfit count.
struct CollectionCard: View {
    let collection: OutfitCollection

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            CoverCollage(urls: collection.coverImageUrls)
                .clipShape(.rect(cornerRadius: AppRadius.lg))
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text(collection.name)
                    .font(AppTypography.label)
                    .foregroundStyle(AppColors.onBackground)
                    .lineLimit(2)
                Text(Strings.commonOutfitCount(count: collection.outfitIds.count))
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.onSurfaceVariant)
            }
            .padding(.horizontal, AppSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
    }
}

/// Up to four cover photos in a square 2 × 2 grid. Empty cells are `surfaceVariant`; with no
/// covers at all, the `collections` icon sits on `surfaceVariant`.
struct CoverCollage: View {
    let urls: [String]

    var body: some View {
        Color.clear
            .aspectRatio(1, contentMode: .fit)
            .overlay {
                if urls.isEmpty {
                    AppColors.surfaceVariant
                        .overlay {
                            Image(AppIcon.collections)
                                .resizable()
                                .scaledToFit()
                                .frame(width: AppIconSize.lg, height: AppIconSize.lg)
                                .foregroundStyle(AppColors.onSurfaceVariant)
                        }
                } else {
                    Grid(horizontalSpacing: AppSpacing.xs / 2, verticalSpacing: AppSpacing.xs / 2) {
                        GridRow {
                            cell(0)
                            cell(1)
                        }
                        GridRow {
                            cell(2)
                            cell(3)
                        }
                    }
                }
            }
            .accessibilityHidden(true)
    }

    private func cell(_ index: Int) -> some View {
        RemotePhoto(url: index < urls.count ? urls[index] : nil)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    let container = AppContainer.preview()
    NavigationStack {
        CollectionsScreen(viewModel: CollectionsViewModel(repository: container.collectionsRepository))
    }
    .environment(container)
}
