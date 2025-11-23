import { Media } from "@/chemistry/models/ChemistryQuestion";

interface MediaRendererProps {
  media: Media | string;
  className?: string;
}

export const MediaRenderer = ({ media, className = "" }: MediaRendererProps) => {
  // Handle legacy string format
  if (typeof media === 'string') {
    return <span className={className}>{media}</span>;
  }

  // Handle Media object
  if (media.type === 'image' && media.url) {
    return (
      <img 
        src={media.url} 
        alt={media.alt || 'Question image'} 
        className={`max-w-full h-auto rounded-md ${className}`}
      />
    );
  }

  // Handle text type or fallback
  return <span className={className}>{media.text || ''}</span>;
};
