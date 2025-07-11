/**
 * Constants for conditional components
 */
export const CONSTANTS = {
  // Maximum number of logical blocks allowed per condition
  MAX_LOGICAL_BLOCKS: 9,
  
  // Spinner size for loading states
  SPINNER_SIZE: 35,
  
  // Default opacity for disabled elements
  DEFAULT_OPACITY: 0.5,
  
  // CSS custom properties
  CSS_VARS: {
    BORDER_RADIUS: '8px',
    SPACING: '10px',
    BORDER_COLOR: '#dadce1',
    BACKGROUND_COLOR: 'var(--background-table-row)',
  },
  
  // Animation durations
  ANIMATION: {
    TRANSITION_DURATION: '0.2s',
    HOVER_SCALE: 1.1,
  },
  
  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },
  
  // Validation messages
  VALIDATION: {
    MIN_CONDITIONS: 'At least one condition is required',
    MAX_LOGICAL_BLOCKS: 'Cannot have more than 9 logical blocks',
    PRIMARY_IF_DELETE: 'Cannot delete the primary "if" block.',
  },
  
  // Accessibility labels
  ACCESSIBILITY: {
    DRAG_HANDLE: 'Drag condition',
    DELETE_BUTTON: 'Delete condition',
    ADD_ELSE_IF: 'Add else-if condition',
  },
} as const;

/**
 * Type for the constants object
 */
export type ConditionalConstants = typeof CONSTANTS;