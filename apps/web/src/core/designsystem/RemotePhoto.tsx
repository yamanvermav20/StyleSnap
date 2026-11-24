import { useState } from 'react'
import { AppIcons } from '#/generated/icons'

/** A remote photo on a surfaceVariant box. A missing image shows the noImage icon. */
export function RemotePhoto({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div className={`relative overflow-hidden bg-surface-variant ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
          <AppIcons.noImage className="size-icon-lg" />
        </span>
      )}
    </div>
  )
}
