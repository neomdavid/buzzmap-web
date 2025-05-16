import React from 'react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ArticlesCard = ({ image, date, title, summary, onReadMore }) => (
  <article className="flex flex-col rounded-3xl overflow-hidden bg-primary text-white pb-10 shadow-sm">
    <img src={image} alt={title} className="h-75 w-full object-cover" />
    <p className="text-3xl font-extrabold tracking-[.5px] mx-12 mt-10 mb-4">{title}</p>
    <p className="text-lg font-semibold mx-12 mb-6">{formatDate(date)}</p>
    <p className="mx-14 font-light mb-8 line-clamp-3">{summary}</p>
    <button className="text-primary mb-10 rounded-3xl font-bold py-3 px-12 bg-gradient-to-b from-[#FADD37] to-[#F8A900] self-center hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70" onClick={onReadMore}>Read More...</button>
  </article>
);

export default ArticlesCard; 