import clsx from 'clsx'

export function Divider({
  soft = false,
  className,
  ...props
}: { soft?: boolean } & React.ComponentPropsWithoutRef<'hr'>) {
  return (
    <hr
      role="presentation"
      {...props}
      className={clsx(
        className,
        'w-full border-t',
        soft && 'border-trax-zinc-950/5 dark:border-trax-white/5',
        !soft && 'border-trax-zinc-950/10 dark:border-trax-white/10'
      )}
    />
  )
}
