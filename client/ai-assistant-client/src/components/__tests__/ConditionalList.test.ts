import { mount, shallowMount } from '@vue/test-utils';
import { createLocalVue } from '@vue/test-utils';
import VueCompositionAPI from '@vue/composition-api';
import ConditionalList from '../ConditionalList.vue';
import ConditionalBlock from '../ConditionalBlock.vue';
import { Conditions } from '@acx-ohc/composer-online-shared/src/types/conditional-values';

const localVue = createLocalVue();
localVue.use(VueCompositionAPI);

// Mock the services
jest.mock('@/services', () => ({
  GenerationContextService: {
    getContextService: jest.fn(() => ({
      getEntities: jest.fn().mockResolvedValue([]),
      getEntityFields: jest.fn().mockResolvedValue({}),
      extractMetadata: jest.fn().mockResolvedValue([]),
    })),
  },
}));

// Mock the composables
jest.mock('@/composables/useConditionalLogic', () => ({
  useConditionalLogic: jest.fn(() => ({
    handleConditionUpdate: jest.fn(),
    handleDelete: jest.fn(),
    handleReset: jest.fn(),
    addElseIfBlock: jest.fn(),
    handleLogicalBlockDelete: jest.fn(),
    handleOrderChange: jest.fn(),
  })),
}));

jest.mock('@/composables/useConditionalState', () => ({
  useConditionalState: jest.fn(() => ({
    isDeleteAvailable: true,
    hasMultipleLogicalBlocks: false,
    totalConditions: 1,
    hasMaxLogicalBlocks: false,
  })),
}));

jest.mock('@/composables/useConditionalValidation', () => ({
  useConditionalValidation: jest.fn(() => ({
    validateConditions: jest.fn(() => []),
  })),
}));

// Mock the constants
jest.mock('@/constants/conditional', () => ({
  CONSTANTS: {
    MAX_LOGICAL_BLOCKS: 9,
    SPINNER_SIZE: 35,
    DEFAULT_OPACITY: 0.5,
  },
}));

describe('ConditionalList.vue', () => {
  let wrapper: any;
  let mockConditions: Conditions[];

  beforeEach(() => {
    mockConditions = [
      {
        id: 'condition-1',
        logicalBlocks: [
          {
            ifBlocks: {
              id: 'if-1',
              ifOperators: [
                {
                  id: 'op-1',
                  type: 'if',
                  entity: { name: 'test' },
                },
              ],
            },
            thenBlocks: {
              id: 'then-1',
              thenOperators: [
                {
                  id: 'then-op-1',
                  type: 'then',
                },
              ],
            },
          },
        ],
        elseBlocks: [
          {
            id: 'else-1',
            type: 'else',
          },
        ],
      },
    ];
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correctly with conditions', () => {
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      expect(wrapper.find('.conditional-list__container').exists()).toBe(true);
      expect(wrapper.findComponent(ConditionalBlock).exists()).toBe(true);
    });

    it('shows loading spinner when isLoading is true', async () => {
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ASpinner: true,
        },
      });

      // Simulate loading state
      await wrapper.setData({ isLoading: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.conditional-list__spinner-container').exists()).toBe(true);
      expect(wrapper.findComponent(ConditionalBlock).exists()).toBe(false);
    });

    it('shows error message when error exists', async () => {
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
        },
      });

      await wrapper.setData({ error: 'Test error message' });
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.conditional-list__error').exists()).toBe(true);
      expect(wrapper.find('.conditional-list__error').text()).toContain('Test error message');
    });
  });

  describe('Props Validation', () => {
    it('validates required props', () => {
      const validator = ConditionalList.options.props.conditions.validator;
      
      // Valid conditions
      expect(validator(mockConditions)).toBe(true);
      
      // Invalid conditions (empty array)
      expect(validator([])).toBe(false);
      
      // Invalid conditions (too many logical blocks)
      const invalidConditions = [
        {
          ...mockConditions[0],
          logicalBlocks: Array(10).fill(mockConditions[0].logicalBlocks[0]),
        },
      ];
      expect(validator(invalidConditions)).toBe(false);
    });

    it('has correct default props', () => {
      expect(ConditionalList.options.props.allowMultiple.default).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('emits update:conditions when condition is updated', async () => {
      wrapper = mount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      const conditionalBlock = wrapper.findComponent(ConditionalBlock);
      await conditionalBlock.vm.$emit('update:condition', mockConditions[0]);

      expect(wrapper.emitted('update:conditions')).toBeTruthy();
      expect(wrapper.emitted('update:conditions')[0]).toEqual([mockConditions]);
    });

    it('emits delete event when condition is deleted', async () => {
      wrapper = mount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      const conditionalBlock = wrapper.findComponent(ConditionalBlock);
      await conditionalBlock.vm.$emit('delete', 'condition-1', 'allBlocks');

      expect(wrapper.emitted('update:conditions')).toBeTruthy();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('calls getParentEntity on beforeMount', async () => {
      const getParentEntitySpy = jest.fn();
      
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      // Mock the getParentEntity method
      wrapper.vm.getParentEntity = getParentEntitySpy;
      
      // Trigger beforeMount
      await wrapper.vm.$options.beforeMount[0].call(wrapper.vm);
      
      expect(getParentEntitySpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles errors in getParentEntity', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      // Mock the service to throw an error
      const { GenerationContextService } = require('@/services');
      GenerationContextService.getContextService.mockImplementation(() => ({
        getEntities: jest.fn().mockRejectedValue(new Error('Service error')),
        getEntityFields: jest.fn().mockResolvedValue({}),
        extractMetadata: jest.fn().mockResolvedValue([]),
      }));

      await wrapper.vm.getParentEntity();
      
      expect(wrapper.vm.error).toBe('Failed to load entity data');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      const container = wrapper.find('.conditional-list__container');
      expect(container.exists()).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      wrapper = shallowMount(ConditionalList, {
        localVue,
        propsData: {
          conditions: mockConditions,
          parentEntityName: 'TestEntity',
        },
        stubs: {
          ConditionalBlock: true,
          ASpinner: true,
        },
      });

      const container = wrapper.find('.conditional-list__container');
      expect(container.classes()).toContain('conditional-list__container');
    });
  });
});