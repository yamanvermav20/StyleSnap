import Foundation
import Observation

/// State and actions for the collection editor: create a collection, or rename and describe one.
@Observable
final class CollectionEditorViewModel {
    static let nameLimit = 40
    static let descriptionLimit = 140

    /// The collection being edited, or nil for a new one.
    let collection: OutfitCollection?
    var name: String
    private var descriptionText: String
    /// Limited to `descriptionLimit` characters as the user types.
    var description: String {
        get { descriptionText }
        set { descriptionText = String(newValue.prefix(Self.descriptionLimit)) }
    }
    private(set) var error: String?
    private(set) var isSaving = false
    @ObservationIgnored private let repository: any CollectionsRepository

    init(collection: OutfitCollection?, repository: any CollectionsRepository) {
        self.collection = collection
        self.repository = repository
        name = collection?.name ?? ""
        descriptionText = collection?.description ?? ""
    }

    var title: String {
        collection == nil ? Strings.collectionEditorCreateTitle : Strings.collectionEditorEditTitle
    }

    /// The validation message for the name, if it isn't valid.
    var nameProblem: String? {
        let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if name.isEmpty { return Strings.collectionEditorNameRequired }
        if name.count > Self.nameLimit { return Strings.collectionEditorNameTooLong }
        return nil
    }

    /// Validates, then saves. Returns the saved collection, or nil when the editor should stay open.
    func save() async -> OutfitCollection? {
        if let nameProblem {
            error = nameProblem
            return nil
        }
        error = nil
        isSaving = true
        defer { isSaving = false }
        let input = CollectionInput(
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            name: name.trimmingCharacters(in: .whitespacesAndNewlines)
        )
        do {
            if let collection {
                return try await repository.update(id: collection.id, input)
            }
            return try await repository.create(input)
        } catch {
            self.error = Strings.commonSaveFailed
            return nil
        }
    }
}
