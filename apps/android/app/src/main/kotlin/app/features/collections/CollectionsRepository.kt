package app.features.collections

import app.core.InvalidInputException
import app.core.NotFoundException
import app.features.catalog.FixtureData
import app.features.catalog.StyleFixture
import app.features.catalog.apiCall
import app.generated.ApiClient
import app.generated.CollectionInput
import app.generated.CollectionOutfitInput
import app.generated.Outfit
import app.generated.OutfitCollection
import java.time.Instant
import java.util.UUID

interface CollectionsRepository {
    suspend fun listCollections(): List<OutfitCollection>
    suspend fun getCollection(id: String): OutfitCollection
    suspend fun listOutfits(id: String): List<Outfit>
    suspend fun createCollection(input: CollectionInput): OutfitCollection
    suspend fun updateCollection(id: String, input: CollectionInput): OutfitCollection
    suspend fun deleteCollection(id: String)
    suspend fun addOutfit(collectionId: String, outfitId: String): OutfitCollection
    suspend fun removeOutfit(collectionId: String, outfitId: String): OutfitCollection
}

class ApiCollectionsRepository : CollectionsRepository {
    override suspend fun listCollections(): List<OutfitCollection> = apiCall { ApiClient.listCollections() }
    override suspend fun getCollection(id: String): OutfitCollection = apiCall { ApiClient.getCollection(id) }
    override suspend fun listOutfits(id: String): List<Outfit> = apiCall { ApiClient.listCollectionOutfits(id) }

    override suspend fun createCollection(input: CollectionInput): OutfitCollection =
        apiCall { ApiClient.createCollection(input) }

    override suspend fun updateCollection(id: String, input: CollectionInput): OutfitCollection =
        apiCall { ApiClient.updateCollection(id, input) }

    override suspend fun deleteCollection(id: String) {
        apiCall { ApiClient.deleteCollection(id) }
    }

    override suspend fun addOutfit(collectionId: String, outfitId: String): OutfitCollection = apiCall {
        ApiClient.addOutfitToCollection(collectionId, CollectionOutfitInput(outfitId))
    }

    override suspend fun removeOutfit(collectionId: String, outfitId: String): OutfitCollection = apiCall {
        ApiClient.removeOutfitFromCollection(collectionId, outfitId)
    }
}

/**
 * In-memory collections. Order, cover photos and validation follow the API:
 * most recently updated first, outfits most recently added first, add moves to the front.
 */
class InMemoryCollectionsRepository(private val data: FixtureData = StyleFixture.data()) : CollectionsRepository {
    var blocker: kotlinx.coroutines.CompletableDeferred<Unit>? = null
    var failReads: Boolean = false
    var failWrites: Boolean = false

    private var tick = 0L

    override suspend fun listCollections(): List<OutfitCollection> {
        blockRead()
        return data.collections.sortedWith(compareByDescending<OutfitCollection> { it.updatedAt }.thenBy { it.id })
    }

    override suspend fun getCollection(id: String): OutfitCollection {
        blockRead()
        return data.collections.find { it.id == id } ?: throw NotFoundException()
    }

    override suspend fun listOutfits(id: String): List<Outfit> {
        val collection = getCollection(id)
        return collection.outfitIds.map { outfitId ->
            data.outfits.find { it.id == outfitId } ?: throw NotFoundException()
        }
    }

    override suspend fun createCollection(input: CollectionInput): OutfitCollection {
        blockWrite()
        val (name, description) = validate(input)
        val now = now()
        val created = OutfitCollection(
            id = "collection-${UUID.randomUUID()}",
            name = name,
            description = description,
            outfitIds = emptyList(),
            coverImageUrls = emptyList(),
            createdAt = now,
            updatedAt = now,
        )
        data.collections.add(0, created)
        return created
    }

    override suspend fun updateCollection(id: String, input: CollectionInput): OutfitCollection {
        blockWrite()
        val (name, description) = validate(input)
        val index = data.collections.indexOfFirst { it.id == id }
        if (index < 0) throw NotFoundException()
        val updated = data.collections[index].copy(name = name, description = description, updatedAt = now())
        data.collections[index] = updated
        return updated
    }

    override suspend fun deleteCollection(id: String) {
        blockWrite()
        if (!data.collections.removeAll { it.id == id }) throw NotFoundException()
    }

    override suspend fun addOutfit(collectionId: String, outfitId: String): OutfitCollection {
        blockWrite()
        if (data.outfits.none { it.id == outfitId }) throw NotFoundException()
        val index = data.collections.indexOfFirst { it.id == collectionId }
        if (index < 0) throw NotFoundException()
        val current = data.collections[index]
        val ids = if (outfitId in current.outfitIds) current.outfitIds else listOf(outfitId) + current.outfitIds
        val updated = current.copy(
            outfitIds = ids,
            coverImageUrls = covers(ids),
            updatedAt = if (outfitId in current.outfitIds) current.updatedAt else now(),
        )
        data.collections[index] = updated
        return updated
    }

    override suspend fun removeOutfit(collectionId: String, outfitId: String): OutfitCollection {
        blockWrite()
        val index = data.collections.indexOfFirst { it.id == collectionId }
        if (index < 0) throw NotFoundException()
        val current = data.collections[index]
        val ids = current.outfitIds.filterNot { it == outfitId }
        val updated = current.copy(outfitIds = ids, coverImageUrls = covers(ids), updatedAt = now())
        data.collections[index] = updated
        return updated
    }

    private fun covers(ids: List<String>): List<String> = ids.take(4).mapNotNull { id ->
        data.outfits.find { it.id == id }?.imageUrl
    }

    private fun validate(input: CollectionInput): Pair<String, String> {
        val name = input.name.trim()
        val description = input.description.trim()
        if (name.isEmpty() || name.length > 40 || description.length > 140) {
            throw InvalidInputException("collection")
        }
        return name to description
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
