import SwiftUI

/// Screens that can be pushed onto a tab's navigation stack. Names match spec/navigation.md.
/// The editors and Save to collection are sheets, presented by the screens that open them.
enum Route: Hashable {
    case category(String)
    case outfitDetail(String)
    case collectionDetail(String)
    case settings
}

/// The four top-level sections, in order (spec/features/feed.md, App shell).
enum AppTab: String, CaseIterable, Identifiable {
    case discover, search, collections, wardrobe

    var id: Self { self }

    var title: String {
        switch self {
        case .discover: Strings.tabsDiscover
        case .search: Strings.tabsSearch
        case .collections: Strings.tabsCollections
        case .wardrobe: Strings.tabsWardrobe
        }
    }

    var icon: ImageResource {
        switch self {
        case .discover: AppIcon.discover
        case .search: AppIcon.search
        case .collections: AppIcon.collections
        case .wardrobe: AppIcon.wardrobe
        }
    }
}
