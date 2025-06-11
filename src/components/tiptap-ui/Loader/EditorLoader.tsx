import React from 'react';

const EditorLoader = () => {
  return (
    <div className="w-full border border-gray-200 rounded-md overflow-hidden">
      {/* Header shimmer */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Toolbar shimmer */}
      <div className="py-1 px-2 border-b border-gray-200 flex gap-2 bg-white justify-center items-center">
        {/* {[...Array(23)].map((_, i) => (
          <div 
            key={i} 
            className="h-8 w-8 bg-gray-200 rounded animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          ></div>
        ))} */}
      </div>
      
      {/* Content area shimmer */}
      <div className="p-4 min-h-64 bg-white">
        <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded mb-4 animate-pulse"></div>
        
        <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-4/6 bg-gray-200 rounded mb-4 animate-pulse"></div>
      </div>
      
      {/* Overlay with loading indicator */}
      {/* <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-600">Initializing editor...</p>
        </div>
      </div> */}
    </div>
  );
};

export default EditorLoader;