package app.features.wardrobe

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.ErrorState
import app.core.designsystem.ITEM_TYPES
import app.core.designsystem.LoadingState
import app.core.designsystem.RemotePhoto
import app.core.designsystem.SEASONS
import app.core.designsystem.itemTypeLabel
import app.core.designsystem.scaledToHeight
import app.core.designsystem.seasonLabel
import app.generated.AppIconSize
import app.generated.AppIcons
import app.generated.AppRadius
import app.generated.AppSize
import app.generated.AppSpacing
import app.generated.AppTypography
import app.generated.WardrobePhoto

@Composable
fun WardrobeEditorScreen(viewModel: WardrobeEditorViewModel, onClose: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.finished) { if (state.finished) onClose() }
    WardrobeEditorContent(
        state = state,
        onClose = onClose,
        onRetry = viewModel::load,
        onName = viewModel::setName,
        onBrand = viewModel::setBrand,
        onType = viewModel::setType,
        onColor = viewModel::setColor,
        onSeason = viewModel::setSeason,
        onNotes = viewModel::setNotes,
        onFavorite = viewModel::setFavorite,
        onPhoto = viewModel::selectPhoto,
        onSave = viewModel::save,
        onDelete = viewModel::delete,
    )
}

@Composable
fun WardrobeEditorContent(
    state: WardrobeEditorUiState,
    onClose: () -> Unit,
    onRetry: () -> Unit,
    onName: (String) -> Unit,
    onBrand: (String) -> Unit,
    onType: (String) -> Unit,
    onColor: (String) -> Unit,
    onSeason: (String) -> Unit,
    onNotes: (String) -> Unit,
    onFavorite: (Boolean) -> Unit,
    onPhoto: (String) -> Unit,
    onSave: () -> Unit,
    onDelete: () -> Unit,
) {
    var confirm by remember { mutableStateOf(false) }
    AppScaffold(
        title = stringResource(if (state.isEdit) R.string.wardrobe_editor_edit_title else R.string.wardrobe_editor_create_title),
        onNavigate = onClose,
        navigationIcon = AppIcons.close,
        navigationDescription = stringResource(R.string.common_close),
        navigationTestTag = "wardrobeEditor.cancel",
        aboveTabBar = false,
        actions = {
            TextButton(onClick = onSave, enabled = !state.saving && !state.loading, modifier = Modifier.testTag("wardrobeEditor.save")) {
                Text(stringResource(R.string.common_save))
            }
        },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.notFound -> ErrorState(
                modifier = Modifier.padding(padding),
                body = stringResource(R.string.wardrobe_editor_not_found),
                onRetry = null,
            )
            state.loadError -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = AppSize.thumbnail),
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(AppSpacing.lg),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm),
                verticalArrangement = Arrangement.spacedBy(AppSpacing.sm),
            ) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Text(stringResource(R.string.wardrobe_editor_photo), style = AppTypography.label)
                }
                items(state.photos, key = { it.id + it.imageUrl }) { photo ->
                    PhotoChoice(photo, selected = photo.imageUrl == state.imageUrl, onClick = { onPhoto(photo.imageUrl) })
                }
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Column(verticalArrangement = Arrangement.spacedBy(AppSpacing.md), modifier = Modifier.padding(top = AppSpacing.lg)) {
                        EditorField(state.name, onName, R.string.wardrobe_editor_name, R.string.wardrobe_editor_name_placeholder, "wardrobeEditor.name")
                        EditorField(state.brand, onBrand, R.string.wardrobe_editor_brand, R.string.wardrobe_editor_brand_placeholder, "wardrobeEditor.brand")
                        ChoiceField(stringResource(R.string.wardrobe_editor_type), itemTypeLabel(state.type), "wardrobeEditor.type", ITEM_TYPES.map { it to itemTypeLabel(it) }, onType)
                        EditorField(state.color, onColor, R.string.wardrobe_editor_color, R.string.wardrobe_editor_color_placeholder, "wardrobeEditor.color")
                        ChoiceField(stringResource(R.string.wardrobe_editor_season), seasonLabel(state.season), "wardrobeEditor.season", SEASONS.map { it to seasonLabel(it) }, onSeason)
                        EditorField(state.notes, onNotes, R.string.wardrobe_editor_notes, R.string.wardrobe_editor_notes_placeholder, "wardrobeEditor.notes", singleLine = false)
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .heightIn(min = AppSize.touchTarget)
                                .testTag("wardrobeEditor.favorite")
                                .toggleable(value = state.favorite, onValueChange = onFavorite, role = Role.Switch),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(stringResource(R.string.wardrobe_editor_favorite), style = AppTypography.body)
                            Switch(
                                checked = state.favorite,
                                onCheckedChange = null,
                                modifier = Modifier.scaledToHeight(AppSize.touchTarget),
                            )
                        }
                        val message = when (state.error) {
                            WardrobeEditorError.NameRequired -> stringResource(R.string.wardrobe_editor_name_required)
                            WardrobeEditorError.PhotoRequired -> stringResource(R.string.wardrobe_editor_photo_required)
                            WardrobeEditorError.SaveFailed -> stringResource(R.string.common_save_failed)
                            WardrobeEditorError.DeleteFailed -> stringResource(R.string.common_delete_failed)
                            null -> null
                        }
                        if (message != null) {
                            Text(message, modifier = Modifier.testTag("wardrobeEditor.error"), style = AppTypography.caption, color = AppTheme.colors.error)
                        }
                        if (state.isEdit) {
                            OutlinedButton(
                                onClick = { confirm = true },
                                enabled = !state.saving,
                                modifier = Modifier.fillMaxWidth().testTag("wardrobeEditor.delete"),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = AppTheme.colors.error),
                            ) {
                                Text(stringResource(R.string.wardrobe_editor_delete))
                            }
                        }
                    }
                }
            }
        }
    }
    if (confirm) {
        AlertDialog(
            onDismissRequest = { confirm = false },
            title = { Text(stringResource(R.string.wardrobe_editor_delete_title)) },
            text = { Text(stringResource(R.string.wardrobe_editor_delete_body)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        confirm = false
                        onDelete()
                    },
                    modifier = Modifier.testTag("wardrobeEditor.confirmDelete"),
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
private fun PhotoChoice(photo: WardrobePhoto, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(AppRadius.md)
    Box(
        Modifier
            .aspectRatio(1f)
            .testTag("wardrobeEditor.photo.${photo.id}")
            .semantics { this.selected = selected }
            .clip(shape)
            .border(AppSpacing.xs, if (selected) AppTheme.colors.primary else Color.Transparent, shape)
            .clickable(onClick = onClick),
    ) {
        RemotePhoto(url = photo.imageUrl, contentDescription = null, modifier = Modifier.fillMaxSize(), shape = shape)
        if (selected) {
            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(AppSpacing.xs)
                    .size(AppIconSize.md)
                    .clip(CircleShape)
                    .background(AppTheme.colors.primary),
                contentAlignment = Alignment.Center,
            ) {
                Icon(AppIcons.check, contentDescription = null, tint = AppTheme.colors.onPrimary, modifier = Modifier.size(AppIconSize.sm))
            }
        }
    }
}

@Composable
private fun EditorField(
    value: String,
    onValue: (String) -> Unit,
    label: Int,
    placeholder: Int,
    tag: String,
    singleLine: Boolean = true,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValue,
        modifier = Modifier.fillMaxWidth().testTag(tag),
        label = { Text(stringResource(label)) },
        placeholder = { Text(stringResource(placeholder)) },
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 3,
        textStyle = AppTypography.body,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChoiceField(
    label: String,
    value: String,
    tag: String,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(expanded = open, onExpandedChange = { open = it }, modifier = Modifier.testTag(tag)) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = open) },
            modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable).fillMaxWidth(),
            textStyle = AppTypography.body,
        )
        ExposedDropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            options.forEach { (id, text) ->
                DropdownMenuItem(text = { Text(text) }, onClick = { onSelect(id); open = false })
            }
        }
    }
}
