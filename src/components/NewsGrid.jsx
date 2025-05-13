import { useEffect } from 'react';

const NewsGrid = ({ articles = [] }) => {
  useEffect(() => {
    console.log('%c ===== NewsGrid Component Mounted =====', 'background: #222; color: #bada55');
    console.log('%c Props received:', 'background: #222; color: #bada55', { articles });
    console.log('%c Articles array:', 'background: #222; color: #bada55', articles);
    console.log('%c Articles length:', 'background: #222; color: #bada55', articles?.length);
    console.log('%c Articles type:', 'background: #222; color: #bada55', typeof articles);
    console.log('%c Is Array?', 'background: #222; color: #bada55', Array.isArray(articles));
  }, [articles]);

  if (!Array.isArray(articles)) {
    console.log('%c ERROR: Articles is not an array:', 'background: #222; color: #ff0000', articles);
    return <p>No articles available</p>;
  }

  if (articles.length === 0) {
    console.log('%c WARNING: Empty articles array received', 'background: #222; color: #ffa500');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((article, index) => {
        console.log('%c Processing article ' + index + ':', 'background: #222; color: #bada55', article);
        
        if (!article) {
          console.log('%c ERROR: Null article at index:', 'background: #222; color: #ff0000', index);
          return null;
        }
        
        const imageUrl = article.image || article.images?.[0] || patientImg;
        console.log('%c Article ' + index + ' details:', 'background: #222; color: #bada55', {
          title: article.title,
          date: article.date,
          imageUrl: imageUrl
        });
        
        return (
          <div key={index} className="flex flex-col gap-4">
            <img 
              src={imageUrl}
              alt={article.title || 'Article image'}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                console.log('%c Image failed to load:', 'background: #222; color: #ff0000', imageUrl);
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