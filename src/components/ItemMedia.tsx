import { useEffect, useState } from 'react';
import { getItemReference } from '../domain/referenceDisplay';
import type { ReferenceSnapshot } from '../domain/types';

function initials(item: string | undefined): string {
  return (item ?? '?')
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function ItemIcon({ reference, item }: { reference: ReferenceSnapshot; item: string | undefined }) {
  const [imageIndex, setImageIndex] = useState(0);
  const itemReference = getItemReference(reference, item);
  const imageCandidates = itemReference?.image
    ? [itemReference.image, ...(itemReference.imageFallbacks ?? [])]
    : [];
  const image = imageCandidates[imageIndex];

  useEffect(() => {
    setImageIndex(0);
  }, [itemReference?.id]);

  return (
    <span className="item-icon" aria-hidden="true">
      {image ? (
        <img
          alt=""
          loading="lazy"
          src={image}
          onError={() => setImageIndex((currentIndex) => currentIndex + 1)}
        />
      ) : (
        <span>{initials(item)}</span>
      )}
    </span>
  );
}
