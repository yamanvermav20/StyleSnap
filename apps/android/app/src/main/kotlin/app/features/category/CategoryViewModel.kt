package app.features.category

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.features.catalog.CatalogRepository
import app.features.catalog.OutfitFilter
import app.generated.Category
import app.generated.Outfit
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class CategoryUiState(
    val loading: Boolean = true,
    val error: Boolean = false,
    val category: Category? = null,
    val outfits: List<Outfit> = emptyList(),
)

class CategoryViewModel(private val catalog: CatalogRepository, private val categoryId: String) : ViewModel() {
    private val state = MutableStateFlow(CategoryUiState())
    val uiState: StateFlow<CategoryUiState> = state.asStateFlow()
    private var job: Job? = null

    init {
        load()
    }

    fun load() {
        job?.cancel()
        job = viewModelScope.launch {
            state.update { it.copy(loading = true, error = false) }
            try {
                val category = catalog.listCategories().find { it.id == categoryId }
                if (category == null) {
                    state.update { it.copy(loading = false, error = true, category = null, outfits = emptyList()) }
                    return@launch
                }
                val outfits = catalog.listOutfits(
                    OutfitFilter(categoryId = categoryId, sort = OutfitFilter.SORT_POPULAR),
                )
                state.value = CategoryUiState(loading = false, category = category, outfits = outfits)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                state.update { it.copy(loading = false, error = true) }
            }
        }
    }
}
