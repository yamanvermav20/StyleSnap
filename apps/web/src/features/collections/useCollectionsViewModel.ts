import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { useState } from 'react'
import { isNotFound } from '#/core/errors'
import { useClientQuery } from '#/core/useClientQuery'
import { publishToast, useToastMessage } from '#/core/useToast'
import type { OutfitCollection } from '#/generated/api'
import { strings } from '#/generated/strings'
import { collectionKeys, parseCollectionDraft, type CollectionsRepository } from './CollectionsRepository'

export async function applyCollectionSave(
  repository: CollectionsRepository,
  draft: { name: string; description: string },
  options: { collectionId?: string; outfitId?: string } = {},
): Promise<{ ok: true; collection: OutfitCollection; added: boolean } | { ok: false; error: string }> {
  const parsed = parseCollectionDraft(draft.name, draft.description)
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error === 'required' ? strings.collectionEditorNameRequired : strings.collectionEditorNameTooLong,
    }
  }
  try {
    const collection = options.collectionId
      ? await repository.update(options.collectionId, parsed.input)
      : await repository.create(parsed.input)
    if (options.outfitId) {
      const updated = await repository.addOutfit(collection.id, options.outfitId)
      return { ok: true, collection: updated, added: true }
    }
    return { ok: true, collection, added: false }
  } catch {
    return { ok: false, error: strings.commonSaveFailed }
  }
}

export function useCollectionsViewModel() {
  const { container } = useRouteContext({ from: '__root__' })
  const repository = container.collectionsRepository
  const collections = useClientQuery({
    queryKey: collectionKeys.all,
    queryFn: () => repository.list(),
    refetchOnMount: 'always',
  })
  return {
    status: collections.isPending ? ('loading' as const) : collections.isError ? ('error' as const) : ('ready' as const),
    collections: collections.data ?? [],
    retry: () => void collections.refetch(),
  }
}

export function useCollectionDetailViewModel(collectionId: string) {
  const { container } = useRouteContext({ from: '__root__' })
  const repository = container.collectionsRepository
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToastMessage()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const collection = useClientQuery({
    queryKey: collectionKeys.detail(collectionId),
    queryFn: () => repository.get(collectionId),
    refetchOnMount: 'always',
  })
  const outfits = useClientQuery({
    queryKey: collectionKeys.outfits(collectionId),
    queryFn: () => repository.listOutfits(collectionId),
    refetchOnMount: 'always',
  })

  const notFound = (collection.isError && isNotFound(collection.error)) || (outfits.isError && isNotFound(outfits.error))
  const failed = !notFound && (collection.isError || outfits.isError)
  const loading = !notFound && !failed && (collection.isPending || outfits.isPending)

  async function remove(outfitId: string) {
    const previous = queryClient.getQueryData(collectionKeys.outfits(collectionId))
    queryClient.setQueryData(collectionKeys.outfits(collectionId), (current: typeof outfits.data) =>
      current?.filter((outfit) => outfit.id !== outfitId),
    )
    try {
      await repository.removeOutfit(collectionId, outfitId)
      await queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) })
      await queryClient.invalidateQueries({ queryKey: collectionKeys.all })
    } catch {
      queryClient.setQueryData(collectionKeys.outfits(collectionId), previous)
      toast.show(strings.commonDeleteFailed)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await repository.delete(collectionId)
      await queryClient.invalidateQueries({ queryKey: collectionKeys.all })
      await navigate({ to: '/collections' })
    } catch {
      setDeleting(false)
      setConfirming(false)
      toast.show(strings.commonDeleteFailed)
    }
  }

  return {
    status: loading ? ('loading' as const) : notFound ? ('notFound' as const) : failed ? ('error' as const) : ('ready' as const),
    collection: collection.data,
    outfits: outfits.data ?? [],
    confirming,
    deleting,
    askDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
    confirmDelete,
    remove,
    retry: () => {
      void collection.refetch()
      void outfits.refetch()
    },
    toast: toast.message,
    clearToast: toast.clear,
  }
}

export function useCollectionEditorViewModel(collectionId?: string, outfitId?: string) {
  const { container } = useRouteContext({ from: '__root__' })
  const repository = container.collectionsRepository
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const existing = useClientQuery({
    queryKey: collectionKeys.detail(collectionId ?? 'new'),
    queryFn: () => repository.get(collectionId ?? ''),
    enabled: Boolean(collectionId),
  })
  const [name, setName] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loading = Boolean(collectionId) && existing.isPending
  const notFound = Boolean(collectionId) && existing.isError && isNotFound(existing.error)
  const failed = Boolean(collectionId) && existing.isError && !notFound

  async function save() {
    setSaving(true)
    const result = await applyCollectionSave(
      repository,
      { name: name ?? existing.data?.name ?? '', description: description ?? existing.data?.description ?? '' },
      { collectionId, outfitId },
    )
    if (!result.ok) {
      setError(result.error)
      setSaving(false)
      return
    }
    if (result.added && outfitId) publishToast(queryClient, strings.saveToCollectionAdded({ name: result.collection.name }))
    await queryClient.invalidateQueries({ queryKey: collectionKeys.all })
    if (outfitId) {
      await navigate({ to: '/outfits/$outfitId', params: { outfitId } })
      return
    }
    if (collectionId) {
      await queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) })
      await navigate({ to: '/collections/$collectionId', params: { collectionId } })
      return
    }
    await navigate({ to: '/collections' })
  }

  function cancel() {
    if (outfitId) void navigate({ to: '/outfits/$outfitId', params: { outfitId } })
    else if (collectionId) void navigate({ to: '/collections/$collectionId', params: { collectionId } })
    else void navigate({ to: '/collections' })
  }

  return {
    status: loading ? ('loading' as const) : notFound ? ('notFound' as const) : failed ? ('error' as const) : ('ready' as const),
    title: collectionId ? strings.collectionEditorEditTitle : strings.collectionEditorCreateTitle,
    name: name ?? existing.data?.name ?? '',
    description: description ?? existing.data?.description ?? '',
    setName,
    setDescription,
    error,
    saving,
    save,
    cancel,
    retry: () => void existing.refetch(),
  }
}
