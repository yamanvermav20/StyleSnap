package app.core

/** The server responded 404, or the in-memory store has no row with that id. */
class NotFoundException : Exception()

/** A write the repository rejected (empty name, bad photo URL, and so on). */
class InvalidInputException(message: String) : Exception(message)
