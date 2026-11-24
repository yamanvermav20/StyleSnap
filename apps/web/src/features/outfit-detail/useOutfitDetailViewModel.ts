import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import { isNotFound } from '#/core/errors'
import { useClientQuery } from '#/core/useClientQuery'
import { useToastMessage } from '#/core/useToast'
import type { OutfitCollection } from '#/generated/api'
import { strings } from '#/generated/strings'
import { catalogKeys } from '#/features/catalog/CatalogRepository'
import { collectionKeys } from '#/features/collections/CollectionsRepository'

export function useOutfitDetailViewModel(outfitId: string) {
  const { container } = useRouteContext({ from: '__root__' })
  const catalog = container.catalogRepository
  const collections = container.collectionsRepository
  const queryClient = useQueryClient()
  const toast = useToastMessage()
  const [sheetOpen, setSheetOpen] = useState(false)

  const outfit = useClientQuery({
    queryKey: catalogKeys.outfit(outfitId),
    queryFn: () => catalog.getOutfit(outfitId),
    staleTime: Infinity,
  })
  const lists = useClientQuery({
    queryKey: collectionKeys.all,
    queryFn: () => collections.list(),
    refetchOnMount: 'always',
  })

  const saved = (lists.data ?? []).some((collection) => collection.outfitIds.includes(outfitId))
  const notFound = outfit.isError && isNotFound(outfit.error)
  const failed = (outfit.isError && !notFound) || (lists.isError && !outfit.isError && !outfit.isSuccess)
  const loading = !outfit.isError && !notFound && (outfit.isPending || (lists.isPending && !lists.data))

  async function toggle(collection: OutfitCollection) {
    const contains = collection.outfitIds.includes(outfitId)
    const previous = queryClient.getQueryData<OutfitCollection[]>(collectionKeys.all)
    queryClient.setQueryData<OutfitCollection[]>(collectionKeys.all, (current) =>
      current?.map((entry) => {
        if (entry.id !== collection.id) return entry
        const outfitIds = contains
          ? entry.outfitIds.filter((id) => id !== outfitId)
          : [outfitId, ...entry.outfitIds.filter((id) => id !== outfitId)]
        return { ...entry, outfitIds, updatedAt: new Date().toISOString() }
      }),
    )
    toast.show(contains ? strings.saveToCollectionRemoved({ name: collection.name }) : strings.saveToCollectionAdded({ name: collection.name }))
    try {
      if (contains) await collections.removeOutfit(collection.id, outfitId)
      else await collections.addOutfit(collection.id, outfitId)
      await queryClient.invalidateQueries({ queryKey: collectionKeys.all })
    } catch {
      queryClient.setQueryData(collectionKeys.all, previous)
      toast.show(strings.commonSaveFailed)
    }
  }

  return {
    status: loading ? ('loading' as const) : notFound ? ('notFound' as const) : failed ? ('error' as const) : ('ready' as const),
    outfit: outfit.data,
    collections: lists.data ?? [],
    collectionsStatus: lists.isPending ? ('loading' as const) : lists.isError ? ('error' as const) : ('ready' as const),
    saved,
    sheetOpen,
    openSheet: () => setSheetOpen(true),
    closeSheet: () => setSheetOpen(false),
    toggle,
    retry: () => {
      void outfit.refetch()
      void lists.refetch()
    },
    retryCollections: () => void lists.refetch(),
    toast: toast.message,
    clearToast: toast.clear,
  }
}
