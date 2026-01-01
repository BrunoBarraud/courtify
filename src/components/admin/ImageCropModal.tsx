'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut, RotateCw, Check, X } from 'lucide-react'

type ImageCropModalProps = {
  isOpen: boolean
  imageUrl: string
  aspectRatio?: number
  onClose: () => void
  onCropComplete: (croppedImageBlob: Blob) => void
}

export function ImageCropModal({
  isOpen,
  imageUrl,
  aspectRatio,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    // Crop inicial que cubre toda la imagen
    const crop: Crop = {
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    }
    setCrop(crop)
  }, [])

  // Actualizar preview canvas cuando cambie el crop
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Configurar tamaño del canvas según el tipo
    if (aspectRatio === 1) {
      canvas.width = 96
      canvas.height = 96
    } else {
      canvas.width = 600
      canvas.height = 192
    }

    ctx.imageSmoothingQuality = 'high'

    // Dibujar el área recortada
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )
  }, [completedCrop, aspectRatio])

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Calcular dimensiones finales del crop
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Usar las MISMAS dimensiones que el preview para que sean idénticos
    if (aspectRatio === 1) {
      // Foto de perfil: tamaño estándar para avatar
      canvas.width = 400
      canvas.height = 400
    } else {
      // Foto de portada: tamaño estándar para banner
      canvas.width = 1600
      canvas.height = 400
    }

    ctx.imageSmoothingQuality = 'high'

    // Dibujar el área recortada con las mismas proporciones que el preview
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    // Convertir a Blob
    canvas.toBlob(
      blob => {
        if (blob) {
          onCropComplete(blob)
          onClose()
        }
      },
      'image/jpeg',
      0.95
    )
  }, [completedCrop, aspectRatio, onCropComplete, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajustar Imagen - Preview en Vivo</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: Editor de crop */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Editor</h3>
              <div
                ref={containerRef}
                className="flex justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-4 overflow-hidden relative"
                style={{ height: '50vh', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={e => {
                  setIsDragging(true)
                  setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
                }}
                onMouseMove={e => {
                  if (isDragging) {
                    setPosition({
                      x: e.clientX - dragStart.x,
                      y: e.clientY - dragStart.y,
                    })
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <div className="relative inline-block">
                  <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={c => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    minWidth={50}
                    minHeight={50}
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Crop preview"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
                        maxHeight: '50vh',
                        maxWidth: '100%',
                        transformOrigin: 'center center',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                      onLoad={onImageLoad}
                      draggable={false}
                    />
                  </ReactCrop>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="space-y-4">
              {/* Zoom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
                </div>
                <Slider
                  value={[scale]}
                  onValueChange={value => setScale(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rotación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotación
                  </label>
                  <span className="text-sm text-muted-foreground">{rotate}°</span>
                </div>
                <Slider
                  value={[rotate]}
                  onValueChange={value => setRotate(value[0])}
                  min={0}
                  max={360}
                  step={15}
                  className="w-full"
                />
              </div>

              {/* Botones de acción rápida */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScale(1)
                    setRotate(0)
                    setPosition({ x: 0, y: 0 })
                    setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })
                  }}
                >
                  Reset Todo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                  <ZoomOut className="h-4 w-4 mr-2" />
                  Reset Zoom
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPosition({ x: 0, y: 0 })}>
                  Centrar
                </Button>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                <p className="font-medium mb-1">💡 Cómo usar:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>
                    • <strong>Arrastrá la imagen</strong> haciendo click y moviendo el mouse
                  </li>
                  <li>
                    • <strong>Zoom</strong> con el slider para acercar/alejar
                  </li>
                  <li>
                    • <strong>Recortá</strong> ajustando los bordes del recuadro verde
                  </li>
                  <li>
                    • <strong>Rotá</strong> con el slider de rotación
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Columna derecha: Preview en vivo */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Preview del Perfil</h3>
              <div className="border rounded-lg overflow-hidden bg-background">
                {/* Simulación del perfil */}
                <div className="relative">
                  {aspectRatio === 1 ? (
                    /* Preview para FOTO DE PERFIL (circular) */
                    <>
                      <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-900"></div>
                      <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl ring-4 ring-background">
                          {completedCrop && imgRef.current ? (
                            <canvas ref={previewCanvasRef} className="w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                              <span className="text-xs text-slate-500">Preview</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-16 px-6 pb-6">
                        <h4 className="font-bold text-lg">Complejo Deportivo</h4>
                        <p className="text-sm text-muted-foreground">Justiniano Posse, Córdoba</p>
                      </div>
                    </>
                  ) : (
                    /* Preview para FOTO DE PORTADA (banner completo) */
                    <>
                      <div className="h-48 relative overflow-hidden">
                        {completedCrop && imgRef.current ? (
                          <canvas ref={previewCanvasRef} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <span className="text-xs text-slate-500">Preview</span>
                          </div>
                        )}
                      </div>
                      <div className="px-6 py-4">
                        <h4 className="font-bold text-lg">Complejo Deportivo</h4>
                        <p className="text-sm text-muted-foreground">Justiniano Posse, Córdoba</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                ℹ️ Así se verá tu imagen en el perfil del complejo
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleCropComplete}>
            <Check className="h-4 w-4 mr-2" />
            Aplicar y Subir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
