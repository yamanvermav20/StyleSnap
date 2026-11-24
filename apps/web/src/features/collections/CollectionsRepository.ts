import type { CollectionInput, Outfit, OutfitCollection } from '#/generated/api'

export interface CollectionsRepository {
  list(): Promise<OutfitCollection[]>
  get(collectionId: string): Promise<OutfitCollection>
  listOutfits(collectionId: string): Promise<Outfit[]>
  create(input: CollectionInput): Promise<OutfitCollection>
  update(collectionId: string, input: CollectionInput): Promise<OutfitCollection>
  delete(collectionId: string): Promise<void>
  addOutfit(collectionId: string, outfitId: string): Promise<OutfitCollection>
  removeOutfit(collectionId: string, outfitId: string): Promise<OutfitCollection>
}

export const collectionKeys = {
  all: ['collections'] as const,
  detail: (collectionId: string) => ['collections', collectionId] as const,
  outfits: (collectionId: string) => ['collections', collectionId, 'outfits'] as const,
}

const NAME_MAX = 40
const DESCRIPTION_MAX = 140

/** Trims the way the API does. Throws a message key the editor can show, or returns the payload. */
export function parseCollectionDraft(name: string, description: string): { ok: true; input: CollectionInput } | { ok: false; error: 'required' | 'tooLong' } {
  const trimmedName = name.trim()
  if (!trimmedName) return { ok: false, error: 'required' }
  if (trimmedName.length > NAME_MAX) return { ok: false, error: 'tooLong' }
  return { ok: true, input: { name: trimmedName, description: description.trim().slice(0, DESCRIPTION_MAX) } }
}

export const COLLECTION_DESCRIPTION_MAX = DESCRIPTION_MAX
