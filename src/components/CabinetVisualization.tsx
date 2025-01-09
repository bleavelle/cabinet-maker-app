import React from 'react';

const CabinetVisualization = ({ 
  dimensions = { width: 24, height: 30, depth: 12 },
  materialThickness = 0.75,
  shelfCount = 2,
  doors = [
    { position: 'left-half', type: 'solid' },
    { position: 'right-half', type: 'mirror' }
  ]
}) => {
  // Scale factor to convert inches to pixels (1 inch = 4 pixels)
  const scale = 4;
  
  // Colors for different components
  const colors = {
    topBottom: '#A0522D',    // Brown
    sides: '#DEB887',        // Light brown
    shelves: '#CD853F',      // Medium brown
    back: '#D2B48C',         // Tan
    solidDoor: '#8B4513',    // Dark brown
    mirrorDoor: '#88CCE7',   // Light blue
    glassDoor: '#AAD7D9',    // Light cyan
    dimensions: '#666666'     // Gray
  };
  
  // Calculate scaled dimensions
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const depth = dimensions.depth * scale;
  const thickness = materialThickness * scale;
  
  // Calculate shelf positions
  const shelfSpacing = height / (shelfCount + 1);
  const shelfPositions = Array.from({ length: shelfCount }, (_, i) => 
    (i + 1) * shelfSpacing
  );

  // Helper function to get door dimensions
  const getDoorDimensions = (position) => {
    let doorWidth = width;
    let doorHeight = height;
    let doorX = 0;
    let doorY = 0;
    
    if (position.includes('half')) {
      if (position.includes('left') || position.includes('right')) {
        doorWidth = width / 2;
        doorX = position.includes('right') ? width / 2 : 0;
      }
      if (position.includes('upper') || position.includes('lower')) {
        doorHeight = height / 2;
        doorY = position.includes('lower') ? height / 2 : 0;
      }
    } else if (position.includes('1/3')) {
      if (position.includes('vert')) {
        doorHeight = height / 3;
        doorY = position.includes('middle') ? height / 3 : 
               position.includes('lower') ? (height * 2) / 3 : 0;
      } else {
        doorWidth = width / 3;
        doorX = position.includes('middle') ? width / 3 : 
               position.includes('right') ? (width * 2) / 3 : 0;
      }
    } else if (position.includes('2/3')) {
      doorWidth = (width * 2) / 3;
      doorX = position.includes('right') ? width / 3 : 0;
    }
    
    return { width: doorWidth, height: doorHeight, x: doorX, y: doorY };
  };

  // Helper function to render doors
  const renderDoor = (door, strokeOnly = false) => {
    const { width: doorWidth, height: doorHeight, x, y } = getDoorDimensions(door.position);
    const doorColor = door.type === 'mirror' ? colors.mirrorDoor : 
                     door.type === 'glass' ? colors.glassDoor : 
                     colors.solidDoor;
    
    return (
      <rect
        key={`${door.position}-${door.type}`}
        x={x}
        y={y}
        width={doorWidth}
        height={doorHeight}
        fill={strokeOnly ? "none" : doorColor}
        fillOpacity={strokeOnly ? 0 : 0.3}
        stroke={doorColor}
        strokeWidth={1}
        strokeDasharray={strokeOnly ? "4" : "0"}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-8 p-4 bg-white rounded-lg">
        {/* Front View */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-2">Front View</span>
          <svg width={width + 40} height={height + 40} className="bg-gray-50">
            <g transform={`translate(20, 20)`}>
              {/* Cabinet frame */}
              <rect 
                width={width} 
                height={height} 
                fill="none" 
                stroke={colors.sides} 
                strokeWidth={thickness}
              />
              
              {/* Top and Bottom */}
              <rect
                y={0}
                width={width}
                height={thickness}
                fill={colors.topBottom}
              />
              <rect
                y={height - thickness}
                width={width}
                height={thickness}
                fill={colors.topBottom}
              />
              
              {/* Sides */}
              <rect
                x={0}
                y={0}
                width={thickness}
                height={height}
                fill={colors.sides}
              />
              <rect
                x={width - thickness}
                y={0}
                width={thickness}
                height={height}
                fill={colors.sides}
              />
              
              {/* Shelves */}
              {shelfPositions.map((y, i) => (
                <rect 
                  key={`shelf-front-${i}`}
                  x={thickness}
                  y={y - thickness/2}
                  width={width - thickness * 2}
                  height={thickness}
                  fill={colors.shelves}
                />
              ))}
              
              {/* Doors */}
              {doors.map((door) => renderDoor(door, true))}
              
              {/* Dimensions */}
              <text x={width / 2} y={-5} textAnchor="middle" fontSize="12" fill={colors.dimensions}>
                {dimensions.width}"
              </text>
              <text 
                x={-5} 
                y={height / 2} 
                textAnchor="middle" 
                transform={`rotate(-90, -5, ${height/2})`}
                fontSize="12"
                fill={colors.dimensions}
              >
                {dimensions.height}"
              </text>
            </g>
          </svg>
        </div>
        
        {/* Side View */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-2">Side View</span>
          <svg width={depth + 40} height={height + 40} className="bg-gray-50">
            <g transform={`translate(20, 20)`}>
              {/* Cabinet frame */}
              <rect 
                width={depth} 
                height={height} 
                fill={colors.back}
                fillOpacity={0.2}
                stroke={colors.sides} 
                strokeWidth={thickness}
              />
              
              {/* Shelves */}
              {shelfPositions.map((y, i) => (
                <rect
                  key={`shelf-side-${i}`}
                  x={0}
                  y={y - thickness/2}
                  width={depth}
                  height={thickness}
                  fill={colors.shelves}
                />
              ))}
              
              {/* Dimensions */}
              <text x={depth / 2} y={-5} textAnchor="middle" fontSize="12" fill={colors.dimensions}>
                {dimensions.depth}"
              </text>
              <text 
                x={-5} 
                y={height / 2} 
                textAnchor="middle" 
                transform={`rotate(-90, -5, ${height/2})`}
                fontSize="12"
                fill={colors.dimensions}
              >
                {dimensions.height}"
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Door Layout View */}
      <div className="p-4 bg-white rounded-lg">
        <span className="text-sm font-medium mb-2 block">Door Layout</span>
        <svg width={width + 40} height={height + 40} className="bg-gray-50">
          <g transform={`translate(20, 20)`}>
            {/* Cabinet outline */}
            <rect 
              width={width} 
              height={height} 
              fill="none"
              stroke={colors.dimensions}
              strokeWidth={1}
              strokeDasharray="2"
            />
            
            {/* Doors with colors */}
            {doors.map((door) => renderDoor(door, false))}
            
            {/* Door labels */}
            {doors.map((door, i) => {
              const dims = getDoorDimensions(door.position);
              return (
                <text
                  key={`door-label-${i}`}
                  x={dims.x + dims.width/2}
                  y={dims.y + dims.height/2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill={colors.dimensions}
                >
                  {door.type.charAt(0).toUpperCase() + door.type.slice(1)}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Color Legend */}
      <div className="flex gap-4 p-4 bg-white rounded-lg flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.topBottom}}></div>
          <span className="text-sm">Top/Bottom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.sides}}></div>
          <span className="text-sm">Sides</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.shelves}}></div>
          <span className="text-sm">Shelves</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.solidDoor, opacity: 0.3}}></div>
          <span className="text-sm">Solid Door</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.mirrorDoor, opacity: 0.3}}></div>
          <span className="text-sm">Mirror Door</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{backgroundColor: colors.glassDoor, opacity: 0.3}}></div>
          <span className="text-sm">Glass Door</span>
        </div>
      </div>
    </div>
  );
};

export default CabinetVisualization;