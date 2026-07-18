import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { blogPosts } from '../../data/blogData';
import SEO from '../../components/seo/SEO';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Generate Article JSON-LD Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [post.coverImage],
    "datePublished": post.date,
    "author": [{
        "@type": "Person",
        "name": post.author,
        "url": "https://vacarcleaningservice.com/about"
      }]
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <SEO 
        title={`${post.title} | VaCar Blog`}
        description={post.excerpt}
        canonicalUrl={`https://vacarcleaningservice.com/blog/${post.slug}`}
        type="article"
        image={post.coverImage}
        schema={articleSchema}
      />

      {/* Hero Header */}
      <div className="relative pt-32 pb-40 text-white flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-dark z-10 opacity-70" />
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="container mx-auto px-4 relative z-20 max-w-4xl pt-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-[#F4B400] font-bold text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
             {post.tags.map(tag => (
                <span key={tag} className="bg-[#F4B400]/20 text-[#F4B400] border border-[#F4B400]/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
             ))}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm font-semibold text-gray-300">
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#F4B400]" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            <span className="flex items-center gap-2"><User size={16} className="text-[#F4B400]" /> {post.author}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 relative z-30 -mt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 max-w-4xl mx-auto border border-gray-100">
          <div className="prose prose-lg md:prose-xl prose-indigo max-w-none text-gray-700
             prose-headings:font-heading prose-headings:font-bold prose-headings:text-dark
             prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
             prose-p:leading-relaxed prose-p:mb-6
             prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
             prose-li:my-2 prose-ul:my-6
          " dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {/* Internal Linking CTA */}
          <div className="mt-16 bg-blue-50 border-l-4 border-primary p-6 rounded-r-xl">
             <h3 className="font-heading font-bold text-xl text-dark mb-2">Need Professional Help?</h3>
             <p className="text-gray-700 mb-4">VaCar Cleaning Service offers premium doorstep detailing in Kanpur. Let our experts handle it while you relax.</p>
             <Link to="/book" className="inline-flex bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
               Book a Service Now
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
