import { css } from 'styled-components';
import { tokens } from './theme';

type Theme = typeof tokens;

/**
 * Utility to access theme values in styled-components
 * 
 * Example:
 * const Button = styled.button`
 *   ${theme('colors.primary')};
 *   font-family: ${theme('fontFamily.sans')};
 * `;
 */
export const theme = <K extends keyof Theme>(key: K) => 
  (props: { theme: Theme }) => {
    const parts = key.toString().split('.');
    let value: any = props.theme;
    
    for (const part of parts) {
      if (value[part] === undefined) {
        console.warn(`Theme key "${key}" not found in theme`);
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  };

/**
 * Utility to create media queries that match Tailwind breakpoints
 * 
 * Example:
 * const Container = styled.div`
 *   width: 100%;
 *   
 *   ${media.sm`
 *     width: 540px;
 *   `}
 * `;
 */
export const media = {
  sm: (styles: TemplateStringsArray, ...args: any[]) => css`
    @media (min-width: 640px) {
      ${css(styles, ...args)}
    }
  `,
  md: (styles: TemplateStringsArray, ...args: any[]) => css`
    @media (min-width: 768px) {
      ${css(styles, ...args)}
    }
  `,
  lg: (styles: TemplateStringsArray, ...args: any[]) => css`
    @media (min-width: 1024px) {
      ${css(styles, ...args)}
    }
  `,
  xl: (styles: TemplateStringsArray, ...args: any[]) => css`
    @media (min-width: 1280px) {
      ${css(styles, ...args)}
    }
  `,
  '2xl': (styles: TemplateStringsArray, ...args: any[]) => css`
    @media (min-width: 1536px) {
      ${css(styles, ...args)}
    }
  `,
};

/**
 * Utility for container queries that match Tailwind's approach
 */
export const container = {
  sm: (styles: TemplateStringsArray, ...args: any[]) => css`
    @container (min-width: 640px) {
      ${css(styles, ...args)}
    }
  `,
  md: (styles: TemplateStringsArray, ...args: any[]) => css`
    @container (min-width: 768px) {
      ${css(styles, ...args)}
    }
  `,
  lg: (styles: TemplateStringsArray, ...args: any[]) => css`
    @container (min-width: 1024px) {
      ${css(styles, ...args)}
    }
  `,
};

/**
 * Creates a fluid typography value that scales between breakpoints
 * 
 * Example:
 * const Heading = styled.h1`
 *   font-size: ${fluidType(1.5, 2.5)}; // scales from 1.5rem to 2.5rem
 * `;
 */
export const fluidType = (minSize: number, maxSize: number, minScreen = 30, maxScreen = 80) => css`
  font-size: ${minSize}rem;
  
  @media screen and (min-width: ${minScreen}rem) {
    font-size: calc(${minSize}rem + (${maxSize} - ${minSize}) * (100vw - ${minScreen}rem) / (${maxScreen} - ${minScreen}));
  }
  
  @media screen and (min-width: ${maxScreen}rem) {
    font-size: ${maxSize}rem;
  }
`; 