import React, { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { getCroppedImg } from '@/app/lib/utils'; // We'll create this utility function
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch'; // Import Switch

// This is a dummy comment to force module re-evaluation.

const ImageCropperModal = ({ imageUrl, open, onOpenChange, onCropComplete, initialAspectRatio, isUploading }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(initialAspectRatio || undefined);

    const onCropChange = useCallback((newCrop) => {
        setCrop(newCrop);
    }, []);

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom);
    }, []);

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
          
            const croppedImage = await getCroppedImg(
                imageUrl,
                croppedAreaPixels
            );
            onCropComplete(croppedImage);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
            // TODO: Add toast notification for error
        }
    }, [imageUrl, croppedAreaPixels, onCropComplete, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar Imagen Principal</DialogTitle>
                </DialogHeader>
                <div className="relative flex-grow w-full bg-gray-900 rounded-md">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={selectedAspectRatio}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                        showGrid={true}
                    />
                </div>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-2">
                        <Label className="w-12">Zoom:</Label>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-grow accent-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="w-12">Proporción:</Label>
                        <Button
                            variant={selectedAspectRatio === undefined ? "default" : "outline"}
                            onClick={() => setSelectedAspectRatio(undefined)}
                            size="sm"
                        >
                            Libre
                        </Button>
                        <Button
                            variant={selectedAspectRatio === 16 / 9 ? "default" : "outline"}
                            onClick={() => setSelectedAspectRatio(16 / 9)}
                            size="sm"
                        >
                            16:9
                        </Button>
                        <Button
                            variant={selectedAspectRatio === 1 / 1 ? "default" : "outline"}
                            onClick={() => setSelectedAspectRatio(1 / 1)}
                            size="sm"
                        >
                            1:1
                        </Button>
                        {/* Add more aspect ratio buttons as needed */}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUploading}>Cancelar</Button>
                    <Button onClick={showCroppedImage} disabled={isUploading}>
                        {isUploading ? 'Subiendo...' : 'Recortar y Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropperModal;
