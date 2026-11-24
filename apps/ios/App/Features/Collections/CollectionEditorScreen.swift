import SwiftUI

/// Create or edit a collection: a sheet with a form (spec/features/collections.md, Collection editor).
struct CollectionEditorScreen: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: CollectionEditorViewModel
    private let onSaved: (OutfitCollection) -> Void

    init(viewModel: CollectionEditorViewModel, onSaved: @escaping (OutfitCollection) -> Void) {
        _viewModel = State(initialValue: viewModel)
        self.onSaved = onSaved
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(Strings.collectionEditorName, text: $viewModel.name, prompt: Text(Strings.collectionEditorNamePlaceholder))
                        .font(AppTypography.body)
                        .accessibilityIdentifier("collectionEditor.name")
                        .listRowBackground(AppColors.surface)
                } header: {
                    Text(Strings.collectionEditorName)
                } footer: {
                    if let error = viewModel.error {
                        Text(error)
                            .font(AppTypography.caption)
                            .foregroundStyle(AppColors.error)
                            .accessibilityIdentifier("collectionEditor.error")
                    }
                }

                Section(Strings.collectionEditorDescription) {
                    TextField(
                        Strings.collectionEditorDescription, text: $viewModel.description,
                        prompt: Text(Strings.collectionEditorDescriptionPlaceholder), axis: .vertical
                    )
                    .font(AppTypography.body)
                    .lineLimit(3...6)
                    .accessibilityIdentifier("collectionEditor.description")
                    .listRowBackground(AppColors.surface)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppColors.background)
            .navigationTitle(viewModel.title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(Strings.commonCancel) { dismiss() }
                        .accessibilityIdentifier("collectionEditor.cancel")
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(Strings.commonSave) {
                        Task {
                            if let saved = await viewModel.save() {
                                onSaved(saved)
                                dismiss()
                            }
                        }
                    }
                    .disabled(viewModel.isSaving)
                    .accessibilityIdentifier("collectionEditor.save")
                }
            }
        }
        .interactiveDismissDisabled(viewModel.isSaving)
    }
}

#Preview {
    CollectionEditorScreen(
        viewModel: CollectionEditorViewModel(collection: nil, repository: InMemoryCollectionsRepository())
    ) { _ in }
}
