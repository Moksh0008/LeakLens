import { useCallback, useRef, useState } from 'react'
import { FileIcon, UploadIcon } from './icons'

// Drag-and-drop zone for selecting a procurement CSV file.
// Emits the chosen file through onFileSelected; parent handles validation.
export default function FileDropzone({ onFileSelected, disabled = false }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const openFilePicker = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled],
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      if (disabled) return
      const [file] = event.dataTransfer.files ?? []
      if (file) onFileSelected(file)
    },
    [disabled, onFileSelected],
  )

  const handleInputChange = useCallback(
    (event) => {
      const [file] = event.target.files ?? []
      if (file) onFileSelected(file)
      event.target.value = ''
    },
    [onFileSelected],
  )

  return (
    <div
      className={[
        'upload-dropzone',
        isDragging ? 'upload-dropzone--dragging' : '',
        disabled ? 'upload-dropzone--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload procurement data (CSV)"
      onClick={openFilePicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFilePicker()
        }
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="upload-dropzone__icon" aria-hidden="true">
        <UploadIcon />
      </span>
      <p className="upload-dropzone__title">
        Drag &amp; drop your procurement CSV here
      </p>
      <p className="upload-dropzone__hint">
        or click to browse files on your computer
      </p>
      <div className="upload-dropzone__formats">
        <span className="upload-dropzone__badge">
          <FileIcon width={12} height={12} /> CSV
        </span>
      </div>
      <input
        ref={inputRef}
        className="upload-dropzone__input"
        type="file"
        accept=".csv,text/csv"
        aria-label="Select a procurement CSV file"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  )
}
