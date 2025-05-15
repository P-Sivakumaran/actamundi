"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toggle, toggleVariants } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Combobox } from "@/components/ui/combobox"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

// Sample options for selects and comboboxes
const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
]

export default function ComponentsDemo() {
  const [comboboxValue, setComboboxValue] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [switchValue, setSwitchValue] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <div className="pb-24">
      <div className="mb-12 max-w-4xl space-y-6">
        <h1 className="font-serif font-semibold text-3xl md:text-4xl tracking-tight text-foreground mb-4">UI Components</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This page showcases the modernized UI components in the ActaMundi design system. Each component is designed to be accessible, themeable, and responsive.
        </p>
      </div>

      <Tabs defaultValue="buttons" className="mb-12">
        <TabsList className="flex flex-wrap w-full mb-8">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="selects">Selects</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Button Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="premium">Premium</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Button Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Button States</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button className="animate-pulse">Loading...</Button>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Toggle Buttons</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Toggle>Basic Toggle</Toggle>
                <Toggle variant="outline">Outline Toggle</Toggle>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Toggle Group</h3>
                <ToggleGroup type="single" defaultValue="center">
                  <ToggleGroupItem value="left">Left</ToggleGroupItem>
                  <ToggleGroupItem value="center">Center</ToggleGroupItem>
                  <ToggleGroupItem value="right">Right</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Toggle Group Multiple</h3>
                <ToggleGroup type="multiple">
                  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
                  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
                  <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Text Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="default-input">Default Input</Label>
                <Input id="default-input" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled-input">Disabled Input</Label>
                <Input id="disabled-input" placeholder="Disabled input" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="with-icon" className="flex items-center gap-1">
                  With Error
                  <Badge variant="outline" className="text-destructive ml-2 font-normal">Required</Badge>
                </Label>
                <Input id="with-icon" placeholder="example@email.com" className="border-destructive" />
                <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="with-success">With Success</Label>
                <Input id="with-success" value="example@email.com" className="border-success" />
                <p className="text-xs text-success mt-1">Email looks good!</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Textarea</h2>
            <div className="grid grid-cols-1 gap-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="default-textarea">Default Textarea</Label>
                <Textarea id="default-textarea" placeholder="Enter your message" />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Checkbox & Radio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl">
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Checkboxes</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={checkboxValue} onCheckedChange={setCheckboxValue} />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" disabled />
                    <Label htmlFor="disabled" className="opacity-50">Disabled option</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Radio Group</h3>
                <RadioGroup defaultValue="option-one">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-one" id="option-one" />
                      <Label htmlFor="option-one">Option One</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-two" id="option-two" />
                      <Label htmlFor="option-two">Option Two</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-three" id="option-three" disabled />
                      <Label htmlFor="option-three" className="opacity-50">Option Three (Disabled)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Other Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-3xl">
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Switch</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" checked={switchValue} onCheckedChange={setSwitchValue} />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-lg font-medium">Slider</h3>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Value: {sliderValue}</p>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-12">
          <section className="space-y-8 max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Headings</h2>
            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-bold">Heading 1</h1>
              <h2 className="font-serif text-3xl font-bold">Heading 2</h2>
              <h3 className="font-serif text-2xl font-bold">Heading 3</h3>
              <h4 className="font-serif text-xl font-bold">Heading 4</h4>
              <h5 className="font-serif text-lg font-bold">Heading 5</h5>
              <h6 className="font-serif text-base font-bold">Heading 6</h6>
            </div>
          </section>

          <section className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Paragraphs</h2>
            <div className="space-y-6">
              <p className="text-lg leading-7">
                This is a large paragraph with good readability. We've designed the typography to provide excellent reading experiences across all screens.
              </p>
              <p className="text-base leading-7">
                This is the default paragraph size. It's designed for optimal readability and comfortable reading across different screen sizes and lighting conditions. The text has enough contrast in both light and dark modes.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                This is a smaller paragraph often used for less important information, captions, or supporting text in a user interface.
              </p>
            </div>
          </section>

          <section className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Text Styles</h2>
            <div className="space-y-4">
              <p className="font-bold">Bold text for emphasis</p>
              <p className="italic">Italic text for subtle emphasis or quotes</p>
              <p className="underline">Underlined text (use sparingly)</p>
              <p className="text-gradient-primary text-xl font-bold">Gradient Text</p>
              <p className="text-gradient-accent text-xl font-bold">Accent Gradient</p>
              <div className="space-y-2">
                <p className="text-primary">Primary Text</p>
                <p className="text-secondary">Secondary Text</p>
                <p className="text-accent">Accent Text</p>
                <p className="text-muted-foreground">Muted Text</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Lists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Unordered List</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>First item in an unordered list</li>
                  <li>Second item with a bit more text to show how wrapping works</li>
                  <li>Third item in this list</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Ordered List</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>First item in an ordered list</li>
                  <li>Second item with a bit more text to show how wrapping works</li>
                  <li>Third item in this list</li>
                </ol>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Selects Tab */}
        <TabsContent value="selects" className="space-y-12">
          <section className="space-y-6 max-w-3xl">
            <h2 className="text-xl font-semibold tracking-tight">Select Components</h2>
            
            <div className="space-y-4">
              <Label>Basic Select</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label>Combobox (Searchable Select)</Label>
              <Combobox 
                options={frameworks}
                value={comboboxValue}
                onChange={setComboboxValue}
                placeholder="Select a framework..."
                searchPlaceholder="Search frameworks..."
              />
            </div>
          </section>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-12">
          <section className="space-y-8">
            <h2 className="text-xl font-semibold tracking-tight">Cards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description providing more details</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the main content area of the card where the primary information is displayed.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Continue</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle>Styled Header</CardTitle>
                  <CardDescription>With subtle background contrast</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>Cards can be customized with different background treatments, borders and spacing.</p>
                  <p className="text-muted-foreground text-sm mt-2">They're great for organizing content into digestible sections.</p>
                </CardContent>
                <CardFooter className="border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm">Back</Button>
                  <Button size="sm">Next</Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Primary Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cards can adopt theme colors.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <CardTitle>Secondary Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Great for featured content.</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-accent">
                <CardHeader>
                  <CardTitle>Bordered Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>With accent border styles.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Overlays Tab */}
        <TabsContent value="overlays" className="space-y-12">
          <section className="space-y-8">
            <h2 className="text-xl font-semibold tracking-tight">Dialogs & Popovers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dialog</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        A description here that explains the purpose of this dialog window.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>This is the main content of the dialog where you can put forms, information, or any other content.</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => {
                        toast({
                          title: "Action Confirmed",
                          description: "You confirmed the dialog action",
                        });
                        setDialogOpen(false);
                      }}>Continue</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Popover</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Popover Heading</h4>
                      <p className="text-sm text-muted-foreground">Popovers are great for displaying additional context or quick actions without leaving the current view.</p>
                      <div className="flex justify-end">
                        <Button size="sm">Action</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dropdown Menu</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => toast({ title: "New Document", description: "Creating new document..." })}>
                      New Document
                    </DropdownMenuItem>
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem>Save</DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hover Card</h3>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">Hover Me</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">What is a HoverCard?</h4>
                      <p className="text-sm text-muted-foreground">
                        A HoverCard shows additional information when users hover over an element, and disappears when they move away.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-12">
          <section className="space-y-8">
            <h2 className="text-xl font-semibold tracking-tight">Interactive Elements</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Toasts (Notifications)</h3>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => {
                  toast({
                    title: "Default Toast",
                    description: "This is a standard notification",
                  })
                }}>
                  Show Toast
                </Button>
                
                <Button variant="success" onClick={() => {
                  toast({
                    title: "Success",
                    description: "Operation completed successfully",
                    variant: "success",
                  })
                }}>
                  Success Toast
                </Button>
                
                <Button variant="destructive" onClick={() => {
                  toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                  })
                }}>
                  Error Toast
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button className="animate-fade-in" variant="outline">Fade In</Button>
                <Button className="animate-slide-up" variant="outline">Slide Up</Button>
                <Button className="animate-scale" variant="outline">Scale</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme Switcher</h3>
              <div className="bg-card rounded-lg p-6 max-w-md border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Current Theme</h4>
                  <ThemeSwitcher />
                </div>
                <p className="mt-2 text-muted-foreground text-sm">
                  Try switching between light, dark, and system themes using the toggle above.
                </p>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
} 