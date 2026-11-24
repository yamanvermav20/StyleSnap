package app.features.collections

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.EmptyState
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.RemotePhoto
import app.core.designsystem.shadow
import app.features.catalog.StyleFixture
import app.generated.AppElevation
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.OutfitCollection

@Composable
fun CollectionsScreen(viewModel: CollectionsViewModel, onOpen: (String) -> Unit, onCreate: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.load() }
    CollectionsContent(state = state, onRetry = viewModel::load, onOpen = onOpen, onCreate = onCreate)
}

@Composable
fun CollectionsContent(
    state: CollectionsUiState,
    onRetry: () -> Unit,
    onOpen: (String) -> Unit,
    onCreate: () -> Unit,
) {
    val addLabel = stringResource(R.string.collections_add)
    AppScaffold(
        title = stringResource(R.string.collections_title),
        floatingActionButton = { AddButton(tag = "collections.add", description = addLabel, onClick = onCreate) },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.error -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            state.collections.isEmpty() -> Box(Modifier.fillMaxSize().padding(padding)) {
                EmptyState(
                    title = stringResource(R.string.collections_empty_title),
                    body = stringResource(R.string.collections_empty_body),
                    icon = AppIcons.collections,
                    modifier = Modifier.fillMaxSize(),
                    actionLabel = stringResource(R.string.collections_empty_action),
                    onAction = onCreate,
                )
            }
            else -> LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = AppSize.cardImage * 2 / 3),
                modifier = Modifier.fillMaxSize().padding(padding).testTag("collections.list"),
                contentPadding = PaddingValues(AppSpacing.lg),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.md),
                verticalArrangement = Arrangement.spacedBy(AppSpacing.lg),
            ) {
                items(state.collections, key = { it.id }) { collection ->
                    CollectionCard(collection, onClick = { onOpen(collection.id) })
                }
            }
        }
    }
}

@Composable
fun CollectionCard(collection: OutfitCollection, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier.testTag("collectionCard.${collection.id}").clickable(onClick = onClick),
        verticalArrangement = Arrangement.spacedBy(AppSpacing.sm),
    ) {
        CoverCollage(collection.coverImageUrls)
        Text(collection.name, style = AppTypography.label, color = AppTheme.colors.onSurface)
        Text(
            AppPlurals.commonOutfitCount(collection.outfitIds.size),
            style = AppTypography.caption,
            color = AppTheme.colors.onSurfaceVariant,
        )
    }
}

@Composable
private fun CoverCollage(covers: List<String>) {
    Box(
        Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(AppRadius.lg))
            .background(AppTheme.colors.surfaceVariant),
        contentAlignment = Alignment.Center,
    ) {
        if (covers.isEmpty()) {
            Icon(AppIcons.collections, contentDescription = null, tint = AppTheme.colors.onSurfaceVariant)
        } else {
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(AppSpacing.xs)) {
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)) {
                    CoverCell(covers.getOrNull(0), Modifier.weight(1f))
                    CoverCell(covers.getOrNull(1), Modifier.weight(1f))
                }
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)) {
                    CoverCell(covers.getOrNull(2), Modifier.weight(1f))
                    CoverCell(covers.getOrNull(3), Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun CoverCell(url: String?, modifier: Modifier) {
    if (url == null) {
        Box(modifier.fillMaxSize().background(AppTheme.colors.surfaceVariant))
    } else {
        RemotePhoto(url = url, contentDescription = null, modifier = modifier.fillMaxSize(), shape = RoundedCornerShape(0.dp))
    }
}

@Composable
fun AddButton(tag: String, description: String, onClick: () -> Unit) {
    FloatingActionButton(
        onClick = onClick,
        modifier = Modifier.shadow(AppElevation.high, CircleShape).testTag(tag),
        elevation = FloatingActionButtonDefaults.elevation(0.dp, 0.dp, 0.dp, 0.dp),
        containerColor = AppTheme.colors.primary,
        contentColor = AppTheme.colors.onPrimary,
    ) {
        Icon(AppIcons.add, contentDescription = description)
    }
}

@Preview
@Composable
private fun CollectionsPreview() {
    AppTheme(darkTheme = false) {
        CollectionsContent(
            state = CollectionsUiState(loading = false, collections = listOf(StyleFixture.weekendCollection)),
            onRetry = {},
            onOpen = {},
            onCreate = {},
        )
    }
}
