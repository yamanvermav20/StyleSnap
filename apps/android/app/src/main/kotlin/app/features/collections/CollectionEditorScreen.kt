package app.features.collections

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import app.R
import app.core.designsystem.AppScaffold
import app.core.designsystem.AppTheme
import app.core.designsystem.ErrorState
import app.core.designsystem.LoadingState
import app.generated.AppIcons
import app.generated.AppSpacing
import app.generated.AppTypography

@Composable
fun CollectionEditorScreen(viewModel: CollectionEditorViewModel, onClose: () -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(state.finished) { if (state.finished) onClose() }
    CollectionEditorContent(
        state = state,
        isEdit = viewModel.isEdit,
        onClose = onClose,
        onRetry = viewModel::load,
        onName = viewModel::setName,
        onDescription = viewModel::setDescription,
        onSave = viewModel::save,
    )
}

@Composable
fun CollectionEditorContent(
    state: CollectionEditorUiState,
    isEdit: Boolean,
    onClose: () -> Unit,
    onRetry: () -> Unit,
    onName: (String) -> Unit,
    onDescription: (String) -> Unit,
    onSave: () -> Unit,
) {
    AppScaffold(
        title = stringResource(if (isEdit) R.string.collection_editor_edit_title else R.string.collection_editor_create_title),
        onNavigate = onClose,
        navigationIcon = AppIcons.close,
        navigationDescription = stringResource(R.string.common_close),
        navigationTestTag = "collectionEditor.cancel",
        aboveTabBar = false,
        actions = {
            TextButton(onClick = onSave, enabled = !state.saving, modifier = Modifier.testTag("collectionEditor.save")) {
                Text(stringResource(R.string.common_save))
            }
        },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.loadError -> ErrorState(Modifier.padding(padding), onRetry = onRetry)
            else -> Column(
                Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(AppSpacing.lg),
            ) {
                OutlinedTextField(
                    value = state.name,
                    onValueChange = onName,
                    modifier = Modifier.fillMaxWidth().testTag("collectionEditor.name"),
                    label = { Text(stringResource(R.string.collection_editor_name)) },
                    placeholder = { Text(stringResource(R.string.collection_editor_name_placeholder)) },
                    singleLine = true,
                    textStyle = AppTypography.body,
                    isError = state.error == CollectionEditorError.NameRequired || state.error == CollectionEditorError.NameTooLong,
                )
                OutlinedTextField(
                    value = state.description,
                    onValueChange = onDescription,
                    modifier = Modifier.fillMaxWidth().padding(top = AppSpacing.lg).testTag("collectionEditor.description"),
                    label = { Text(stringResource(R.string.collection_editor_description)) },
                    placeholder = { Text(stringResource(R.string.collection_editor_description_placeholder)) },
                    minLines = 3,
                    textStyle = AppTypography.body,
                )
                val message = when (state.error) {
                    CollectionEditorError.NameRequired -> stringResource(R.string.collection_editor_name_required)
                    CollectionEditorError.NameTooLong -> stringResource(R.string.collection_editor_name_too_long)
                    CollectionEditorError.SaveFailed -> stringResource(R.string.common_save_failed)
                    null -> null
                }
                if (message != null) {
                    Text(
                        message,
                        modifier = Modifier.padding(top = AppSpacing.sm).testTag("collectionEditor.error"),
                        style = AppTypography.caption,
                        color = AppTheme.colors.error,
                    )
                }
            }
        }
    }
}
