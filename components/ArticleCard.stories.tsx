import type { Meta, StoryObj } from '@storybook/react';
import { ArticleCard } from './ArticleCard';

const meta = {
  title: 'Components/ArticleCard',
  component: ArticleCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    article: { control: 'object' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Example article data
const sampleArticle = {
  _id: '1',
  title: 'Understanding Container Queries in Modern CSS',
  content: 'This is a long content that would be shown in the full article page...',
  excerpt: 'Container queries allow you to apply styles based on the size of a containing element rather than the viewport. This revolutionary approach enables truly responsive components.',
  coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
  category: 'Web Development',
  status: 'published' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  slug: 'understanding-container-queries',
  readingTime: 5,
  tags: ['CSS', 'Web Development', 'Responsive Design', 'Frontend'],
};

// Stories
export const Default: Story = {
  args: {
    article: sampleArticle,
  },
};

export const NoImage: Story = {
  args: {
    article: {
      ...sampleArticle,
      coverImage: undefined,
    },
  },
};

export const Draft: Story = {
  args: {
    article: {
      ...sampleArticle,
      status: 'draft',
    },
  },
};

export const LongTitle: Story = {
  args: {
    article: {
      ...sampleArticle,
      title: 'This is an extremely long title that will potentially wrap to multiple lines and test how the component handles such scenarios in different container sizes',
    },
  },
};

// To demonstrate container queries, wrap the story in different widths
export const InNarrowContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '300px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    article: sampleArticle,
  },
};

export const InMediumContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '500px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    article: sampleArticle,
  },
};

export const InWideContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    article: sampleArticle,
  },
}; 