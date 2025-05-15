'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import styled from 'styled-components'

// Example styled component that we create inline
const StyledHeading = styled.h1`
  font-size: 3rem;
  font-family: var(--font-playfair);
  background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  
  @container (min-width: 640px) {
    padding: 3rem;
  }
`

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`

const Card = styled.div`
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`

export default function DemoPage() {
  return (
    <div className="@container">
      <StyledContainer>
        <StyledHeading>Enhanced UI Framework</StyledHeading>
        
        <Card>
          <h2 className="text-2xl font-serif mb-4">Hybrid Approach</h2>
          <p className="text-muted-foreground mb-4">
            This demo showcases a hybrid approach combining Tailwind CSS with styled-components.
            This gives us the best of both worlds: Tailwind's utility classes for rapid development
            and styled-components for complex, dynamic styling.
          </p>
        </Card>
        
        <h2 className="text-2xl font-serif mt-8 mb-4">UI Components with Tailwind</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="default" size="default">Default Button</Button>
          <Button variant="destructive" size="default">Destructive Button</Button>
          <Button variant="outline" size="default">Outline Button</Button>
          <Button variant="secondary" size="default">Secondary Button</Button>
          <Button variant="ghost" size="default">Ghost Button</Button>
          <Button variant="link" size="default">Link Button</Button>
        </div>
        
        <h2 className="text-2xl font-serif mt-8 mb-4">Styled Components</h2>
        
        <ButtonGrid>
          {/* Create styled buttons dynamically */}
          {['primary', 'secondary', 'success', 'warning', 'danger', 'info'].map((color) => (
            <button
              key={color}
              className={`bg-${color === 'primary' ? 'primary' : color === 'secondary' ? 'secondary' : color} 
                         text-white px-4 py-2 rounded hover:opacity-90 transition-opacity`}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </ButtonGrid>
        
        <h2 className="text-2xl font-serif mt-8 mb-4">Container Queries Demo</h2>
        <p className="mb-4">Resize the browser to see different layouts based on container size, not just viewport:</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="@container bg-card rounded-lg p-6 shadow-md">
            <h3 className="text-xl @lg:text-2xl font-serif mb-4">Container One</h3>
            <p className="text-muted-foreground @md:text-base @lg:text-lg">
              This container adapts its layout based on its own width, not the viewport width.
              Try resizing the browser window and watch how content in both containers adapts differently.
            </p>
          </div>
          
          <div className="@container bg-card rounded-lg p-6 shadow-md">
            <h3 className="text-xl @lg:text-2xl font-serif mb-4">Container Two</h3>
            <div className="@md:flex items-center gap-4">
              <div className="@md:w-1/3 mb-4 @md:mb-0">
                <div className="aspect-square bg-muted rounded-md"></div>
              </div>
              <div className="@md:w-2/3">
                <p className="text-muted-foreground">
                  This container has different layout at different container sizes. 
                  At narrow widths, elements stack vertically. At wider container widths,
                  they display side by side.
                </p>
              </div>
            </div>
          </div>
        </div>
      </StyledContainer>
    </div>
  )
} 