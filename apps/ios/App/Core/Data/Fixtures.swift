import Foundation

/// The small fixture every platform's in-memory repositories hold (spec/decisions.md, Test fixtures),
/// taken from backend/src/seed-data.js. Timestamps are relative to `now`, as the seed computes them.
nonisolated enum Fixtures {
    /// The fixture's "now": Wednesday 18 November 2026, 09:30 UTC.
    static let now = Date(timeIntervalSince1970: 1_794_994_200)

    static func timestamp(_ date: Date) -> String {
        Date.ISO8601FormatStyle(includingFractionalSeconds: true).format(date)
    }

    /// The seed's `ago(days, hours)`.
    static func ago(days: Int, hours: Int = 0) -> String {
        timestamp(now.addingTimeInterval(-Double(days * 86_400 + hours * 3_600)))
    }

    static func photo(_ id: String, width: Int = 900) -> String {
        "https://images.unsplash.com/photo-\(id)?auto=format&fit=crop&w=\(width)&q=80"
    }

    // Product shots, as in the seed's `P`.
    static let whiteTee = photo("1521572163474-6864f9cf17ab", width: 600)
    static let blueTee = photo("1564584217132-2271feaeb3c5", width: 600)
    static let blackTee = photo("1583743814966-8936f5b7be1a", width: 600)
    static let logoTee = photo("1618354691373-d851c5c3a990", width: 600)
    static let graphicTee = photo("1576566588028-4147f3842f27", width: 600)
    static let whiteSweatshirt = photo("1620799140408-edc6dcb6d633", width: 600)
    static let denimShirt = photo("1596755094514-f87e34085b2c", width: 600)
    static let whiteShirt = photo("1603252109303-2751441dd157", width: 600)
    static let chambrayShirt = photo("1558171813-4c088753af8f", width: 600)
    static let knitTop = photo("1434389677669-e08b4cac3105", width: 600)
    static let darkJeans = photo("1624378439575-d8705ad7ae80", width: 600)
    static let trousers = photo("1506629082955-511b1aa562c8", width: 600)
    static let bomber = photo("1591047139829-d91aecb6caea", width: 600)
    static let greySneaker = photo("1460353581641-37baddab0fa2", width: 600)
    static let redRunner = photo("1542291026-7eec264c27ff", width: 600)
    static let tanSneaker = photo("1549298916-b41d501d3772", width: 600)
    static let orangeRunner = photo("1600185365483-26d7a4cc7519", width: 600)
    static let blackRunner = photo("1605348532760-6753d2c43329", width: 600)
    static let neonRunner = photo("1606107557195-0e29a4b5b4aa", width: 600)
    static let whiteSneaker = photo("1608231387042-66d1773070a5", width: 600)
    static let pastelSneaker = photo("1595950653106-6c9ebd614d3a", width: 600)
    static let floralHeels = photo("1543163521-1bf539c55dd2", width: 600)
    static let navyHeels = photo("1515347619252-60a4bf4fff4f", width: 600)
    static let brogues = photo("1614252235316-8c857d38b5f4", width: 600)

    static let categories: [Category] = [
        Category(
            description: "Graphic layers, statement sneakers and city attitude.", id: "streetwear",
            imageUrl: photo("1520367445093-50dc08a59d9d", width: 600), name: "Streetwear", outfitCount: 1
        ),
        Category(
            description: "Clean lines, quiet colors and pieces that last.", id: "minimal",
            imageUrl: photo("1571513722275-4b41940f54b8", width: 600), name: "Minimal", outfitCount: 2
        ),
    ]

    static let outfits: [Outfit] = [
        Outfit(
            categoryId: "streetwear", categoryName: "Streetwear", createdAt: ago(days: 2, hours: 0), creatorName: "Malik Osei",
            description: "A tailored blazer thrown over shorts and tall socks. Bright sneakers keep it playful.",
            gallery: [photo("1520975954732-35dd22299614"), photo("1529139574466-a303027c1d8b")],
            id: "outfit-01", imageUrl: photo("1520367445093-50dc08a59d9d"),
            items: [
                OutfitItem(brand: "Northline", imageUrl: bomber, name: "Relaxed linen blazer", price: 189, type: "outerwear"),
                OutfitItem(brand: "Field & Co", imageUrl: graphicTee, name: "Graphic cotton tee", price: 42, type: "top"),
                OutfitItem(brand: "Strada", imageUrl: orangeRunner, name: "Volt runner", price: 129, type: "shoes"),
            ],
            likes: 4821, occasion: "everyday", season: "summer", tags: ["blazer", "shorts", "bold"], title: "Orange Wall Street Edit"
        ),
        Outfit(
            categoryId: "minimal", categoryName: "Minimal", createdAt: ago(days: 3, hours: 4), creatorName: "Chloé Martin",
            description: "A softly structured ivory blazer with a single red rose. Quietly confident.",
            gallery: [whiteShirt],
            id: "outfit-05", imageUrl: photo("1571513722275-4b41940f54b8"),
            items: [
                OutfitItem(brand: "Northline", imageUrl: whiteShirt, name: "Poplin button-down", price: 79, type: "top"),
                OutfitItem(brand: "Atelier Nove", imageUrl: trousers, name: "Wide leg trousers", price: 135, type: "bottom"),
                OutfitItem(brand: "Maison Rue", imageUrl: navyHeels, name: "Satin pointed heels", price: 165, type: "shoes"),
            ],
            likes: 3388, occasion: "work", season: "spring", tags: ["ivory", "blazer", "tailored"], title: "Ivory Blazer Set"
        ),
        Outfit(
            categoryId: "minimal", categoryName: "Minimal", createdAt: ago(days: 14, hours: 6), creatorName: "Arjun Mehta",
            description: "The perfect white tee, dark denim and nothing else. Minimal never goes out of style.",
            gallery: [whiteTee],
            id: "outfit-07", imageUrl: photo("1586790170083-2f9ceadc732d"),
            items: [
                OutfitItem(brand: "Field & Co", imageUrl: whiteTee, name: "Supima crew tee", price: 32, type: "top"),
                OutfitItem(brand: "Indigo Lab", imageUrl: darkJeans, name: "Raw selvedge jeans", price: 148, type: "bottom"),
                OutfitItem(brand: "Strada", imageUrl: whiteSneaker, name: "Court sneaker", price: 85, type: "shoes"),
            ],
            likes: 1876, occasion: "everyday", season: "summer", tags: ["white", "basics", "tee"], title: "Clean White Tee"
        ),
    ]

    /// A stored collection: the collection plus when each outfit was added.
    struct CollectionRecord {
        var id: String
        var name: String
        var description: String
        var createdAt: String
        var updatedAt: String
        /// Outfit IDs with the time each was added.
        var entries: [(outfitId: String, addedAt: String)]
    }

    static let collections: [CollectionRecord] = [
        CollectionRecord(
            id: "collection-weekend", name: "Weekend edits", description: "Easy looks for slow Saturdays.",
            createdAt: ago(days: 8), updatedAt: ago(days: 1),
            entries: [(outfitId: "outfit-01", addedAt: ago(days: 1))]
        ),
    ]

    static let wardrobeItems: [WardrobeItem] = [
        WardrobeItem(
            brand: "Field & Co", color: "White", createdAt: ago(days: 1), favorite: true, id: "wardrobe-01",
            imageUrl: whiteTee, name: "White crew tee", notes: "Goes with everything. Size M.", season: "allSeason",
            type: "top", updatedAt: ago(days: 1)
        ),
        WardrobeItem(
            brand: "Strada", color: "White", createdAt: ago(days: 4), favorite: false, id: "wardrobe-04",
            imageUrl: whiteSneaker, name: "White court sneakers", notes: "Clean with a soft brush.", season: "allSeason",
            type: "shoes", updatedAt: ago(days: 4)
        ),
    ]

    /// The photo library's tops and shoes, in the seed's display order.
    static let wardrobePhotos: [WardrobePhoto] = [
        ("whiteTee", whiteTee), ("blueTee", blueTee), ("blackTee", blackTee), ("logoTee", logoTee),
        ("graphicTee", graphicTee), ("whiteSweatshirt", whiteSweatshirt), ("denimShirt", denimShirt),
        ("whiteShirt", whiteShirt), ("chambrayShirt", chambrayShirt), ("knitTop", knitTop),
    ].map { WardrobePhoto(id: "photo-\($0.0)", imageUrl: $0.1, type: "top") } + [
        ("whiteSneaker", whiteSneaker), ("greySneaker", greySneaker), ("redRunner", redRunner),
        ("tanSneaker", tanSneaker), ("orangeRunner", orangeRunner), ("blackRunner", blackRunner),
        ("neonRunner", neonRunner), ("pastelSneaker", pastelSneaker), ("floralHeels", floralHeels),
        ("navyHeels", navyHeels), ("brogues", brogues),
    ].map { WardrobePhoto(id: "photo-\($0.0)", imageUrl: $0.1, type: "shoes") }
}
