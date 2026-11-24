import Foundation

/// How a repository call failed, in the terms screens need: missing, or anything else.
nonisolated enum RepositoryError: Error, Equatable {
    /// The thing asked for doesn't exist (HTTP 404).
    case notFound
    /// Offline, a server error or a rejected request.
    case failed

    init(_ error: any Error) {
        if let error = error as? RepositoryError {
            self = error
        } else if case ApiError.httpStatus(404, _) = error {
            self = .notFound
        } else {
            self = .failed
        }
    }
}

/// Runs a generated `ApiClient` call and maps its failure to a `RepositoryError`.
func apiCall<T>(_ call: () async throws -> T) async throws -> T {
    do {
        return try await call()
    } catch {
        throw RepositoryError(error)
    }
}

/// What a screen shows while it loads data, and after.
enum LoadState<Value> {
    case loading
    case loaded(Value)
    case failed(RepositoryError)

    var value: Value? {
        if case .loaded(let value) = self { value } else { nil }
    }
}
