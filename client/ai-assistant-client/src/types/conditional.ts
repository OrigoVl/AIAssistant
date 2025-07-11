import { Conditions, IfOperator, ActionOperator, LogicalBlock } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import SobjectModel from '@acx-ohc/composer-online-shared/src/co-generator/model/SobjectModel';

/**
 * Props interface for ConditionalList component
 */
export interface ConditionalListProps {
  conditions: Conditions[];
  allowMultiple?: boolean;
  parentEntityName: string;
}

/**
 * Emits interface for ConditionalList component
 */
export interface ConditionalListEmits {
  'update:conditions': [conditions: Conditions[]];
}

/**
 * Props interface for ConditionalBlock component
 */
export interface ConditionalBlockProps {
  condition: Conditions;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
  isDeleteAvailable: boolean;
}

/**
 * Emits interface for ConditionalBlock component
 */
export interface ConditionalBlockEmits {
  'update:condition': [condition: Conditions];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'add-else-if': [conditionId: string];
  'delete-logical-block': [conditionId: string, index: number];
  'order-change': [conditionId: string];
}

/**
 * Props interface for ConditionalDraggableList component
 */
export interface ConditionalDraggableListProps {
  logicalBlocks: LogicalBlock[];
  conditionId: string;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
}

/**
 * Emits interface for ConditionalDraggableList component
 */
export interface ConditionalDraggableListEmits {
  'update:logical-blocks': [logicalBlocks: LogicalBlock[]];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'delete-logical-block': [conditionId: string, index: number];
  'order-change': [conditionId: string];
}

/**
 * Props interface for ConditionalDraggableItem component
 */
export interface ConditionalDraggableItemProps {
  condition: LogicalBlock;
  index: number;
  childrenOfCollection: SobjectModel[];
  allowMultiple: boolean;
  canDelete: boolean;
}

/**
 * Emits interface for ConditionalDraggableItem component
 */
export interface ConditionalDraggableItemEmits {
  'update:condition': [updates: any[]];
  'delete': [id: string, type: 'allBlocks' | 'oneBlock'];
  'reset': [id: string | any];
  'delete-logical-block': [conditionId: string, index: number];
}

/**
 * Props interface for ConditionalActions component
 */
export interface ConditionalActionsProps {
  canAddElseIf: boolean;
  conditionId: string;
}

/**
 * Emits interface for ConditionalActions component
 */
export interface ConditionalActionsEmits {
  'add-else-if': [conditionId: string];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validation summary interface
 */
export interface ValidationSummary {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  totalIssues: number;
}

/**
 * Type guards for better type safety
 */
export const isIfOperator = (item: any): item is IfOperator => {
  return 'type' in item && (item.type === 'if' || item.type === 'else-if');
};

export const isActionOperator = (item: any): item is ActionOperator => {
  return 'type' in item && item.type === 'then';
};

export const isLogicalBlock = (item: any): item is LogicalBlock => {
  return 'ifBlocks' in item && 'thenBlocks' in item;
};

/**
 * Utility type for component props with proper typing
 */
export type ComponentProps<T> = {
  [K in keyof T]: T[K];
};

/**
 * Utility type for component emits with proper typing
 */
export type ComponentEmits<T> = {
  [K in keyof T]: T[K];
};