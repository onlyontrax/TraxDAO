import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

export const Select = forwardRef(function Select(
  { className, multiple, ...props }: { className?: string } & Omit<Headless.SelectProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        'group relative block w-full',
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        'before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-trax-white before:shadow',
        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        'dark:before:hidden',
        // Focus ring
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent after:has-[[data-focus]]:ring-2 after:has-[[data-focus]]:ring-trax-blue-500',
        // Disabled state
        'has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-trax-zinc-950/5 before:has-[[data-disabled]]:shadow-none',
      ])}
    >
      <Headless.Select
        ref={ref}
        multiple={multiple}
        {...props}
        className={clsx([
          // Basic layout
          'relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]',
          // Horizontal padding
          multiple
            ? 'px-[calc(theme(spacing[3.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)]'
            : 'pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing.10)-1px)] sm:pl-[calc(theme(spacing.3)-1px)] sm:pr-[calc(theme(spacing.9)-1px)]',
          // Options (multi-select)
          '[&_optgroup]:font-semibold',
          // Typography
          'text-base/6 text-trax-zinc-950 placeholder:text-trax-zinc-500 sm:text-sm/6 dark:text-trax-white dark:*:text-trax-white',
          // Border
          'border border-trax-zinc-950/10 data-[hover]:border-trax-zinc-950/20 dark:border-trax-white/10 dark:data-[hover]:border-trax-white/20',
          // Background color
          'bg-transparent dark:bg-trax-white/5 dark:*:bg-trax-zinc-800',
          // Hide default focus styles
          'focus:outline-none',
          // Invalid state
          'data-[invalid]:border-trax-red-500 data-[invalid]:data-[hover]:border-trax-red-500 data-[invalid]:dark:border-trax-red-600 data-[invalid]:data-[hover]:dark:border-trax-red-600',
          // Disabled state
          'data-[disabled]:border-trax-zinc-950/20 data-[disabled]:opacity-100 dark:data-[hover]:data-[disabled]:border-trax-white/15 data-[disabled]:dark:border-trax-white/15 data-[disabled]:dark:bg-trax-white/[2.5%]',
        ])}
      />
      {!multiple && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="size-5 stroke-trax-zinc-500 group-has-[[data-disabled]]:stroke-trax-zinc-600 sm:size-4 dark:stroke-trax-zinc-400 forced-colors:stroke-[CanvasText]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  )
})
