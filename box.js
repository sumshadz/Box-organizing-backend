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
const boxes = [];

// Helper function to check if one box can be placed on top of another box
function canPlaceOnTop(lowerBox, upperBox) {
  const [lh, lw, ld] = lowerBox;
  const [uh, uw, ud] = upperBox;

  return (lw > uw && ld > ud) || (lw > ud && ld > uw);
}

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

app.delete('/boxes/:id', (req, res) => {
  const { id } = req.params;
  const index = boxes.findIndex(box => box.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Box not found' });
  }

  boxes.splice(index, 1);
  res.json({ message: 'Box removed successfully' });
});

// API endpoint to find the tallest stack of boxes
app.get('/tallest-stack', (req, res) => {
  const sortedBoxes = [...boxes].sort((a, b) => b[0] - a[0]);
  const n = sortedBoxes.length;
  const dp = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    dp[i] = sortedBoxes[i][0];
    for (let j = 0; j < i; j++) {
      if (canPlaceOnTop(sortedBoxes[j], sortedBoxes[i])) {
        dp[i] = Math.max(dp[i], dp[j] + sortedBoxes[i][0]);
      }
    }
  }

  const maxHeight = Math.max(...dp);
  res.json({ maxHeight });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
