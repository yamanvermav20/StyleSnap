package app.features.catalog

import app.generated.ApiClient
import app.generated.Category
import app.generated.Outfit

/** Live catalog: the generated client talking to [app.generated.AppConfig.apiBaseUrl]. */
class ApiCatalogRepository : CatalogRepository {
    override suspend fun listCategories(): List<Category> = apiCall { ApiClient.listCategories() }

    override suspend fun listOutfits(filter: OutfitFilter): List<Outfit> = apiCall {
        ApiClient.listOutfits(
            search = filter.search?.trim()?.takeIf { it.isNotEmpty() },
            categoryId = filter.categoryId,
            season = filter.season,
            occasion = filter.occasion,
            sort = filter.sort,
        )
    }

    override suspend fun getOutfit(id: String): Outfit = apiCall { ApiClient.getOutfit(id) }
}
