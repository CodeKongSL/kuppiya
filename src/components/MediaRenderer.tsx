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
        alt={media.alt || 'Option image'} 
        className={`max-w-xs max-h-48 h-auto rounded-md object-contain ${className}`}
      />
    );
  }

  // Handle text type or fallback
  return <span className={className}>{media.text || ''}</span>;
};
