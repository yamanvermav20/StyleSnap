import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { useState } from 'react'
import { isNotFound } from '#/core/errors'
import type { ItemType, Season } from '#/core/labels'
import { useClientQuery } from '#/core/useClientQuery'
import type { WardrobeItem, WardrobePhoto } from '#/generated/api'
import { strings } from '#/generated/strings'
import {
  clipWardrobeText,
  normalizeWardrobeInput,
  wardrobeDraftError,
  wardrobeKeys,
  WARDROBE_LIMITS,
} from './WardrobeRepository'

export type WardrobeFilter = 'all' | ItemType

export type WardrobeDraft = {
  name: string
  brand: string
  type: ItemType
  color: string
  season: Season
  notes: string
  favorite: boolean
  imageUrl: string
}

const newDraft = (): WardrobeDraft => ({
  name: '',
  brand: '',
  type: 'top',
  color: '',
  season: 'allSeason',
  notes: '',
  favorite: false,
  imageUrl: '',
})

function fromItem(item: WardrobeItem): WardrobeDraft {
  return {
    name: item.name,
    brand: item.brand,
    type: item.type,
    color: item.color,
    season: item.season,
    notes: item.notes,
    favorite: item.favorite,
    imageUrl: item.imageUrl,
  }
}

export function useWardrobeFilter() {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: wardrobeKeys.filter,
    queryFn: () => queryClient.getQueryData<WardrobeFilter>(wardrobeKeys.filter) ?? 'all',
    initialData: 'all' as WardrobeFilter,
    staleTime: Infinity,
    retry: false,
  })
  return {
    type: data ?? 'all',
    setType: (type: WardrobeFilter) => queryClient.setQueryData(wardrobeKeys.filter, type),
  }
}

export function useWardrobeViewModel() {
  const { container } = useRouteContext({ from: '__root__' })
  const repository = container.wardrobeRepository
  const filter = useWardrobeFilter()
  const all = useClientQuery({
    queryKey: wardrobeKeys.items('all'),
    queryFn: () => repository.list(),
    refetchOnMount: 'always',
  })
  const typed = useClientQuery({
    queryKey: wardrobeKeys.items(filter.type),
    queryFn: () => repository.list(filter.type === 'all' ? undefined : filter.type),
    enabled: filter.type !== 'all',
    refetchOnMount: 'always',
  })
  const items = filter.type === 'all' ? (all.data ?? []) : (typed.data ?? [])
  const pending = all.isPending || (filter.type !== 'all' && typed.isPending)
  const failed = all.isError || (filter.type !== 'all' && typed.isError)

  return {
    status: failed ? ('error' as const) : pending ? ('loading' as const) : ('ready' as const),
    items,
    total: all.data?.length ?? 0,
    filter: filter.type,
    setFilter: filter.setType,
    retry: () => {
      void all.refetch()
      void typed.refetch()
    },
  }
}

export function useWardrobeEditorViewModel(itemId?: string) {
  const { container } = useRouteContext({ from: '__root__' })
  const repository = container.wardrobeRepository
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const photos = useClientQuery({
    queryKey: wardrobeKeys.photos,
    queryFn: () => repository.listPhotos(),
    staleTime: Infinity,
  })
  const item = useClientQuery({
    queryKey: wardrobeKeys.item(itemId ?? 'new'),
    queryFn: () => repository.get(itemId ?? ''),
    enabled: Boolean(itemId),
  })
  const [draft, setDraft] = useState<WardrobeDraft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const loading = photos.isPending || (Boolean(itemId) && item.isPending)
  const notFound = Boolean(itemId) && item.isError && isNotFound(item.error)
  const failed = photos.isError || (Boolean(itemId) && item.isError && !notFound)
  const base = draft ?? (item.data ? fromItem(item.data) : newDraft())

  function update(partial: Partial<WardrobeDraft>) {
    setDraft({ ...base, ...partial })
    setError(null)
  }

  function visiblePhotos(library: WardrobePhoto[], current: WardrobeDraft, original?: string) {
    const ofType = library.filter((photo) => photo.type === current.type)
    if (original && !ofType.some((photo) => photo.imageUrl === original)) {
      return [{ id: 'current', type: current.type, imageUrl: original }, ...ofType]
    }
    return ofType
  }

  async function save() {
    const problem = wardrobeDraftError(base.name, base.imageUrl)
    if (problem) {
      setError(problem === 'name' ? strings.wardrobeEditorNameRequired : strings.wardrobeEditorPhotoRequired)
      return
    }
    setPending(true)
    try {
      const input = normalizeWardrobeInput(base)
      if (itemId) await repository.update(itemId, input)
      else await repository.create(input)
      await queryClient.invalidateQueries({ queryKey: ['wardrobe'] })
      await navigate({ to: '/wardrobe' })
    } catch {
      setError(strings.commonSaveFailed)
      setPending(false)
    }
  }

  async function confirmDelete() {
    if (!itemId) return
    setPending(true)
    try {
      await repository.delete(itemId)
      await queryClient.invalidateQueries({ queryKey: ['wardrobe'] })
      await navigate({ to: '/wardrobe' })
    } catch {
      setError(strings.commonDeleteFailed)
      setConfirming(false)
      setPending(false)
    }
  }

  return {
    status: loading ? ('loading' as const) : notFound ? ('notFound' as const) : failed ? ('error' as const) : ('ready' as const),
    title: itemId ? strings.wardrobeEditorEditTitle : strings.wardrobeEditorCreateTitle,
    editing: Boolean(itemId),
    draft: base,
    photos: visiblePhotos(photos.data ?? [], base, item.data?.imageUrl),
    error,
    pending,
    confirming,
    setName: (value: string) => update({ name: clipWardrobeText(value, WARDROBE_LIMITS.name) }),
    setBrand: (value: string) => update({ brand: clipWardrobeText(value, WARDROBE_LIMITS.brand) }),
    setColor: (value: string) => update({ color: clipWardrobeText(value, WARDROBE_LIMITS.color) }),
    setNotes: (value: string) => update({ notes: clipWardrobeText(value, WARDROBE_LIMITS.notes) }),
    setFavorite: (favorite: boolean) => update({ favorite }),
    setSeason: (season: Season) => update({ season }),
    setType: (type: ItemType) => {
      const original = item.data?.imageUrl
      const library = photos.data ?? []
      const stillVisible =
        library.some((photo) => photo.type === type && photo.imageUrl === base.imageUrl) || original === base.imageUrl
      update({ type, imageUrl: stillVisible ? base.imageUrl : '' })
    },
    setPhoto: (imageUrl: string) => update({ imageUrl }),
    save,
    askDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
    confirmDelete,
    cancel: () => void navigate({ to: '/wardrobe' }),
    retry: () => {
      void photos.refetch()
      void item.refetch()
    },
  }
}
