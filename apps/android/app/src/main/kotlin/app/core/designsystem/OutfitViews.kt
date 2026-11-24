package app.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import app.R
import app.generated.AppPlurals
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.Category
import app.generated.Outfit

private val GridMin = AppSize.cardImage * 2 / 3

/** Two columns on a phone, more as the window grows (DESIGN.md: Outfit grid). */
@Composable
fun OutfitGrid(
    outfits: List<Outfit>,
    onOpen: (Outfit) -> Unit,
    modifier: Modifier = Modifier,
    testTag: String,
    contentPadding: PaddingValues = PaddingValues(AppSpacing.lg),
    header: (@Composable () -> Unit)? = null,
    onLongClick: ((Outfit) -> Unit)? = null,
    overlay: @Composable (Outfit) -> Unit = {},
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = GridMin),
        modifier = modifier.testTag(testTag),
        contentPadding = contentPadding,
        horizontalArrangement = Arrangement.spacedBy(AppSpacing.md),
        verticalArrangement = Arrangement.spacedBy(AppSpacing.lg),
    ) {
        if (header != null) {
            item(span = { GridItemSpan(maxLineSpan) }) { header() }
        }
        items(outfits.size, key = { outfits[it].id }) { index ->
            val outfit = outfits[index]
            Box {
                OutfitCard(outfit, onOpen = { onOpen(outfit) }, onLongClick = onLongClick?.let { { it(outfit) } })
                overlay(outfit)
            }
        }
    }
}

/** Photo 3:4, then title, creator and likes (DESIGN.md: Outfit card). */
@Composable
fun OutfitCard(
    outfit: Outfit,
    onOpen: () -> Unit,
    modifier: Modifier = Modifier,
    onLongClick: (() -> Unit)? = null,
) {
    val open = if (onLongClick != null) {
        Modifier.combinedClickable(onClick = onOpen, onLongClick = onLongClick)
    } else {
        Modifier.clickable(onClick = onOpen)
    }
    Column(
        modifier
            .testTag("outfitCard.${outfit.id}")
            .then(open),
        verticalArrangement = Arrangement.spacedBy(AppSpacing.sm),
    ) {
        RemotePhoto(
            url = outfit.imageUrl,
            contentDescription = outfit.title,
            modifier = Modifier.fillMaxWidth().aspectRatio(3f / 4f),
        )
        Text(outfit.title, style = AppTypography.label, color = AppTheme.colors.onSurface)
        Text(
            stringResource(R.string.feed_by_creator, outfit.creatorName),
            style = AppTypography.caption,
            color = AppTheme.colors.onSurfaceVariant,
        )
        Text(
            AppPlurals.commonLikes(outfit.likes.coerceAtMost(Int.MAX_VALUE.toLong()).toInt()),
            style = AppTypography.caption,
            color = AppTheme.colors.onSurfaceVariant,
        )
    }
}

/** A style tile: photo 4:5, name on a scrim (DESIGN.md: Category tile). */
@Composable
fun CategoryTile(category: Category, onOpen: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier
            .testTag("categoryTile.${category.id}")
            .width(AppSize.categoryTile)
            .aspectRatio(4f / 5f)
            .clip(RoundedCornerShape(AppRadius.lg))
            .clickable(onClick = onOpen),
    ) {
        RemotePhoto(
            url = category.imageUrl,
            contentDescription = category.name,
            modifier = Modifier.fillMaxSize(),
            shape = RectangleShape,
        )
        val scrim = AppTheme.colors.scrim
        Box(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Color.Transparent, scrim)))
                .padding(AppSpacing.sm),
        ) {
            Text(category.name, style = AppTypography.label, color = AppTheme.colors.onScrim)
        }
    }
}
