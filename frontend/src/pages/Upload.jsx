import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { analyzeProcurement, uploadProcurementFile } from '../services/api'
import UploadPipeline from '../components/upload/UploadPipeline'
import FileDropzone from '../components/upload/FileDropzone'
import FileDetails from '../components/upload/FileDetails'
import UploadStatus from '../components/upload/UploadStatus'
import AnalysisSummary from '../components/upload/AnalysisSummary'
import '../components/upload/upload.css'

// Stages of the Phase 1 upload workflow.
const STAGES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  UPLOAD_DONE: 'upload-done',
  ANALYZING: 'analyzing',
  SUCCESS: 'success',
  ERROR: 'error',
}

const ACCEPTED_EXTENSION = '.csv'

// Short pause so the "File uploaded" state registers before analysis begins.
const UPLOAD_DONE_PAUSE_MS = 600
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const STAGE_TO_STEP = {
  [STAGES.IDLE]: 'upload',
  [STAGES.UPLOADING]: 'upload',
  [STAGES.UPLOAD_DONE]: 'upload',
  [STAGES.ANALYZING]: 'analyze',
  [STAGES.SUCCESS]: 'review',
  [STAGES.ERROR]: 'upload',
}

const isCsvFile = (file) =>
  file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION) ||
  file.type === 'text/csv'

// Validate the file before starting the upload workflow.
const validateFile = (file) => {
  if (!file) {
    return 'Please select a procurement CSV file to continue.'
  }
  if (!isCsvFile(file)) {
    return 'Unsupported file type. Please upload a file with a .csv extension.'
  }
  if (file.size === 0) {
    return 'The selected file appears to be empty. Please choose a valid CSV file.'
  }
  return null
}

export default function Upload() {
  const [file, setFile] = useState(null)
  const [stage, setStage] = useState(STAGES.IDLE)
  const [error, setError] = useState(null)
  const [errorTitle, setErrorTitle] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [progress, setProgress] = useState(0)
  const progressTimerRef = useRef(null)

  const isBusy = stage === STAGES.UPLOADING || stage === STAGES.ANALYZING

  // Simulated progress while the mock API runs, so the UI feels responsive.
  const startProgress = useCallback(() => {
    setProgress(0)
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + 4))
    }, 120)
  }, [])

  const stopProgress = useCallback(() => {
    clearInterval(progressTimerRef.current)
    setProgress(100)
  }, [])

  useEffect(() => {
    return () => clearInterval(progressTimerRef.current)
  }, [])

  const startWorkflow = useCallback(
    async (selectedFile) => {
      setStage(STAGES.UPLOADING)
      setError(null)
      startProgress()

      try {
        await uploadProcurementFile(selectedFile)
      } catch {
        stopProgress()
        setStage(STAGES.ERROR)
        setErrorTitle('Upload failed')
        setError('We could not upload the file. Please check the file and try again.')
        return
      }

      stopProgress()
      setStage(STAGES.UPLOAD_DONE)
      setProgress(0)
      await wait(UPLOAD_DONE_PAUSE_MS)

      setStage(STAGES.ANALYZING)
      startProgress()

      try {
        const result = await analyzeProcurement()
        stopProgress()
        setAnalysis(result)
        setStage(STAGES.SUCCESS)
      } catch {
        stopProgress()
        setStage(STAGES.ERROR)
        setErrorTitle('Analysis failed')
        setError('The analysis could not be completed. Please try again.')
      }
    },
    [startProgress, stopProgress],
  )

  // Validate and hold the selected file; the upload starts on user confirmation.
  const handleFileSelected = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setStage(STAGES.ERROR)
      setErrorTitle('Invalid file')
      setError(validationError)
      return
    }
    setError(null)
    setAnalysis(null)
    setFile(selectedFile)
    setStage(STAGES.IDLE)
  }, [])

  const handleReset = useCallback(() => {
    setFile(null)
    setStage(STAGES.IDLE)
    setError(null)
    setErrorTitle(null)
    setAnalysis(null)
    setProgress(0)
  }, [])

  const activeStep = STAGE_TO_STEP[stage]
  const completedSteps = stage === STAGES.SUCCESS ? ['upload', 'analyze'] : []

  return (
    <div className="upload-page">
      <header className="upload-page__header">
        <p className="upload-page__eyebrow">Procurement Data Consolidation</p>
        <h1 className="upload-page__title">Upload Procurement Data</h1>
        <p className="upload-page__subtitle">
          Import historical procurement transactions as a CSV file. LeakLens will
          analyze the dataset to surface potential spend leakage with supporting
          transaction evidence.
        </p>
      </header>

      <UploadPipeline completedSteps={completedSteps} activeStep={activeStep} />

      {stage === STAGES.SUCCESS && analysis ? (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="upload-card"
        >
          <AnalysisSummary
            fileName={file?.name ?? analysis.fileName}
            result={analysis}
            onContinue={handleReset}
          />
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="upload-card"
        >
          <div className="upload-card__section">
            <h2 className="upload-card__title">Procurement dataset</h2>
            <p className="upload-card__subtitle">
              One dataset at a time: the CSV is validated, then normalized into
              standardized transaction records before analysis.
            </p>
          </div>

          {file ? (
            <FileDetails file={file} onRemove={handleReset} disabled={isBusy} />
          ) : null}

          {stage === STAGES.UPLOADING && (
            <UploadStatus
              tone="info"
              title="Uploading procurement data"
              message="Your file is being received and validated."
              showProgress
              progress={progress}
            />
          )}

          {stage === STAGES.UPLOAD_DONE && (
            <UploadStatus
              tone="success"
              title="File uploaded"
              message="The procurement file was received. Preparing for analysis."
            />
          )}

          {stage === STAGES.ANALYZING && (
            <UploadStatus
              tone="info"
              title="Analyzing procurement data"
              message="Scanning for pricing variances and other potential leakage patterns."
              showProgress
              progress={progress}
            />
          )}

          {stage === STAGES.ERROR && error && (
            <UploadStatus tone="error" title={errorTitle ?? 'Something went wrong'} message={error} />
          )}

          {!file && stage !== STAGES.UPLOADING && stage !== STAGES.ANALYZING && (
            <FileDropzone onFileSelected={handleFileSelected} disabled={isBusy} />
          )}

          <div className="upload-actions">
            <button
              type="button"
              className="upload-button upload-button--ghost"
              onClick={handleReset}
              disabled={!file || isBusy}
            >
              Reset
            </button>
            <button
              type="button"
              className="upload-button upload-button--primary"
              onClick={() => startWorkflow(file)}
              disabled={!file || isBusy}
            >
              Start Upload &amp; Analysis
              {isBusy && (
                <span className="upload-spinner upload-spinner--small" aria-hidden="true" />
              )}
            </button>
          </div>
        </motion.section>
      )}
    </div>
  )
}
