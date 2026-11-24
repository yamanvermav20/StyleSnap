package app.features.feed

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.runtime.collectAsState
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.CategoryTile
import app.core.designsystem.EmptyState
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.OutfitGrid
import app.features.catalog.StyleFixture
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppSpacing
import app.generated.AppTypography

@Composable
fun FeedScreen(
    viewModel: FeedViewModel,
    onOpenSettings: () -> Unit,
    onOpenCategory: (String) -> Unit,
    onOpenOutfit: (String) -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    FeedContent(
        state = state,
        onRefresh = viewModel::refresh,
        onRetry = viewModel::load,
        onOpenSettings = onOpenSettings,
        onOpenCategory = onOpenCategory,
        onOpenOutfit = onOpenOutfit,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedContent(
    state: FeedUiState,
    onRefresh: () -> Unit,
    onRetry: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenCategory: (String) -> Unit,
    onOpenOutfit: (String) -> Unit,
) {
    AppScaffold(
        title = stringResource(R.string.feed_title),
        actions = {
            IconButton(onClick = onOpenSettings, modifier = Modifier.testTag("feed.openSettings")) {
                Icon(
                    AppIcons.settings,
                    contentDescription = stringResource(R.string.feed_open_settings),
                    modifier = Modifier.size(AppIconSize.md),
                )
            }
        },
    ) { padding ->
        when {
            state.loading && !state.refreshing -> LoadingState(Modifier.padding(padding))
            state.error -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> Column(Modifier.fillMaxSize().padding(padding)) {
            PullToRefreshBox(
                isRefreshing = state.refreshing,
                onRefresh = onRefresh,
                modifier = Modifier.weight(1f).fillMaxWidth(),
            ) {
                OutfitGrid(
                    outfits = state.outfits,
                    onOpen = { onOpenOutfit(it.id) },
                    modifier = Modifier.fillMaxSize(),
                    testTag = "feed.outfits",
                    contentPadding = PaddingValues(AppSpacing.lg),
                    header = {
                        Column(verticalArrangement = Arrangement.spacedBy(AppSpacing.md)) {
                            Text(
                                stringResource(R.string.feed_categories_title),
                                style = AppTypography.headline,
                                color = AppTheme.colors.onBackground,
                            )
                            LazyRow(
                                modifier = Modifier.testTag("feed.categories"),
                                horizontalArrangement = Arrangement.spacedBy(AppSpacing.md),
                            ) {
                                items(state.categories, key = { it.id }) { category ->
                                    CategoryTile(category, onOpen = { onOpenCategory(category.id) })
                                }
                            }
                            Text(
                                stringResource(R.string.feed_trending_title),
                                style = AppTypography.headline,
                                color = AppTheme.colors.onBackground,
                                modifier = Modifier.padding(top = AppSpacing.lg),
                            )
                            if (state.outfits.isEmpty()) {
                                EmptyState(
                                    title = stringResource(R.string.feed_empty_title),
                                    body = stringResource(R.string.feed_empty_body),
                                    icon = AppIcons.discover,
                                )
                            }
                        }
                    },
                )
            }
            }
        }
    }
}

@Preview
@Composable
private fun FeedPreview() {
    AppTheme(darkTheme = false) {
        FeedContent(
            state = FeedUiState(loading = false, categories = StyleFixture.categories, outfits = StyleFixture.outfits),
            onRefresh = {},
            onRetry = {},
            onOpenSettings = {},
            onOpenCategory = {},
            onOpenOutfit = {},
        )
    }
}
