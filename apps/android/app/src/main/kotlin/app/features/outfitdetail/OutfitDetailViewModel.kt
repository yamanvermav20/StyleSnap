package app.features.outfitdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.core.NotFoundException
import app.core.Notice
import app.core.NoticeCenter
import app.features.catalog.CatalogRepository
import app.features.collections.CollectionsRepository
import app.generated.Outfit
import app.generated.OutfitCollection
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OutfitDetailUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val notFound: Boolean = false,
    val outfit: Outfit? = null,
    val collections: List<OutfitCollection> = emptyList(),
    val collectionsLoading: Boolean = false,
    val collectionsError: Boolean = false,
    val sheetOpen: Boolean = false,
) {
    val saved: Boolean
        get() = outfit != null && collections.any { outfit.id in it.outfitIds }
}

class OutfitDetailViewModel(
    private val outfitId: String,
    private val catalog: CatalogRepository,
    private val collectionsRepository: CollectionsRepository,
    private val notices: NoticeCenter,
) : ViewModel() {
    private val state = MutableStateFlow(OutfitDetailUiState())
    val uiState: StateFlow<OutfitDetailUiState> = state.asStateFlow()
    private var job: Job? = null

    init {
        load()
    }

    fun load() {
        job?.cancel()
        job = viewModelScope.launch {
            if (state.value.outfit == null) {
                state.update { it.copy(loading = true, error = false, notFound = false) }
            }
            try {
                val outfit = catalog.getOutfit(outfitId)
                val listed = try {
                    collectionsRepository.listCollections()
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    null
                }
                state.update {
                    it.copy(
                        loading = false,
                        error = false,
                        notFound = false,
                        outfit = outfit,
                        collections = listed ?: it.collections,
                        collectionsError = listed == null,
                    )
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: NotFoundException) {
                state.update { it.copy(loading = false, notFound = true, error = false, outfit = null) }
            } catch (e: Exception) {
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }

    fun openSheet() {
        state.update { it.copy(sheetOpen = true, collectionsError = false) }
        refreshCollections()
    }

    fun closeSheet() {
        state.update { it.copy(sheetOpen = false) }
    }

    fun refreshCollections() {
        viewModelScope.launch {
            state.update { it.copy(collectionsLoading = true, collectionsError = false) }
            try {
                val listed = collectionsRepository.listCollections()
                state.update { it.copy(collectionsLoading = false, collections = listed) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(collectionsLoading = false, collectionsError = true) }
            }
        }
    }

    fun toggle(collection: OutfitCollection) {
        val outfit = state.value.outfit ?: return
        val contains = outfit.id in collection.outfitIds
        val previous = state.value.collections
        val optimistic = previous.map { current ->
            if (current.id != collection.id) current
            else if (contains) current.copy(outfitIds = current.outfitIds.filterNot { it == outfit.id })
            else current.copy(outfitIds = listOf(outfit.id) + current.outfitIds)
        }
        state.update { it.copy(collections = optimistic) }
        viewModelScope.launch {
            try {
                val updated = if (contains) {
                    collectionsRepository.removeOutfit(collection.id, outfit.id)
                } else {
                    collectionsRepository.addOutfit(collection.id, outfit.id)
                }
                state.update { current ->
                    current.copy(collections = current.collections.map { if (it.id == updated.id) updated else it })
                }
                notices.show(if (contains) Notice.Removed(collection.name) else Notice.Added(collection.name))
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(collections = previous) }
                notices.show(Notice.SaveFailed)
            }
        }
    }
}
