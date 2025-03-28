import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { Link } from './link'

const styles = {
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    // Sizing
    'px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6',
    // Focus
    'focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-trax-blue-500',
    // Disabled
    'data-[disabled]:opacity-50',
    // Icon
    '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText]',
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    'border-transparent bg-[--btn-border]',
    // Dark mode: border is rendered on `after` so background is set to button background
    'dark:bg-[--btn-bg]',
    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]',
    // Drop shadow, applied to the inset `before` layer so it blends with the border
    'before:shadow',
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    'dark:before:hidden',
    // Dark mode: Subtle white outline is applied using a border
    'dark:border-trax-white/5',
    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
    'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]',
    // Inner highlight shadow
    'after:shadow-[shadow:inset_0_1px_theme(colors.trax.white/15%)]',
    // White overlay on hover
    'after:data-[active]:bg-[--btn-hover-overlay] after:data-[hover]:bg-[--btn-hover-overlay]',
    // Dark mode: `after` layer expands to cover entire button
    'dark:after:-inset-px dark:after:rounded-lg',
    // Disabled
    'before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none',
  ],
  outline: [
    // Base
    'border-trax-zinc-950/10 text-trax-zinc-950 data-[active]:bg-zinc-trax-950/[2.5%] data-[hover]:bg-zinc-trax-950/[2.5%]',
    // Dark mode
    'dark:border-trax-white/15 dark:text-trax-white/5 dark:[--btn-bg:transparent] dark:data-[active]:bg-trax-white/5 dark:data-[hover]:bg-trax-white/5',
    // Icon
    '[--btn-icon:theme(colors.trax.zinc.500)] data-[active]:[--btn-icon:theme(colors.trax.zinc.700)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.700)] dark:data-[active]:[--btn-icon:theme(colors.trax.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.trax.zinc.400)]',
  ],
  plain: [
    // Base
    'border-transparent text-trax-zinc-950 data-[active]:bg-trax-zinc-950/5 data-[hover]:bg-trax-zinc-950/5',
    // Dark mode
    'dark:text-trax-white/5 dark:data-[active]:bg-trax-white/10 dark:data-[hover]:bg-trax-white/10',
    // Icon
    '[--btn-icon:theme(colors.trax.zinc.500)] data-[active]:[--btn-icon:theme(colors.trax.zinc.700)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.700)] dark:[--btn-icon:theme(colors.trax.zinc.500)] dark:data-[active]:[--btn-icon:theme(colors.trax.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.trax.zinc.400)]',
  ],
  colors: {
    'dark/zinc': [
      'text-trax-white [--btn-bg:theme(colors.trax.zinc.900)] [--btn-border:theme(colors.trax.zinc.950/90%)] [--btn-hover-overlay:theme(colors.trax.white/10%)]',
      'dark:text-trax-white dark:[--btn-bg:theme(colors.trax.zinc.600)] dark:[--btn-hover-overlay:theme(colors.trax.white/5%)]',
      '[--btn-icon:theme(colors.trax.zinc.400)] data-[active]:[--btn-icon:theme(colors.trax.zinc.300)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.300)]',
    ],
    light: [
      'text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.trax.zinc.950/10%)] [--btn-hover-overlay:theme(colors.trax.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.trax.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.trax.zinc.950/15%)]',
      'dark:text-white dark:[--btn-hover-overlay:theme(colors.trax.white/5%)] dark:[--btn-bg:theme(colors.trax.zinc.800)]',
      '[--btn-icon:theme(colors.trax.zinc.500)] data-[active]:[--btn-icon:theme(colors.trax.zinc.700)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.700)] dark:[--btn-icon:theme(colors.trax.zinc.500)] dark:data-[active]:[--btn-icon:theme(colors.trax.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.trax.zinc.400)]',
    ],
    'dark/white': [
      'text-white [--btn-bg:theme(colors.trax.zinc.900)] [--btn-border:theme(colors.trax.zinc.950/90%)] [--btn-hover-overlay:theme(colors.trax.white/10%)]',
      'dark:text-zinc-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:theme(colors.trax.zinc.950/5%)]',
      '[--btn-icon:theme(colors.trax.zinc.400)] data-[active]:[--btn-icon:theme(colors.trax.zinc.300)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.300)] dark:[--btn-icon:theme(colors.trax.zinc.500)] dark:data-[active]:[--btn-icon:theme(colors.trax.zinc.400)] dark:data-[hover]:[--btn-icon:theme(colors.trax.zinc.400)]',
    ],
    dark: [
      'text-white [--btn-bg:theme(colors.trax.zinc.900)] [--btn-border:theme(colors.trax.zinc.950/90%)] [--btn-hover-overlay:theme(colors.trax.white/10%)]',
      'dark:[--btn-hover-overlay:theme(colors.trax.white/5%)] dark:[--btn-bg:theme(colors.trax.zinc.800)]',
      '[--btn-icon:theme(colors.trax.zinc.400)] data-[active]:[--btn-icon:theme(colors.trax.zinc.300)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.300)]',
    ],
    white: [
      'text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.trax.zinc.950/10%)] [--btn-hover-overlay:theme(colors.trax.zinc.950/2.5%)] data-[active]:[--btn-border:theme(colors.trax.zinc.950/15%)] data-[hover]:[--btn-border:theme(colors.trax.zinc.950/15%)]',
      'dark:[--btn-hover-overlay:theme(colors.trax.zinc.950/5%)]',
      '[--btn-icon:theme(colors.trax.zinc.400)] data-[active]:[--btn-icon:theme(colors.trax.zinc.500)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.500)]',
    ],
    zinc: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.zinc.600)] [--btn-border:theme(colors.trax.zinc.700/90%)]',
      'dark:[--btn-hover-overlay:theme(colors.trax.white/5%)]',
      '[--btn-icon:theme(colors.trax.zinc.400)] data-[active]:[--btn-icon:theme(colors.trax.zinc.300)] data-[hover]:[--btn-icon:theme(colors.trax.zinc.300)]',
    ],
    indigo: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.indigo.500)] [--btn-border:theme(colors.trax.indigo.600/90%)]',
      '[--btn-icon:theme(colors.trax.indigo.300)] data-[active]:[--btn-icon:theme(colors.trax.indigo.200)] data-[hover]:[--btn-icon:theme(colors.trax.indigo.200)]',
    ],
    cyan: [
      'text-cyan-950 [--btn-bg:theme(colors.trax.cyan.300)] [--btn-border:theme(colors.trax.cyan.400/80%)] [--btn-hover-overlay:theme(colors.trax.white/25%)]',
      '[--btn-icon:theme(colors.trax.cyan.500)]',
    ],
    red: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.red.600)] [--btn-border:theme(colors.trax.red.700/90%)]',
      '[--btn-icon:theme(colors.trax.red.300)] data-[active]:[--btn-icon:theme(colors.trax.red.200)] data-[hover]:[--btn-icon:theme(colors.trax.red.200)]',
    ],
    orange: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.orange.500)] [--btn-border:theme(colors.trax.orange.600/90%)]',
      '[--btn-icon:theme(colors.trax.orange.300)] data-[active]:[--btn-icon:theme(colors.trax.orange.200)] data-[hover]:[--btn-icon:theme(colors.trax.orange.200)]',
    ],
    amber: [
      'text-amber-950 [--btn-hover-overlay:theme(colors.trax.white/25%)] [--btn-bg:theme(colors.trax.amber.400)] [--btn-border:theme(colors.trax.amber.500/80%)]',
      '[--btn-icon:theme(colors.trax.amber.600)]',
    ],
    yellow: [
      'text-yellow-950 [--btn-hover-overlay:theme(colors.trax.white/25%)] [--btn-bg:theme(colors.trax.yellow.300)] [--btn-border:theme(colors.trax.yellow.400/80%)]',
      '[--btn-icon:theme(colors.trax.yellow.600)] data-[active]:[--btn-icon:theme(colors.trax.yellow.700)] data-[hover]:[--btn-icon:theme(colors.trax.yellow.700)]',
    ],
    lime: [
      'text-lime-950 [--btn-hover-overlay:theme(colors.trax.white/25%)] [--btn-bg:theme(colors.trax.lime.300)] [--btn-border:theme(colors.trax.lime.400/80%)]',
      '[--btn-icon:theme(colors.trax.lime.600)] data-[active]:[--btn-icon:theme(colors.trax.lime.700)] data-[hover]:[--btn-icon:theme(colors.trax.lime.700)]',
    ],
    green: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.green.600)] [--btn-border:theme(colors.trax.green.700/90%)]',
      '[--btn-icon:theme(colors.trax.white/60%)] data-[active]:[--btn-icon:theme(colors.trax.white/80%)] data-[hover]:[--btn-icon:theme(colors.trax.white/80%)]',
    ],
    emerald: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.emerald.600)] [--btn-border:theme(colors.trax.emerald.700/90%)]',
      '[--btn-icon:theme(colors.trax.white/60%)] data-[active]:[--btn-icon:theme(colors.trax.white/80%)] data-[hover]:[--btn-icon:theme(colors.trax.white/80%)]',
    ],
    teal: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.teal.600)] [--btn-border:theme(colors.trax.teal.700/90%)]',
      '[--btn-icon:theme(colors.trax.white/60%)] data-[active]:[--btn-icon:theme(colors.trax.white/80%)] data-[hover]:[--btn-icon:theme(colors.trax.white/80%)]',
    ],
    sky: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.sky.500)] [--btn-border:theme(colors.trax.sky.600/80%)]',
      '[--btn-icon:theme(colors.trax.white/60%)] data-[active]:[--btn-icon:theme(colors.trax.white/80%)] data-[hover]:[--btn-icon:theme(colors.trax.white/80%)]',
    ],
    blue: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.blue.600)] [--btn-border:theme(colors.trax.blue.700/90%)]',
      '[--btn-icon:theme(colors.trax.blue.400)] data-[active]:[--btn-icon:theme(colors.trax.blue.300)] data-[hover]:[--btn-icon:theme(colors.trax.blue.300)]',
    ],
    violet: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.violet.500)] [--btn-border:theme(colors.trax.violet.600/90%)]',
      '[--btn-icon:theme(colors.trax.violet.300)] data-[active]:[--btn-icon:theme(colors.trax.violet.200)] data-[hover]:[--btn-icon:theme(colors.trax.violet.200)]',
    ],
    purple: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.purple.500)] [--btn-border:theme(colors.trax.purple.600/90%)]',
      '[--btn-icon:theme(colors.trax.purple.300)] data-[active]:[--btn-icon:theme(colors.trax.purple.200)] data-[hover]:[--btn-icon:theme(colors.trax.purple.200)]',
    ],
    fuchsia: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.fuchsia.500)] [--btn-border:theme(colors.trax.fuchsia.600/90%)]',
      '[--btn-icon:theme(colors.trax.fuchsia.300)] data-[active]:[--btn-icon:theme(colors.trax.fuchsia.200)] data-[hover]:[--btn-icon:theme(colors.trax.fuchsia.200)]',
    ],
    pink: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.pink.500)] [--btn-border:theme(colors.trax.pink.600/90%)]',
      '[--btn-icon:theme(colors.trax.pink.300)] data-[active]:[--btn-icon:theme(colors.trax.pink.200)] data-[hover]:[--btn-icon:theme(colors.trax.pink.200)]',
    ],
    rose: [
      'text-white [--btn-hover-overlay:theme(colors.trax.white/10%)] [--btn-bg:theme(colors.trax.rose.500)] [--btn-border:theme(colors.trax.rose.600/90%)]',
      '[--btn-icon:theme(colors.trax.rose.300)] data-[active]:[--btn-icon:theme(colors.trax.rose.200)] data-[hover]:[--btn-icon:theme(colors.trax.rose.200)]',
    ],
  },
}

type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
) & { className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  )

export const Button = forwardRef(function Button(
  { color, outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>
) {
  let classes = clsx(
    className,
    styles.base,
    outline ? styles.outline : plain ? styles.plain : clsx(styles.solid, styles.colors[color ?? 'dark/zinc'])
  )

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
      <TouchTarget>{children}</TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={clsx(classes, 'cursor-default')} ref={ref}>
      <TouchTarget>{children}</TouchTarget>
    </Headless.Button>
  )
})

/**
 * Expand the hit area to at least 44×44px on touch devices
 */
export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  )
}
