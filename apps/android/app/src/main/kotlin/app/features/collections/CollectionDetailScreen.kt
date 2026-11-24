package app.features.collections

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import app.core.designsystem.LoadingState
import app.core.designsystem.OutfitGrid
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.Outfit

@Composable
fun CollectionDetailScreen(
    viewModel: CollectionDetailViewModel,
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onOpenOutfit: (String) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.load() }
    LaunchedEffect(state.deleted) { if (state.deleted) onBack() }
    CollectionDetailContent(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onEdit = { state.collection?.let { onEdit(it.id) } },
        onDelete = viewModel::delete,
        onOpenOutfit = onOpenOutfit,
        onRemove = viewModel::remove,
    )
}

@Composable
fun CollectionDetailContent(
    state: CollectionDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onOpenOutfit: (String) -> Unit,
    onRemove: (String) -> Unit,
) {
    var confirm by remember { mutableStateOf(false) }
    var menuOutfit by remember { mutableStateOf<String?>(null) }
    val title = state.collection?.name ?: stringResource(R.string.collections_title)
    AppScaffold(
        title = title,
        onNavigate = onBack,
        navigationDescription = stringResource(R.string.common_back),
        actions = {
            if (state.collection != null) {
                IconButton(onClick = onEdit, modifier = Modifier.testTag("collectionDetail.edit")) {
                    Icon(AppIcons.edit, contentDescription = stringResource(R.string.common_edit), modifier = Modifier.size(AppIconSize.md))
                }
                IconButton(onClick = { confirm = true }, modifier = Modifier.testTag("collectionDetail.delete")) {
                    Icon(AppIcons.trash, contentDescription = stringResource(R.string.common_delete), modifier = Modifier.size(AppIconSize.md))
                }
            }
        },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.notFound -> ErrorState(
                modifier = Modifier.padding(padding),
                body = stringResource(R.string.collection_detail_not_found),
                onRetry = null,
            )
            state.error || state.collection == null -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> {
                val collection = state.collection
                OutfitGrid(
                    outfits = state.outfits,
                    onOpen = { onOpenOutfit(it.id) },
                    onLongClick = { menuOutfit = it.id },
                    modifier = Modifier.fillMaxSize().padding(padding),
                    testTag = "collectionDetail.outfits",
                    contentPadding = PaddingValues(AppSpacing.lg),
                    header = {
                        Column(Modifier.padding(bottom = AppSpacing.lg)) {
                            if (collection.description.isNotEmpty()) {
                                Text(collection.description, style = AppTypography.body, color = AppTheme.colors.onSurfaceVariant)
                            }
                            Text(
                                AppPlurals.commonOutfitCount(state.outfits.size),
                                style = AppTypography.caption,
                                color = AppTheme.colors.onSurfaceVariant,
                                modifier = Modifier.padding(top = AppSpacing.sm),
                            )
                            if (state.outfits.isEmpty()) {
                                EmptyState(
                                    title = stringResource(R.string.collection_detail_empty_title),
                                    body = stringResource(R.string.collection_detail_empty_body),
                                    icon = AppIcons.collections,
                                )
                            }
                        }
                    },
                    overlay = { outfit ->
                        RemoveMenu(outfit, expanded = menuOutfit == outfit.id, onDismiss = { menuOutfit = null }) {
                            menuOutfit = null
                            onRemove(outfit.id)
                        }
                    },
                )
            }
        }
    }
    if (confirm) {
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text(stringResource(R.string.collection_detail_delete_title)) },
            text = { Text(stringResource(R.string.collection_detail_delete_body)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirm = false
                        onDelete()
                    },
                    modifier = Modifier.testTag("collectionDetail.confirmDelete"),
                ) {
                    Text(stringResource(R.string.common_delete), color = AppTheme.colors.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { confirm = false }) { Text(stringResource(R.string.common_cancel)) }
            },
        )
    }
}

@Composable
private fun RemoveMenu(outfit: Outfit, expanded: Boolean, onDismiss: () -> Unit, onRemove: () -> Unit) {
    Box {
        DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
            DropdownMenuItem(
                text = { Text(stringResource(R.string.collection_detail_remove_outfit)) },
                onClick = onRemove,
                modifier = Modifier.testTag("collectionDetail.remove.${outfit.id}"),
            )
        }
    }
}
