const latency = 4.2;

const calculateTravelTime = (from, to) => {
  let diff = Math.abs(from - to);
  if (diff !== 0) {
    return 1 + diff * 0.15 + 1 + latency;
  } else {
    return latency;
  }
};

let requestCount = 0;
let queue = [];
let totalQueueTime = 0;
let previous = { cylinder: 0 };
let current = {};
const algorithm = process.argv[2] || "FIFO";
const queueSize = parseInt(process.argv[3]) || 50;
const inputFile = process.argv[4] || "disk_data_100.txt";

async function main() {
  var rl = require("readline").createInterface({
    input: require("fs").createReadStream(inputFile),
  });
  //while there are still lines in the file
  for await (const line of rl) {
    requestCount++;
    //Fill queue to max queueSize
    if (queue.length < queueSize) {
      queue.push({ cylinder: parseInt(line), time: 0 });
      if (queue.length !== queueSize) {
        continue;
      }
    }
    manageQueue();
  }
  //while items remain on the queue, complete queue
  while (queue.length) {
    manageQueue();
  }
  console.log(
    "Total Queue Time:",
    parseFloat(totalQueueTime.toFixed(2))
  );
  console.log("Total requests:", requestCount);
  console.log(
    "Average queue time:",
    parseFloat((totalQueueTime / requestCount).toFixed(2))
  );
}

function manageQueue() {
  //pull current cylinder based on algorithm
  switch (algorithm) {
    case "SSTF":
      current = sstf();
      break;
    case "C-SCAN":
      current = cScan();
      break;
    case "FIFO":
      current = fifo();
      break;
    default:
      current = queue.shift();
      break;
  }
  //calculate current travel time
  let travelTime = calculateTravelTime(previous.cylinder, current.cylinder);
  //add onQueue time and travel time to total
  totalQueueTime += current.time + travelTime;
  //add travel time to all cylinders on queue
  for (let cylinder of queue) {
    cylinder.time += travelTime;
  }
  previous = current;
}

function sstf() {
  //find the nearest cylinder to seek to
  let nearest = 0;
  for (let index in queue) {
    if (
      Math.abs(queue[index].cylinder - previous.cylinder) <
      Math.abs(queue[nearest].cylinder - previous.cylinder)
    ) {
      nearest = index;
    }
  }
  //return and remvoe the nearest cylinder and save to current
  return queue.splice(nearest, 1)[0];
}

let index = 0;
function cScan() {
  //sort the queue
  queue = queue.sort((a,b) => a.cylinder - b.cylinder);
  //loop over the queue starting at the previous index
  for (index; index < queue.length; index++) {
    //if the cylinder at index is equal or greater than previous
    if (queue[index].cylinder >= previous.cylinder) {
      //return and remove that cylinder
      return queue.splice(index, 1)[0];
    }
  }
  //if the end of the queue was reached without finding an equal or larger cylinder 
  //than return and remove the first item on the queue and set index back to zero
  index = 0;
  return queue.shift();
}

function fifo() {
  //return and remove the first item on the queue
  return queue.shift();
}

main();
// FILE - disk_data_100.txt
// FIFO - Average with Q = 50 is 2245
// SSTF - Average with Q = 50 is 323
// C-SCAN - Average with Q = 50 is 333
