import { Conditions } from '@acx-ohc/composer-online-shared/src/types/conditional-values';
import { CONSTANTS } from '@/constants/conditional';

/**
 * Validation error interface
 */
interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Composable for conditional validation
 */
export function useConditionalValidation() {
  /**
   * Validates conditions array
   * @param conditions - The conditions to validate
   * @returns Array of validation errors
   */
  const validateConditions = (conditions: Conditions[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!conditions || conditions.length === 0) {
      errors.push({
        field: 'conditions',
        message: 'At least one condition is required',
        severity: 'error',
      });
      return errors;
    }

    conditions.forEach((condition, index) => {
      // Validate logical blocks
      if (!condition.logicalBlocks || condition.logicalBlocks.length === 0) {
        errors.push({
          field: `condition-${index}-logical-blocks`,
          message: `Condition ${index + 1} must have at least one logical block`,
          severity: 'error',
        });
      }

      if (condition.logicalBlocks && condition.logicalBlocks.length > CONSTANTS.MAX_LOGICAL_BLOCKS) {
        errors.push({
          field: `condition-${index}-logical-blocks`,
          message: `Condition ${index + 1} cannot have more than ${CONSTANTS.MAX_LOGICAL_BLOCKS} logical blocks`,
          severity: 'error',
        });
      }

      // Validate else blocks
      if (!condition.elseBlocks || condition.elseBlocks.length === 0) {
        errors.push({
          field: `condition-${index}-else-blocks`,
          message: `Condition ${index + 1} must have else blocks`,
          severity: 'error',
        });
      }

      // Validate individual logical blocks
      condition.logicalBlocks?.forEach((logicalBlock, blockIndex) => {
        if (!logicalBlock.ifBlocks?.ifOperators || logicalBlock.ifBlocks.ifOperators.length === 0) {
          errors.push({
            field: `condition-${index}-block-${blockIndex}-if`,
            message: `Logical block ${blockIndex + 1} in condition ${index + 1} must have if operators`,
            severity: 'error',
          });
        }

        if (!logicalBlock.thenBlocks?.thenOperators || logicalBlock.thenBlocks.thenOperators.length === 0) {
          errors.push({
            field: `condition-${index}-block-${blockIndex}-then`,
            message: `Logical block ${blockIndex + 1} in condition ${index + 1} must have then operators`,
            severity: 'error',
          });
        }
      });
    });

    return errors;
  };

  /**
   * Validates a single condition
   * @param condition - The condition to validate
   * @returns Array of validation errors
   */
  const validateSingleCondition = (condition: Conditions): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!condition.id) {
      errors.push({
        field: 'id',
        message: 'Condition must have an ID',
        severity: 'error',
      });
    }

    if (!condition.logicalBlocks || condition.logicalBlocks.length === 0) {
      errors.push({
        field: 'logical-blocks',
        message: 'Condition must have at least one logical block',
        severity: 'error',
      });
    }

    if (condition.logicalBlocks && condition.logicalBlocks.length > CONSTANTS.MAX_LOGICAL_BLOCKS) {
      errors.push({
        field: 'logical-blocks',
        message: `Condition cannot have more than ${CONSTANTS.MAX_LOGICAL_BLOCKS} logical blocks`,
        severity: 'error',
      });
    }

    return errors;
  };

  /**
   * Checks if conditions are valid
   * @param conditions - The conditions to check
   * @returns True if valid, false otherwise
   */
  const isConditionsValid = (conditions: Conditions[]): boolean => {
    return validateConditions(conditions).length === 0;
  };

  /**
   * Gets validation summary
   * @param conditions - The conditions to validate
   * @returns Summary object with error and warning counts
   */
  const getValidationSummary = (conditions: Conditions[]) => {
    const errors = validateConditions(conditions);
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      totalIssues: errors.length,
    };
  };

  return {
    validateConditions,
    validateSingleCondition,
    isConditionsValid,
    getValidationSummary,
  };
}