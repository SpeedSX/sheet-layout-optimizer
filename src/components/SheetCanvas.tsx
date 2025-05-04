import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { Sheet } from '../models/types';

interface SheetCanvasProps {
  sheet: Sheet;
  scale?: number;
}

const SheetCanvas: React.FC<SheetCanvasProps> = ({ sheet, scale = 1 }) => {
  // Apply scaling to handle large sheet sizes in the UI
  const canvasWidth = sheet.width * scale;
  const canvasHeight = sheet.height * scale;

  return (
    <div className="sheet-container" style={{ marginBottom: '20px' }}>
      <h3>Sheet {sheet.id}</h3>
      <div style={{ border: '1px solid #ccc', display: 'inline-block' }}>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Sheet background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill="#f8f8f8"
              stroke="#ddd"
            />
            
            {/* Items placed on the sheet */}
            {sheet.items.map((item, index) => (
              <React.Fragment key={index}>
                <Rect
                  x={item.x * scale}
                  y={item.y * scale}
                  width={item.width * scale}
                  height={item.height * scale}
                  fill={item.color || `hsl(${index * 30 % 360}, 70%, 80%)`}
                  stroke="#333"
                  strokeWidth={1}
                />
                {/* Item label - only show if there's enough space */}
                {(item.width * scale > 40 && item.height * scale > 20) && (
                  <Text
                    x={item.x * scale + 5}
                    y={item.y * scale + 5}
                    text={item.name}
                    fontSize={12 * scale}
                    fill="#333"
                    width={item.width * scale - 10}
                    ellipsis={true}
                  />
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default SheetCanvas;