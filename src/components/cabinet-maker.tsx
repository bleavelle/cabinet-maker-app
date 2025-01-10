'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import CabinetVisualization from './CabinetVisualization';

type DoorPosition = 'full' | 'left-half' | 'right-half' | 'left-1/3' | 'middle-1/3' | 'right-1/3' | 
                    'left-2/3' | 'right-2/3' | 'upper-half' | 'lower-half' | 'upper-1/3' | 
                    'middle-vert-1/3' | 'lower-1/3';

type DoorType = 'solid' | 'mirror' | 'glass';

interface Door {
  position: DoorPosition;
  type: DoorType;
}

interface CutPiece {
  name: string;
  qty: number;
  width: number;
  length: number;
  notes: string;
}

const CabinetMaker = () => {
  const [dimensions, setDimensions] = useState({
    width: 24,
    height: 30,
    depth: 12
  });
  
  const [materialThickness, setMaterialThickness] = useState(0.75);
  const [shelfCount, setShelfCount] = useState(3);
  const [joinery, setJoinery] = useState({
    sideJoint: {
      type: 'screwed' as const,
      depth: 0.25
    },
    shelves: 'adjustable' as const,
    backPanel: 'rabbeted' as const
  });
  
  const [doors, setDoors] = useState<Door[]>([
    { position: 'left-2/3', type: 'solid' },
    { position: 'right-1/3', type: 'solid' }
  ]);

  const positionOptions = [
    'full', 'left-half', 'right-half',
    'left-1/3', 'middle-1/3', 'right-1/3',
    'left-2/3', 'right-2/3',
    'upper-half', 'lower-half',
    'upper-1/3', 'middle-vert-1/3', 'lower-1/3'
  ] as const;

  const addDoor = () => {
    setDoors([...doors, { position: 'full', type: 'solid' }]);
  };

  const removeDoor = (index: number) => {
    setDoors(doors.filter((_, i) => i !== index));
  };

  const updateDoor = (index: number, field: 'position' | 'type', value: string) => {
    const newDoors = [...doors];
    newDoors[index] = { ...newDoors[index], [field]: value as any };
    setDoors(newDoors);
  };

  const updateJoinery = (field: 'sideJoint', value: any) => {
    if (field === 'sideJoint') {
      setJoinery(prev => ({
        ...prev,
        sideJoint: { ...prev.sideJoint, ...value }
      }));
    }
  };

  const calculateCutList = (): CutPiece[] => {
    const jointDepth = joinery.sideJoint.type === 'screwless' 
      ? materialThickness * joinery.sideJoint.depth * 2 
      : 0;
  
    const sideLengthBase = dimensions.height - materialThickness * 2;
    const sideLength = sideLengthBase + jointDepth;
  
    const jointingNotes = {
      screwed: 'cut to fit, pre-drill for screws and glue',
      screwless: `includes ${(jointDepth / 2).toFixed(3)} extra inches on each end for joinery`,
      shelves: joinery.shelves === 'dado' ? 
        'for dado joint' : 
        'for shelf pins',
      backPanel: joinery.backPanel === 'rabbeted' ?
        'with back panel rabbet' :
        'with back panel dado'
    };
  
    return [
      { 
        name: 'Top', 
        qty: 1, 
        length: dimensions.width, 
        width: dimensions.depth, 
        notes: `Main cabinet top (${materialThickness}) - ${joinery.sideJoint.type === 'screwed' ? jointingNotes.screwed : 'receives side panel joints'}` 
      },
      { 
        name: 'Bottom', 
        qty: 1, 
        length: dimensions.width, 
        width: dimensions.depth, 
        notes: `Main cabinet bottom (${materialThickness}) - ${joinery.sideJoint.type === 'screwed' ? jointingNotes.screwed : 'receives side panel joints'}` 
      },
      { 
        name: 'Left Side', 
        qty: 1, 
        width: dimensions.depth, 
        length: sideLength, 
        notes: `Left side (${materialThickness}) - ${joinery.sideJoint.type === 'screwed' ? jointingNotes.screwed : jointingNotes.screwless}` 
      },
      { 
        name: 'Right Side', 
        qty: 1, 
        width: dimensions.depth, 
        length: sideLength, 
        notes: `Right side (${materialThickness}) - ${joinery.sideJoint.type === 'screwed' ? jointingNotes.screwed : jointingNotes.screwless}` 
      },
      { 
        name: 'Back Panel', 
        qty: 1, 
        width: dimensions.width - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        length: dimensions.height - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        notes: `1/4 back panel - ${jointingNotes.backPanel}` 
      },
      { 
        name: 'Shelf', 
        qty: shelfCount, 
        length: dimensions.width - materialThickness - (joinery.shelves === 'adjustable' ? 0.125 : 0), 
        width: dimensions.depth - materialThickness - 0.75, 
        notes: `${materialThickness} shelves - ${jointingNotes.shelves}` 
      },
      ...doors.map(door => {
        const dims = getDoorDimensions(door.position);
        return {
          name: `${door.type === 'mirror' ? 'Mirror' : 'Solid'} Door (${door.position})`,
          qty: 1,
          width: dims.width + 1,
          length: dims.height + 1,
          notes: door.type === 'mirror' ? 
            `${materialThickness} door with mirror - 1/2 overlay` : 
            `${materialThickness} door - 1/2 overlay`
        };
      })
    ];
  };

  const getDoorDimensions = (position: string) => {
    let width = dimensions.width;
    let height = dimensions.height;
    
    if (position.includes('half')) {
      width = position.includes('left') || position.includes('right') ? width / 2 : width;
      height = position.includes('upper') || position.includes('lower') ? height / 2 : height;
    } else if (position.includes('1/3')) {
      width = position.includes('vert') ? width : width / 3;
      height = position.includes('vert') ? height / 3 : height;
    } else if (position.includes('2/3')) {
      width = width * 2/3;
    }
    
    return { width: width + 0.5, height: height + 0.5 };
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Title */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-mono text-gray-400 py-4 text-center">
            IT ALWAYS STARTS AS A BOX
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-8">
        {/* Dimensions */}
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(dimensions).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-gray-400 text-sm font-mono">{key}&quot;</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setDimensions(prev => ({
                  ...prev,
                  [key]: parseFloat(e.target.value) || 0
                }))}
                className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200 font-mono"
                step="0.125"
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm font-mono">Material&quot;</label>
            <input
              type="number"
              value={materialThickness}
              onChange={(e) => setMaterialThickness(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200 font-mono"
              step="0.125"
            />
          </div>
        </div>

        {/* Joint and Shelves */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm font-mono">Joint</label>
            <select 
              value={joinery.sideJoint.type}
              onChange={(e) => updateJoinery('sideJoint', { type: e.target.value })}
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200"
            >
              <option value="screwed">Screwed</option>
              <option value="screwless">Screwless</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-mono">Shelves</span>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
              <button 
                onClick={() => setShelfCount(Math.max(0, shelfCount - 1))}
                className="px-2 py-1 hover:bg-gray-700"
              >
                <Minus className="w-4 h-4 text-gray-400" />
              </button>
              <span className="px-3 font-mono text-gray-200">{shelfCount}</span>
              <button 
                onClick={() => setShelfCount(shelfCount + 1)}
                className="px-2 py-1 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <button 
            onClick={addDoor}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Door
          </button>
        </div>

        {/* Visualization */}
        <div className="w-full">
          <CabinetVisualization 
            dimensions={dimensions}
            materialThickness={materialThickness}
            shelfCount={shelfCount}
            doors={doors}
            joinery={joinery}
          />
        </div>

        {/* Door Configuration */}
        <div className="flex flex-col gap-4">
          {doors.map((door, index) => (
            <div key={index} className="flex gap-4 items-center">
              <select
                value={door.position}
                onChange={(e) => updateDoor(index, 'position', e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200"
              >
                {positionOptions.map(option => (
                  <option key={option} value={option}>
                    {option.replace('-', ' ').replace('/', ' of ')}
                  </option>
                ))}
              </select>
              
              <select
                value={door.type}
                onChange={(e) => updateDoor(index, 'type', e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200"
              >
                <option value="solid">Solid Door</option>
                <option value="mirror">Mirror Door</option>
                <option value="glass">Glass Door</option>
              </select>
              
              <button 
                onClick={() => removeDoor(index)}
                className="px-2 py-1 bg-gray-900 hover:bg-gray-700 rounded flex items-center gap-2 text-gray-400"
              >
                <Minus className="w-4 h-4" /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Cut List */}
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-3 text-gray-400 font-mono">Piece</th>
                <th className="text-center p-3 text-gray-400 font-mono">Qty</th>
                <th className="text-center p-3 text-gray-400 font-mono">Width</th>
                <th className="text-center p-3 text-gray-400 font-mono">Length</th>
                <th className="text-left p-3 text-gray-400 font-mono">Notes</th>
              </tr>
            </thead>
            <tbody>
              {calculateCutList().map((piece, index) => (
                <tr key={index} className="border-b border-gray-800/50">
                  <td className="p-3 text-gray-200">{piece.name}</td>
                  <td className="p-3 text-center text-gray-200">{piece.qty}</td>
                  <td className="p-3 text-center text-gray-200">
                    {Math.round(piece.width * 100) / 100}"
                  </td>
                  <td className="p-3 text-center text-gray-200">
                    {Math.round(piece.length * 100) / 100}"
                  </td>
                  <td className="p-3 text-gray-200">{piece.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CabinetMaker;