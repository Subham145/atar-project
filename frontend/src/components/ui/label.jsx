import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * @typedef {{
 *   className?: string,
 *   children?: import("react").ReactNode,
 *   htmlFor?: string,
 *   [key: string]: any
 * }} LabelProps
 */

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(
  /**
   * @param {LabelProps} props
   * @param {import("react").ForwardedRef<HTMLLabelElement>} ref
   */
  ({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
  )
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
