import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuzzLineFooter from '../../components/BuzzLineFooter';
import ArticlesCard from '../../components/ArticlesCard';
import { useGetAllAdminPostsQuery } from '../../api/dengueApi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const Articles = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery();
  const articles = adminPosts?.filter(post => post.category === 'tip') || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = document.getElementById(`item${current + 1}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }, [current]);

  const handleReadMore = (article) => {
    navigate(`/buzzline/${article._id}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-10">
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-16">
        <div className="carousel w-full h-[500px] overflow-x-auto whitespace-nowrap">
          {articles.map((article, idx) => (
            <div
              key={article._id}
              id={`item${idx + 1}`}
              className="carousel-item inline-block w-full h-full relative"
            >
              <img src={article.images && article.images.length > 0 ? article.images[0] : undefined} className="w-full h-full object-cover rounded-xl" alt={`slide ${idx + 1}`} />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-10 px-13 rounded-b-xl">
                <p className="text-white text-3xl font-extrabold drop-shadow-lg mb-2">#QCESDhelps - Published on</p>
                <p className="text-white text-6xl font-extrabold uppercase mb-4 drop-shadow-lg">{article.publishDate ? formatDate(article.publishDate) : ''}</p>
                <p className="text-white text-lg drop-shadow-lg">{article.content}</p>
                <button className="absolute bottom-6 right-6 bg-white/80 rounded-full p-2">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center gap-2 py-2 mt-5 mb-10">
          {articles.map((_, idx) => (
            <button
              key={idx}
              className={`btn btn-md ${current === idx ? 'btn-primary' : ''}`}
              onClick={() => setCurrent(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 text-white">
          {articles.map((article) => (
            <ArticlesCard
              key={article._id}
              image={article.images && article.images.length > 0 ? article.images[0] : undefined}
              date={article.publishDate ? formatDate(article.publishDate) : ''}
              title={article.title}
              summary={article.content}
              onReadMore={() => handleReadMore(article)}
            />
          ))}
        </div>
      </div>
      <BuzzLineFooter />
    </main>
  );
};

export default Articles; 