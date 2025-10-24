import { cn } from '../../src/lib/utils';

describe('utils', () => {
  describe('cn function', () => {
    test('should combine simple class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(typeof result).toBe('string');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    test('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toContain('base-class');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    test('should merge conflicting Tailwind classes', () => {
      // Testing Tailwind merge functionality
      const result = cn('p-4', 'p-2');
      
      // Should keep only one padding class (the last one)
      expect(result).toBe('p-2');
    });

    test('should handle empty and undefined values', () => {
      const result = cn('valid-class', '', undefined, null, false, 'another-class');
      
      expect(result).toContain('valid-class');
      expect(result).toContain('another-class');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    test('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    test('should handle object with conditional classes', () => {
      const result = cn({
        'always-present': true,
        'conditionally-present': true,
        'never-present': false
      });
      
      expect(result).toContain('always-present');
      expect(result).toContain('conditionally-present');
      expect(result).not.toContain('never-present');
    });

    test('should handle complex Tailwind class conflicts', () => {
      // Testing more complex Tailwind merge scenarios
      const result = cn(
        'bg-red-500 text-white p-4',
        'bg-blue-500 p-2',
        'hover:bg-green-500'
      );
      
      // Should resolve conflicts while keeping non-conflicting classes
      expect(result).toContain('text-white');
      expect(result).toContain('hover:bg-green-500');
      expect(result).toContain('bg-blue-500'); // Last bg color wins
      expect(result).toContain('p-2'); // Last padding wins
      expect(result).not.toContain('bg-red-500');
      expect(result).not.toContain('p-4');
    });

    test('should handle responsive classes correctly', () => {
      const result = cn(
        'text-sm md:text-base lg:text-lg',
        'md:text-xl'
      );
      
      // Should keep base and lg, but md:text-xl should override md:text-base
      expect(result).toContain('text-sm');
      expect(result).toContain('lg:text-lg');
      expect(result).toContain('md:text-xl');
      expect(result).not.toContain('md:text-base');
    });

    test('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    test('should handle whitespace and normalize classes', () => {
      const result = cn('  class1  ', '  class2  class3  ');
      
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
      // Should not have extra whitespace
      expect(result.trim()).toBe(result);
    });

    test('should work with real-world component patterns', () => {
      // Test different scenarios to avoid TypeScript literal type issues
      const testCases = [
        { size: 'sm', variant: 'primary', disabled: false },
        { size: 'lg', variant: 'primary', disabled: false },
        { size: 'md', variant: 'secondary', disabled: true },
      ] as const;

      testCases.forEach(({ size, variant, disabled }) => {
        const result = cn(
          'button-base transition-colors',
          {
            'button-sm': size === 'sm',
            'button-md': size === 'md',
            'button-lg': size === 'lg',
          },
          {
            'button-primary': variant === 'primary',
            'button-secondary': variant === 'secondary',
          },
          disabled && 'button-disabled'
        );
        
        expect(result).toContain('button-base');
        expect(result).toContain('transition-colors');
        expect(result).toContain(`button-${size}`);
        expect(result).toContain(`button-${variant}`);
        
        if (disabled) {
          expect(result).toContain('button-disabled');
        } else {
          expect(result).not.toContain('button-disabled');
        }
      });
    });

    test('should handle duplicate classes', () => {
      const result = cn('duplicate', 'other', 'duplicate', 'another');
      
      // clsx/twMerge preserves duplicate non-conflicting classes
      expect(result).toBe('duplicate other duplicate another');
    });
  });
});