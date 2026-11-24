import SwiftUI

/// A category as a tile (DESIGN.md: Category tile): its photo, `categoryTile` wide at 4:5 with `lg`
/// corners, and its name on a `scrim` gradient at the bottom.
struct CategoryTile: View {
    let category: Category

    var body: some View {
        RemotePhoto(url: category.imageUrl, aspectRatio: 4 / 5)
            .frame(width: AppSize.categoryTile)
            .overlay(alignment: .bottomLeading) {
                Text(category.name)
                    .font(AppTypography.title)
                    .foregroundStyle(AppColors.onScrim)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                    .padding(AppSpacing.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(ScrimGradient())
            }
            .clipShape(.rect(cornerRadius: AppRadius.lg))
            .contentShape(.rect(cornerRadius: AppRadius.lg))
    }
}

/// The `scrim` color fading in from the top, behind text that sits on a photo's bottom edge.
struct ScrimGradient: View {
    var body: some View {
        LinearGradient(colors: [AppColors.scrim.opacity(0), AppColors.scrim], startPoint: .top, endPoint: .bottom)
    }
}

#Preview {
    HStack {
        ForEach(Fixtures.categories) { CategoryTile(category: $0) }
    }
    .padding(AppSpacing.lg)
}
