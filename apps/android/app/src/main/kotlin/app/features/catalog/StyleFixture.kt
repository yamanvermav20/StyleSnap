package app.features.catalog

import app.generated.Category
import app.generated.Outfit
import app.generated.OutfitCollection
import app.generated.OutfitItem
import app.generated.WardrobeItem
import app.generated.WardrobePhoto

/** Unsplash URL, the same builder the seed uses (`backend/src/seed-data.js`). */
fun unsplash(id: String, width: Int = 900): String =
    "https://images.unsplash.com/photo-$id?auto=format&fit=crop&w=$width&q=80"

/**
 * The shared in-memory fixture from spec/decisions.md (2026-11-18), copied from the seed:
 * categories streetwear and minimal; outfits 01, 05 and 07; collection-weekend containing
 * outfit-01; wardrobe-01 and wardrobe-04; the photo library's tops and shoes.
 */
object StyleFixture {
    private val whiteTee = unsplash("1521572163474-6864f9cf17ab", 600)
    private val blueTee = unsplash("1564584217132-2271feaeb3c5", 600)
    private val blackTee = unsplash("1583743814966-8936f5b7be1a", 600)
    private val logoTee = unsplash("1618354691373-d851c5c3a990", 600)
    private val graphicTee = unsplash("1576566588028-4147f3842f27", 600)
    private val whiteSweatshirt = unsplash("1620799140408-edc6dcb6d633", 600)
    private val denimShirt = unsplash("1596755094514-f87e34085b2c", 600)
    private val whiteShirt = unsplash("1603252109303-2751441dd157", 600)
    private val chambrayShirt = unsplash("1558171813-4c088753af8f", 600)
    private val knitTop = unsplash("1434389677669-e08b4cac3105", 600)
    private val jeans = unsplash("1542272604-787c3835535d", 600)
    private val darkJeans = unsplash("1624378439575-d8705ad7ae80", 600)
    private val trousers = unsplash("1506629082955-511b1aa562c8", 600)
    private val bomber = unsplash("1591047139829-d91aecb6caea", 600)
    private val greySneaker = unsplash("1460353581641-37baddab0fa2", 600)
    private val redRunner = unsplash("1542291026-7eec264c27ff", 600)
    private val tanSneaker = unsplash("1549298916-b41d501d3772", 600)
    private val orangeRunner = unsplash("1600185365483-26d7a4cc7519", 600)
    private val blackRunner = unsplash("1605348532760-6753d2c43329", 600)
    private val neonRunner = unsplash("1606107557195-0e29a4b5b4aa", 600)
    private val whiteSneaker = unsplash("1608231387042-66d1773070a5", 600)
    private val pastelSneaker = unsplash("1595950653106-6c9ebd614d3a", 600)
    private val floralHeels = unsplash("1543163521-1bf539c55dd2", 600)
    private val navyHeels = unsplash("1515347619252-60a4bf4fff4f", 600)
    private val brogues = unsplash("1614252235316-8c857d38b5f4", 600)

    val categories: List<Category> = listOf(
        Category(
            id = "streetwear",
            name = "Streetwear",
            description = "Graphic layers, statement sneakers and city attitude.",
            imageUrl = unsplash("1520367445093-50dc08a59d9d", 600),
            outfitCount = 1,
        ),
        Category(
            id = "minimal",
            name = "Minimal",
            description = "Clean lines, quiet colors and pieces that last.",
            imageUrl = unsplash("1571513722275-4b41940f54b8", 600),
            outfitCount = 2,
        ),
    )

    val outfits: List<Outfit> = listOf(
        Outfit(
            id = "outfit-01",
            title = "Orange Wall Street Edit",
            categoryId = "streetwear",
            categoryName = "Streetwear",
            creatorName = "Malik Osei",
            description = "A tailored blazer thrown over shorts and tall socks. Bright sneakers keep it playful.",
            imageUrl = unsplash("1520367445093-50dc08a59d9d"),
            gallery = listOf(unsplash("1520975954732-35dd22299614"), unsplash("1529139574466-a303027c1d8b")),
            season = "summer",
            occasion = "everyday",
            tags = listOf("blazer", "shorts", "bold"),
            likes = 4821,
            createdAt = "2026-11-16T12:00:00.000Z",
            items = listOf(
                OutfitItem("Northline", bomber, "Relaxed linen blazer", 189.0, "outerwear"),
                OutfitItem("Field & Co", graphicTee, "Graphic cotton tee", 42.0, "top"),
                OutfitItem("Strada", orangeRunner, "Volt runner", 129.0, "shoes"),
            ),
        ),
        Outfit(
            id = "outfit-05",
            title = "Ivory Blazer Set",
            categoryId = "minimal",
            categoryName = "Minimal",
            creatorName = "Chloé Martin",
            description = "A softly structured ivory blazer with a single red rose. Quietly confident.",
            imageUrl = unsplash("1571513722275-4b41940f54b8"),
            gallery = listOf(whiteShirt),
            season = "spring",
            occasion = "work",
            tags = listOf("ivory", "blazer", "tailored"),
            likes = 3388,
            createdAt = "2026-11-15T12:00:00.000Z",
            items = listOf(
                OutfitItem("Northline", whiteShirt, "Poplin button-down", 79.0, "top"),
                OutfitItem("Atelier Nove", trousers, "Wide leg trousers", 135.0, "bottom"),
                OutfitItem("Maison Rue", navyHeels, "Satin pointed heels", 165.0, "shoes"),
            ),
        ),
        Outfit(
            id = "outfit-07",
            title = "Clean White Tee",
            categoryId = "minimal",
            categoryName = "Minimal",
            creatorName = "Arjun Mehta",
            description = "The perfect white tee, dark denim and nothing else. Minimal never goes out of style.",
            imageUrl = unsplash("1586790170083-2f9ceadc732d"),
            gallery = listOf(whiteTee),
            season = "summer",
            occasion = "everyday",
            tags = listOf("white", "basics", "tee"),
            likes = 1876,
            createdAt = "2026-11-04T12:00:00.000Z",
            items = listOf(
                OutfitItem("Field & Co", whiteTee, "Supima crew tee", 32.0, "top"),
                OutfitItem("Indigo Lab", darkJeans, "Raw selvedge jeans", 148.0, "bottom"),
                OutfitItem("Strada", whiteSneaker, "Court sneaker", 85.0, "shoes"),
            ),
        ),
    )

