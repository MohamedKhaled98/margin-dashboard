import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTHS } from '@/lib/format'
import { YEARS } from '../use-period-params'

type PeriodFilterProps = {
  year: number
  month?: number
  onChange: (year: number, month?: number) => void
}

// Base UI Select values are strings; "all" is the whole-year sentinel.
const ALL_MONTHS = 'all'

const yearItems = YEARS.map((year) => ({
  value: String(year),
  label: String(year),
}))

const monthItems = [
  { value: ALL_MONTHS, label: 'Full year' },
  ...MONTHS.map((month) => ({
    value: String(month.value),
    label: month.label,
  })),
]

export function PeriodFilter({ year, month, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        items={yearItems}
        value={String(year)}
        onValueChange={(value) => onChange(Number(value), month)}
      >
        <SelectTrigger aria-label="Year">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={monthItems}
        value={month === undefined ? ALL_MONTHS : String(month)}
        onValueChange={(value) =>
          onChange(year, value === ALL_MONTHS ? undefined : Number(value))
        }
      >
        <SelectTrigger aria-label="Month">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
