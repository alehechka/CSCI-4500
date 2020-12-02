// Capacity	P1	    P2	    P3	    P4	    PT
// 5	    37.00%	39.20%	21.60%	21.60%	29.85%
// 10	    78.20%	83.00%	44.40%	44.40%	62.50%

async function main(p1frames, p2frames, p3frames, p4frames, print) {
  var rl = require("readline").createInterface({
    input: require("fs").createReadStream(inputFile),
  });
  let memoryItems = [null, [], [], [], []];
  //read and store all page frames into 2D index representing the process
  for await (const line of rl) {
    let numbers = line.split(" ");
    memoryItems[numbers[0]].push(parseInt(numbers[1]));
  }
  let hitrate1 = readPageFrames(memoryItems[1], p1frames);
  let hitrate2 = readPageFrames(memoryItems[2], p2frames);
  let hitrate3 = readPageFrames(memoryItems[3], p3frames);
  let hitrate4 = readPageFrames(memoryItems[4], p4frames);
  let hitRateAverage = parseFloat(
    (
      (hitrate1.hitRate +
        hitrate2.hitRate +
        hitrate3.hitRate +
        hitrate4.hitRate) /
      4
    ).toFixed(2)
  );

  if (print) {
    console.log(
      `${hitrate1.hitRate}% ${hitrate2.hitRate}% ${hitrate3.hitRate}% ${hitrate4.hitRate}% AVG=${hitRateAverage}%`
    );
  }
  return hitRateAverage;
}

function readPageFrames(frames, queueSize) {
  let queue = [];
  let hits = 0;
  let misses = 0;

  for (let frame of frames) {
    if (queue.includes(frame)) {
      queue.splice(queue.indexOf(frame), 1);
      queue.push(frame);
      hits++;
    } else {
      if (queue.length >= queueSize) {
        queue.shift();
      }
      queue.push(frame);
      misses++;
    }
  }
  let total = hits + misses;
  let hitRate = hits / total;
  return {
    hits,
    misses,
    total,
    hitRate: parseFloat((hitRate * 100).toFixed(2)),
  };
}

async function findOptimalCombination(dec) {
  let largest = { one: 0, two: 0, three: 0, four: 0, hitRate: 0 };
  for (let one = 50; one > 0; one -= dec) {
    for (let two = 50 - one; two > 0; two -= dec) {
      for (let three = 50 - one - two; three > 0; three -= dec) {
        for (let four = 50 - one - two - three; four > 0; four -= dec) {
          let newHitRate = await main(one, two, three, four, false);
          //console.log(one, two, three, four, newHitRate);
          if (newHitRate > largest.hitRate) {
            largest = { one, two, three, four, hitRate: newHitRate };
            console.log("New largest:", largest);
          }
        }
      }
    }
  }
  console.log("Best combo:", largest);
}

async function assignment(inc) {
  for (let i = inc; i <= 50; i += inc) {
    console.log("Allocation size:", i);
    await main(i, i, i, i, true);
  }
}

let inputFile = process.argv[2] || "p4_data";
let p1 = parseInt(process.argv[3]) || 5;
let p2 = parseInt(process.argv[4]) || 5;
let p3 = parseInt(process.argv[5]) || 5;
let p4 = parseInt(process.argv[6]) || 5;
if (process.argv.length > 2) {
  if (process.argv[2] === "optimal") {
    inputFile = "p4_data";
    findOptimalCombination(p1);
  } else if (process.argv[2] === "assign") {
    inputFile = "p4_data";
    assignment(p1);
  } else {
    main(p1, p2, p3, p4, true);
  }
} else {
  console.log(`
    Options: 
      - optimal <decrementer>:  Will find the optimal combination of process allocations. 
                                If no decrementer is provided will default to 5.

      - assign: <incrementer>:  Runs the assignment simulation by computing with all processes equal from 5 to 50.
                                Providing an incrementer will increment by that instead of 5.

      - <fileName> <p1 alloc> <p2 alloc> <p3 alloc> <p4 alloc>"
                                Allows manual input of a filename and process allocations.
                                Default file is "p4_data" and allocations set to 5.
  `);
}
