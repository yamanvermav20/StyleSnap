import SwiftUI

/// Save to collection (spec/features/outfit-detail.md): every collection with a check mark when it
/// holds the outfit. A sheet at the medium detent.
struct SaveToCollectionSheet: View {
    @Environment(AppContainer.self) private var container
    @Environment(\.dismiss) private var dismiss
    @Bindable var viewModel: OutfitDetailViewModel
    @State private var isEditorPresented = false

    var body: some View {
        NavigationStack {
            content
                .accessibilityElement(children: .contain)
                .accessibilityIdentifier("saveToCollection.sheet")
                .background(AppColors.background)
                .navigationTitle(Strings.saveToCollectionTitle)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(Strings.commonDone) { dismiss() }
                            .accessibilityIdentifier("saveToCollection.done")
                    }
                }
        }
        .presentationDetents([.medium, .large])
        .presentationCornerRadius(AppRadius.xl)
        .task { await viewModel.loadCollections() }
        .toast($viewModel.toast)
        .sheet(isPresented: $isEditorPresented) {
            CollectionEditorScreen(
                viewModel: CollectionEditorViewModel(collection: nil, repository: container.collectionsRepository)
            ) { created in
                Task { await viewModel.collectionCreated(created) }
            }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.collections {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error) { Task { await viewModel.loadCollections() } }
        case .loaded(let collections):
            List {
                if collections.isEmpty {
                    Text(Strings.saveToCollectionEmptyBody)
                        .font(AppTypography.body)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                        .listRowBackground(AppColors.background)
                }
                ForEach(collections) { collection in
                    row(collection)
                        .listRowBackground(AppColors.surface)
                }
                Button {
                    isEditorPresented = true
                } label: {
                    Label {
                        Text(Strings.saveToCollectionNewCollection)
                            .font(AppTypography.label)
                    } icon: {
                        Image(AppIcon.add)
                    }
                    .foregroundStyle(AppColors.primary)
                    .frame(minHeight: AppSize.touchTarget)
                }
                .accessibilityIdentifier("saveToCollection.new")
                .listRowBackground(AppColors.surface)
            }
            .scrollContentBackground(.hidden)
        }
    }

    private func row(_ collection: OutfitCollection) -> some View {
        let isIn = viewModel.contains(collection)
        return Button {
            Task { await viewModel.toggle(collectionId: collection.id) }
        } label: {
            HStack(spacing: AppSpacing.md) {
                RemotePhoto(url: collection.coverImageUrls.first)
                    .frame(width: AppSize.touchTarget, height: AppSize.touchTarget)
                    .clipShape(.rect(cornerRadius: AppRadius.sm))
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text(collection.name)
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.onSurface)
                    Text(Strings.commonOutfitCount(count: collection.outfitIds.count))
                        .font(AppTypography.caption)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                }
                Spacer(minLength: AppSpacing.md)
                if isIn {
                    Image(AppIcon.check)
                        .foregroundStyle(AppColors.primary)
                        .accessibilityHidden(true)
                }
            }
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(isIn ? .isSelected : [])
        .accessibilityIdentifier("saveToCollection.row.\(collection.id)")
    }
}

#Preview {
    let container = AppContainer.preview()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            SaveToCollectionSheet(viewModel: OutfitDetailViewModel(
                outfitId: "outfit-01", catalog: container.catalogRepository, collections: container.collectionsRepository
            ))
        }
        .environment(container)
}
