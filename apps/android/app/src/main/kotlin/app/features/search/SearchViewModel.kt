package app.features.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.features.catalog.CatalogRepository
import app.features.catalog.OutfitFilter
import app.generated.Category
import app.generated.Outfit
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

const val SEARCH_DEBOUNCE_MS = 300L

data class SearchUiState(
    val query: String = "",
    val categoryId: String? = null,
    val season: String? = null,
    val occasion: String? = null,
    val sort: String = OutfitFilter.SORT_POPULAR,
    val categories: List<Category> = emptyList(),
    val results: List<Outfit> = emptyList(),
    val loading: Boolean = true,
    val error: Boolean = false,
    val hasLoaded: Boolean = false,
) {
    val filtersActive: Boolean
        get() = categoryId != null || season != null || occasion != null || sort != OutfitFilter.SORT_POPULAR
}

class SearchViewModel(private val catalog: CatalogRepository) : ViewModel() {
    private val state = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = state.asStateFlow()
    private var generation = 0

    init {
        schedule(debounce = false)
    }

    fun onQueryChange(value: String) {
        state.update { it.copy(query = value) }
        schedule(debounce = true)
    }

    fun setCategory(id: String?) {
        state.update { it.copy(categoryId = id) }
        schedule(debounce = false)
    }

    fun setSeason(id: String?) {
        state.update { it.copy(season = id) }
        schedule(debounce = false)
    }

    fun setOccasion(id: String?) {
        state.update { it.copy(occasion = id) }
        schedule(debounce = false)
    }

    fun setSort(sort: String) {
        state.update { it.copy(sort = sort) }
        schedule(debounce = false)
    }

    fun clearFilters() {
        state.update {
            it.copy(categoryId = null, season = null, occasion = null, sort = OutfitFilter.SORT_POPULAR)
        }
        schedule(debounce = false)
    }

    fun retry() = schedule(debounce = false)

    private fun schedule(debounce: Boolean) {
        val ticket = ++generation
        val snapshot = state.value
        viewModelScope.launch {
            if (debounce) delay(SEARCH_DEBOUNCE_MS)
            if (ticket != generation) return@launch
            state.update { it.copy(loading = true, error = false) }
            try {
                if (state.value.categories.isEmpty()) {
                    val categories = catalog.listCategories()
                    if (ticket != generation) return@launch
                    state.update { it.copy(categories = categories) }
                }
                val results = catalog.listOutfits(
                    OutfitFilter(
                        search = snapshot.query.trim().ifBlank { null },
                        categoryId = snapshot.categoryId,
                        season = snapshot.season,
                        occasion = snapshot.occasion,
                        sort = snapshot.sort,
                    ),
                )
                if (ticket != generation) return@launch
                state.update { it.copy(loading = false, hasLoaded = true, results = results) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                if (ticket != generation) return@launch
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }
}
