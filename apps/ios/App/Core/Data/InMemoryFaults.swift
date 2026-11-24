import Foundation

/// Makes the in-memory repositories slow or failing on purpose, so tests can reach the loading
/// and error states. Operations are named after contracts/api.json's operation IDs.
final class InMemoryFaults {
    /// Added before every call.
    var delay: Duration
    /// Each entry fails once: `listOutfits` the next call of that operation, `listOutfits@2` its
    /// second call since launch.
    var failOnce: Set<String>
    /// These fail every time.
    var failAlways: Set<String>
    private var calls: [String: Int] = [:]

    init(delay: Duration = .zero, failOnce: Set<String> = [], failAlways: Set<String> = []) {
        self.delay = delay
        self.failOnce = failOnce
        self.failAlways = failAlways
    }

    func check(_ operation: String) async throws {
        let call = calls[operation, default: 0] + 1
        calls[operation] = call
        if delay > .zero {
            try await Task.sleep(for: delay)
        }
        if failAlways.contains(operation)
            || failOnce.remove(operation) != nil
            || failOnce.remove("\(operation)@\(call)") != nil {
            throw RepositoryError.failed
        }
    }
}

/// A clock for the in-memory repositories: starts at the fixture's "now" and moves forward one
/// second per call, so new and updated records always sort after the fixture's.
final class InMemoryClock {
    private var current: Date

    init(start: Date = Fixtures.now) {
        current = start
    }

    func tick() -> String {
        current = current.addingTimeInterval(1)
        return Fixtures.timestamp(current)
    }
}
