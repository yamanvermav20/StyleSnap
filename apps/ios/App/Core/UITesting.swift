import Foundation

/// Launch arguments for XCUITests and showcase screenshots (spec/decisions.md, Showcase).
///
/// - `-uiTesting`: in-memory repositories with the shared fixture, so UI tests never need the network.
///   - `-uiTestingEmpty`: no outfits, collections or wardrobe items.
///   - `-uiTestingDelayMs <ms>`: every repository call waits this long, to show loading states.
///   - `-uiTestingFailOnce <operation,…>`: these API operations fail once: `getOutfit` on its next
///     call, `listOutfits@2` on its second call since launch.
/// - `-screenshotScreen <id>`: open that screen on launch. Without `-uiTesting` the app keeps the
///   live API: a freshly seeded backend runs during capture.
/// - `-screenshotAppearance light|dark`: force that appearance, without storing it.
/// - `-screenshotCategoryId`, `-screenshotOutfitId`, `-screenshotCollectionId`, `-screenshotWardrobeItemId`:
///   the records the pushed screens open.
nonisolated struct LaunchOptions: Equatable {
    enum Screen: String {
        case feed
        case category
        case outfitDetail = "outfit-detail"
        case search
        case collections
        case collectionDetail = "collection-detail"
        case collectionEditor = "collection-editor"
        case wardrobe
        case wardrobeEditor = "wardrobe-editor"
        case settings
    }

    static let uiTestingFlag = "-uiTesting"
    static let emptyFlag = "-uiTestingEmpty"
    static let delayFlag = "-uiTestingDelayMs"
    static let failOnceFlag = "-uiTestingFailOnce"
    static let screenFlag = "-screenshotScreen"
    static let appearanceFlag = "-screenshotAppearance"
    static let categoryIdFlag = "-screenshotCategoryId"
    static let outfitIdFlag = "-screenshotOutfitId"
    static let collectionIdFlag = "-screenshotCollectionId"
    static let wardrobeItemIdFlag = "-screenshotWardrobeItemId"

    var isUITesting = false
    var isEmpty = false
    var delayMs = 0
    var failOnce: Set<String> = []
    var screen: Screen?
    var appearance: Appearance?
    var categoryId = "evening"
    var outfitId = "outfit-17"
    var collectionId = "collection-weekend"
    var wardrobeItemId = "wardrobe-03"

    init(arguments: [String]) {
        func value(_ name: String) -> String? {
            guard let index = arguments.firstIndex(of: name), index + 1 < arguments.count else { return nil }
            return arguments[index + 1]
        }
        isUITesting = arguments.contains(Self.uiTestingFlag)
        isEmpty = arguments.contains(Self.emptyFlag)
        delayMs = value(Self.delayFlag).flatMap(Int.init) ?? 0
        failOnce = Set((value(Self.failOnceFlag) ?? "").split(separator: ",").map(String.init))
        screen = value(Self.screenFlag).flatMap(Screen.init(rawValue:))
        appearance = value(Self.appearanceFlag).flatMap(Appearance.init(rawValue:))
        categoryId = value(Self.categoryIdFlag) ?? categoryId
        outfitId = value(Self.outfitIdFlag) ?? outfitId
        collectionId = value(Self.collectionIdFlag) ?? collectionId
        wardrobeItemId = value(Self.wardrobeItemIdFlag) ?? wardrobeItemId
    }

    static let current = LaunchOptions(arguments: ProcessInfo.processInfo.arguments)

    /// The tab the app starts on: Discover, unless a screenshot screen lives in another tab.
    @MainActor
    var initialTab: AppTab {
        switch screen {
        case .search: .search
        case .collections, .collectionDetail, .collectionEditor: .collections
        case .wardrobe, .wardrobeEditor: .wardrobe
        case .feed, .category, .outfitDetail, .settings, nil: .discover
        }
    }

    /// The initial tab's navigation stack, with its root underneath.
    @MainActor
    var initialPath: [Route] {
        switch screen {
        case .category: [.category(categoryId)]
        case .outfitDetail: [.outfitDetail(outfitId)]
        case .collectionDetail, .collectionEditor: [.collectionDetail(collectionId)]
        case .settings: [.settings]
        case .feed, .search, .collections, .wardrobe, .wardrobeEditor, nil: []
        }
    }

    /// Whether Collection detail for `collectionId` opens with its editor presented.
    func presentsCollectionEditor(for collectionId: String) -> Bool {
        screen == .collectionEditor && self.collectionId == collectionId
    }

    /// The wardrobe item whose editor Wardrobe presents on launch.
    var initialWardrobeEditorItemId: String? {
        screen == .wardrobeEditor ? wardrobeItemId : nil
    }
}

extension AppContainer {
    /// The container for this launch: live, or in-memory for `-uiTesting`. An appearance passed on
    /// the command line is kept in memory, so it never overwrites the user's stored choice.
    static func forLaunch(_ options: LaunchOptions) -> AppContainer {
        if options.isUITesting {
            let faults = InMemoryFaults(delay: .milliseconds(options.delayMs), failOnce: options.failOnce)
            return .preview(appearance: options.appearance ?? .system, faults: faults, empty: options.isEmpty)
        }
        guard let appearance = options.appearance else { return .live() }
        return .live(settingsRepository: InMemorySettingsRepository(appearance: appearance))
    }
}
