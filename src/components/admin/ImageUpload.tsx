'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link as LinkIcon, X, CheckCircle2 } from 'lucide-react'
import { ImageCropModal } from './ImageCropModal'

type ImageUploadProps = {
  currentImageUrl?: string
  onImageChange: (url: string) => void
  label: string
  aspectRatio?: 'cover' | 'square'
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  label,
  aspectRatio = 'cover',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccioná un archivo de imagen')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB')
      return
    }

    // Crear URL temporal para preview
    const imageUrl = URL.createObjectURL(file)
    setSelectedImageUrl(imageUrl)
    setSelectedFile(file)
    setShowCropModal(true)
    setError(null)

    // Limpiar el input
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      setUploadProgress(10)

      // Crear FormData con la imagen recortada
      const formData = new FormData()
      formData.append('file', croppedBlob, selectedFile?.name || 'cropped-image.jpg')

      setUploadProgress(30)

      // Subir a través de la API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al subir la imagen')
      }

      const { url } = await response.json()

      setUploadProgress(90)

      if (!url) {
        throw new Error('No se pudo obtener la URL de la imagen')
      }

      onImageChange(url)
      setUploadProgress(100)
      setSuccess(true)

      // Limpiar estados
      setSelectedImageUrl(null)
      setSelectedFile(null)

      // Limpiar success después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleCloseCropModal = () => {
    setShowCropModal(false)
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }
    setSelectedImageUrl(null)
    setSelectedFile(null)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleRemoveImage = () => {
    onImageChange('')
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Preview */}
      {currentImageUrl && (
        <div className="relative rounded-lg overflow-hidden border">
          <img
            src={currentImageUrl}
            alt="Preview"
            className={`w-full object-cover ${aspectRatio === 'cover' ? 'h-48' : 'h-64'}`}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="cursor-pointer"
            id={`file-upload-${label}`}
          />
          <label htmlFor={`file-upload-${label}`} className="hidden">
            Subir imagen
          </label>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={uploading}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* Modal de edición de imagen */}
      {selectedImageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={selectedImageUrl}
          aspectRatio={aspectRatio === 'cover' ? 16 / 9 : 1}
          onClose={handleCloseCropModal}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Barra de progreso */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subiendo imagen...</span>
            <span className="font-medium text-primary">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>¡Imagen subida exitosamente!</span>
        </div>
      )}

      {/* Input de URL */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
          />
          <Button type="button" onClick={handleUrlSubmit}>
            Agregar
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Subí una imagen desde tu computadora (máx 5MB) o pegá una URL
      </p>
    </div>
  )
}
