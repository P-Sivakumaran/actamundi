'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function TypographyDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Fluid Typography</h3>
        <p className="text-muted-foreground mb-6">
          Fluid typography scales smoothly between screen sizes using clamp() for better readability. Text will always be perfectly sized for any viewport.
        </p>
        
        <div className="grid gap-4 p-4 border rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-xs">text-fluid-xs</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-sm">text-fluid-sm</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(0.875rem, 0.8rem + 0.375vw, 1rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-base">text-fluid-base</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(1rem, 0.9rem + 0.5vw, 1.125rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-lg">text-fluid-lg</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(1.125rem, 1rem + 0.625vw, 1.25rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-xl">text-fluid-xl</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(1.25rem, 1.125rem + 0.75vw, 1.5rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-2xl">text-fluid-2xl</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-3xl">text-fluid-3xl</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
            <div className="text-fluid-4xl">text-fluid-4xl</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(2.25rem, 1.75rem + 2.5vw, 3rem)</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-fluid-5xl">text-fluid-5xl</div>
            <div className="font-mono text-xs text-muted-foreground">clamp(3rem, 2.25rem + 3.75vw, 4rem)</div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Fluid Spacing</h3>
        <p className="text-muted-foreground mb-6">
          Fluid spacing adjusts margins and padding proportionally to screen size for consistent visual rhythm across devices.
        </p>
        
        <div className="grid gap-4 p-4 border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-mono text-sm">.space-fluid-2</div>
              <div className="mt-1 text-xs text-muted-foreground">clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)</div>
            </div>
            <div className="w-1/2 bg-muted p-1 rounded-md">
              <div className="h-4 bg-primary/20 rounded space-fluid-2"></div>
              <div className="h-4 bg-primary/40 rounded"></div>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-mono text-sm">.space-fluid-4</div>
              <div className="mt-1 text-xs text-muted-foreground">clamp(1rem, 0.8rem + 1vw, 1.5rem)</div>
            </div>
            <div className="w-1/2 bg-muted p-1 rounded-md">
              <div className="h-4 bg-primary/20 rounded space-fluid-4"></div>
              <div className="h-4 bg-primary/40 rounded"></div>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-mono text-sm">.space-fluid-6</div>
              <div className="mt-1 text-xs text-muted-foreground">clamp(2rem, 1.6rem + 2vw, 3rem)</div>
            </div>
            <div className="w-1/2 bg-muted p-1 rounded-md">
              <div className="h-4 bg-primary/20 rounded space-fluid-6"></div>
              <div className="h-4 bg-primary/40 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Text Alignment Responsive Control</h3>
        <p className="text-muted-foreground mb-6">
          Text alignment can be controlled at different breakpoints for optimal readability across devices.
        </p>
        
        <div className="grid gap-4 p-4 border rounded-lg">
          <div className="border rounded-lg p-4 text-left sm:text-center md:text-right">
            <p className="font-mono text-sm mb-2">text-left sm:text-center md:text-right</p>
            <p>This text changes alignment based on screen size. Resize the browser to see it change.</p>
          </div>
          
          <div className="border rounded-lg p-4 text-center sm:text-left">
            <p className="font-mono text-sm mb-2">text-center sm:text-left</p>
            <p>Centered on mobile, but left-aligned on larger screens.</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Vertical Rhythm</h3>
        <p className="text-muted-foreground mb-6">
          Consistent spacing between elements creates a pleasing visual rhythm and improves readability.
        </p>
        
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="border rounded-lg p-4">
            <p className="font-mono text-sm mb-4">Default spacing (inconsistent)</p>
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="text-lg font-semibold">Heading</h4>
              <p className="mt-2">This is a paragraph with default spacing.</p>
              <p className="mt-4">Inconsistent spacing creates visual discord.</p>
              <p className="mt-3">And makes content harder to scan.</p>
              <button className="mt-6 px-4 py-2 bg-primary text-white rounded-md">Button</button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <p className="font-mono text-sm mb-4">With rhythm (consistent)</p>
            <div className="border rounded-lg p-4 bg-muted/20 rhythm">
              <h4 className="text-lg font-semibold">Heading</h4>
              <p>This is a paragraph with rhythm spacing.</p>
              <p>Consistent spacing creates visual harmony.</p>
              <p>And makes content easier to scan.</p>
              <button className="px-4 py-2 bg-primary text-white rounded-md">Button</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 