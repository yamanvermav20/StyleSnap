import SwiftUI

/// Add, edit or delete a wardrobe item: a sheet with a form (spec/features/wardrobe.md, Wardrobe editor).
struct WardrobeEditorScreen: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: WardrobeEditorViewModel
    @State private var isDeleteConfirmationPresented = false
    /// Called after a save or delete, so Wardrobe can reload.
    private let onChange: () -> Void

    private let photoColumns = [GridItem(.adaptive(minimum: AppSize.thumbnail), spacing: AppSpacing.sm)]

    init(viewModel: WardrobeEditorViewModel, onChange: @escaping () -> Void) {
        _viewModel = State(initialValue: viewModel)
        self.onChange = onChange
    }

    var body: some View {
        NavigationStack {
            content
                .background(AppColors.background)
                .navigationTitle(viewModel.title)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button(Strings.commonCancel) { dismiss() }
                            .accessibilityIdentifier("wardrobeEditor.cancel")
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button(Strings.commonSave) {
                            Task {
                                if await viewModel.save() {
                                    onChange()
                                    dismiss()
                                }
                            }
                        }
                        .disabled(viewModel.state.value == nil || viewModel.isBusy)
                        .accessibilityIdentifier("wardrobeEditor.save")
                    }
                }
        }
        .interactiveDismissDisabled(viewModel.isBusy)
        .task { await viewModel.load() }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error, notFoundMessage: Strings.wardrobeEditorNotFound) { Task { await viewModel.load() } }
        case .loaded:
            form
        }
    }

    private var form: some View {
        Form {
            if let error = viewModel.error {
                Section {
                    Text(error)
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.error)
                        .accessibilityIdentifier("wardrobeEditor.error")
                        .listRowBackground(AppColors.surface)
                }
            }

            Section(Strings.wardrobeEditorPhoto) {
                photoGrid
                    .padding(.vertical, AppSpacing.sm)
                    .listRowBackground(AppColors.surface)
            }

            Section {
                LabeledContent(Strings.wardrobeEditorName) {
                    TextField(Strings.wardrobeEditorName, text: $viewModel.name, prompt: Text(Strings.wardrobeEditorNamePlaceholder))
                        .multilineTextAlignment(.trailing)
                        .accessibilityIdentifier("wardrobeEditor.name")
                }
                LabeledContent(Strings.wardrobeEditorBrand) {
                    TextField(Strings.wardrobeEditorBrand, text: $viewModel.brand, prompt: Text(Strings.wardrobeEditorBrandPlaceholder))
                        .multilineTextAlignment(.trailing)
                        .accessibilityIdentifier("wardrobeEditor.brand")
                }
                Picker(Strings.wardrobeEditorType, selection: $viewModel.type) {
                    ForEach(ItemType.allCases) { type in
                        Text(type.label).tag(type)
                    }
                }
                .pickerStyle(.menu)
                .accessibilityIdentifier("wardrobeEditor.type")
                LabeledContent(Strings.wardrobeEditorColor) {
                    TextField(Strings.wardrobeEditorColor, text: $viewModel.color, prompt: Text(Strings.wardrobeEditorColorPlaceholder))
                        .multilineTextAlignment(.trailing)
                        .accessibilityIdentifier("wardrobeEditor.color")
                }
                Picker(Strings.wardrobeEditorSeason, selection: $viewModel.season) {
                    ForEach(Season.allCases) { season in
                        Text(season.label).tag(season)
                    }
                }
                .pickerStyle(.menu)
                .accessibilityIdentifier("wardrobeEditor.season")
                Toggle(Strings.wardrobeEditorFavorite, isOn: $viewModel.favorite)
                    .tint(AppColors.primary)
                    .accessibilityIdentifier("wardrobeEditor.favorite")
            }
            .font(AppTypography.body)
            .listRowBackground(AppColors.surface)

            Section(Strings.wardrobeEditorNotes) {
                TextField(Strings.wardrobeEditorNotes, text: $viewModel.notes, prompt: Text(Strings.wardrobeEditorNotesPlaceholder), axis: .vertical)
                    .font(AppTypography.body)
                    .lineLimit(3...8)
                    .accessibilityIdentifier("wardrobeEditor.notes")
                    .listRowBackground(AppColors.surface)
            }

            if viewModel.isEditing {
                Section {
                    Button(role: .destructive) {
                        isDeleteConfirmationPresented = true
                    } label: {
                        Label {
                            Text(Strings.wardrobeEditorDelete)
                        } icon: {
                            Image(AppIcon.trash)
                        }
                        .font(AppTypography.body)
                        .foregroundStyle(AppColors.error)
                    }
                    .disabled(viewModel.isBusy)
                    .accessibilityIdentifier("wardrobeEditor.delete")
                    .confirmationDialog(Strings.wardrobeEditorDeleteTitle, isPresented: $isDeleteConfirmationPresented, titleVisibility: .visible) {
                        Button(Strings.commonDelete, role: .destructive) {
                            Task {
                                if await viewModel.delete() {
                                    onChange()
                                    dismiss()
                                }
                            }
                        }
                        .accessibilityIdentifier("wardrobeEditor.confirmDelete")
                        Button(Strings.commonCancel, role: .cancel) {}
                    } message: {
                        Text(Strings.wardrobeEditorDeleteBody)
                    }
                    .listRowBackground(AppColors.surface)
                }
            }
        }
        .scrollContentBackground(.hidden)
    }

    private var photoGrid: some View {
        LazyVGrid(columns: photoColumns, spacing: AppSpacing.sm) {
            if let current = viewModel.currentPhotoUrl {
                photoOption(url: current, testID: "wardrobeEditor.photo.current")
            }
            ForEach(viewModel.visiblePhotos) { photo in
                photoOption(url: photo.imageUrl, testID: "wardrobeEditor.photo.\(photo.id)")
            }
        }
    }

    private func photoOption(url: String, testID: String) -> some View {
        let isSelected = viewModel.imageUrl == url
        return Button {
            viewModel.imageUrl = url
        } label: {
            RemotePhoto(url: url, aspectRatio: 1)
                .clipShape(.rect(cornerRadius: AppRadius.md))
                .overlay {
                    if isSelected {
                        RoundedRectangle(cornerRadius: AppRadius.md)
                            .strokeBorder(AppColors.primary, lineWidth: AppSpacing.xs)
                    }
                }
                .overlay(alignment: .topTrailing) {
                    if isSelected {
                        Image(AppIcon.check)
                            .resizable()
                            .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                            .foregroundStyle(AppColors.onPrimary)
                            .padding(AppSpacing.xs)
                            .background(AppColors.primary, in: .circle)
                            .padding(AppSpacing.xs)
                    }
                }
                .contentShape(.rect)
        }
        .buttonStyle(.borderless)
        .accessibilityLabel(Strings.wardrobeEditorPhoto)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityIdentifier(testID)
    }
}

#Preview {
    WardrobeEditorScreen(viewModel: WardrobeEditorViewModel(itemId: "wardrobe-01", repository: InMemoryWardrobeRepository())) {}
}
