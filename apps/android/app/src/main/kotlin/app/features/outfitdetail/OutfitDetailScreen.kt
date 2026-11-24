package app.features.outfitdetail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.formatPrice
import app.core.designsystem.AppTheme
import app.core.designsystem.ControlContentPadding
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.core.designsystem.RemotePhoto
import app.core.designsystem.itemTypeLabel
import app.core.designsystem.occasionLabel
import app.core.designsystem.seasonLabel
import app.features.catalog.StyleFixture
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.Outfit
import androidx.lifecycle.Lifecycle

@Composable
fun OutfitDetailScreen(
    viewModel: OutfitDetailViewModel,
    onBack: () -> Unit,
    onOpenCategory: (String) -> Unit,
    onNewCollection: (String) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.load() }
    OutfitDetailContent(
        state = state,
        onBack = onBack,
        onRetry = viewModel::load,
        onOpenCategory = onOpenCategory,
        onSave = viewModel::openSheet,
        onDismissSheet = viewModel::closeSheet,
        onToggle = viewModel::toggle,
        onRetryCollections = viewModel::refreshCollections,
        onNewCollection = {
            val id = state.outfit?.id ?: return@OutfitDetailContent
            viewModel.closeSheet()
            onNewCollection(id)
        },
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun OutfitDetailContent(
    state: OutfitDetailUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onOpenCategory: (String) -> Unit,
    onSave: () -> Unit,
    onDismissSheet: () -> Unit,
    onToggle: (app.generated.OutfitCollection) -> Unit,
    onRetryCollections: () -> Unit,
    onNewCollection: () -> Unit,
) {
    AppScaffold(
        title = stringResource(R.string.outfit_detail_title),
        onNavigate = onBack,
        navigationDescription = stringResource(R.string.common_back),
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.notFound -> ErrorState(
                modifier = Modifier.padding(padding),
                body = stringResource(R.string.outfit_detail_not_found),
                onRetry = null,
            )
            state.error || state.outfit == null -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> {
                val outfit = state.outfit
                Column(
                    Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(AppSpacing.lg),
                    verticalArrangement = Arrangement.spacedBy(AppSpacing.lg),
                ) {
                    PhotoPager(outfit)
                    Text(outfit.title, style = AppTypography.headline, color = AppTheme.colors.onBackground)
                    Text(
                        stringResource(R.string.feed_by_creator, outfit.creatorName),
                        style = AppTypography.body,
                        color = AppTheme.colors.onSurfaceVariant,
                    )
                    Text(
                        AppPlurals.commonLikes(outfit.likes.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()),
                        style = AppTypography.caption,
                        color = AppTheme.colors.onSurfaceVariant,
                    )
                    SaveButton(saved = state.saved, onClick = onSave)
                    Text(outfit.description, style = AppTypography.body, color = AppTheme.colors.onBackground)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm), verticalArrangement = Arrangement.spacedBy(AppSpacing.sm)) {
                        outfit.tags.forEach { tag ->
                            Surface(shape = RoundedCornerShape(AppRadius.full), color = AppTheme.colors.surfaceVariant) {
                                Text(
                                    tag,
                                    modifier = Modifier.padding(horizontal = AppSpacing.md, vertical = AppSpacing.xs),
                                    style = AppTypography.caption,
                                    color = AppTheme.colors.onSurfaceVariant,
                                )
                            }
                        }
                    }
                    Text(stringResource(R.string.outfit_detail_details_title), style = AppTypography.title)
                    DetailRow(stringResource(R.string.outfit_detail_category), outfit.categoryName, Modifier.testTag("outfitDetail.category")) {
                        onOpenCategory(outfit.categoryId)
                    }
                    DetailRow(stringResource(R.string.outfit_detail_season), seasonLabel(outfit.season))
                    DetailRow(stringResource(R.string.outfit_detail_occasion), occasionLabel(outfit.occasion))
                    Text(stringResource(R.string.outfit_detail_items_title), style = AppTypography.title)
                    Column(Modifier.testTag("outfitDetail.items"), verticalArrangement = Arrangement.spacedBy(AppSpacing.md)) {
                        outfit.items.forEach { item ->
                            Row(horizontalArrangement = Arrangement.spacedBy(AppSpacing.md), verticalAlignment = Alignment.CenterVertically) {
                                RemotePhoto(
                                    url = item.imageUrl,
                                    contentDescription = item.name,
                                    modifier = Modifier.size(AppSize.thumbnail),
                                    shape = RoundedCornerShape(AppRadius.md),
                                )
                                Column(Modifier.weight(1f)) {
                                    Text(item.name, style = AppTypography.label)
                                    Text(item.brand, style = AppTypography.caption, color = AppTheme.colors.onSurfaceVariant)
                                    Text(itemTypeLabel(item.type), style = AppTypography.caption, color = AppTheme.colors.onSurfaceVariant)
                                }
                                Text(
                                    stringResource(R.string.common_price, formatPrice(item.price)),
                                    style = AppTypography.label,
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(AppSpacing.xl))
                }
            }
        }
        if (state.sheetOpen) {
            SaveToCollectionSheet(
                state = state,
                onDismiss = onDismissSheet,
                onToggle = onToggle,
                onNewCollection = onNewCollection,
                onRetry = onRetryCollections,
            )
        }
    }
}

@Composable
private fun PhotoPager(outfit: Outfit) {
    val photos = listOf(outfit.imageUrl) + outfit.gallery
    val pager = rememberPagerState { photos.size }
    Box(Modifier.fillMaxWidth().testTag("outfitDetail.photos")) {
        HorizontalPager(
            state = pager,
            modifier = Modifier.fillMaxWidth().aspectRatio(3f / 4f),
        ) { page ->
            RemotePhoto(
                url = photos[page],
                contentDescription = outfit.title,
                modifier = Modifier.fillMaxSize(),
                shape = RoundedCornerShape(AppRadius.xl),
            )
        }
        if (photos.size > 1) {
            Text(
                stringResource(R.string.outfit_detail_photo_position, pager.currentPage + 1, photos.size),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(AppSpacing.md)
                    .background(AppTheme.colors.scrim, RoundedCornerShape(AppRadius.full))
                    .padding(horizontal = AppSpacing.md, vertical = AppSpacing.xs)
                    .testTag("outfitDetail.photoPosition"),
                color = AppTheme.colors.onScrim,
                style = AppTypography.caption,
            )
        }
    }
}

@Composable
private fun SaveButton(saved: Boolean, onClick: () -> Unit) {
    if (saved) {
        OutlinedButton(
            onClick = onClick,
            modifier = Modifier.testTag("outfitDetail.save").height(AppSize.touchTarget),
            contentPadding = ControlContentPadding,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = AppTheme.colors.primary),
        ) {
            Icon(AppIcons.saved, contentDescription = null, tint = AppTheme.colors.primary, modifier = Modifier.size(AppIconSize.sm))
            Spacer(Modifier.width(AppSpacing.sm))
            Text(stringResource(R.string.outfit_detail_saved), style = AppTypography.label)
        }
    } else {
        Button(
            onClick = onClick,
            modifier = Modifier.testTag("outfitDetail.save").height(AppSize.touchTarget),
            contentPadding = ControlContentPadding,
        ) {
            Icon(AppIcons.save, contentDescription = null, modifier = Modifier.size(AppIconSize.sm))
            Spacer(Modifier.width(AppSpacing.sm))
            Text(stringResource(R.string.outfit_detail_save), style = AppTypography.label)
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    val row = modifier.fillMaxWidth().heightIn(min = AppSize.touchTarget)
    Row(
        (if (onClick != null) row.clickable(onClick = onClick) else row),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column {
            Text(label, style = AppTypography.caption, color = AppTheme.colors.onSurfaceVariant)
            Text(value, style = AppTypography.body)
        }
        if (onClick != null) {
            Icon(AppIcons.chevronRight, contentDescription = null, tint = AppTheme.colors.onSurfaceVariant)
        }
    }
}

@Preview
@Composable
private fun OutfitDetailPreview() {
    AppTheme(darkTheme = false) {
        OutfitDetailContent(
            state = OutfitDetailUiState(loading = false, outfit = StyleFixture.outfits.first(), collections = listOf(StyleFixture.weekendCollection)),
            onBack = {},
            onRetry = {},
            onOpenCategory = {},
            onSave = {},
            onDismissSheet = {},
            onToggle = {},
            onRetryCollections = {},
            onNewCollection = {},
        )
    }
}
