import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';
import styles from './Gogglify.module.css';

/**
 * Gogglify
 * ------------------------------------------------------------------
 * The goggles looked fine on‑screen but were wildly distorted in the
 * downloaded PNG. The root cause was `object-fit: contain` on the
 * <img> element: html2canvas still struggles with object‑fit and ends
 * up stretching the bitmap across the element's full width/height.
 *
 * Fix
 * 1. Render each pair of goggles as a **background image** on a div
 *    instead of an <img>. html2canvas handles background‑size: contain
 *    correctly, so the aspect ratio is preserved.
 * 2. Keep every transform (rotate / flip) on that div so they're also
 *    captured perfectly.
 * 3. Capture the canvas at the device‑pixel ratio for sharper output.
 */

export default function Gogglify() {
  const editorRef = useRef(null);
  const captureRef = useRef(null);

  const [image, setImage] = useState(null);
  const [goggles, setGoggles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [size, setSize] = useState(1); // 1 ⇒ 100 × 50 CSS‑px
  const [gogglesType, setGogglesType] = useState('goggles2.png');

  /* --------------------------------------------------
   *  Upload + editor helpers
   * -------------------------------------------------- */
  const handleUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target.result);
      setGoggles([]);
      setSelectedId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClickCanvas = e => {
    if (!image) return;
    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - (size * 100) / 2;
    const y = e.clientY - rect.top  - (size * 50)  / 2;

    const newG = {
      id: Date.now(),
      x,
      y,
      width:  size * 100,
      height: size * 50,
      rotation: 0,
      type: gogglesType,
      flipped: false,
    };
    setGoggles(g => [...g, newG]);
    setSelectedId(newG.id);
  };

  /* --------------------------------------------------
   *  Goggles transform helpers
   * -------------------------------------------------- */
  const rotateSelected = (value) => setGoggles(g => g.map(gog =>
    gog.id === selectedId ? { ...gog, rotation: parseInt(value, 10) } : gog
  ));

  const flipSelected = () => setGoggles(g => g.map(gog =>
    gog.id === selectedId ? { ...gog, flipped: !gog.flipped } : gog
  ));

  const handleReset = () => {
    setGoggles([]);
    setSelectedId(null);
  };

  const handleDragStop = (id, d) => setGoggles(prev =>
    prev.map(g => (g.id === id ? { ...g, x: d.x, y: d.y } : g))
  );

  const handleSizeChange = e => {
    const newSize = parseInt(e.target.value, 10) / 100;
    setSize(newSize);
    if (selectedId) {
      setGoggles(prev => prev.map(g =>
        g.id === selectedId ? { ...g, width: newSize * 100, height: newSize * 50 } : g
      ));
    }
  };

  const handleGogglesTypeChange = type => {
    setGogglesType(type);
    if (selectedId) {
      setGoggles(prev => prev.map(g =>
        g.id === selectedId ? { ...g, type } : g
      ));
    }
  };

  /* --------------------------------------------------
   *  Capture & download
   * -------------------------------------------------- */
  const downloadImage = async () => {
    if (!captureRef.current || !image) return;
    setCapturing(true);

    // Wait for the uploaded image to load (edge‑case for very large files)
    const img = new Image();
    img.src = image;
    await new Promise(res => (img.onload = res));

    // Fix the capture area's size so html2canvas doesn't re‑flow anything
    const { width, height } = captureRef.current.getBoundingClientRect();
    const prevWidth  = captureRef.current.style.width;
    const prevHeight = captureRef.current.style.height;
    captureRef.current.style.width  = `${width}px`;
    captureRef.current.style.height = `${height}px`;
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: window.devicePixelRatio || 1, //  crisp + keeps ratios intact
    });

    // Restore previous style so the UI stays responsive afterwards
    captureRef.current.style.width  = prevWidth;
    captureRef.current.style.height = prevHeight;
    setCapturing(false);

    const link = document.createElement('a');
    link.download = 'gogglified.png';
    link.href = canvas.toDataURL('image/png', 1);
    link.click();
  };

  /* --------------------------------------------------
   *  Render
   * -------------------------------------------------- */
  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>Goggify Anything!</h1>

          {/*  Controls  */}
          <div className={styles.controls}>
            <label className={styles.uploadLabel}>
              <input type="file" accept="image/*" onChange={handleUpload} className={styles.fileInput} />
              <span className={styles.uploadButton}>Upload Image</span>
            </label>

            <div className={styles.sizeControl}>
              <label>Goggles Size:</label>
              <input
                type="range"
                min="100"
                max="2000"
                value={size * 100}
                onChange={handleSizeChange}
              />
              <span>{Math.round(size * 10)}%</span>
            </div>

            {selectedId && (
              <div className={styles.rotationControl}>
                <label>Rotation:</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={goggles.find(g => g.id === selectedId)?.rotation || 0}
                  onChange={(e) => rotateSelected(e.target.value)}
                  disabled={!selectedId}
                />
              </div>
            )}

            <button onClick={flipSelected}   disabled={!selectedId} className={styles.controlButton}>Flip</button>
            <button onClick={handleReset}    disabled={goggles.length === 0} className={styles.controlButton}>Reset</button>
            <button onClick={downloadImage}  disabled={!image} className={styles.downloadButton}>Download</button>
          </div>

          {/*  Editor  */}
          {image && (
            <div className={styles.editorWrapper} ref={editorRef} onClick={handleClickCanvas}>
              <div
                className={styles.captureArea}
                ref={captureRef}
                data-capturing={capturing ? 'true' : 'false'}
                style={{ overflow: 'visible', position: 'relative' }}
              >
                <img src={image} alt="Uploaded" className={styles.baseImage} style={{ width: '100%', height: 'auto' }} />

                {goggles.map(gog => (
                  <Rnd
                    key={gog.id}
                    size={{ width: gog.width, height: gog.height }}
                    position={{ x: gog.x, y: gog.y }}
                    onDragStop={(e, d) => handleDragStop(gog.id, d)}
                    enableResizing={false}
                    disableDragging={capturing}
                    dragGrid={[1, 1]}
                    onClick={e => { e.stopPropagation(); if (!capturing) setSelectedId(gog.id); }}
                    style={{ zIndex: selectedId === gog.id ? 10 : 5, position: 'absolute' }}
                    data-testid="goggles-container"
                  >
                    {/*  The div itself IS the goggles; we use a background image so html2canvas preserves aspect ratio  */}
                    <div
                      className={styles.gogglesWrapper}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(/${gog.type})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        transform: `rotate(${gog.rotation}deg) ${gog.flipped ? 'scaleX(-1)' : ''}`,
                      }}
                    />
                  </Rnd>
                ))}
              </div>
            </div>
          )}
        </div>

        {/*  Help card  */}
       <div className={styles.helpCard}>
          <h3>How to Goggify</h3>
          <ol>
            <li><strong>Upload an image</strong> using the "Upload Image" button</li>
            <li><strong>Click anywhere</strong> on the image to add goggles</li>
            <li><strong>Adjust size</strong> using the slider (10‑1000%)</li>
            <li><strong>Drag</strong> goggles to position them</li>
            <li><strong>Rotate/Flip</strong> selected goggles</li>
            <li><strong>Download</strong> your goggified image when ready</li>
            <li><strong>Reset</strong> to start over</li>
          </ol>
        </div>
      </div>
    </div>
  );
}