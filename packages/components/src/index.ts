/**
 * @punk/components
 *
 * React component library built on Radix UI primitives
 * Provides accessible, composable UI components for the Punk framework
 */

// Button
export { Button } from './button';
export type { ButtonProps } from './button';

// Dialog
export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
export type { DialogProps } from './dialog';

// Popover
export {
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
  PopoverAnchor,
} from './popover';
export type { PopoverProps } from './popover';

// Tooltip
export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
} from './tooltip';
export type { TooltipProps } from './tooltip';

// Accordion
export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from './accordion';
export type { AccordionProps, AccordionItemType } from './accordion';

// Tabs
export {
  Tabs,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './tabs';
export type { TabsProps, TabItem } from './tabs';

// Checkbox
export { Checkbox, CheckboxRoot, CheckboxIndicator } from './checkbox';
export type { CheckboxProps } from './checkbox';

// Radio
export {
  Radio,
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupIndicator,
} from './radio';
export type { RadioProps, RadioOption } from './radio';

// Select
export {
  Select,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
} from './select';
export type { SelectProps, SelectOption, SelectGroupType } from './select';

// Slider
export {
  Slider,
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from './slider';
export type { SliderProps } from './slider';

// Switch
export { Switch, SwitchRoot, SwitchThumb } from './switch';
export type { SwitchProps } from './switch';
