package app.features.category

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.EmptyState
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.OutfitGrid
import app.features.catalog.StyleFixture
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppSpacing
import app.generated.AppTypography

@Composable
fun CategoryScreen(viewModel: CategoryViewModel, onBack: () -> Unit, onOpenOutfit: (String) -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CategoryContent(state = state, onBack = onBack, onRetry = viewModel::load, onOpenOutfit = onOpenOutfit)
}

@Composable
fun CategoryContent(
    state: CategoryUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onOpenOutfit: (String) -> Unit,
) {
    val title = state.category?.name ?: stringResource(R.string.feed_categories_title)
    AppScaffold(
        title = title,
        onNavigate = onBack,
        navigationDescription = stringResource(R.string.common_back),
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.error || state.category == null -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> {
                val category = state.category
                OutfitGrid(
                    outfits = state.outfits,
                    onOpen = { onOpenOutfit(it.id) },
                    modifier = Modifier.fillMaxSize().padding(padding),
                    testTag = "category.outfits",
                    contentPadding = PaddingValues(AppSpacing.lg),
                    header = {
                        Column {
                            Text(category.description, style = AppTypography.body, color = AppTheme.colors.onSurfaceVariant)
                            Text(
                                AppPlurals.commonOutfitCount(state.outfits.size),
                                style = AppTypography.caption,
                                color = AppTheme.colors.onSurfaceVariant,
                                modifier = Modifier.padding(top = AppSpacing.sm, bottom = AppSpacing.lg),
                            )
                            if (state.outfits.isEmpty()) {
                                EmptyState(
                                    title = stringResource(R.string.category_empty_title),
                                    body = stringResource(R.string.category_empty_body),
                                    icon = AppIcons.categories,
                                )
                            }
                        }
                    },
                )
            }
        }
    }
}

@Preview
@Composable
private fun CategoryPreview() {
    AppTheme(darkTheme = false) {
        CategoryContent(
            state = CategoryUiState(loading = false, category = StyleFixture.categories.first(), outfits = StyleFixture.outfits.take(1)),
            onBack = {},
            onRetry = {},
            onOpenOutfit = {},
        )
    }
}
