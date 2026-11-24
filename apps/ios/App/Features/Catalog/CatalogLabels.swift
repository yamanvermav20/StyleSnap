import Foundation

/// PRODUCT.md, Glossary: Season. Raw values are the API's.
nonisolated enum Season: String, CaseIterable, Identifiable {
    case spring, summer, fall, winter, allSeason

    var id: Self { self }

    var label: String {
        switch self {
        case .spring: Strings.seasonSpring
        case .summer: Strings.seasonSummer
        case .fall: Strings.seasonFall
        case .winter: Strings.seasonWinter
        case .allSeason: Strings.seasonAllSeason
        }
    }

    /// The label for an API value, or the value itself if it's unknown.
    static func label(for value: String) -> String {
        Season(rawValue: value)?.label ?? value
    }
}

/// PRODUCT.md, Glossary: Occasion.
nonisolated enum Occasion: String, CaseIterable, Identifiable {
    case everyday, work, party, date, travel, sport

    var id: Self { self }

    var label: String {
        switch self {
        case .everyday: Strings.occasionEveryday
        case .work: Strings.occasionWork
        case .party: Strings.occasionParty
        case .date: Strings.occasionDate
        case .travel: Strings.occasionTravel
        case .sport: Strings.occasionSport
        }
    }

    static func label(for value: String) -> String {
        Occasion(rawValue: value)?.label ?? value
    }
}

/// PRODUCT.md, Glossary: Item type. Shared by outfit items and wardrobe items.
nonisolated enum ItemType: String, CaseIterable, Identifiable {
    case top, bottom, dress, outerwear, shoes, accessory

    var id: Self { self }

    var label: String {
        switch self {
        case .top: Strings.itemTypeTop
        case .bottom: Strings.itemTypeBottom
        case .dress: Strings.itemTypeDress
        case .outerwear: Strings.itemTypeOuterwear
        case .shoes: Strings.itemTypeShoes
        case .accessory: Strings.itemTypeAccessory
        }
    }

    static func label(for value: String) -> String {
        ItemType(rawValue: value)?.label ?? value
    }
}

/// The `sort` parameter of `listOutfits`.
nonisolated enum OutfitSort: String, CaseIterable, Identifiable {
    case popular, newest

    var id: Self { self }

    var label: String {
        switch self {
        case .popular: Strings.searchSortPopular
        case .newest: Strings.searchSortNewest
        }
    }
}

/// spec/features/outfit-detail.md, Prices: whole dollars without decimals ("189"), anything else
/// with two ("42.50"). The result fills `common.price`'s `{price}`.
nonisolated enum PriceFormat {
    static func string(_ price: Double) -> String {
        price.rounded() == price ? String(Int(price)) : String(format: "%.2f", price)
    }

    static func label(_ price: Double) -> String {
        Strings.commonPrice(price: string(price))
    }
}

nonisolated extension Category: Identifiable {}
nonisolated extension Outfit: Identifiable {}
nonisolated extension OutfitCollection: Identifiable {}
nonisolated extension WardrobeItem: Identifiable {}
nonisolated extension WardrobePhoto: Identifiable {}

nonisolated extension Outfit {
    /// The cover photo, then the gallery.
    var photos: [String] { [imageUrl] + gallery }
}
