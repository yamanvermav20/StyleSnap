package app.features.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.features.catalog.CatalogRepository
import app.features.catalog.OutfitFilter
import app.generated.Category
import app.generated.Outfit
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FeedUiState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val error: Boolean = false,
    val categories: List<Category> = emptyList(),
    val outfits: List<Outfit> = emptyList(),
)

class FeedViewModel(private val catalog: CatalogRepository) : ViewModel() {
    private val state = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = state.asStateFlow()
    private var generation = 0

    init {
        viewModelScope.launch(start = CoroutineStart.UNDISPATCHED) { fetch(refreshing = false) }
    }

    fun load() {
        viewModelScope.launch { fetch(refreshing = false) }
    }

    fun refresh() {
        viewModelScope.launch { fetch(refreshing = true) }
    }

    /** Runs in the caller's coroutine so a composition effect can finish the load. */
    suspend fun fetch(refreshing: Boolean) {
        val ticket = ++generation
        if (!refreshing && state.value.categories.isEmpty() && state.value.outfits.isEmpty()) {
            state.update { it.copy(loading = true, refreshing = false, error = false) }
        } else if (refreshing) {
            state.update { it.copy(refreshing = true, error = false) }
        }
        try {
            val categories = catalog.listCategories()
            val outfits = catalog.listOutfits(OutfitFilter(sort = OutfitFilter.SORT_POPULAR))
            if (ticket != generation) return
            state.value = FeedUiState(loading = false, categories = categories, outfits = outfits)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            if (ticket != generation) return
            state.update { it.copy(loading = false, refreshing = false, error = true) }
        }
    }
}
