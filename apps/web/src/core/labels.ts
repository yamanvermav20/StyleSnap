import type { Outfit, WardrobeItem } from '#/generated/api'
import { strings } from '#/generated/strings'

export type Season = Outfit['season']
export type Occasion = Outfit['occasion']
export type ItemType = WardrobeItem['type']

export const SEASONS = ['spring', 'summer', 'fall', 'winter', 'allSeason'] as const satisfies readonly Season[]
export const OCCASIONS = ['everyday', 'work', 'party', 'date', 'travel', 'sport'] as const satisfies readonly Occasion[]
export const ITEM_TYPES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'] as const satisfies readonly ItemType[]

export function isSeason(value: unknown): value is Season {
  return typeof value === 'string' && (SEASONS as readonly string[]).includes(value)
}

export function isOccasion(value: unknown): value is Occasion {
  return typeof value === 'string' && (OCCASIONS as readonly string[]).includes(value)
}

export function isItemType(value: unknown): value is ItemType {
  return typeof value === 'string' && (ITEM_TYPES as readonly string[]).includes(value)
}

export function seasonLabel(season: Season) {
  switch (season) {
    case 'spring':
      return strings.seasonSpring
    case 'summer':
      return strings.seasonSummer
    case 'fall':
      return strings.seasonFall
    case 'winter':
      return strings.seasonWinter
    case 'allSeason':
      return strings.seasonAllSeason
  }
}

export function occasionLabel(occasion: Occasion) {
  switch (occasion) {
    case 'everyday':
      return strings.occasionEveryday
    case 'work':
      return strings.occasionWork
    case 'party':
      return strings.occasionParty
    case 'date':
      return strings.occasionDate
    case 'travel':
      return strings.occasionTravel
    case 'sport':
      return strings.occasionSport
  }
}

export function itemTypeLabel(type: ItemType) {
  switch (type) {
    case 'top':
      return strings.itemTypeTop
    case 'bottom':
      return strings.itemTypeBottom
    case 'dress':
      return strings.itemTypeDress
    case 'outerwear':
      return strings.itemTypeOuterwear
    case 'shoes':
      return strings.itemTypeShoes
    case 'accessory':
      return strings.itemTypeAccessory
  }
}
