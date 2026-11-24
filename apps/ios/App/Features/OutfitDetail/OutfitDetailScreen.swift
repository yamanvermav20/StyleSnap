import SwiftUI

/// Everything about one outfit (spec/features/outfit-detail.md).
struct OutfitDetailScreen: View {
    @State private var viewModel: OutfitDetailViewModel
    @State private var isSaveSheetPresented = false
    @State private var photoIndex = 0
    @State private var heroWidth: CGFloat = 0

    init(viewModel: OutfitDetailViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        content
            .background(AppColors.background)
            .navigationTitle(Strings.outfitDetailTitle)
            .task { await viewModel.loadIfNeeded() }
            // While the sheet is up, it shows the toast instead.
            .toast(isSaveSheetPresented ? .constant(nil) : $viewModel.toast)
            .sheet(isPresented: $isSaveSheetPresented) {
                SaveToCollectionSheet(viewModel: viewModel)
            }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .loading:
            LoadingState()
        case .failed(let error):
            LoadErrorState(error: error, notFoundMessage: Strings.outfitDetailNotFound) { Task { await viewModel.load() } }
        case .loaded(let outfit):
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.xl) {
                    photos(outfit.photos)
                    header(outfit)
                    about(outfit)
                    details(outfit)
                    items(outfit.items)
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.bottom, AppSpacing.xxl)
            }
        }
    }

    // MARK: Photos

    /// 3:4, up to `heroImage` tall.
    private var heroHeight: CGFloat {
        heroWidth > 0 ? min(heroWidth * 4 / 3, AppSize.heroImage) : AppSize.heroImage
    }

    private func photos(_ photos: [String]) -> some View {
        TabView(selection: $photoIndex) {
            ForEach(Array(photos.enumerated()), id: \.offset) { index, url in
                RemotePhoto(url: url)
                    .tag(index)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .frame(maxWidth: .infinity)
        .frame(height: heroHeight)
        .onGeometryChange(for: CGFloat.self, of: { $0.size.width }) { heroWidth = $0 }
        .background(AppColors.surfaceVariant)
        .clipShape(.rect(cornerRadius: AppRadius.xl))
        .overlay(alignment: .bottomTrailing) {
            if photos.count > 1 {
                Text(Strings.outfitDetailPhotoPosition(position: photoIndex + 1, total: photos.count))
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.onScrim)
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.vertical, AppSpacing.xs)
                    .background(AppColors.scrim, in: .capsule)
                    .padding(AppSpacing.md)
                    .accessibilityIdentifier("outfitDetail.photoPosition")
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("outfitDetail.photos")
    }

    // MARK: Header

    private func header(_ outfit: Outfit) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            Text(outfit.title)
                .font(AppTypography.headline)
                .foregroundStyle(AppColors.onBackground)
                .accessibilityAddTraits(.isHeader)
            HStack(alignment: .center, spacing: AppSpacing.md) {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text(Strings.feedByCreator(name: outfit.creatorName))
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.onBackground)
                    HStack(spacing: AppSpacing.xs) {
                        Image(AppIcon.likes)
                            .resizable()
                            .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                            .accessibilityHidden(true)
                        Text(Strings.commonLikes(count: outfit.likes))
                    }
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.onSurfaceVariant)
                }
                Spacer(minLength: AppSpacing.md)
                saveButton
            }
        }
    }

    @ViewBuilder
    private var saveButton: some View {
        let saved = viewModel.isSaved
        let button = Button {
            isSaveSheetPresented = true
        } label: {
            Label {
                Text(saved ? Strings.outfitDetailSaved : Strings.outfitDetailSave)
            } icon: {
                Image(saved ? AppIcon.saved : AppIcon.save)
                    .resizable()
                    .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                    .foregroundStyle(saved ? AppColors.primary : AppColors.onPrimary)
            }
        }
        .accessibilityIdentifier("outfitDetail.save")
        if saved {
            button.buttonStyle(.tonal)
        } else {
            button.buttonStyle(.primary)
        }
    }

    // MARK: Description and tags

    private func about(_ outfit: Outfit) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            Text(outfit.description)
                .font(AppTypography.body)
                .foregroundStyle(AppColors.onBackground)
            FlowLayout {
                ForEach(outfit.tags, id: \.self) { tag in
                    Text(tag)
                        .font(AppTypography.caption)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, AppSpacing.xs)
                        .background(AppColors.surfaceVariant, in: .capsule)
                }
            }
        }
    }

    // MARK: Details

    private func details(_ outfit: Outfit) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionTitle(Strings.outfitDetailDetailsTitle)
            VStack(spacing: 0) {
                NavigationLink(value: Route.category(outfit.categoryId)) {
                    DetailRow(label: Strings.outfitDetailCategory, value: outfit.categoryName, showsChevron: true)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("outfitDetail.category")
                Divider().overlay(AppColors.outline)
                DetailRow(label: Strings.outfitDetailSeason, value: Season.label(for: outfit.season))
                Divider().overlay(AppColors.outline)
                DetailRow(label: Strings.outfitDetailOccasion, value: Occasion.label(for: outfit.occasion))
            }
            .padding(.horizontal, AppSpacing.lg)
            .background(AppColors.surface, in: .rect(cornerRadius: AppRadius.lg))
        }
    }

    // MARK: Items

    private func items(_ items: [OutfitItem]) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            SectionTitle(Strings.outfitDetailItemsTitle)
            VStack(spacing: AppSpacing.md) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                    ItemRow(item: item)
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("outfitDetail.items")
    }
}

/// A label and its value, in the details card.
private struct DetailRow: View {
    let label: String
    let value: String
    var showsChevron = false

    var body: some View {
        HStack(spacing: AppSpacing.md) {
            Text(label)
                .font(AppTypography.body)
                .foregroundStyle(AppColors.onSurfaceVariant)
            Spacer(minLength: AppSpacing.md)
            Text(value)
                .font(AppTypography.label)
                .foregroundStyle(showsChevron ? AppColors.primary : AppColors.onSurface)
                .multilineTextAlignment(.trailing)
            if showsChevron {
                Image(AppIcon.chevronRight)
                    .resizable()
                    .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                    .foregroundStyle(AppColors.onSurfaceVariant)
                    .accessibilityHidden(true)
            }
        }
        .frame(minHeight: AppSize.touchTarget)
        .contentShape(.rect)
        .accessibilityElement(children: .combine)
    }
}

/// One piece of an outfit: photo, name, brand, type and price.
private struct ItemRow: View {
    let item: OutfitItem

    var body: some View {
        HStack(spacing: AppSpacing.md) {
            RemotePhoto(url: item.imageUrl)
                .frame(width: AppSize.thumbnail, height: AppSize.thumbnail)
                .clipShape(.rect(cornerRadius: AppRadius.md))
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text(item.name)
                    .font(AppTypography.label)
                    .foregroundStyle(AppColors.onBackground)
                Text(item.brand)
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.onSurfaceVariant)
                Text(ItemType.label(for: item.type))
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.onSurfaceVariant)
            }
            Spacer(minLength: AppSpacing.md)
            Text(PriceFormat.label(item.price))
                .font(AppTypography.label)
                .foregroundStyle(AppColors.onBackground)
        }
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let container = AppContainer.preview()
    NavigationStack {
        OutfitDetailScreen(viewModel: OutfitDetailViewModel(
            outfitId: "outfit-01", catalog: container.catalogRepository, collections: container.collectionsRepository
        ))
    }
    .environment(container)
}
