package app.features.wardrobe

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.EmptyState
import app.core.designsystem.ErrorState
import app.core.designsystem.ITEM_TYPES
import app.core.designsystem.LoadingState
import app.core.designsystem.RemotePhoto
import app.core.designsystem.itemTypeLabel
import app.features.collections.AddButton
import app.features.catalog.StyleFixture
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.WardrobeItem

@Composable
fun WardrobeScreen(viewModel: WardrobeViewModel, onAdd: () -> Unit, onOpen: (String) -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.load() }
    WardrobeContent(state = state, onRetry = viewModel::load, onSelectType = viewModel::selectType, onAdd = onAdd, onOpen = onOpen)
}

@Composable
fun WardrobeContent(
    state: WardrobeUiState,
    onRetry: () -> Unit,
    onSelectType: (String?) -> Unit,
    onAdd: () -> Unit,
    onOpen: (String) -> Unit,
) {
    val addLabel = stringResource(R.string.wardrobe_add)
    AppScaffold(
        title = stringResource(R.string.wardrobe_title),
        floatingActionButton = { AddButton(tag = "wardrobe.add", description = addLabel, onClick = onAdd) },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.error -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> Column(Modifier.fillMaxSize().padding(padding)) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = AppSpacing.lg, vertical = AppSpacing.md),
                    horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm),
                ) {
                    item {
                        TypeChip(
                            label = stringResource(R.string.wardrobe_all),
                            selected = state.type == null,
                            tag = "wardrobe.filter.all",
                            onClick = { onSelectType(null) },
                        )
                    }
                    items(ITEM_TYPES) { type ->
                        TypeChip(
                            label = itemTypeLabel(type),
                            selected = state.type == type,
                            tag = "wardrobe.filter.$type",
                            onClick = { onSelectType(type) },
                        )
                    }
                }
                Text(
                    AppPlurals.commonItemCount(state.items.size),
                    style = AppTypography.caption,
                    color = AppTheme.colors.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = AppSpacing.lg),
                )
                when {
                    !state.hasAny -> EmptyState(
                        title = stringResource(R.string.wardrobe_empty_title),
                        body = stringResource(R.string.wardrobe_empty_body),
                        icon = AppIcons.wardrobe,
                        modifier = Modifier.weight(1f).fillMaxWidth(),
                        actionLabel = addLabel,
                        onAction = onAdd,
                    )
                    state.items.isEmpty() -> EmptyState(
                        title = stringResource(R.string.wardrobe_empty_filtered_title),
                        body = stringResource(R.string.wardrobe_empty_filtered_body),
                        icon = AppIcons.wardrobe,
                        modifier = Modifier.weight(1f).fillMaxWidth(),
                    )
                    else -> LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = AppSize.cardImage * 2 / 3),
                        modifier = Modifier.fillMaxSize().testTag("wardrobe.items"),
                        contentPadding = PaddingValues(AppSpacing.lg),
                        horizontalArrangement = Arrangement.spacedBy(AppSpacing.md),
                        verticalArrangement = Arrangement.spacedBy(AppSpacing.lg),
                    ) {
                        items(state.items, key = { it.id }) { item ->
                            WardrobeCard(item, onClick = { onOpen(item.id) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TypeChip(label: String, selected: Boolean, tag: String, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label, style = AppTypography.label) },
        leadingIcon = if (selected) {
            { Icon(AppIcons.check, contentDescription = null, modifier = Modifier.size(AppIconSize.sm)) }
        } else {
            null
        },
        modifier = Modifier.heightIn(min = AppSize.touchTarget).testTag(tag),
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
}

@Composable
private fun WardrobeCard(item: WardrobeItem, onClick: () -> Unit) {
    Column(
        Modifier.testTag("wardrobeCard.${item.id}").clickable(onClick = onClick),
        verticalArrangement = Arrangement.spacedBy(AppSpacing.sm),
    ) {
        Box {
            RemotePhoto(
                url = item.imageUrl,
                contentDescription = item.name,
                modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                shape = RoundedCornerShape(AppRadius.lg),
            )
            if (item.favorite) {
                Icon(
                    AppIcons.favorite,
                    contentDescription = stringResource(R.string.wardrobe_favorite),
                    tint = AppTheme.colors.favorite,
                    modifier = Modifier.align(Alignment.TopEnd).padding(AppSpacing.sm).size(AppIconSize.md),
                )
            }
        }
        Text(item.name, style = AppTypography.label)
        if (item.brand.isNotEmpty()) {
            Text(item.brand, style = AppTypography.caption, color = AppTheme.colors.onSurfaceVariant)
        }
    }
}
