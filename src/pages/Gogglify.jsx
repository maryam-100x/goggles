// src/pages/Gogglify.jsx
import { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';
import styles from './Gogglify.module.css';

export default function Gogglify() {
  const editorRef = useRef(null);
  const [image, setImage] = useState(null);
  const [goggles, setGoggles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setGoggles([]);
      setSelectedId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClickCanvas = (e) => {
    if (!image) return;
    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50; // center horizontally
    const y = e.clientY - rect.top - 25;  // center vertically

    const newG = {
      id: Date.now(),
      x, y,
      width: 100,
      height: 50,
      rotation: 0,
    };
    setGoggles((g) => [...g, newG]);
    setSelectedId(newG.id);
  };

  const rotateSelected = () => {
    setGoggles((g) =>
      g.map((gog) =>
        gog.id === selectedId
          ? { ...gog, rotation: (gog.rotation + 15) % 360 }
          : gog
      )
    );
  };

  const downloadImage = async () => {
    if (!editorRef.current) return;
    const canvas = await html2canvas(editorRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = 'gogglified.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gogglify Yourself</h1>

      <div className={styles.controls}>
        <label className={styles.uploadLabel}>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className={styles.fileInput}
          />
          <span className={styles.uploadButton}>Upload Image</span>
        </label>

        <button
          onClick={rotateSelected}
          disabled={!selectedId}
          className={styles.controlButton}
        >
          Rotate Selected
        </button>

        <button
          onClick={downloadImage}
          disabled={!image}
          className={styles.downloadButton}
        >
          Download
        </button>
      </div>

      {image && (
        <div
          className={styles.editorWrapper}
          ref={editorRef}
          onClick={handleClickCanvas}
        >
          <img src={image} alt="Uploaded" className={styles.baseImage} />

          {goggles.map((gog) => (
            <Rnd
              key={gog.id}
              size={{ width: gog.width, height: gog.height }}
              position={{ x: gog.x, y: gog.y }}
              onDragStop={(_, d) => {
                setGoggles((prev) =>
                  prev.map((p) =>
                    p.id === gog.id ? { ...p, x: d.x, y: d.y } : p
                  )
                );
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                setGoggles((prev) =>
                  prev.map((p) =>
                    p.id === gog.id
                      ? {
                          ...p,
                          width: ref.offsetWidth,
                          height: ref.offsetHeight,
                          x: position.x,
                          y: position.y,
                        }
                      : p
                  )
                );
              }}
              bounds="parent"
              enableResizing={{ bottomRight: true }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(gog.id);
              }}
              style={{
                transform: `rotate(${gog.rotation}deg)`,
                zIndex: selectedId === gog.id ? 10 : 5,
              }}
            >
              <img
                src="/goggles.png"
                alt="Goggles"
                className={styles.gogglesImage}
              />
            </Rnd>
          ))}
        </div>
      )}
    </div>
  );
}
