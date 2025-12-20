// FileDropZone.tsx
import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import styles from '../css/FileListHandler.module.css';

interface FileDropZoneProps {
  title: string;
  onFilesProcessed: (files: File[]) => void;
  acceptTypes?: string;
    children?: ReactNode; // 👈 allows custom content
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  title,
  onFilesProcessed,
  acceptTypes = '.xml,.zip',
  children
  
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

    function processFiles(files: File[]) {
        const validFiles = files.filter(file =>
            acceptTypes.split(',').some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))
        );
        if (validFiles.length) {
            onFilesProcessed(validFiles);
        }
    }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files)

  }, [onFilesProcessed, acceptTypes]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            processFiles(files)
        }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      ref={dropRef}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${styles.fileDropZone} ${
        title.includes('Reference') ? styles.referenceZone : styles.editableZone
      } ${isDragging ? styles.dragging : ''}`}
    >
   {children ? (
        children
      ) : (
        <>
          <h3>{title}</h3>
          <p>Drag & drop XML or ZIP files here</p>
          <p>or</p>
          <button type="button" onClick={openFilePicker} className={styles.fileInputLabel}>
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptTypes}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </>
      )}
    </div>
  );
};
export default FileDropZone