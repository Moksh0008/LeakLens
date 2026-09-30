import { AlertIcon, InfoIcon } from './icons'

// Status panel used for in-progress and error states during upload and analysis.
export default function UploadStatus({ tone = 'info', title, message, showProgress = false, progress = 0 }) {
  return (
    <div
      className="upload-status"
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <span className={`upload-status__icon upload-status__icon--${tone}`} aria-hidden="true">
        {tone === 'error' ? <AlertIcon /> : <InfoIcon />}
      </span>
      <div className="upload-status__body">
        <span className="upload-status__title">{title}</span>
        {message && <span className="upload-status__message">{message}</span>}
        {showProgress && (
          <span
            className="upload-status__bar"
            role="progressbar"
            aria-label={`${title} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span
              className="upload-status__bar-fill"
              style={{
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </span>
        )}
      </div>
    </div>
  )
}
