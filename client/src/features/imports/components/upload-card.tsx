import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheck, FileSpreadsheet, LoaderCircle, TriangleAlert } from 'lucide-react'

import { uploadImportFile, type ImportKind } from '@/api/imports'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type UploadCardProps = {
  kind: ImportKind
  title: string
  description: string
}

export function UploadCard({ kind, title, description }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (selected: File) => uploadImportFile(kind, selected),
    onSuccess: () => {
      // Every page reads from the same imported data.
      queryClient.invalidateQueries()
    },
  })

  function pickFile(selected: File | null) {
    setFile(selected)
    mutation.reset()
  }

  return (
    <Card size="sm" className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileSpreadsheet className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="sr-only"
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
        <span className="truncate text-sm text-muted-foreground">
          {file ? file.name : 'No file selected (.xlsx)'}
        </span>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2">
        <Button
          size="sm"
          disabled={!file || mutation.isPending}
          onClick={() => file && mutation.mutate(file)}
        >
          {mutation.isPending && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          {mutation.isPending ? 'Uploading…' : 'Upload'}
        </Button>

        {mutation.isSuccess && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-500">
            <CircleCheck className="size-4" />
            {mutation.data.rows} rows imported
          </p>
        )}

        {mutation.isError && (
          <p className="flex items-start gap-1.5 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {mutation.error.message}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
