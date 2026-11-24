package app.features.wardrobe

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.core.NotFoundException
import app.generated.WardrobeItem
import app.generated.WardrobeItemInput
import app.generated.WardrobePhoto
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class WardrobeUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val type: String? = null,
    val items: List<WardrobeItem> = emptyList(),
    val hasAny: Boolean = false,
)

class WardrobeViewModel(private val repository: WardrobeRepository) : ViewModel() {
    private val state = MutableStateFlow(WardrobeUiState())
    val uiState: StateFlow<WardrobeUiState> = state.asStateFlow()
    private var job: Job? = null

    init {
        load()
    }

    fun selectType(type: String?) {
        state.update { it.copy(type = type) }
        load()
    }

    fun load() {
        job?.cancel()
        val type = state.value.type
        job = viewModelScope.launch {
            if (state.value.items.isEmpty()) state.update { it.copy(loading = true, error = false) }
            try {
                val items = repository.list(type)
                val hasAny = if (type == null) items.isNotEmpty() else items.isNotEmpty() || repository.list(null).isNotEmpty()
                state.update { it.copy(loading = false, items = items, hasAny = hasAny, type = type) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }
}

enum class WardrobeEditorError { NameRequired, PhotoRequired, SaveFailed, DeleteFailed }

data class WardrobeEditorUiState(
    val loading: Boolean = true,
    val loadError: Boolean = false,
    val notFound: Boolean = false,
    val name: String = "",
    val brand: String = "",
    val type: String = "top",
    val color: String = "",
    val season: String = "allSeason",
    val notes: String = "",
    val favorite: Boolean = false,
    val imageUrl: String = "",
    val library: List<WardrobePhoto> = emptyList(),
    val error: WardrobeEditorError? = null,
    val saving: Boolean = false,
    val finished: Boolean = false,
    val isEdit: Boolean = false,
) {
    val photos: List<WardrobePhoto>
        get() {
            val ofType = library.filter { it.type == type }
            val extra = if (imageUrl.isNotBlank() && ofType.none { it.imageUrl == imageUrl }) {
                listOf(WardrobePhoto(id = "current", imageUrl = imageUrl, type = type))
            } else {
                emptyList()
            }
            return extra + ofType
        }
}

class WardrobeEditorViewModel(
    private val repository: WardrobeRepository,
    private val itemId: String?,
) : ViewModel() {
    private val state = MutableStateFlow(WardrobeEditorUiState(loading = true, isEdit = itemId != null))
    val uiState: StateFlow<WardrobeEditorUiState> = state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            state.update { it.copy(loading = true, loadError = false, notFound = false) }
            try {
                val photos = repository.listPhotos()
                val item = if (itemId == null) null else repository.get(itemId)
                state.update {
                    if (item == null) {
                        it.copy(loading = false, library = photos, isEdit = false)
                    } else {
                        it.copy(
                            loading = false,
                            isEdit = true,
                            library = photos,
                            name = item.name,
                            brand = item.brand,
                            type = item.type,
                            color = item.color,
                            season = item.season,
                            notes = item.notes,
                            favorite = item.favorite,
                            imageUrl = item.imageUrl,
                        )
                    }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: NotFoundException) {
                state.update { it.copy(loading = false, notFound = true) }
            } catch (e: Exception) {
                state.update { it.copy(loading = false, loadError = true) }
            }
        }
    }

    fun setName(value: String) = state.update { it.copy(name = value.take(NAME_LIMIT), error = clear(it.error, WardrobeEditorError.NameRequired)) }
    fun setBrand(value: String) = state.update { it.copy(brand = value.take(BRAND_LIMIT)) }
    fun setColor(value: String) = state.update { it.copy(color = value.take(COLOR_LIMIT)) }
    fun setNotes(value: String) = state.update { it.copy(notes = value.take(NOTES_LIMIT)) }
    fun setType(value: String) = state.update { it.copy(type = value) }
    fun setSeason(value: String) = state.update { it.copy(season = value) }
    fun setFavorite(value: Boolean) = state.update { it.copy(favorite = value) }

    fun selectPhoto(url: String) {
        state.update { it.copy(imageUrl = url, error = clear(it.error, WardrobeEditorError.PhotoRequired)) }
    }

    fun save() {
        val current = state.value
        val name = current.name.trim()
        val error = when {
            name.isEmpty() -> WardrobeEditorError.NameRequired
            current.imageUrl.isBlank() -> WardrobeEditorError.PhotoRequired
            else -> null
        }
        if (error != null) {
            state.update { it.copy(error = error) }
            return
        }
        val input = WardrobeItemInput(
            name = name,
            brand = current.brand.trim(),
            type = current.type,
            color = current.color.trim(),
            season = current.season,
            imageUrl = current.imageUrl,
            notes = current.notes.trim(),
            favorite = current.favorite,
        )
        viewModelScope.launch {
            state.update { it.copy(saving = true, error = null) }
            try {
                if (itemId == null) repository.create(input) else repository.update(itemId, input)
                state.update { it.copy(saving = false, finished = true) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(saving = false, error = WardrobeEditorError.SaveFailed) }
            }
        }
    }

    fun delete() {
        val id = itemId ?: return
        viewModelScope.launch {
            state.update { it.copy(saving = true, error = null) }
            try {
                repository.delete(id)
                state.update { it.copy(saving = false, finished = true) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(saving = false, error = WardrobeEditorError.DeleteFailed) }
            }
        }
    }

    private fun clear(current: WardrobeEditorError?, match: WardrobeEditorError): WardrobeEditorError? =
        if (current == match) null else current

    private companion object {
        const val NAME_LIMIT = 60
        const val BRAND_LIMIT = 40
        const val COLOR_LIMIT = 30
        const val NOTES_LIMIT = 280
    }
}
