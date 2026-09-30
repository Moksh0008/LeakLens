import { CheckIcon, FileIcon } from './icons'

// Formats a number as currency for the potential leakage figure.
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

// Success summary rendered after procurement analysis completes.
// Displays only the values returned by the analysis API.
export default function AnalysisSummary({ fileName, result, onContinue }) {
  return (
    <section className="upload-summary" aria-label="Analysis summary">
      <div className="upload-summary__headline">
        <span className="upload-summary__headline-icon" aria-hidden="true">
          <CheckIcon />
        </span>
        <div>
          <p className="upload-summary__headline-title">Analysis complete</p>
          <p className="upload-summary__headline-text">
            The procurement dataset was processed successfully. The summary below
            highlights transactions that may require investigation.
          </p>
        </div>
      </div>

      <div className="upload-summary__grid">
        <div className="upload-summary__item">
          <span className="upload-summary__item-label">Transactions Analyzed</span>
          <span className="upload-summary__item-value">
            {result.transactionsAnalyzed.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="upload-summary__item">
          <span className="upload-summary__item-label">Suspicious Transactions</span>
          <span className="upload-summary__item-value upload-summary__item-value--warning">
            {result.suspiciousTransactions.toLocaleString('en-IN')}
          </span>
          <span className="upload-summary__item-note">Requires investigation</span>
        </div>
        <div className="upload-summary__item">
          <span className="upload-summary__item-label">Potential Leakage</span>
          <span className="upload-summary__item-value upload-summary__item-value--danger">
            {formatCurrency(result.potentialLeakage)}
          </span>
          <span className="upload-summary__item-note">Potential excess cost</span>
        </div>
      </div>

      <div className="upload-summary__file">
        <FileIcon width={16} height={16} />
        <span>
          Dataset source: <span className="upload-summary__file-name">{fileName}</span>
        </span>
      </div>

      <div className="upload-actions">
        <button type="button" className="upload-button upload-button--primary" onClick={onContinue}>
          Upload Another Dataset
        </button>
      </div>
    </section>
  )
}
