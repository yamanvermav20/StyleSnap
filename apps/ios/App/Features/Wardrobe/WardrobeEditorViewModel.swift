import Foundation
import Observation

/// State and actions for the wardrobe editor: add an item, or edit or delete one.
@Observable
final class WardrobeEditorViewModel {
    /// The item being edited, or nil for a new one.
    let itemId: String?
    private(set) var state: LoadState<Void> = .loading
    /// The whole photo library.
    private(set) var photos: [WardrobePhoto] = []

    // The form. Text fields are limited to their lengths as the user types.
    private var nameText = ""
    private var brandText = ""
    private var colorText = ""
    private var notesText = ""
    var type: ItemType = .top
    var season: Season = .allSeason
    var favorite = false
    /// The chosen photo's URL.
    var imageUrl: String?

    private(set) var error: String?
    private(set) var isSaving = false
    private(set) var isDeleting = false
    @ObservationIgnored private let repository: any WardrobeRepository

    init(itemId: String?, repository: any WardrobeRepository) {
        self.itemId = itemId
        self.repository = repository
    }

    var name: String {
        get { nameText }
        set { nameText = String(newValue.prefix(WardrobeLimits.name)) }
    }

    var brand: String {
        get { brandText }
        set { brandText = String(newValue.prefix(WardrobeLimits.brand)) }
    }

    var color: String {
        get { colorText }
        set { colorText = String(newValue.prefix(WardrobeLimits.color)) }
    }

    var notes: String {
        get { notesText }
        set { notesText = String(newValue.prefix(WardrobeLimits.notes)) }
    }

    var isEditing: Bool { itemId != nil }
    var isBusy: Bool { isSaving || isDeleting }

    var title: String {
        isEditing ? Strings.wardrobeEditorEditTitle : Strings.wardrobeEditorCreateTitle
    }

    /// The library's photos of the selected type.
    var visiblePhotos: [WardrobePhoto] {
        photos.filter { $0.type == type.rawValue }
    }

    /// The chosen photo when it isn't among `visiblePhotos` (an item's own photo, say), shown first.
    var currentPhotoUrl: String? {
        guard let imageUrl, !visiblePhotos.contains(where: { $0.imageUrl == imageUrl }) else { return nil }
        return imageUrl
    }

    /// Loads the photo library and, when editing, the item, before the form shows.
    func load() async {
        state = .loading
        do {
            async let photos = repository.listPhotos()
            if let itemId {
                fill(from: try await repository.get(id: itemId))
            }
            self.photos = try await photos
            state = .loaded(())
        } catch {
            state = .failed(RepositoryError(error))
        }
    }

    /// The validation messages for the form, empty when it can be saved.
    var problems: [String] {
        var problems: [String] = []
        if name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { problems.append(Strings.wardrobeEditorNameRequired) }
        if imageUrl == nil { problems.append(Strings.wardrobeEditorPhotoRequired) }
        return problems
    }

    /// Validates, then saves. Returns whether it worked, so the editor can close.
    func save() async -> Bool {
        guard problems.isEmpty, let imageUrl else {
            error = problems.joined(separator: "\n")
            return false
        }
        error = nil
        isSaving = true
        defer { isSaving = false }
        let input = WardrobeItemInput(
            brand: brand.trimmingCharacters(in: .whitespacesAndNewlines),
            color: color.trimmingCharacters(in: .whitespacesAndNewlines),
            favorite: favorite,
            imageUrl: imageUrl,
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            notes: notes.trimmingCharacters(in: .whitespacesAndNewlines),
            season: season.rawValue,
            type: type.rawValue
        )
        do {
            if let itemId {
                _ = try await repository.update(id: itemId, input)
            } else {
                _ = try await repository.create(input)
            }
            return true
        } catch {
            self.error = Strings.commonSaveFailed
            return false
        }
    }

    /// Deletes the item. Returns whether it worked, so the editor can close.
    func delete() async -> Bool {
        guard let itemId else { return false }
        error = nil
        isDeleting = true
        defer { isDeleting = false }
        do {
            try await repository.delete(id: itemId)
            return true
        } catch {
            self.error = Strings.commonDeleteFailed
            return false
        }
    }

    private func fill(from item: WardrobeItem) {
        name = item.name
        brand = item.brand
        color = item.color
        notes = item.notes
        type = ItemType(rawValue: item.type) ?? .top
        season = Season(rawValue: item.season) ?? .allSeason
        favorite = item.favorite
        imageUrl = item.imageUrl
    }
}
