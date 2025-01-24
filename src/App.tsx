// Final
import "./styles.css";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { fabric } from "fabric";

const API_KEY = "B9OVw2pb8pFLpfO68g2uNLTVce4KyOJO7niKtf6I1ZQ";

function App() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 450,
        backgroundColor: "white",
      });
      setCanvas(newCanvas);

      return () => {
        newCanvas.dispose();
      };
    }
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      const response = await axios.get("https://api.unsplash.com/search/photos", {
        headers: {
          Authorization: `Client-ID ${API_KEY}`,
        },
        params: {
          query: searchTerm,
          per_page: 12,
        },
      });
      setImages(response.data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const addImageToCanvas = (imageUrl: string) => {
    if (!canvas) return;

    canvas.clear();

    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        if (!img) return;

        const scaleX = canvas.width! / img.width!;
        const scaleY = canvas.height! / img.height!;
        const scale = Math.min(scaleX, scaleY);

        img.scale(scale);

        const left = (canvas.width! - img.width! * scale) / 2;
        const top = (canvas.height! - img.height! * scale) / 2;

        img.set({
          left: left,
          top: top,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          lockUniScaling: false,
          transparentCorners: false,
        });

        canvas.add(img);
        img.bringToFront();
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  };

  const addText = () => {
    if (!canvas) return;

    const text = prompt("Enter your caption:");
    if (text) {
      const textObj = new fabric.Text(text, {
        fontSize: 30,
        fill: "white",
        stroke: "#000",
        strokeWidth: 1,
        fontFamily: "Arial",
        originX: "center",
        originY: "center",
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        selectable: true,
        
      });

      canvas.add(textObj);
      textObj.bringToFront();
      canvas.renderAll();
    }
  };

  const addShape = (type: string) => {
    if (!canvas) return;

    let shape;
    const commonProps = {
      originX: "center",
      originY: "center",
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      selectable: true,
    };

    if (type === "circle") {
      shape = new fabric.Circle({
        ...commonProps,
        radius: 50,
        fill: "rgba(255, 0, 0, 0.5)",
      });
    } else if (type === "rectangle") {
      shape = new fabric.Rect({
        ...commonProps,
        width: 100,
        height: 50,
        fill: "rgba(0, 0, 255, 0.5)",
      });
    }

    if (shape) {
      canvas.add(shape);
      shape.bringToFront();
      canvas.renderAll();
    }
  };

  const downloadImage = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png";
    link.click();
  };

  return (
    <div className="App">
      <div className="user-info">
      <h1>
    <a 
      href="https://github.com/Vickeychouhan/vickey_portfolio.git" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      Git Repository
    </a>
  </h1>
      </div>
      <h1>Image Editor</h1>

      <div className="main-container">
        <div className="left-section">
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for images..."
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <div className="search-results">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <img
                  src={image.urls.small}
                  alt={image.alt_description}
                  onClick={() => addImageToCanvas(image.urls.regular)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="right-section">
          <div className="canvas-container">
            <canvas ref={canvasRef} />
            <div className="controls">
              <button onClick={addText}>Add Text</button>
              <button onClick={() => addShape("circle")}>Add Circle</button>
              <button onClick={() => addShape("rectangle")}>Add Rectangle</button>
              <button onClick={downloadImage}>Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
