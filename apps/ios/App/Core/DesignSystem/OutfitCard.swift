import SwiftUI

/// An outfit as a card (DESIGN.md: Outfit card): the cover photo at 3:4 with `lg` corners, then the
/// title, the creator and the like count.
struct OutfitCard: View {
    let outfit: Outfit

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            RemotePhoto(url: outfit.imageUrl, aspectRatio: 3 / 4)
                .clipShape(.rect(cornerRadius: AppRadius.lg))
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text(outfit.title)
                    .font(AppTypography.label)
                    .foregroundStyle(AppColors.onBackground)
                    .lineLimit(2)
                Text(Strings.feedByCreator(name: outfit.creatorName))
                    .lineLimit(1)
                HStack(spacing: AppSpacing.xs) {
                    Image(AppIcon.likes)
                        .resizable()
                        .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                        .accessibilityHidden(true)
                    Text(Strings.commonLikes(count: outfit.likes))
                }
            }
            .font(AppTypography.caption)
            .foregroundStyle(AppColors.onSurfaceVariant)
            .padding(.horizontal, AppSpacing.xs)
        }
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .contentShape(.rect)
    }
}

/// Outfit cards in an adaptive grid, two columns on phones (DESIGN.md: Outfit grid). Each card
/// opens Outfit detail. With `onRemove`, a context menu on each card removes it.
struct OutfitGrid: View {
    let outfits: [Outfit]
    var onRemove: ((Outfit) -> Void)?

    private let columns = [GridItem(.adaptive(minimum: AppSize.cardImage / 1.5), spacing: AppSpacing.md, alignment: .top)]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: AppSpacing.xl) {
            ForEach(outfits) { outfit in
                NavigationLink(value: Route.outfitDetail(outfit.id)) {
                    OutfitCard(outfit: outfit)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("outfitCard.\(outfit.id)")
                .contextMenu {
                    if let onRemove {
                        Button(role: .destructive) {
                            onRemove(outfit)
                        } label: {
                            Label {
                                Text(Strings.collectionDetailRemoveOutfit)
                            } icon: {
                                Image(AppIcon.trash)
                            }
                        }
                        .accessibilityIdentifier("collectionDetail.remove.\(outfit.id)")
                    }
                }
            }
        }
        .accessibilityElement(children: .contain)
    }
}

/// A section title on a scrolling screen (DESIGN.md: `headline` for section titles).
struct SectionTitle: View {
    let title: String

    init(_ title: String) {
        self.title = title
    }

    var body: some View {
        Text(title)
            .font(AppTypography.headline)
            .foregroundStyle(AppColors.onBackground)
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityAddTraits(.isHeader)
    }
}

#Preview {
    NavigationStack {
        ScrollView {
            OutfitGrid(outfits: Fixtures.outfits)
                .padding(AppSpacing.lg)
        }
    }
}
