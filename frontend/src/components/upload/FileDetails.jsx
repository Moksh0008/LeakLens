import { FileIcon } from './icons'

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Details card for the currently selected procurement CSV file.
export default function FileDetails({ file, onRemove, disabled = false }) {
  return (
    <div className="upload-file">
      <span className="upload-file__icon" aria-hidden="true">
        <FileIcon />
      </span>
      <div className="upload-file__meta">
        <span className="upload-file__name">{file.name}</span>
        <span className="upload-file__details">
          {file.type || 'text/csv'} &middot; {formatFileSize(file.size)}
        </span>
      </div>
      <button
        type="button"
        className="upload-file__remove"
        onClick={onRemove}
        disabled={disabled}
      >
        Remove
      </button>
    </div>
  )
}
