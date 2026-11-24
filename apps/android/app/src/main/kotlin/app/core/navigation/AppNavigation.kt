package app.core.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.navigation3.rememberViewModelStoreNavEntryDecorator
import androidx.navigation3.runtime.NavBackStack
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.runtime.rememberSaveableStateHolderNavEntryDecorator
import androidx.navigation3.ui.NavDisplay
import app.R
import app.core.LocalAppContainer
import app.core.Notice
import app.core.ScreenshotLaunch
import app.core.designsystem.AppTheme
import app.core.designsystem.LocalLoadRemotePhotos
import app.features.category.CategoryScreen
import app.features.category.CategoryViewModel
import app.features.collections.CollectionDetailScreen
import app.features.collections.CollectionDetailViewModel
import app.features.collections.CollectionEditorScreen
import app.features.collections.CollectionEditorViewModel
import app.features.collections.CollectionsScreen
import app.features.collections.CollectionsViewModel
import app.features.feed.FeedScreen
import app.features.feed.FeedViewModel
import app.features.outfitdetail.OutfitDetailScreen
import app.features.outfitdetail.OutfitDetailViewModel
import app.features.search.SearchScreen
import app.features.search.SearchViewModel
import app.features.settings.SettingsScreen
import app.features.settings.SettingsViewModel
import app.features.wardrobe.WardrobeEditorScreen
import app.features.wardrobe.WardrobeEditorViewModel
import app.features.wardrobe.WardrobeScreen
import app.features.wardrobe.WardrobeViewModel
import app.generated.AppIcons

/** The app shell: four tabs, each with its own back stack. The bar hides on editors. */
@Composable
fun AppNavigation(launch: ScreenshotLaunch? = null, loadRemotePhotos: Boolean = true, autoDismissToasts: Boolean = true) {
    val container = LocalAppContainer.current
    val discover = rememberStack(launch?.routes(Section.Discover) ?: listOf(Route.Feed))
    val search = rememberStack(launch?.routes(Section.Search) ?: listOf(Route.Search))
    val collections = rememberStack(launch?.routes(Section.Collections) ?: listOf(Route.Collections))
    val wardrobe = rememberStack(launch?.routes(Section.Wardrobe) ?: listOf(Route.Wardrobe))
    val stacks = mapOf(
        Section.Discover to discover,
        Section.Search to search,
        Section.Collections to collections,
        Section.Wardrobe to wardrobe,
    )
    var selectedName by rememberSaveable { mutableStateOf((launch?.section ?: Section.Discover).name) }
    val selected = Section.valueOf(selectedName)
    val stack = stacks.getValue(selected)
    val hideBar = stack.last() is Route.CollectionEditor || stack.last() is Route.WardrobeEditor
    val snackbars = remember { SnackbarHostState() }
    val notice by container.notices.current.collectAsStateWithLifecycle()
    val noticeText = notice?.let { noticeLabel(it) }
    LaunchedEffect(noticeText) {
        val text = noticeText ?: return@LaunchedEffect
        snackbars.showSnackbar(text, duration = if (autoDismissToasts) SnackbarDuration.Short else SnackbarDuration.Indefinite)
        container.notices.dismiss()
    }

    CompositionLocalProvider(LocalLoadRemotePhotos provides loadRemotePhotos) {
        Scaffold(
            contentWindowInsets = WindowInsets(0, 0, 0, 0),
            containerColor = AppTheme.colors.background,
            snackbarHost = {
                SnackbarHost(snackbars) { data ->
                    Snackbar(snackbarData = data, modifier = Modifier.testTag("toast"))
                }
            },
            bottomBar = {
                if (!hideBar) {
                    NavigationBar(containerColor = AppTheme.colors.background) {
                        Section.entries.forEach { section ->
                            val meta = sectionMeta(section)
                            NavigationBarItem(
                                selected = section == selected,
                                onClick = {
                                    if (section == selected) stacks.getValue(section).popToRoot()
                                    else selectedName = section.name
                                },
                                icon = { Icon(meta.icon, contentDescription = null) },
                                label = { Text(stringResource(meta.label)) },
                                modifier = Modifier.testTag(meta.tag),
                            )
                        }
                    }
                }
            },
        ) { padding ->
            // Root view models outlive the tab's NavDisplay, so a tab keeps its filters,
            // scroll-backing data and loaded content while another tab is showing.
            val feedVm = remember(container) { FeedViewModel(container.catalogRepository) }
            val searchVm = remember(container) { SearchViewModel(container.catalogRepository) }
            val collectionsVm = remember(container) { CollectionsViewModel(container.collectionsRepository) }
            val wardrobeVm = remember(container) { WardrobeViewModel(container.wardrobeRepository) }
            Box(Modifier.fillMaxSize().padding(padding)) {
                NavDisplay(
                    backStack = stack,
                    onBack = { onBack(stack) },
                    modifier = Modifier.fillMaxSize(),
                    entryDecorators = listOf(
                        rememberSaveableStateHolderNavEntryDecorator(),
                        rememberViewModelStoreNavEntryDecorator(),
                    ),
                    entryProvider = entries(stack, feedVm, searchVm, collectionsVm, wardrobeVm),
                )
            }
        }
    }
}