    val weekendCollection = OutfitCollection(
        id = "collection-weekend",
        name = "Weekend edits",
        description = "Easy looks for slow Saturdays.",
        outfitIds = listOf("outfit-01"),
        coverImageUrls = listOf(unsplash("1520367445093-50dc08a59d9d")),
        createdAt = "2026-11-17T12:00:00.000Z",
        updatedAt = "2026-11-17T12:00:00.000Z",
    )

    val wardrobeItems: List<WardrobeItem> = listOf(
        WardrobeItem(
            id = "wardrobe-01",
            name = "White crew tee",
            brand = "Field & Co",
            type = "top",
            color = "White",
            season = "allSeason",
            imageUrl = whiteTee,
            notes = "Goes with everything. Size M.",
            favorite = true,
            createdAt = "2026-11-17T12:00:00.000Z",
            updatedAt = "2026-11-17T12:00:00.000Z",
        ),
        WardrobeItem(
            id = "wardrobe-04",
            name = "White court sneakers",
            brand = "Strada",
            type = "shoes",
            color = "White",
            season = "allSeason",
            imageUrl = whiteSneaker,
            notes = "Clean with a soft brush.",
            favorite = false,
            createdAt = "2026-11-14T12:00:00.000Z",
            updatedAt = "2026-11-14T12:00:00.000Z",
        ),
    )

    val photos: List<WardrobePhoto> = listOf(
        WardrobePhoto("photo-whiteTee", whiteTee, "top"),
        WardrobePhoto("photo-blueTee", blueTee, "top"),
        WardrobePhoto("photo-blackTee", blackTee, "top"),
        WardrobePhoto("photo-logoTee", logoTee, "top"),
        WardrobePhoto("photo-graphicTee", graphicTee, "top"),
        WardrobePhoto("photo-whiteSweatshirt", whiteSweatshirt, "top"),
        WardrobePhoto("photo-denimShirt", denimShirt, "top"),
        WardrobePhoto("photo-whiteShirt", whiteShirt, "top"),
        WardrobePhoto("photo-chambrayShirt", chambrayShirt, "top"),
        WardrobePhoto("photo-knitTop", knitTop, "top"),
        WardrobePhoto("photo-whiteSneaker", whiteSneaker, "shoes"),
        WardrobePhoto("photo-greySneaker", greySneaker, "shoes"),
        WardrobePhoto("photo-redRunner", redRunner, "shoes"),
        WardrobePhoto("photo-tanSneaker", tanSneaker, "shoes"),
        WardrobePhoto("photo-orangeRunner", orangeRunner, "shoes"),
        WardrobePhoto("photo-blackRunner", blackRunner, "shoes"),
        WardrobePhoto("photo-neonRunner", neonRunner, "shoes"),
        WardrobePhoto("photo-pastelSneaker", pastelSneaker, "shoes"),
        WardrobePhoto("photo-floralHeels", floralHeels, "shoes"),
        WardrobePhoto("photo-navyHeels", navyHeels, "shoes"),
        WardrobePhoto("photo-brogues", brogues, "shoes"),
    )

    /** A private copy of the fixture so one test cannot change another's data. */
    fun data(): FixtureData = FixtureData(
        categories = categories,
        outfits = outfits,
        collections = mutableListOf(weekendCollection),
        wardrobe = wardrobeItems.toMutableList(),
        photos = photos,
    )
}

/** Mutable store shared by the three in-memory repositories for one container. */
class FixtureData(
    val categories: List<Category> = StyleFixture.categories,
    val outfits: List<Outfit> = StyleFixture.outfits,
    val collections: MutableList<OutfitCollection> = mutableListOf(StyleFixture.weekendCollection),
    val wardrobe: MutableList<WardrobeItem> = StyleFixture.wardrobeItems.toMutableList(),
    val photos: List<WardrobePhoto> = StyleFixture.photos,
)
