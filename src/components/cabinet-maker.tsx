"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import CabinetVisualization from './CabinetVisualization';

// Type definitions
type DoorPosition = 'full' | 'left-half' | 'right-half' | 'left-1/3' | 'middle-1/3' | 'right-1/3' | 
                    'left-2/3' | 'right-2/3' | 'upper-half' | 'lower-half' | 'upper-1/3' | 
                    'middle-vert-1/3' | 'lower-1/3';

type DoorType = 'solid' | 'mirror' | 'glass';
type JoineryType = 'dado' | 'dowel' | 'box-joint' | 'adjustable' | 'rabbeted' | 'inset' | 'screwed';

interface Door {
  position: DoorPosition;
  type: DoorType;
}

interface JoineryConfig {
  sides: JoineryType;
  shelves: JoineryType;
  construction: JoineryType;
  backPanel: JoineryType;
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
    depth: 6
  });
  
  const [materialThickness, setMaterialThickness] = useState(0.75);
  const [shelfCount, setShelfCount] = useState(3);
  
  const [joinery, setJoinery] = useState<JoineryConfig>({
    sides: 'dado',
    shelves: 'dado',
    construction: 'screwed',
    backPanel: 'rabbeted'
  });
  
  const [doors, setDoors] = useState<Door[]>([
    { position: 'left-2/3', type: 'mirror' },
    { position: 'right-1/3', type: 'solid' }
  ]);

  const positionOptions = [
    'full', 'left-half', 'right-half',
    'left-1/3', 'middle-1/3', 'right-1/3',
    'left-2/3', 'right-2/3',
    'upper-half', 'lower-half',
    'upper-1/3', 'middle-vert-1/3', 'lower-1/3'
  ];

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

  const calculateCutList = (): CutPiece[] => {
    const jointingNotes = {
      sides: joinery.sides === 'dado' ? 
        'with shelf dados' : 
        joinery.sides === 'dowel' ? 
        'with dowel holes marked' : 
        'prepared for box joints',
      shelves: joinery.shelves === 'dado' ? 
        'for dado joint' : 
        joinery.shelves === 'dowel' ? 
        'for dowel mounting' :
        'for shelf pins',
      construction: joinery.construction === 'screwed' ?
        'pre-drill for screws' :
        'cut box joints on ends',
      backPanel: joinery.backPanel === 'rabbeted' ?
        'with back panel rabbet' :
        'with back panel dado'
    };

    return [
      { 
        name: 'Top', 
        qty: 1, 
        width: dimensions.width, 
        length: dimensions.depth, 
        notes: `Main cabinet top (${materialThickness}") - ${jointingNotes.construction}` 
      },
      { 
        name: 'Bottom', 
        qty: 1, 
        width: dimensions.width, 
        length: dimensions.depth, 
        notes: `Main cabinet bottom (${materialThickness}") - ${jointingNotes.construction}` 
      },
      { 
        name: 'Left Side', 
        qty: 1, 
        width: dimensions.depth - materialThickness, 
        length: dimensions.height, 
        notes: `Left side (${materialThickness}") - ${jointingNotes.sides} - ${jointingNotes.backPanel}` 
      },
      { 
        name: 'Right Side', 
        qty: 1, 
        width: dimensions.depth - materialThickness, 
        length: dimensions.height, 
        notes: `Right side (${materialThickness}") - ${jointingNotes.sides} - ${jointingNotes.backPanel}` 
      },
      { 
        name: 'Back Panel', 
        qty: 1, 
        width: dimensions.width - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        length: dimensions.height - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        notes: `1/4" back panel - ${joinery.backPanel === 'rabbeted' ? 'fits in rabbet' : 'fits in dado'}` 
      },
      { 
        name: 'Shelf', 
        qty: shelfCount, 
        width: dimensions.width - materialThickness * 2 - (joinery.shelves === 'adjustable' ? 0.125 : 0), 
        length: dimensions.depth - materialThickness - 0.75, 
        notes: `${materialThickness}" shelves - ${jointingNotes.shelves}` 
      },
      ...doors.map(door => {
        const { width, height } = getDoorDimensions(door.position);
        return {
          name: `${door.type === 'mirror' ? 'Mirror' : 'Solid'} Door (${door.position})`,
          qty: 1,
          width: width + 1,
          length: height + 1,
          notes: door.type === 'mirror' ? 
            `${materialThickness}" door with mirror - 1/2" overlay` : 
            `${materialThickness}" door - 1/2" overlay`
        };
      })
    ];
  };

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

  const cutList = calculateCutList();

  return (
  <div className="w-full max-w-5xl p-8 bg-white rounded-lg shadow-lg">

<div className="w-full max-w-6xl p-8 mx-auto bg-white rounded-xl shadow-lg">
  <div className="mb-12 border-b border-wood-light/20 pb-6">
    <h1 className="text-4xl font-bold text-wood-dark">Cabinet Maker</h1>
  </div>

      <p className="mt-2 text-gray-600">Design and plan your cabinet dimensions and cuts</p>
    </div>

      {/* Dimensions Section */}

      <div className="mb-12 bg-gray-50 p-8 rounded-xl shadow-sm">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-wood-dark">Cabinet Dimensions</h2>
     <p className="mt-1 text-sm text-gray-600">Enter the overall dimensions of your cabinet</p>
     </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Width (inches)</label>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.125"
            />
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Height (inches)</label>
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.125"
            />
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Depth (inches)</label>
            <input
              type="number"
              value={dimensions.depth}
              onChange={(e) => setDimensions({...dimensions, depth: parseFloat(e.target.value)})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.125"
            />
          </div>
        </div>
      </div>

      {/* Material & Joinery Section */}
      <div className="mb-12 bg-gray-50 p-8 rounded-xl shadow-sm">
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-wood-dark">Construction Details</h2>
    <p className="mt-1 text-sm text-gray-600">Select material thickness and joinery methods</p>
  </div>
        
        {/* Material Thickness */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Material Thickness (inches)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={materialThickness}
                onChange={(e) => setMaterialThickness(parseFloat(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                step="0.125"
              />
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Common: 3/4" (0.75), 1/2" (0.5), 1/4" (0.25)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Joinery Options */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Side Panel Joinery</label>
            <select 
              value={joinery.sides}
              onChange={(e) => setJoinery({...joinery, sides: e.target.value as JoineryType})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="dado">Dado Joint</option>
              <option value="dowel">Doweled</option>
              <option value="box-joint">Box Joint</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Shelf Mounting</label>
            <select 
              value={joinery.shelves}
              onChange={(e) => setJoinery({...joinery, shelves: e.target.value as JoineryType})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="dado">Fixed (Dado)</option>
              <option value="dowel">Fixed (Doweled)</option>
              <option value="adjustable">Adjustable (Shelf Pins)</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Construction Method</label>
            <select 
              value={joinery.construction}
              onChange={(e) => setJoinery({...joinery, construction: e.target.value as JoineryType})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="screwed">Screwed & Glued</option>
              <option value="box-joint">Box Jointed</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <label className="block mb-2 text-gray-700 font-medium">Back Panel Mount</label>
            <select 
              value={joinery.backPanel}
              onChange={(e) => setJoinery({...joinery, backPanel: e.target.value as JoineryType})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rabbeted">Rabbeted</option>
              <option value="inset">Inset (Dado)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shelf Configuration */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Shelf Configuration</h2>
        <div className="flex items-center gap-4 bg-white p-4 rounded-md shadow-sm">
          <button 
            onClick={() => setShelfCount(Math.max(0, shelfCount - 1))}
            className="p-3 border rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-lg font-medium text-gray-700">{shelfCount} shelves</span>
          <button 
            onClick={() => setShelfCount(shelfCount + 1)}
            className="p-3 border rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

{/* Door Configuration */}
<div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Door Configuration</h2>
          <button 
            onClick={addDoor}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" /> Add Door
          </button>
        </div>
        
        {doors.map((door, index) => (
          <div key={index} className="flex gap-4 items-center mb-2 p-4 bg-white rounded-md shadow-sm">
            <select
              value={door.position}
              onChange={(e) => updateDoor(index, 'position', e.target.value)}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="solid">Solid Door</option>
              <option value="mirror">Mirror Door</option>
              <option value="glass">Glass Door</option>
            </select>
            
            <button 
              onClick={() => removeDoor(index)}
              className="p-3 border rounded-lg hover:bg-red-50 focus:ring-2 focus:ring-red-500"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

     {/* Cut List */}
     <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cut List</h2>
        <div className="overflow-x-auto bg-white rounded-md shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border-b text-left font-semibold text-gray-700">Piece</th>
                <th className="p-3 border-b text-center font-semibold text-gray-700">Qty</th>
                <th className="p-3 border-b text-center font-semibold text-gray-700">Width</th>
                <th className="p-3 border-b text-center font-semibold text-gray-700">Length</th>
                <th className="p-3 border-b text-left font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {cutList.map((piece, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{piece.name}</td>
                  <td className="p-3 border-b text-center">{piece.qty}</td>
                  <td className="p-3 border-b text-center">{Math.round(piece.width * 100) / 100}"</td>
                  <td className="p-3 border-b text-center">{Math.round(piece.length * 100) / 100}"</td>
                  <td className="p-3 border-b">{piece.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cabinet Visualization</h2>
        <CabinetVisualization 
          dimensions={dimensions}
          materialThickness={materialThickness}
          shelfCount={shelfCount}
          doors={doors}
        />
      </div>
    </div>
  );
};

export default CabinetMaker;