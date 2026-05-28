/**
 * Example Data
 * Sample wells and homes for demonstration purposes
 * Based on realistic oil & gas field locations
 */

export const EXAMPLE_WELLS = [
  {
    id: 'well-demo-1',
    name: 'Alpha-7 Petroleum Well',
    lat: 33.5731,
    lon: 73.0617,
    type: 'Oil',
    depth: '3,240 ft',
    operator: 'OGDCL',
    savedAt: new Date().toISOString(),
  },
  {
    id: 'well-demo-2',
    name: 'Beta Well Station',
    lat: 33.6007,
    lon: 73.0479,
    type: 'Gas',
    depth: '5,100 ft',
    operator: 'PPL',
    savedAt: new Date().toISOString(),
  },
];

export const EXAMPLE_HOMES = [
  {
    name: 'Residence A',
    lat: 33.5950,
    lon: 73.0480,
    description: 'Inside radius (2.7 km from Alpha-7)',
  },
  {
    name: 'Residence B',
    lat: 33.6400,
    lon: 73.1100,
    description: 'Outside radius (8.2 km from Alpha-7)',
  },
];

export const EXAMPLE_HISTORY = [
  {
    id: 'hist-demo-1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    well: { id: 'well-demo-1', name: 'Alpha-7 Petroleum Well', lat: 33.5731, lon: 73.0617 },
    home: { name: 'Residence A', lat: 33.595, lon: 73.048 },
    distance: 2.71,
    status: 'Inside 5 KM Radius',
    isInside: true,
  },
  {
    id: 'hist-demo-2',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    well: { id: 'well-demo-1', name: 'Alpha-7 Petroleum Well', lat: 33.5731, lon: 73.0617 },
    home: { name: 'Residence B', lat: 33.64, lon: 73.11 },
    distance: 8.24,
    status: 'Outside 5 KM Radius',
    isInside: false,
  },
];
