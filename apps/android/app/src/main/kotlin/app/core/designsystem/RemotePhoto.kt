package app.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.layout.ContentScale
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppRadius
import coil3.compose.SubcomposeAsyncImage

/** Tests set this to false so Coil never runs; photos stay on the placeholder. */
val LocalLoadRemotePhotos = staticCompositionLocalOf { true }

/**
 * A photo from a URL (DESIGN.md: Remote photo). `surfaceVariant` while loading,
 * and the `noImage` icon when there is no URL or the load fails.
 */
@Composable
fun RemotePhoto(
    url: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(AppRadius.lg),
) {
    val load = LocalLoadRemotePhotos.current
    Box(
        modifier.clip(shape).background(AppTheme.colors.surfaceVariant),
        contentAlignment = Alignment.Center,
    ) {
        if (load && !url.isNullOrBlank()) {
            SubcomposeAsyncImage(
                model = url,
                contentDescription = contentDescription,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                loading = { Box(Modifier.fillMaxSize()) },
                error = { NoImage() },
            )
        } else if (url.isNullOrBlank()) {
            NoImage()
        }
    }
}

@Composable
private fun NoImage() {
    Icon(
        AppIcons.noImage,
        contentDescription = null,
        tint = AppTheme.colors.onSurfaceVariant,
        modifier = Modifier.size(AppIconSize.lg),
    )
}
