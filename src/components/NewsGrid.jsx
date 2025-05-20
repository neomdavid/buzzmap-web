import { useEffect } from 'react';

const NewsGrid = ({ articles = [] }) => {
  useEffect(() => {
    if (!Array.isArray(articles)) {
      console.warn('Articles is not an array');
      return;
    }
  }, [articles]);

  if (!Array.isArray(articles)) {
    return <p>No articles available</p>;
  }

  if (articles.length === 0) {
    return <p>No articles available</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((article, index) => {
        if (!article) {
          return null;
        }
        
        const imageUrl = article.image || article.images?.[0] || patientImg;
        
        return (
          <div key={index} className="flex flex-col gap-4">
            <img 
              src={imageUrl}
              alt={article.title || 'Article image'}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = patientImg;
              }}
            />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">{article.date}</p>
              <h3 className="text-xl font-bold">{article.title}</h3>
              <p className="text-gray-600">{article.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NewsGrid; 