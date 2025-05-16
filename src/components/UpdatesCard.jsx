import React from 'react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const UpdatesCard = ({ image, date, title, summary, onReadMore, bgColor = "bg-white" }) => {
  const textColor = bgColor === "bg-primary" ? "text-white" : "text-primary";
  
  return (
    <article className={`flex flex-col pb-10 ${bgColor} ${textColor} rounded-3xl overflow-hidden shadow-sm`}>
      <img src={image} alt={title} className="h-75 w-full object-cover" />
      <p className="mt-10 text-4xl font-[900] uppercase tracking-[.5px] mb-2">{formatDate(date)}</p>
      <p className="text-lg font-bold uppercase mb-4">{title}</p>
      <p className="mx-12 mb-4 line-clamp-3">{summary}</p>
      <button
        onClick={onReadMore}
        className="rounded-3xl text-primary font-bold py-3 px-12 bg-gradient-to-b from-[#FADD37] to-[#F8A900] self-center hover:cursor-pointer hover:scale-105 transition-transform duration-300 active:opacity-70"
      >
        Read More...
      </button>
    </article>
  );
};

export default UpdatesCard; 