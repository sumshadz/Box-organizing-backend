const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}); 
const boxes = [
  {
    id: "01",
    height: 1,
    width: 1.5,
    depth: 2,
    weight: 20,
    address: "Sonepur"
  },
  {
    id: "02",
    height: 1,
    width: 1,
    depth: 2,
    weight: 5,
    address: "Bhubaneswar"
  },
  {
    id: "03",
    height: 3,
    width: 3,
    depth: 2,
    weight: 10,
    address: "Bangalore"
  }
];


// API endpoint to add a box
app.post('/boxes', (req, res) => {
  const { height, width, depth, weight, address,id } = req.body;
  const box = {
    id:id,
    height:height, 
    width:width, 
    depth:depth, 
    weight:weight, 
    address:address};
  boxes.push(box);
  res.json({ message: 'Box added successfully' });
});

// API endpoint to get all boxes
app.get('/boxes', (req, res) => {
  const boxesWithAllFields = boxes.length !== 0
  ? boxes.map((box) => ({
      id: box.id !== undefined ? box.id : '',
      height: box.height || 0,
      width: box.width || 0,
      depth: box.depth || 0,
      weight: box.weight || 0,
      address: box.address || '',
    }))
  : [];

res.json(boxesWithAllFields);
});

// API endpoint to delete a box
app.delete('/boxes/:id', (req, res) => {
  const { id } = req.params;
  const index = boxes.findIndex(box => box.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Box not found' });
  }

  boxes.splice(index, 1);
  res.json({ message: 'Box removed successfully' });
});

function calculateVolume(box) {
  const { height, width, depth } = box;
  const rotatedWidth = Math.min(width, depth);
  const rotatedDepth = Math.max(width, depth);
  return height * rotatedWidth * rotatedDepth;
}

// Function to compare boxes based on volume
function compareBoxes(box1, box2) {
  const volume1 = calculateVolume(box1);
  const volume2 = calculateVolume(box2);
  return volume2 - volume1;
}

// Function to arrange the boxes
function arrangeBoxes(boxes) {
  const sortedBoxes = boxes.sort(compareBoxes);
  const n = sortedBoxes.length;
  const memo = new Array(n).fill(-1);

  function findMaxHeight(index) {
    if (memo[index] !== -1) return memo[index];
    let maxHeight = 0;
    for (let i = index + 1; i < n; i++) {
      if (
        sortedBoxes[i].width < sortedBoxes[index].width &&
        sortedBoxes[i].depth < sortedBoxes[index].depth
      ) {
        const height = findMaxHeight(i);
        maxHeight = Math.max(maxHeight, height);
      }
    }
    memo[index] = sortedBoxes[index].height + maxHeight;
    return memo[index];
  }

  let maxHeight = 0;
  for (let i = 0; i < n; i++) {
    const height = findMaxHeight(i);
    maxHeight = Math.max(maxHeight, height);
  }

  const arrangedBoxes = sortedBoxes.slice(0, n);
  const ans = arrangedBoxes.reverse();
  return ans;
}

// API end point to arrange the boxes
app.get('/arrange-boxes', (req, res) => {
  const arrangedBoxes = arrangeBoxes(boxes);
  res.json(arrangedBoxes);
});

// API end point to get the height of the stack of boxes after arrangement
app.get('/height-of-stack', (req, res) => {
  const arrangedBoxes = arrangeBoxes(boxes);
  let height=0;
  for(let i=0;i<arrangedBoxes.length;i++){
    height+=arrangedBoxes[i].height;
  }
  res.json(height);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
