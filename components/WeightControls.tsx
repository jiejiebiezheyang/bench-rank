'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/language-context'

interface Preset {
  labelKey: 'presetBalanced' | 'presetComputeHeavy' | 'presetIoHeavy'
  insignificantIO: number
}

const PRESETS: Preset[] = [
  { labelKey: 'presetBalanced', insignificantIO: 50 },
  { labelKey: 'presetComputeHeavy', insignificantIO: 75 },
  { labelKey: 'presetIoHeavy', insignificantIO: 25 }
]

interface WeightControlsProps {
  insignificantIO: number
  significantIO: number
  onChange: (insignificantIO: number) => void
}

export function WeightControls({ insignificantIO, significantIO, onChange }: WeightControlsProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="insignificant-slider" className="text-base font-medium">
            {t('filterInsignificant')}
          </Label>
          <Badge variant="outline" className="tabular-nums">
            {insignificantIO}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{t('weightsInsignificantDesc')}</p>
        <Slider
          id="insignificant-slider"
          value={[insignificantIO]}
          min={0}
          max={100}
          step={1}
          onValueChange={value => onChange(value[0] ?? 50)}
          aria-label={t('filterInsignificant')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="significant-slider" className="text-base font-medium">
            {t('filterSignificant')}
          </Label>
          <Badge variant="outline" className="tabular-nums">
            {significantIO}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{t('weightsSignificantDesc')}</p>
        <Slider
          id="significant-slider"
          value={[significantIO]}
          min={0}
          max={100}
          step={1}
          onValueChange={value => onChange(100 - (value[0] ?? 50))}
          aria-label={t('filterSignificant')}
        />
      </div>

      <div className="pt-1">
        <span className="mb-2 block text-xs font-medium text-muted-foreground">{t('weightsPresets')}</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => {
            const active = insignificantIO === preset.insignificantIO
            return (
              <button
                key={preset.labelKey}
                type="button"
                onClick={() => onChange(preset.insignificantIO)}
                aria-pressed={active}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t(preset.labelKey)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
