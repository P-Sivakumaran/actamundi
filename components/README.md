# Components Directory

This directory contains all React components used in the ActaMundi application. The components are organized into the following subdirectories:

## Directory Structure

### `/ui`
Reusable UI components that are not specific to any feature. These components are the building blocks of the application's interface.

- Basic elements (buttons, inputs, forms)
- Complex components (dialogs, dropdowns, tooltips)
- Layout components (cards, containers)
- Utility components (toasts, alerts)

### `/providers`
Context providers and higher-order components that manage application state and provide functionality to child components.

### `/articles`
Components specific to article-related features:
- ArticleCard: Displays article previews
- ArticlePreview: Shows article content
- ArticleSearch: Handles article search functionality

### `/truth-verification`
Components for the truth verification system:
- TruthVerification: Main component for managing claims and verifications
- useTruthVerification: Custom hook for contract interactions
- types: TypeScript interfaces and contract ABI definitions

## Component Guidelines

1. **File Organization**
   - Each component should be in its own file
   - Related components should be grouped in appropriate subdirectories
   - Keep component files under 200 lines when possible
   - Split large components into smaller, focused components

2. **Naming Conventions**
   - Use PascalCase for component files and components
   - Use descriptive names that indicate the component's purpose
   - Suffix provider components with "Provider"
   - Use kebab-case for utility files (e.g., `use-truth-verification.ts`)

3. **Component Structure**
   - Place client components in separate files with 'use client' directive
   - Keep components focused and single-responsibility
   - Use TypeScript for type safety
   - Include proper prop types and documentation
   - Extract reusable logic into custom hooks

4. **Best Practices**
   - Use composition over inheritance
   - Keep components pure when possible
   - Implement proper error boundaries
   - Follow accessibility guidelines
   - Use Tailwind CSS for styling
   - Handle loading and error states appropriately

## Adding New Components

When adding new components:
1. Choose the appropriate subdirectory based on the component's purpose
2. Follow the established naming conventions
3. Include proper TypeScript types and documentation
4. Consider component reusability and maintainability
5. Split large components into smaller, focused pieces
6. Extract reusable logic into custom hooks 