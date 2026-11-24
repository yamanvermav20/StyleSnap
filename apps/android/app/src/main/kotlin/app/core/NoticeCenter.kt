package app.core

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** A transient message. The navigation shell shows it as a snackbar. */
sealed interface Notice {
    data class Added(val collectionName: String) : Notice
    data class Removed(val collectionName: String) : Notice
    data object SaveFailed : Notice
    data object DeleteFailed : Notice
}

/** One snackbar at a time, shared so a screen can report a message and then close. */
class NoticeCenter {
    private val messages = MutableStateFlow<Notice?>(null)
    val current: StateFlow<Notice?> = messages.asStateFlow()

    fun show(notice: Notice) {
        messages.value = notice
    }

    fun dismiss() {
        messages.value = null
    }
}
