import SwiftUI

/// The Wardrobe tab (spec/features/wardrobe.md).
struct WardrobeScreen: View {
    /// Which editor the sheet shows.
    enum Editor: Identifiable, Equatable {
        case new
        case edit(String)

        var id: String {
            switch self {
            case .new: ""
            case .edit(let itemId): itemId
            }
        }

        var itemId: String? {
            if case .edit(let itemId) = self { itemId } else { nil }
        }
    }

    @Environment(AppContainer.self) private var container
    @State private var viewModel: WardrobeViewModel
    @State private var editor: Editor?
    @State private var hasAppeared = false

    private let columns = [GridItem(.adaptive(minimum: AppSize.cardImage / 1.5), spacing: AppSpacing.md, alignment: .top)]

    init(viewModel: WardrobeViewModel, initialEditorItemId: String? = nil) {
        _viewModel = State(initialValue: viewModel)
        _editor = State(initialValue: initialEditorItemId.map(Editor.edit))
    }

    var body: some View {
        VStack(spacing: 0) {
            chips
            content
                .frame(maxHeight: .infinity)
        }
        .background(AppColors.background)
        .navigationTitle(Strings.wardrobeTitle)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    editor = .new
                } label: {
                    Image(AppIcon.add)
                }
                .accessibilityLabel(Strings.wardrobeAdd)
                .accessibilityIdentifier("wardrobe.add")
            }
        }
        .onAppear {
            let first = !hasAppeared
            hasAppeared = true
            Task { first ? await viewModel.load() : await viewModel.reload() }
        }
        .sheet(item: $editor) { editor in
            WardrobeEditorScreen(
                viewModel: WardrobeEditorViewModel(itemId: editor.itemId, repository: container.wardrobeRepository)
            ) {
                Task { await viewModel.reload() }
            }
        }
    }

    private var chips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppSpacing.sm) {
                FilterChip(title: Strings.wardrobeAll, isOn: viewModel.selectedType == nil) {
                    Task { await viewModel.select(nil) }
                }
                .accessibilityIdentifier("wardrobe.filter.all")
                ForEach(ItemType.allCases) { type in
                    FilterChip(title: type.label, isOn: viewModel.selectedType == type) {
                        Task { await viewModel.select(type) }
                    }
                    .accessibilityIdentifier("wardrobe.filter.\(type.rawValue)")
                }
            }
            .padding(.horizontal, AppSpacing.lg)
        }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error) { Task { await viewModel.load() } }
        case .loaded(let content) where content.wardrobeIsEmpty:
            EmptyState(
                icon: AppIcon.wardrobe, title: Strings.wardrobeEmptyTitle, message: Strings.wardrobeEmptyBody,
                actionTitle: Strings.wardrobeAdd
            ) {
                editor = .new
            }
        case .loaded(let content) where content.items.isEmpty:
            EmptyState(icon: AppIcon.wardrobe, title: Strings.wardrobeEmptyFilteredTitle, message: Strings.wardrobeEmptyFilteredBody)
        case .loaded(let content):
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    Text(Strings.commonItemCount(count: content.items.count))
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                    LazyVGrid(columns: columns, alignment: .leading, spacing: AppSpacing.xl) {
                        ForEach(content.items) { item in
                            Button {
                                editor = .edit(item.id)
                            } label: {
                                WardrobeCard(item: item)
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("wardrobeCard.\(item.id)")
                        }
                    }
                    .accessibilityElement(children: .contain)
                    .accessibilityIdentifier("wardrobe.items")
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.vertical, AppSpacing.sm)
            }
            .refreshable { await viewModel.reload() }
        }
    }
}

/// A wardrobe item as a card: a square photo with `lg` corners and, for favorites, a star on its
/// corner; then the name and brand.
struct WardrobeCard: View {
    let item: WardrobeItem

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            RemotePhoto(url: item.imageUrl, aspectRatio: 1)
                .clipShape(.rect(cornerRadius: AppRadius.lg))
                .overlay(alignment: .topTrailing) {
                    if item.favorite {
                        Image(AppIcon.favorite)
                            .resizable()
                            .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                            .foregroundStyle(AppColors.favorite)
                            .padding(AppSpacing.sm)
                            .background(AppColors.scrim, in: .circle)
                            .padding(AppSpacing.sm)
                            .accessibilityLabel(Strings.wardrobeFavorite)
                    }
                }
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text(item.name)
                    .font(AppTypography.label)
                    .foregroundStyle(AppColors.onBackground)
                    .lineLimit(2)
                if !item.brand.isEmpty {
                    Text(item.brand)
                        .font(AppTypography.caption)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, AppSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let container = AppContainer.preview()
    NavigationStack {
        WardrobeScreen(viewModel: WardrobeViewModel(repository: container.wardrobeRepository))
    }
    .environment(container)
}
