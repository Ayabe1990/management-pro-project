import React from 'react';

interface SplashScreenProps {
  onVideoEnd: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onVideoEnd }) => {
  // Use a direct-access link for the Google Drive video
  const videoSrc = "https://drive.google.com/uc?id=1KtkxBr5CV_HFIZiaTHnNVhib2cctWqvH";

  return (
    <div className="fixed inset-0 w-screen h-screen bg-dark-bg z-[100]">
      <video
        autoPlay
        muted
        playsInline
        onEnded={onVideoEnd}
        onError={onVideoEnd} // Fallback in case the video fails to load
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button 
        onClick={onVideoEnd} 
        className="absolute bottom-8 right-8 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition animate-fade-in"
        style={{ animationDelay: '2s' }}
      >
        Skip
      </button>
    </div>
  );
};

export default SplashScreen;
