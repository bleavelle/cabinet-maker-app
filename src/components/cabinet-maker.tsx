'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
        notes: `Main cabinet top (${materialThickness}) - ${jointingNotes.construction}` 
      },
      { 
        name: 'Bottom', 
        qty: 1, 
        width: dimensions.width, 
        length: dimensions.depth, 
        notes: `Main cabinet bottom (${materialThickness}) - ${jointingNotes.construction}` 
      },
      { 
        name: 'Left Side', 
        qty: 1, 
        width: dimensions.depth - materialThickness, 
        length: dimensions.height, 
        notes: `Left side (${materialThickness}) - ${jointingNotes.sides} - ${jointingNotes.backPanel}` 
      },
      { 
        name: 'Right Side', 
        qty: 1, 
        width: dimensions.depth - materialThickness, 
        length: dimensions.height, 
        notes: `Right side (${materialThickness}) - ${jointingNotes.sides} - ${jointingNotes.backPanel}` 
      },
      { 
        name: 'Back Panel', 
        qty: 1, 
        width: dimensions.width - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        length: dimensions.height - (joinery.backPanel === 'rabbeted' ? materialThickness * 2 : 0), 
        notes: `1/4 back panel - ${joinery.backPanel === 'rabbeted' ? 'fits in rabbet' : 'fits in dado'}` 
      },
      { 
        name: 'Shelf', 
        qty: shelfCount, 
        width: dimensions.width - materialThickness * 2 - (joinery.shelves === 'adjustable' ? 0.125 : 0), 
        length: dimensions.depth - materialThickness - 0.75, 
        notes: `${materialThickness} shelves - ${jointingNotes.shelves}` 
      },
      ...doors.map(door => {
        const { width, height } = getDoorDimensions(door.position);
        return {
          name: `${door.type === 'mirror' ? 'Mirror' : 'Solid'} Door (${door.position})`,
          qty: 1,
          width: width + 1,
          length: height + 1,
          notes: door.type === 'mirror' ? 
            `${materialThickness} door with mirror - 1/2 overlay` : 
            `${materialThickness} door - 1/2 overlay`
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
    newDoors[index] = { ...newDoors[index], [field]: value as DoorType | DoorPosition };
    setDoors(newDoors);
  };

  const cutList = calculateCutList();

  return (
    <div className="min-h-screen bg-sky-50 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sky-900 mb-2">Cabinet Maker</h1>
          <p className="text-lg text-sky-700">Design your custom cabinet with precise measurements</p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Dimensions */}
            <section className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-sky-900 mb-6">Dimensions</h2>
              <div className="grid gap-6">
                {Object.entries(dimensions).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-lg text-sky-800 mb-2 capitalize">
                      {key} (inches)
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setDimensions({...dimensions, [key]: parseFloat(e.target.value) || 0})}
                      className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                      step="0.125"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Material Thickness */}
            <section className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-sky-900 mb-6">Material</h2>
              <div className="space-y-4">
                <label className="block text-lg text-sky-800 mb-2">
                  Thickness (inches)
                </label>
                <input
                  type="number"
                  value={materialThickness}
                  onChange={(e) => setMaterialThickness(parseFloat(e.target.value) || 0)}
                  className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                  step="0.125"
                />
                <div className="mt-2 text-sky-600">
                  Common: 3/4 (0.75), 1/2 (0.5), 1/4 (0.25)
                </div>
              </div>
            </section>

            {/* Shelf Count */}
            <section className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-sky-900 mb-6">Shelves</h2>
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => setShelfCount(Math.max(0, shelfCount - 1))}
                  className="p-4 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors"
                >
                  <Minus className="h-6 w-6" />
                </button>
                <span className="text-2xl font-semibold text-sky-900 min-w-[80px] text-center">
                  {shelfCount}
                </span>
                <button 
                  onClick={() => setShelfCount(shelfCount + 1)}
                  className="p-4 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Joinery */}
            <section className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-sky-900 mb-6">Construction Method</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-lg text-sky-800 mb-2">Side Panel Joinery</label>
                  <select 
                    value={joinery.sides}
                    onChange={(e) => setJoinery({...joinery, sides: e.target.value as JoineryType})}
                    className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                  >
                    <option value="dado">Dado Joint</option>
                    <option value="dowel">Doweled</option>
                    <option value="box-joint">Box Joint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg text-sky-800 mb-2">Shelf Mounting</label>
                  <select 
                    value={joinery.shelves}
                    onChange={(e) => setJoinery({...joinery, shelves: e.target.value as JoineryType})}
                    className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                  >
                    <option value="dado">Fixed (Dado)</option>
                    <option value="dowel">Fixed (Doweled)</option>
                    <option value="adjustable">Adjustable (Shelf Pins)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg text-sky-800 mb-2">Construction Method</label>
                  <select 
                    value={joinery.construction}
                    onChange={(e) => setJoinery({...joinery, construction: e.target.value as JoineryType})}
                    className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                  >
                    <option value="screwed">Screwed & Glued</option>
                    <option value="box-joint">Box Jointed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg text-sky-800 mb-2">Back Panel Mount</label>
                  <select 
                    value={joinery.backPanel}
                    onChange={(e) => setJoinery({...joinery, backPanel: e.target.value as JoineryType})}
                    className="w-full p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none"
                  >
                    <option value="rabbeted">Rabbeted</option>
                    <option value="inset">Inset (Dado)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Cut List */}
            <section className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-sky-900 mb-6">Cut List</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-sky-100">
                      <th className="text-left p-4 text-sky-800">Piece</th>
                      <th className="text-center p-4 text-sky-800">Qty</th>
                      <th className="text-center p-4 text-sky-800">Width</th>
                      <th className="text-center p-4 text-sky-800">Length</th>
                      <th className="text-left p-4 text-sky-800">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cutList.map((piece, index) => (
                      <tr key={index} className="border-b border-sky-50 hover:bg-sky-50">
                        <td className="p-4 text-sky-900">{piece.name}</td>
                        <td className="p-4 text-center text-sky-900">{piece.qty}</td>
                        <td className="p-4 text-center text-sky-900">
                          {Math.round(piece.width * 100) / 100}
                        </td>
                        <td className="p-4 text-center text-sky-900">
                          {Math.round(piece.length * 100) / 100}
                        </td>
                        <td className="p-4 text-sky-900">{piece.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        {/* Door Configuration */}
        <section className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-sky-900">Doors</h2>
            <button 
              onClick={addDoor}
              className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add Door
            </button>
          </div>
          
          <div className="grid gap-4">
            {doors.map((door, index) => (
              <div key={index} className="flex gap-4 items-center p-4 bg-sky-50 rounded-xl">
                <select
                  value={door.position}
                  onChange={(e) => updateDoor(index, 'position', e.target.value)}
                  className="flex-1 p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none bg-white"
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
                  className="flex-1 p-4 text-lg border-2 border-sky-100 rounded-xl focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all outline-none bg-white"
                >
                  <option value="solid">Solid Door</option>
                  <option value="mirror">Mirror Door</option>
                  <option value="glass">Glass Door</option>
                </select>
                
                <button 
                  onClick={() => removeDoor(index)}
                  className="p-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                >
                  <Minus className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CabinetMaker;