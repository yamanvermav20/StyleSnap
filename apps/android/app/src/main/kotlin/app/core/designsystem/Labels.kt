package app.core.designsystem

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import app.R

val SEASONS = listOf("spring", "summer", "fall", "winter", "allSeason")
val OCCASIONS = listOf("everyday", "work", "party", "date", "travel", "sport")
val ITEM_TYPES = listOf("top", "bottom", "dress", "outerwear", "shoes", "accessory")

@StringRes
fun seasonLabelRes(id: String): Int = when (id) {
    "spring" -> R.string.season_spring
    "summer" -> R.string.season_summer
    "fall" -> R.string.season_fall
    "winter" -> R.string.season_winter
    else -> R.string.season_all_season
}

@StringRes
fun occasionLabelRes(id: String): Int = when (id) {
    "work" -> R.string.occasion_work
    "party" -> R.string.occasion_party
    "date" -> R.string.occasion_date
    "travel" -> R.string.occasion_travel
    "sport" -> R.string.occasion_sport
    else -> R.string.occasion_everyday
}

@StringRes
fun itemTypeLabelRes(id: String): Int = when (id) {
    "bottom" -> R.string.item_type_bottom
    "dress" -> R.string.item_type_dress
    "outerwear" -> R.string.item_type_outerwear
    "shoes" -> R.string.item_type_shoes
    "accessory" -> R.string.item_type_accessory
    else -> R.string.item_type_top
}

@Composable
fun seasonLabel(id: String): String = stringResource(seasonLabelRes(id))

@Composable
fun occasionLabel(id: String): String = stringResource(occasionLabelRes(id))

@Composable
fun itemTypeLabel(id: String): String = stringResource(itemTypeLabelRes(id))
