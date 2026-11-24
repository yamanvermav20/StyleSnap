package app.features.collections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.core.NotFoundException
import app.core.Notice
import app.core.NoticeCenter
import app.generated.CollectionInput
import app.generated.Outfit
import app.generated.OutfitCollection
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CollectionsUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val collections: List<OutfitCollection> = emptyList(),
)

class CollectionsViewModel(private val repository: CollectionsRepository) : ViewModel() {
    private val state = MutableStateFlow(CollectionsUiState())
    val uiState: StateFlow<CollectionsUiState> = state.asStateFlow()
    private var job: Job? = null

    init {
        load()
    }

    fun load() {
        job?.cancel()
        job = viewModelScope.launch {
            if (state.value.collections.isEmpty()) state.update { it.copy(loading = true, error = false) }
            try {
                val collections = repository.listCollections()
                state.value = CollectionsUiState(loading = false, collections = collections)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }
}

data class CollectionDetailUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val notFound: Boolean = false,
    val collection: OutfitCollection? = null,
    val outfits: List<Outfit> = emptyList(),
    val deleted: Boolean = false,
)

class CollectionDetailViewModel(
    private val collectionId: String,
    private val repository: CollectionsRepository,
    private val notices: NoticeCenter,
) : ViewModel() {
    private val state = MutableStateFlow(CollectionDetailUiState())
    val uiState: StateFlow<CollectionDetailUiState> = state.asStateFlow()
    private var job: Job? = null

    init {
        load()
    }

    fun load() {
        job?.cancel()
        job = viewModelScope.launch {
            if (state.value.collection == null) state.update { it.copy(loading = true, error = false, notFound = false) }
            try {
                val collection = repository.getCollection(collectionId)
                val outfits = repository.listOutfits(collectionId)
                state.value = CollectionDetailUiState(loading = false, collection = collection, outfits = outfits)
            } catch (e: CancellationException) {
                throw e
            } catch (e: NotFoundException) {
                state.update { it.copy(loading = false, notFound = true, collection = null, outfits = emptyList()) }
            } catch (e: Exception) {
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }

    fun remove(outfitId: String) {
        val previous = state.value
        state.update {
            it.copy(
                outfits = it.outfits.filterNot { outfit -> outfit.id == outfitId },
                collection = it.collection?.copy(outfitIds = it.collection.outfitIds.filterNot { id -> id == outfitId }),
            )
        }
        viewModelScope.launch {
            try {
                repository.removeOutfit(collectionId, outfitId)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.value = previous
                notices.show(Notice.DeleteFailed)
            }
        }
    }

    fun delete() {
        viewModelScope.launch {
            try {
                repository.deleteCollection(collectionId)
                state.update { it.copy(deleted = true) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                notices.show(Notice.DeleteFailed)
            }
        }
    }
}

enum class CollectionEditorError { NameRequired, NameTooLong, SaveFailed }

data class CollectionEditorUiState(
    val loading: Boolean = false,
    val loadError: Boolean = false,
    val name: String = "",
    val description: String = "",
    val error: CollectionEditorError? = null,
    val saving: Boolean = false,
    val finished: Boolean = false,
)

class CollectionEditorViewModel(
    private val repository: CollectionsRepository,
    private val collectionId: String?,
    private val addOutfitId: String?,
    private val notices: NoticeCenter,
) : ViewModel() {
    private val state = MutableStateFlow(CollectionEditorUiState(loading = collectionId != null))
    val uiState: StateFlow<CollectionEditorUiState> = state.asStateFlow()
    val isEdit: Boolean = collectionId != null

    init {
        if (collectionId != null) load()
    }

    fun load() {
        val id = collectionId ?: return
        viewModelScope.launch {
            state.update { it.copy(loading = true, loadError = false) }
            try {
                val collection = repository.getCollection(id)
                state.update {
                    it.copy(loading = false, name = collection.name, description = collection.description)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(loading = false, loadError = true) }
            }
        }
    }

    fun setName(value: String) {
        state.update { it.copy(name = value, error = null) }
    }

    fun setDescription(value: String) {
        state.update { it.copy(description = value.take(DESCRIPTION_LIMIT)) }
    }

    fun save() {
        val name = state.value.name.trim()
        val description = state.value.description.trim()
        val error = when {
            name.isEmpty() -> CollectionEditorError.NameRequired
            name.length > NAME_LIMIT -> CollectionEditorError.NameTooLong
            else -> null
        }
        if (error != null) {
            state.update { it.copy(error = error) }
            return
        }
        viewModelScope.launch {
            state.update { it.copy(saving = true, error = null) }
            try {
                val input = CollectionInput(name = name, description = description)
                val saved = if (collectionId == null) {
                    repository.createCollection(input)
                } else {
                    repository.updateCollection(collectionId, input)
                }
                if (!addOutfitId.isNullOrBlank()) {
                    repository.addOutfit(saved.id, addOutfitId)
                    notices.show(Notice.Added(saved.name))
                }
                state.update { it.copy(saving = false, finished = true) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(saving = false, error = CollectionEditorError.SaveFailed) }
            }
        }
    }

    private companion object {
        const val NAME_LIMIT = 40
        const val DESCRIPTION_LIMIT = 140
    }
}