@Composable
private fun rememberStack(routes: List<Route>): NavBackStack<NavKey> {
    val keys = Array<NavKey>(routes.size) { routes[it] }
    return rememberNavBackStack(*keys)
}

private fun onBack(stack: NavBackStack<NavKey>) {
    if (stack.size > 1) stack.removeAt(stack.lastIndex)
}

private fun NavBackStack<NavKey>.popToRoot() {
    while (size > 1) removeAt(lastIndex)
}

@Composable
private fun entries(
    backStack: NavBackStack<NavKey>,
    feedVm: FeedViewModel,
    searchVm: SearchViewModel,
    collectionsVm: CollectionsViewModel,
    wardrobeVm: WardrobeViewModel,
) = entryProvider<NavKey> {
    val container = LocalAppContainer.current
    entry<Route.Feed> {
        FeedScreen(
            viewModel = feedVm,
            onOpenSettings = { backStack.add(Route.Settings) },
            onOpenCategory = { backStack.add(Route.Category(it)) },
            onOpenOutfit = { backStack.add(Route.OutfitDetail(it)) },
        )
    }
    entry<Route.Search> {
        SearchScreen(
            viewModel = searchVm,
            onOpenOutfit = { backStack.add(Route.OutfitDetail(it)) },
        )
    }
    entry<Route.Collections> {
        CollectionsScreen(
            viewModel = collectionsVm,
            onOpen = { backStack.add(Route.CollectionDetail(it)) },
            onCreate = { backStack.add(Route.CollectionEditor()) },
        )
    }
    entry<Route.Wardrobe> {
        WardrobeScreen(
            viewModel = wardrobeVm,
            onAdd = { backStack.add(Route.WardrobeEditor()) },
            onOpen = { backStack.add(Route.WardrobeEditor(itemId = it)) },
        )
    }
    entry<Route.Category> { key ->
        CategoryScreen(
            viewModel = viewModel { CategoryViewModel(container.catalogRepository, key.id) },
            onBack = { backStack.removeLastOrNull() },
            onOpenOutfit = { backStack.add(Route.OutfitDetail(it)) },
        )
    }
    entry<Route.OutfitDetail> { key ->
        OutfitDetailScreen(
            viewModel = viewModel {
                OutfitDetailViewModel(key.id, container.catalogRepository, container.collectionsRepository, container.notices)
            },
            onBack = { backStack.removeLastOrNull() },
            onOpenCategory = { backStack.add(Route.Category(it)) },
            onNewCollection = { outfitId -> backStack.add(Route.CollectionEditor(addOutfitId = outfitId)) },
        )
    }
    entry<Route.CollectionDetail> { key ->
        CollectionDetailScreen(
            viewModel = viewModel {
                CollectionDetailViewModel(key.id, container.collectionsRepository, container.notices)
            },
            onBack = { backStack.removeLastOrNull() },
            onEdit = { backStack.add(Route.CollectionEditor(collectionId = it)) },
            onOpenOutfit = { backStack.add(Route.OutfitDetail(it)) },
        )
    }
    entry<Route.CollectionEditor> { key ->
        CollectionEditorScreen(
            viewModel = viewModel {
                CollectionEditorViewModel(
                    container.collectionsRepository,
                    collectionId = key.collectionId.ifBlank { null },
                    addOutfitId = key.addOutfitId.ifBlank { null },
                    notices = container.notices,
                )
            },
            onClose = {
                backStack.removeLastOrNull()
                collectionsVm.load()
            },
        )
    }
    entry<Route.WardrobeEditor> { key ->
        WardrobeEditorScreen(
            viewModel = viewModel {
                WardrobeEditorViewModel(container.wardrobeRepository, itemId = key.itemId.ifBlank { null })
            },
            onClose = {
                backStack.removeLastOrNull()
                wardrobeVm.load()
            },
        )
    }
    entry<Route.Settings> {
        SettingsScreen(
            viewModel = viewModel { SettingsViewModel(container.settingsRepository) },
            onBack = { backStack.removeLastOrNull() },
        )
    }
}

private data class TabMeta(val label: Int, val tag: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

@Composable
private fun sectionMeta(section: Section): TabMeta = when (section) {
    Section.Discover -> TabMeta(R.string.tabs_discover, "tabs.discover", AppIcons.discover)
    Section.Search -> TabMeta(R.string.tabs_search, "tabs.search", AppIcons.search)
    Section.Collections -> TabMeta(R.string.tabs_collections, "tabs.collections", AppIcons.collections)
    Section.Wardrobe -> TabMeta(R.string.tabs_wardrobe, "tabs.wardrobe", AppIcons.wardrobe)
}

@Composable
private fun noticeLabel(notice: Notice): String = when (notice) {
    is Notice.Added -> stringResource(R.string.save_to_collection_added, notice.collectionName)
    is Notice.Removed -> stringResource(R.string.save_to_collection_removed, notice.collectionName)
    Notice.SaveFailed -> stringResource(R.string.common_save_failed)
    Notice.DeleteFailed -> stringResource(R.string.common_delete_failed)
}
