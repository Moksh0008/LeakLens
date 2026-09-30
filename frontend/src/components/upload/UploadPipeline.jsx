// Pipeline strip showing the procurement data consolidation flow.
// Steps highlight progress as the upload workflow advances.

const PIPELINE_STEPS = [
  { key: 'upload', label: 'Upload CSV' },
  { key: 'analyze', label: 'Analyze' },
  { key: 'review', label: 'Review findings' },
]

export default function UploadPipeline({ completedSteps, activeStep }) {
  const isDone = (key) => completedSteps.includes(key)

  return (
    <ol className="upload-pipeline" aria-label="Data consolidation flow">
      {PIPELINE_STEPS.map((step, index) => {
        const classes = ['upload-pipeline__step']
        if (isDone(step.key)) classes.push('upload-pipeline__step--done')
        if (activeStep === step.key) classes.push('upload-pipeline__step--active')

        return (
          <li key={step.key} className={classes.join(' ')} aria-current={activeStep === step.key ? 'step' : undefined}>
            <span className="upload-pipeline__step-dot" aria-hidden="true" />
            {step.label}
            {index < PIPELINE_STEPS.length - 1 && (
              <span className="upload-pipeline__arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
