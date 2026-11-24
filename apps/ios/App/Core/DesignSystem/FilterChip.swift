import SwiftUI

/// What a filter chip looks like (DESIGN.md: Filter chip): a capsule, `surfaceVariant` when off and
/// `primaryContainer` with a `check` when on, in a tap area at least `touchTarget` tall. Also the
/// label of Search's filter menus.
struct ChipLabel: View {
    let title: String
    let isOn: Bool
    /// Shows the `filter` icon after the title, for chips that open a menu.
    var opensMenu = false

    var body: some View {
        HStack(spacing: AppSpacing.xs) {
            if isOn {
                Image(AppIcon.check)
                    .resizable()
                    .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                    .accessibilityHidden(true)
            }
            Text(title)
                .font(AppTypography.label)
                .lineLimit(1)
            if opensMenu {
                Image(AppIcon.filter)
                    .resizable()
                    .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                    .accessibilityHidden(true)
            }
        }
        .foregroundStyle(isOn ? AppColors.onPrimaryContainer : AppColors.onSurface)
        .padding(.horizontal, AppSpacing.md)
        .padding(.vertical, AppSpacing.sm)
        .background(isOn ? AppColors.primaryContainer : AppColors.surfaceVariant, in: .capsule)
        .frame(minHeight: AppSize.touchTarget)
        .contentShape(.rect)
    }
}

/// A chip that toggles one filter on.
struct FilterChip: View {
    let title: String
    let isOn: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ChipLabel(title: title, isOn: isOn)
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isOn ? .isSelected : [])
    }
}

#Preview {
    HStack {
        FilterChip(title: Strings.wardrobeAll, isOn: true) {}
        FilterChip(title: Strings.itemTypeTop, isOn: false) {}
        ChipLabel(title: Strings.searchSeason, isOn: false, opensMenu: true)
    }
    .padding(AppSpacing.lg)
}
