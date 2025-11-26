import React, { useState, useRef, useEffect } from 'react';

import type { IReactChildren } from "../ts/IReactChildren"



interface IDragDropModal extends IReactChildren{
handleFileDrop:(fileList:FileList)=>void

}

const DragDropModal: React.FC<IDragDropModal> = ({handleFileDrop}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const [draggingModal, setDraggingModal] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Show modal on dragenter, hide on dragleave/drop
  const handleDragEnter = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e:any) => {
    e.preventDefault();
    // Only hide if leaving the window (not child modal)
    if ((e.target as HTMLElement).id === 'drag-drop-overlay') {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e:any) => {
    e.preventDefault();
    // Only hide if leaving the window (not child modal)
    if ((e.target as HTMLElement).id === 'drag-drop-overlay') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files as FileList;
    handleFileDrop(files)
    // Process files here e.g. upload, read, etc.
    console.log(files);
  };

  // Modal drag handlers
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setDraggingModal(true);
      offset.current = {
        x: e.clientX - modalPos.x,
        y: e.clientY - modalPos.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingModal) {
      setModalPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingModal) {
      setDraggingModal(false);
    }
  };

    useEffect(() => {
        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.addEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
  }, [draggingModal, modalPos]);

  if (!isDragging) return null;

  return (
    <div
      id="drag-drop-overlay"
      style={{
        position: 'fixed',
        top: 200, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        ref={modalRef}
        onMouseDown={handleModalMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right:0,
          bottom:0,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          cursor: 'move',
          userSelect: 'none',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0,0,0,0.25)'
        }}
      >
        <p>Drop files here to upload</p>
        <button onClick={() => setIsDragging(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default DragDropModal;
