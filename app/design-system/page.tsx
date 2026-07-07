"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Toast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { TypographyDemo } from './components/typography-demo'

export default function DesignSystemPage() {
  const { toast } = useToast()

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-fluid-4xl font-bold">ActaMundi Design System</h1>
        <p className="text-fluid-xl text-muted-foreground">A comprehensive guide to our UI components and patterns</p>
      </div>

      <Tabs defaultValue="typography">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none">
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Form Inputs</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>

        {/* Typography */}
        <TabsContent value="typography" className="mt-6">
          <h2 className="text-fluid-3xl font-bold mb-6">Typography System</h2>
          
          <div className="grid gap-8">
            <TypographyDemo />
          
            <div>
              <h3 className="text-xl font-semibold mb-4">Headings</h3>
              <div className="grid gap-4">
                <div>
                  <h1 className="text-5xl font-serif font-bold">Heading 1</h1>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-5xl font-serif font-bold</div>
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold">Heading 2</h2>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-4xl font-serif font-bold</div>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-semibold">Heading 3</h3>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-3xl font-serif font-semibold</div>
                </div>
                <div>
                  <h4 className="text-2xl font-serif font-semibold">Heading 4</h4>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-2xl font-serif font-semibold</div>
                </div>
                <div>
                  <h5 className="text-xl font-semibold">Heading 5</h5>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-xl font-semibold</div>
                </div>
                <div>
                  <h6 className="text-lg font-semibold">Heading 6</h6>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-lg font-semibold</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Body Text</h3>
              <div className="grid gap-4">
                <div>
                  <p className="text-lg">Large paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-lg</div>
                </div>
                <div>
                  <p>Default paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">Default</div>
                </div>
                <div>
                  <p className="text-sm">Small paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-sm</div>
                </div>
                <div>
                  <p className="text-xs">Extra small text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="text-sm text-muted-foreground mt-2 font-mono">text-xs</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="mt-6">
          <h2 className="text-3xl font-bold mb-6">Color System</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                  <div key={weight} className="flex flex-col gap-2">
                    <div 
                      className={`h-20 rounded-md bg-primary-${weight}`} 
                      style={{ backgroundColor: `hsl(var(--primary-${weight}))` }}
                    />
                    <div className="text-sm font-mono">primary-{weight}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Secondary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                  <div key={weight} className="flex flex-col gap-2">
                    <div 
                      className={`h-20 rounded-md`} 
                      style={{ backgroundColor: `hsl(var(--secondary-${weight}))` }}
                    />
                    <div className="text-sm font-mono">secondary-{weight}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">State Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-20 rounded-md bg-success" />
                  <div className="text-sm font-mono">success</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 rounded-md bg-warning" />
                  <div className="text-sm font-mono">warning</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 rounded-md bg-destructive" />
                  <div className="text-sm font-mono">destructive</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-20 rounded-md bg-info" />
                  <div className="text-sm font-mono">info</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Buttons */}
        <TabsContent value="buttons" className="mt-6">
          <h2 className="text-3xl font-bold mb-6">Buttons</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
                <Button variant="premium">Premium</Button>
                <Button variant="bordered">Bordered</Button>
                <Button variant="glass">Glass</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon">
                  <span className="sr-only">Icon button</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth className="mb-2">Full Width</Button>
                <Button rounded>Rounded</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Form Inputs */}
        <TabsContent value="inputs" className="mt-6">
          <h2 className="text-3xl font-bold mb-6">Form Inputs</h2>
          
          <div className="grid gap-8">
            <div className="grid gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Enter your email" />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="Enter your password" />
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="textarea">Message</Label>
                <Textarea id="textarea" placeholder="Type your message here" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Checkbox</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Switch</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Radio Group</h3>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Select</h3>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Feedback */}
        <TabsContent value="feedback" className="mt-6">
          <h2 className="text-3xl font-bold mb-6">Feedback Components</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Alerts</h3>
              <div className="grid gap-4">
                <Alert>
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>This is an informational alert.</AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>This is an error alert.</AlertDescription>
                </Alert>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Toast</h3>
              <Button
                onClick={() => {
                  toast({
                    title: "Toast Notification",
                    description: "This is a toast notification example.",
                  })
                }}
              >
                Show Toast
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Cards */}
        <TabsContent value="cards" className="mt-6">
          <h2 className="text-3xl font-bold mb-6">Cards</h2>
          
          <div className="grid gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Basic Card</h3>
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description text goes here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.</p>
                </CardContent>
                <CardFooter>
                  <Button>Action</Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>With badge and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <Badge>Featured</Badge>
                    <div className="flex space-x-2">
                      <Button size="icon" variant="ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                      </Button>
                      <Button size="icon" variant="ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                      </Button>
                    </div>
                  </div>
                  <p>This card demonstrates additional features like badges and action buttons.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button>Continue</Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Accent Card</CardTitle>
                  <CardDescription className="text-primary-foreground/80">With custom background</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This card uses a primary background color for emphasis.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 