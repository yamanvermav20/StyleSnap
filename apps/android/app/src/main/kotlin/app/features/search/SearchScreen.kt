package app.features.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.EmptyState
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.OCCASIONS
import app.core.designsystem.OutfitGrid
import app.core.designsystem.SEASONS
import app.core.designsystem.occasionLabel
import app.core.designsystem.seasonLabel
import app.features.catalog.OutfitFilter
import app.features.catalog.StyleFixture
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography

@Composable
fun SearchScreen(viewModel: SearchViewModel, onOpenOutfit: (String) -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SearchContent(
        state = state,
        onQueryChange = viewModel::onQueryChange,
        onCategory = viewModel::setCategory,
        onSeason = viewModel::setSeason,
        onOccasion = viewModel::setOccasion,
        onSort = viewModel::setSort,
        onClearFilters = viewModel::clearFilters,
        onRetry = viewModel::retry,
        onOpenOutfit = onOpenOutfit,
    )
}

@Composable
fun SearchContent(
    state: SearchUiState,
    onQueryChange: (String) -> Unit,
    onCategory: (String?) -> Unit,
    onSeason: (String?) -> Unit,
    onOccasion: (String?) -> Unit,
    onSort: (String) -> Unit,
    onClearFilters: () -> Unit,
    onRetry: () -> Unit,
    onOpenOutfit: (String) -> Unit,
) {
    AppScaffold(title = stringResource(R.string.search_title)) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = AppSpacing.lg)) {
            OutlinedTextField(
                value = state.query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth().padding(top = AppSpacing.md).testTag("search.field"),
                placeholder = { Text(stringResource(R.string.search_placeholder), style = AppTypography.body) },
                leadingIcon = { Icon(AppIcons.search, contentDescription = null, modifier = Modifier.size(AppIconSize.md)) },
                singleLine = true,
                textStyle = AppTypography.body,
                shape = RoundedCornerShape(AppRadius.full),
            )
            LazyRow(
                modifier = Modifier.padding(vertical = AppSpacing.md),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm),
            ) {
                item {
                    ChoiceChip(
                        label = state.categories.find { it.id == state.categoryId }?.name
                            ?: stringResource(R.string.search_category),
                        selected = state.categoryId != null,
                        testTag = "search.filter.category",
                        options = listOf(null to stringResource(R.string.search_any)) +
                            state.categories.map { it.id to it.name },
                        onSelect = onCategory,
                    )
                }
                item {
                    ChoiceChip(
                        label = state.season?.let { seasonLabel(it) } ?: stringResource(R.string.search_season),
                        selected = state.season != null,
                        testTag = "search.filter.season",
                        options = listOf(null to stringResource(R.string.search_any)) + SEASONS.map { it to seasonLabel(it) },
                        onSelect = onSeason,
                    )
                }
                item {
                    ChoiceChip(
                        label = state.occasion?.let { occasionLabel(it) } ?: stringResource(R.string.search_occasion),
                        selected = state.occasion != null,
                        testTag = "search.filter.occasion",
                        options = listOf(null to stringResource(R.string.search_any)) + OCCASIONS.map { it to occasionLabel(it) },
                        onSelect = onOccasion,
                    )
                }
                item {
                    val popular = stringResource(R.string.search_sort_popular)
                    val newest = stringResource(R.string.search_sort_newest)
                    ChoiceChip(
                        label = if (state.sort == OutfitFilter.SORT_NEWEST) newest else stringResource(R.string.search_sort),
                        selected = state.sort != OutfitFilter.SORT_POPULAR,
                        testTag = "search.sort",
                        options = listOf(OutfitFilter.SORT_POPULAR to popular, OutfitFilter.SORT_NEWEST to newest),
                        onSelect = { onSort(it ?: OutfitFilter.SORT_POPULAR) },
                    )
                }
            }
            if (state.filtersActive) {
                TextButton(onClick = onClearFilters, modifier = Modifier.testTag("search.clearFilters")) {
                    Text(stringResource(R.string.search_clear_filters), style = AppTypography.label)
                }
            }
            when {
                state.loading && !state.hasLoaded -> LoadingState()
                state.error -> ErrorState(onRetry = onRetry)
                else -> Box(Modifier.fillMaxSize()) {
                    Column(Modifier.fillMaxSize()) {
                        Row(
                            Modifier.fillMaxWidth().padding(bottom = AppSpacing.sm),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(
                                AppPlurals.searchResultCount(state.results.size),
                                style = AppTypography.caption,
                                color = AppTheme.colors.onSurfaceVariant,
                                modifier = Modifier.testTag("search.resultCount"),
                            )
                            if (state.loading) {
                                androidx.compose.material3.CircularProgressIndicator(
                                    modifier = Modifier.size(AppIconSize.md).testTag("state.loading"),
                                    color = AppTheme.colors.primary,
                                    strokeWidth = AppSpacing.xs,
                                )
                            }
                        }
                        if (state.results.isEmpty()) {
                            EmptyState(
                                title = stringResource(R.string.search_empty_title),
                                body = stringResource(R.string.search_empty_body),
                                icon = AppIcons.search,
                                modifier = Modifier.fillMaxSize(),
                            )
                        } else {
                            OutfitGrid(
                                outfits = state.results,
                                onOpen = { onOpenOutfit(it.id) },
                                modifier = Modifier.fillMaxSize(),
                                testTag = "search.results",
                                contentPadding = PaddingValues(bottom = AppSpacing.xl),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChoiceChip(
    label: String,
    selected: Boolean,
    testTag: String,
    options: List<Pair<String?, String>>,
    onSelect: (String?) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    Box {
        FilterChip(
            selected = selected,
            onClick = { open = true },
            label = { Text(label, style = AppTypography.label) },
            leadingIcon = if (selected) {
                { Icon(AppIcons.check, contentDescription = null, modifier = Modifier.size(AppIconSize.sm)) }
            } else {
                null
            },
            modifier = Modifier.heightIn(min = AppSize.touchTarget).testTag(testTag),
            colors = FilterChipDefaults.filterChipColors(
                containerColor = AppTheme.colors.surfaceVariant,
                labelColor = AppTheme.colors.onSurface,
                iconColor = AppTheme.colors.onSurface,
                selectedContainerColor = AppTheme.colors.primaryContainer,
                selectedLabelColor = AppTheme.colors.onPrimaryContainer,
                selectedLeadingIconColor = AppTheme.colors.onPrimaryContainer,
            ),
            border = null,
        )
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            options.forEach { (id, text) ->
                DropdownMenuItem(
                    text = { Text(text, style = AppTypography.body) },
                    onClick = {
                        open = false
                        onSelect(id)
                    },
                )
            }
        }
    }
}

@Preview
@Composable
private fun SearchPreview() {
    AppTheme(darkTheme = false) {
        SearchContent(
            state = SearchUiState(
                loading = false,
                hasLoaded = true,
                categories = StyleFixture.categories,
                results = StyleFixture.outfits,
            ),
            onQueryChange = {},
            onCategory = {},
            onSeason = {},
            onOccasion = {},
            onSort = {},
            onClearFilters = {},
            onRetry = {},
            onOpenOutfit = {},
        )
    }
}
