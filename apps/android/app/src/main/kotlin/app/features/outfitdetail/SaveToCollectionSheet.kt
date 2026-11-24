package app.features.outfitdetail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import app.R
import app.core.designsystem.AppTheme
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.RemotePhoto
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.OutfitCollection

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SaveToCollectionSheet(
    state: OutfitDetailUiState,
    onDismiss: () -> Unit,
    onToggle: (OutfitCollection) -> Unit,
    onNewCollection: () -> Unit,
    onRetry: () -> Unit,
) {
    val outfitId = state.outfit?.id
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = AppTheme.colors.background,
        shape = RoundedCornerShape(topStart = AppRadius.xl, topEnd = AppRadius.xl),
    ) {
        Column(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = AppSpacing.lg)
                .padding(bottom = AppSpacing.xl)
                .testTag("saveToCollection.sheet"),
            verticalArrangement = Arrangement.spacedBy(AppSpacing.md),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.save_to_collection_title), style = AppTypography.title)
                TextButton(onClick = onDismiss, modifier = Modifier.testTag("saveToCollection.done")) {
                    Text(stringResource(R.string.common_done), style = AppTypography.label)
                }
            }
            when {
                state.collectionsLoading && state.collections.isEmpty() -> LoadingState(Modifier.heightIn(min = AppSize.heroImage / 2))
                state.collectionsError && state.collections.isEmpty() -> ErrorState(
                    modifier = Modifier.heightIn(min = AppSize.heroImage / 2),
                    onRetry = onRetry,
                )
                else -> {
                    if (state.collections.isEmpty()) {
                        Text(
                            stringResource(R.string.save_to_collection_empty_body),
                            style = AppTypography.body,
                            color = AppTheme.colors.onSurfaceVariant,
                        )
                    }
                    Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(AppSpacing.sm)) {
                        state.collections.forEach { collection ->
                            val contains = outfitId != null && outfitId in collection.outfitIds
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = AppSize.touchTarget)
                                    .testTag("saveToCollection.row.${collection.id}")
                                    .semantics { selected = contains }
                                    .clickable { onToggle(collection) }
                                    .padding(vertical = AppSpacing.sm),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(AppSpacing.md),
                            ) {
                                val cover = collection.coverImageUrls.firstOrNull()
                                if (cover == null) {
                                    Box(
                                        Modifier
                                            .size(AppSize.thumbnail)
                                            .clip(RoundedCornerShape(AppRadius.md))
                                            .background(AppTheme.colors.surfaceVariant),
                                    )
                                } else {
                                    RemotePhoto(
                                        url = cover,
                                        contentDescription = null,
                                        modifier = Modifier.size(AppSize.thumbnail),
                                        shape = RoundedCornerShape(AppRadius.md),
                                    )
                                }
                                Column(Modifier.weight(1f)) {
                                    Text(collection.name, style = AppTypography.label)
                                    Text(
                                        AppPlurals.commonOutfitCount(collection.outfitIds.size),
                                        style = AppTypography.caption,
                                        color = AppTheme.colors.onSurfaceVariant,
                                    )
                                }
                                if (contains) {
                                    Icon(AppIcons.check, contentDescription = null, tint = AppTheme.colors.primary)
                                }
                            }
                        }
                    }
                    TextButton(onClick = onNewCollection, modifier = Modifier.testTag("saveToCollection.new")) {
                        Icon(AppIcons.add, contentDescription = null, modifier = Modifier.size(AppIconSize.sm))
                        Text(stringResource(R.string.save_to_collection_new_collection), style = AppTypography.label)
                    }
                }
            }
        }
    }
}
