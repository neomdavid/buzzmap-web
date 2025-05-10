
const NewsGrid = ({ articles = [] }) => {
  // Add a more visible console log
  console.log('%c NewsGrid Component Rendered', 'background: #222; color: #bada55');
  console.log('%c Articles received:', 'background: #222; color: #bada55', articles);

  if (!Array.isArray(articles)) {
    console.log('%c Articles is not an array:', 'background: #222; color: #ff0000', articles);
    return <p>No articles available</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((article, index) => {
        if (!article) {
          console.log('%c Null article at index:', 'background: #222; color: #ff0000', index);
          return null;
        }
        
        console.log('%c Processing article:', 'background: #222; color: #bada55', article);
        
        // Add fallback for image
        const imageUrl = article.image || article.images?.[0] || patientImg;
        console.log('%c Image URL:', 'background: #222; color: #bada55', imageUrl);
        
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