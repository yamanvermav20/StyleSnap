package app.features.wardrobe

import app.core.InvalidInputException
import app.core.NotFoundException
import app.features.catalog.FixtureData
import app.features.catalog.StyleFixture
import app.features.catalog.apiCall
import app.generated.ApiClient
import app.generated.WardrobeItem
import app.generated.WardrobeItemInput
import app.generated.WardrobePhoto
import java.time.Instant
import java.util.UUID

interface WardrobeRepository {
    suspend fun list(type: String? = null): List<WardrobeItem>
    suspend fun get(id: String): WardrobeItem
    suspend fun create(input: WardrobeItemInput): WardrobeItem
    suspend fun update(id: String, input: WardrobeItemInput): WardrobeItem
    suspend fun delete(id: String)
    suspend fun listPhotos(): List<WardrobePhoto>
}

class ApiWardrobeRepository : WardrobeRepository {
    override suspend fun list(type: String?): List<WardrobeItem> = apiCall { ApiClient.listWardrobeItems(type) }
    override suspend fun get(id: String): WardrobeItem = apiCall { ApiClient.getWardrobeItem(id) }
    override suspend fun create(input: WardrobeItemInput): WardrobeItem = apiCall { ApiClient.createWardrobeItem(input) }
    override suspend fun update(id: String, input: WardrobeItemInput): WardrobeItem =
        apiCall { ApiClient.updateWardrobeItem(id, input) }

    override suspend fun delete(id: String) {
        apiCall { ApiClient.deleteWardrobeItem(id) }
    }

    override suspend fun listPhotos(): List<WardrobePhoto> = apiCall { ApiClient.listWardrobePhotos() }
}

/** In-memory wardrobe. Newest first, same validation as the API. */
class InMemoryWardrobeRepository(private val data: FixtureData = StyleFixture.data()) : WardrobeRepository {
    var blocker: kotlinx.coroutines.CompletableDeferred<Unit>? = null
    var failReads: Boolean = false
    var failWrites: Boolean = false

    private var tick = 0L

    override suspend fun list(type: String?): List<WardrobeItem> {
        blockRead()
        return data.wardrobe
            .filter { type == null || it.type == type }
            .sortedWith(compareByDescending<WardrobeItem> { it.createdAt }.thenBy { it.id })
    }

    override suspend fun get(id: String): WardrobeItem {
        blockRead()
        return data.wardrobe.find { it.id == id } ?: throw NotFoundException()
    }

    override suspend fun create(input: WardrobeItemInput): WardrobeItem {
        blockWrite()
        val clean = validate(input)
        val now = now()
        val created = WardrobeItem(
            id = "wardrobe-${UUID.randomUUID()}",
            name = clean.name,
            brand = clean.brand,
            type = clean.type,
            color = clean.color,
            season = clean.season,
            imageUrl = clean.imageUrl,
            notes = clean.notes,
            favorite = clean.favorite,
            createdAt = now,
            updatedAt = now,
        )
        data.wardrobe.add(0, created)
        return created
    }

    override suspend fun update(id: String, input: WardrobeItemInput): WardrobeItem {
        blockWrite()
        val clean = validate(input)
        val index = data.wardrobe.indexOfFirst { it.id == id }
        if (index < 0) throw NotFoundException()
        val current = data.wardrobe[index]
        val updated = current.copy(
            name = clean.name,
            brand = clean.brand,
            type = clean.type,
            color = clean.color,
            season = clean.season,
            imageUrl = clean.imageUrl,
            notes = clean.notes,
            favorite = clean.favorite,
            updatedAt = now(),
        )
        data.wardrobe[index] = updated
        return updated
    }

    override suspend fun delete(id: String) {
        blockWrite()
        if (!data.wardrobe.removeAll { it.id == id }) throw NotFoundException()
    }

    override suspend fun listPhotos(): List<WardrobePhoto> {
        blockRead()
        return data.photos
    }

    private fun validate(input: WardrobeItemInput): WardrobeItemInput {
        val name = input.name.trim()
        val brand = input.brand.trim()
        val color = input.color.trim()
        val notes = input.notes.trim()
        if (name.isEmpty() || name.length > 60) throw InvalidInputException("name")
        if (brand.length > 40 || color.length > 30 || notes.length > 280) throw InvalidInputException("length")
        if (!input.imageUrl.startsWith("https://")) throw InvalidInputException("imageUrl")
        return input.copy(name = name, brand = brand, color = color, notes = notes)
    }

    private fun now(): String {
        tick += 1
        return Instant.parse("2026-11-18T15:00:00Z").plusMillis(tick).toString()
    }

    private suspend fun blockRead() {
        blocker?.await()
        if (failReads) throw IllegalStateException("offline")
    }

    private suspend fun blockWrite() {
        blocker?.await()
        if (failWrites) throw IllegalStateException("offline")
    }
}
