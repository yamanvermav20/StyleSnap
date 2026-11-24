package app.features.catalog

import app.core.NotFoundException
import app.generated.ApiException

internal suspend fun <T> apiCall(block: suspend () -> T): T = try {
    block()
} catch (e: ApiException) {
    if (e.status == 404) throw NotFoundException() else throw e
}
