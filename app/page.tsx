import Image from 'next/image'
import Link from 'next/link'
import { CategoryTag } from '@/components/CategoryTag'

const featuredArticle = {
  title: "The Future of Democracy in the Digital Age",
  excerpt: "As technology continues to reshape our world, how can we ensure democratic institutions remain strong and accountable?",
  author: "Sarah Chen",
  date: "February 2024",
  category: "Politics",
  image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
}

const latestArticles = [
  {
    title: "The Art of Slow Living",
    excerpt: "In an age of constant connectivity, finding moments of stillness becomes an act of resistance.",
    author: "Michael Roberts",
    date: "February 2024",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "The Ethics of Artificial Intelligence",
    excerpt: "As AI systems become more sophisticated, we must grapple with questions of consciousness and responsibility.",
    author: "Dr. Emily Zhang",
    date: "February 2024",
    category: "Ideas",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "The New Urban Renaissance",
    excerpt: "How cities are reimagining public space in the post-pandemic world.",
    author: "James Wilson",
    date: "February 2024",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Featured Article */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={featuredArticle.image}
            alt={featuredArticle.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <CategoryTag 
              category={featuredArticle.category}
              variant="default"
              size="md"
              className="bg-opacity-25 backdrop-blur-sm bg-black text-white border-white/30 mb-4 inline-block"
            />
            <h1 className="mt-4 text-fluid-4xl md:text-fluid-5xl font-serif font-bold leading-tight space-fluid-4">
              {featuredArticle.title}
            </h1>
            <p className="text-fluid-xl leading-snug space-fluid-5">
              {featuredArticle.excerpt}
            </p>
            <div className="mt-8 flex items-center">
              <span className="text-fluid-sm">
                By {featuredArticle.author} • {featuredArticle.date}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-fluid-3xl font-serif font-bold space-fluid-6 text-foreground">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article, index) => (
              <article key={index} className="group rhythm">
                <div className="relative h-64 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="rhythm-tight">
                  <CategoryTag 
                    category={article.category}
                    size="sm"
                    variant="default"
                    href={`/${article.category.toLowerCase()}`}
                  />
                  <h3 className="text-fluid-xl font-serif font-bold leading-snug text-foreground">
                    <Link href="#" className="hover:text-accent transition-colors">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-fluid-base text-gray-800">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-fluid-sm text-gray-700">
                    <span>By {article.author} • {article.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center rhythm">
            <h2 className="text-fluid-3xl font-serif font-bold space-fluid-2">Stay Updated</h2>
            <p className="text-fluid-lg text-gray-700 dark:text-gray-300 space-fluid-5">
              Subscribe to our newsletter for weekly insights and analysis.
            </p>
            <form className="flex flex-col gap-4 text-left">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 text-gray-900 placeholder-gray-500"
                  aria-label="Email address"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800 transition-colors sm:w-auto w-full"
                >
                  Subscribe
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                I agree to receive the ActaMundi newsletter and understand that I can unsubscribe at any time.
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
} 