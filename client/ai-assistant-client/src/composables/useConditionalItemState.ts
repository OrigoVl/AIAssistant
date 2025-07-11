import { ref, Ref } from '@vue/composition-api';

/**
 * Composable for managing the open/closed state of conditional items
 */
export function useConditionalItemState(allowMultiple: Ref<boolean>) {
  const openItems = ref<Set<string>>(new Set([]));

  /**
   * Checks if an item is open
   * @param itemId - The ID of the item to check
   * @returns True if the item is open, false otherwise
   */
  const isItemOpen = (itemId: string): boolean => {
    return !openItems.value.has(itemId);
  };

  /**
   * Toggles the open/closed state of an item
   * @param itemId - The ID of the item to toggle
   */
  const toggleItem = (itemId: string) => {
    if (openItems.value.has(itemId)) {
      openItems.value.delete(itemId);
    } else {
      if (!allowMultiple.value) {
        openItems.value.clear();
      }
      openItems.value.add(itemId);
    }
    openItems.value = new Set(openItems.value);
  };

  /**
   * Opens a specific item and closes others if multiple is not allowed
   * @param itemId - The ID of the item to open
   */
  const openItem = (itemId: string) => {
    if (!allowMultiple.value) {
      openItems.value.clear();
    }
    openItems.value.add(itemId);
    openItems.value = new Set(openItems.value);
  };

  /**
   * Closes a specific item
   * @param itemId - The ID of the item to close
   */
  const closeItem = (itemId: string) => {
    openItems.value.delete(itemId);
    openItems.value = new Set(openItems.value);
  };

  /**
   * Closes all items
   */
  const closeAllItems = () => {
    openItems.value.clear();
    openItems.value = new Set(openItems.value);
  };

  /**
   * Gets the number of open items
   */
  const openItemsCount = () => {
    return openItems.value.size;
  };

  return {
    openItems,
    isItemOpen,
    toggleItem,
    openItem,
    closeItem,
    closeAllItems,
    openItemsCount,
  };
}