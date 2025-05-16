import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuzzLineFooter from '../../components/BuzzLineFooter';
import UpdatesCard from '../../components/UpdatesCard';
import { useGetAllAdminPostsQuery } from '../../api/dengueApi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const Updates = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const { data: adminPosts, isLoading } = useGetAllAdminPostsQuery();
  const updates = adminPosts?.filter(post => post.category === 'news') || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % updates.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = document.getElementById(`item${current + 1}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }, [current]);

  const handleReadMore = (update) => {
    navigate(`/buzzline/${update._id}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-between p-10">
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-16">
        <div className="carousel w-full h-[500px] overflow-x-auto whitespace-nowrap">
          {updates.map((update, idx) => (
            <div
              key={update._id}
              id={`item${idx + 1}`}
              className="carousel-item inline-block w-full h-full relative"
            >
              <img src={update.images && update.images.length > 0 ? update.images[0] : undefined} className="w-full h-full object-cover rounded-xl" alt={`slide ${idx + 1}`} />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-10 px-13 rounded-b-xl">
                <p className="text-white text-3xl font-extrabold drop-shadow-lg mb-2">Latest - Published on</p>
                <p className="text-white text-6xl font-extrabold uppercase mb-4 drop-shadow-lg">{update.publishDate ? formatDate(update.publishDate) : ''}</p>
                <p className="text-white text-lg drop-shadow-lg">{update.content}</p>
                <button className="absolute bottom-6 right-6 bg-white/80 rounded-full p-2">
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center gap-2 py-2 mt-5 mb-10">
          {updates.map((_, idx) => (
            <button
              key={idx}
              className={`btn btn-md ${current === idx ? 'btn-primary' : ''}`}
              onClick={() => setCurrent(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 text-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 w-full gap-12 mt-8">
          {updates.map((update) => (
            <UpdatesCard
              key={update._id}
              image={update.images && update.images.length > 0 ? update.images[0] : undefined}
              date={update.publishDate ? formatDate(update.publishDate) : ''}
              title={update.title}
              summary={update.content}
              onReadMore={() => handleReadMore(update)}
              bgColor="bg-primary"
            />
          ))}
        </div>
      </div>
      <BuzzLineFooter />
    </main>
  );
};

export default Updates;
