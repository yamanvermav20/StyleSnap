package app.core.designsystem

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.union
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppTypography

/**
 * A screen scaffold. The shell already pads for the tab bar, so a screen above it
 * does not add the system navigation-bar inset again. Editors (no tab bar) do.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffold(
    title: String,
    onNavigate: (() -> Unit)? = null,
    navigationIcon: ImageVector = AppIcons.back,
    navigationDescription: String? = null,
    navigationTestTag: String? = null,
    aboveTabBar: Boolean = true,
    actions: @Composable RowScope.() -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        contentWindowInsets = if (aboveTabBar) {
            WindowInsets(0, 0, 0, 0)
        } else {
            WindowInsets.navigationBars.union(WindowInsets.ime)
        },
        topBar = {
            TopAppBar(
                title = { Text(title, style = AppTypography.title) },
                navigationIcon = {
                    if (onNavigate != null && navigationDescription != null) {
                        IconButton(
                            onClick = onNavigate,
                            modifier = if (navigationTestTag != null) Modifier.testTag(navigationTestTag) else Modifier,
                        ) {
                            Icon(
                                navigationIcon,
                                contentDescription = navigationDescription,
                                modifier = Modifier.size(AppIconSize.md),
                            )
                        }
                    }
                },
                actions = actions,
            )
        },
        floatingActionButton = floatingActionButton,
        content = content,
    )
}
