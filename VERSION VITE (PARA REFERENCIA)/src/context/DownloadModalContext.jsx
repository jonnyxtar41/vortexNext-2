import React, { createContext, useState, useContext } from 'react';

const DownloadModalContext = createContext();

export const useDownloadModal = () => useContext(DownloadModalContext);

export const DownloadModalProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadInfo, setDownloadInfo] = useState(null);

    const showModal = (info) => {
        setDownloadInfo(info);
        setIsModalOpen(true);
    };

    const hideModal = () => {
        setIsModalOpen(false);
        setDownloadInfo(null);
    };

    const confirmDownload = () => {
        if (downloadInfo && typeof downloadInfo.onConfirm === 'function') {
            downloadInfo.onConfirm();
        }
    };

    const value = {
        isModalOpen,
        showModal,
        hideModal,
        downloadInfo,
        confirmDownload,
    };

    return <DownloadModalContext.Provider value={value}>{children}</DownloadModalContext.Provider>;
};