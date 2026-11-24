import SwiftUI

/// One collection and its outfits (spec/features/collections.md, Collection detail).
struct CollectionDetailScreen: View {
    @Environment(AppContainer.self) private var container
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: CollectionDetailViewModel
    @State private var isEditorPresented: Bool
    @State private var isDeleteConfirmationPresented = false
    @State private var hasAppeared = false

    init(viewModel: CollectionDetailViewModel, presentsEditor: Bool = false) {
        _viewModel = State(initialValue: viewModel)
        _isEditorPresented = State(initialValue: presentsEditor)
    }

    var body: some View {
        content
            .background(AppColors.background)
            .navigationTitle(viewModel.title)
            .toolbar {
                if viewModel.collection != nil {
                    ToolbarItem(placement: .primaryAction) {
                        actions
                    }
                }
            }
            .onAppear {
                let first = !hasAppeared
                hasAppeared = true
                Task { first ? await viewModel.load() : await viewModel.reload() }
            }
            .toast($viewModel.toast)
            .sheet(isPresented: $isEditorPresented) {
                if let collection = viewModel.collection {
                    CollectionEditorScreen(
                        viewModel: CollectionEditorViewModel(collection: collection, repository: container.collectionsRepository)
                    ) { updated in
                        viewModel.updated(updated)
                    }
                }
            }
    }

    private var actions: some View {
        Menu {
            Button {
                isEditorPresented = true
            } label: {
                Label {
                    Text(Strings.commonEdit)
                } icon: {
                    Image(AppIcon.edit)
                }
            }
            .accessibilityIdentifier("collectionDetail.edit")
            Button(role: .destructive) {
                isDeleteConfirmationPresented = true
            } label: {
                Label {
                    Text(Strings.commonDelete)
                } icon: {
                    Image(AppIcon.trash)
                }
            }
            .accessibilityIdentifier("collectionDetail.delete")
        } label: {
            Image(AppIcon.edit)
                .accessibilityLabel(Strings.commonEdit)
        }
        .disabled(viewModel.isDeleting)
        .confirmationDialog(Strings.collectionDetailDeleteTitle, isPresented: $isDeleteConfirmationPresented, titleVisibility: .visible) {
            Button(Strings.commonDelete, role: .destructive) {
                Task {
                    if await viewModel.delete() { dismiss() }
                }
            }
            .accessibilityIdentifier("collectionDetail.confirmDelete")
            Button(Strings.commonCancel, role: .cancel) {}
        } message: {
            Text(Strings.collectionDetailDeleteBody)
        }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error, notFoundMessage: Strings.collectionDetailNotFound) { Task { await viewModel.load() } }
        case .loaded(let content):
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.lg) {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        if !content.collection.description.isEmpty {
                            Text(content.collection.description)
                                .font(AppTypography.body)
                                .foregroundStyle(AppColors.onBackground)
                        }
                        Text(Strings.commonOutfitCount(count: content.outfits.count))
                            .font(AppTypography.caption)
                            .foregroundStyle(AppColors.onSurfaceVariant)
                    }
                    if content.outfits.isEmpty {
                        EmptyState(icon: AppIcon.saved, title: Strings.collectionDetailEmptyTitle, message: Strings.collectionDetailEmptyBody)
                            .padding(.top, AppSpacing.xl)
                    } else {
                        OutfitGrid(outfits: content.outfits) { outfit in
                            Task { await viewModel.remove(outfitId: outfit.id) }
                        }
                        .accessibilityIdentifier("collectionDetail.outfits")
                    }
                }
                .padding(AppSpacing.lg)
            }
            .refreshable { await viewModel.reload() }
        }
    }
}

#Preview {
    let container = AppContainer.preview()
    NavigationStack {
        CollectionDetailScreen(viewModel: CollectionDetailViewModel(
            collectionId: "collection-weekend", repository: container.collectionsRepository
        ))
    }
    .environment(container)
}
