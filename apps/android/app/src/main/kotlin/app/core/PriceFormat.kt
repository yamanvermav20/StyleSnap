package app.core

import kotlin.math.roundToInt

/**
 * The number that goes in `common.price`: whole dollars with no decimals ("189"),
 * anything else with two ("42.50").
 */
fun formatPrice(price: Double): String {
    val cents = (price * 100.0).roundToInt()
    val dollars = cents / 100
    val remainder = kotlin.math.abs(cents % 100)
    return if (remainder == 0) dollars.toString() else "%d.%02d".format(dollars, remainder)
}
