import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../../data/blogData';
import SEO from '../../components/seo/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO 
        title="Car Cleaning & Detailing Blog | VaCar Kanpur"
        description="Read our latest articles and tips on car maintenance, ceramic coating, deep interior cleaning, and seasonal car care."
      />
      
      {/* Header */}
      <div className="bg-[#070C16] text-white pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">
            VaCar Detailing <span className="text-[#F4B400]">Journal</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Expert advice, maintenance tips, and the latest news from the auto detailing industry.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col transition-transform hover:-translate-y-2">
              <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                  {post.tags[0]}
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold mb-3">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                </div>
                <Link to={`/blog/${post.slug}`} className="block group">
                  <h2 className="text-xl font-heading font-bold text-dark mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline mt-auto">
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
