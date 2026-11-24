package app.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import app.R
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography

/** A centered loading indicator (`state.loading`). */
@Composable
fun LoadingState(modifier: Modifier = Modifier) {
    val label = stringResource(R.string.common_loading)
    Column(
        modifier.fillMaxSize().semantics { contentDescription = label },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        CircularProgressIndicator(
            modifier = Modifier.testTag("state.loading").size(AppIconSize.lg),
            color = AppTheme.colors.primary,
        )
    }
}

/**
 * The shared error state: offline icon, title, body and an optional Try again button.
 * A not-found message replaces [body] and passes a null [onRetry].
 */
@Composable
fun ErrorState(
    modifier: Modifier = Modifier,
    body: String = stringResource(R.string.common_error_body),
    onRetry: (() -> Unit)? = null,
) {
    Column(
        modifier.fillMaxSize().padding(AppSpacing.xl).testTag("state.error"),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.md, Alignment.CenterVertically),
    ) {
        Icon(
            AppIcons.offline,
            contentDescription = null,
            tint = AppTheme.colors.onSurfaceVariant,
            modifier = Modifier.size(AppIconSize.lg),
        )
        Text(stringResource(R.string.common_error_title), style = AppTypography.title, color = AppTheme.colors.onBackground)
        Text(body, style = AppTypography.body, color = AppTheme.colors.onSurfaceVariant)
        if (onRetry != null) {
            Button(
                onClick = onRetry,
                modifier = Modifier.testTag("state.retry").height(AppSize.touchTarget),
                contentPadding = ControlContentPadding,
            ) {
                Icon(AppIcons.retry, contentDescription = null, modifier = Modifier.size(AppIconSize.sm))
                Spacer(Modifier.width(AppSpacing.sm))
                Text(stringResource(R.string.common_retry), style = AppTypography.label)
            }
        }
    }
}

/** The shared empty state, with an optional action (`state.emptyAction`). */
@Composable
fun EmptyState(
    title: String,
    body: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier.padding(AppSpacing.xl).testTag("state.empty"),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.md, Alignment.CenterVertically),
    ) {
        Icon(icon, contentDescription = null, tint = AppTheme.colors.onSurfaceVariant, modifier = Modifier.size(AppIconSize.lg))
        Text(title, style = AppTypography.title, color = AppTheme.colors.onBackground)
        Text(body, style = AppTypography.body, color = AppTheme.colors.onSurfaceVariant)
        if (actionLabel != null && onAction != null) {
            Button(
                onClick = onAction,
                modifier = Modifier.testTag("state.emptyAction").height(AppSize.touchTarget),
                contentPadding = ControlContentPadding,
            ) {
                Text(actionLabel, style = AppTypography.label)
            }
        }
    }
}
