"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useDownloadModal } from "@/app/context/DownloadModalContext";
import AdBlock from '@//app/components/AdBlock';
import { FolderHeart as HandHeart, Coffee, Download, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DownloadModal = () => {
    const { isModalOpen, hideModal, downloadInfo, confirmDownload } = useDownloadModal();
    const [countdown, setCountdown] = useState(10);
    const router = useRouter();

    useEffect(() => {
        let timer;
        if (isModalOpen) {
            setCountdown(10);
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isModalOpen]);

    if (!isModalOpen || !downloadInfo) {
        return null;
    }

    const handleDonateClick = () => {
        hideModal();
        router.push('/donar');
    };

    const handleConfirm = () => {
        confirmDownload();
        hideModal();
    };

    const onOpenChange = (open) => {
        if (!open) {
            hideModal();
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-900 border-accent text-white p-0 max-w-md w-full">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-2xl font-bold text-center gradient-text flex items-center justify-center gap-2">
                        <HandHeart className="w-7 h-7"/>
                        Apoya Nuestro Trabajo
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-sm pt-1">
                        Tu descarga estará disponible en segundos. ¡Considera apoyarnos!
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                         <AdBlock adKey="interstitial" />
                    </motion.div>
                </div>

                <div className="bg-background/20 px-6 py-6">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full text-md border-primary/50 text-primary hover:bg-primary/10"
                        onClick={handleDonateClick}
                    >
                        <Coffee className="w-5 h-5 mr-2"/>
                        Invítanos a un café
                    </Button>
                </div>

                <DialogFooter className="p-6 bg-gray-900 flex flex-col gap-3">
                     <Button
                        onClick={handleConfirm}
                        disabled={countdown > 0}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-md py-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {countdown > 0 ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {`Descarga gratuita en ${countdown}s`}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Descargar Gratis
                            </>
                        )}
                    </Button>
                     <DialogClose asChild>
                        <Button variant="ghost" size="sm" className="w-full">Cancelar</Button>
                     </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadModal;