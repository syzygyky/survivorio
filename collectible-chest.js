document.getElementById('collectibles').addEventListener('input', event => {
  clampAndFocusNext(event);
})
document.getElementById('chestButton').addEventListener('click', collectibleChest);
function clampAndFocusNext(event) {
  const input = event.target;
  const value = Math.floor(input.value);
  if (value === '') return; 
  if (input.value < Number(input.min)) input.value = input.min;
  if (input.value > Number(input.max)) input.value = input.max;
  const inputs = Array.from(document.querySelectorAll('#collectibles input'));
  const index = inputs.indexOf(input);
  if (input.max === '10' && value === 1) return; 
  if (index === inputs.length -1) {
    input.blur();
    return;
  };
  inputs[index+1].focus();
}

const data = {
  epic: {
    shards: 30,
    salvage: 120,
    kind: 4
  },
  excellent: {
    shards: 20,
    salvage: 30,
    kind: 10
  },
  better: {
    shards: 10,
    salvage: 6,
    kind: 3
  },
  good: {
    shards: 10,
    salvage: 3,
    kind: 3
  }
}
const odds = {
  epic: {
    shard: 0.01,
    unit: 0.015,
  },
  excellent: {
    shard: 0.08,
    unit: 0.125,
  },
  better: {
    shard: 0.12,
    unit: 0.25,
  },
  good: {
    shard: 0.15,
    unit: 0.25,
  }
}

function collectibleChest(){
  const input = document.getElementById('trial-count');
  const trial = input.value === '' ? Math.floor(input.placeholder) : Math.floor(input.value);
  const counts = {
    epic: {
      shard:0, unit:0
    },
    excellent: {
      shard:0, unit:0
    },
    better: {
      shard:0, unit:0
    },
    good: {
      shard:0, unit:0
    }
  }
  let consecutive_10 = 0;
  let consecutive_80 = 0;
  const entries = [];

  for (const key in odds) {
    for (const type in odds[key]) {
      entries.push({ key, type, weight: odds[key][type] })
    }
  }
  for (let i=0; i<trial; i++) {
    if (consecutive_80 === 79) {
      counts.epic.unit++;
      consecutive_10 = 0;
      consecutive_80 = 0;
    } else if (consecutive_10 === 9) {
      counts.excellent.unit++;
      consecutive_10 = 0;
      consecutive_80++;
    } else {
      const rng = Math.random();
      let sum = 0;
      for (const entry of entries) {
        sum += entry.weight;
        if (rng < sum) {
          counts[entry.key][entry.type]++;
          if (entry.key === 'epic' && entry.type === 'unit') {
            consecutive_10 = 0;
            consecutive_80 = 0;
          } else if (entry.key === 'excellent' && entry.type === 'unit') {
            consecutive_10 = 0;
            consecutive_80++;
          } else {
            consecutive_10++;
            consecutive_80++;
          }
          break;
        }
      }
    }
  }
  console.log(counts)
  const total = {};
  for (const key of Object.keys(counts)) {
    total[key] = counts[key].unit * data[key].shards + counts[key].shard *5;
  }
  const expected = { collectible:{}, heart:0 };
  for (const [key,value] of Object.entries(total)) {
    const input = document.getElementById('max-'+key);
    const max = input.value === '' ? data[key].kind : Math.floor(input.value);
    const shard = value / trial;
    expected.collectible[key] = shard / data[key].shards;
    expected.heart += shard * data[key].salvage * max / data[key].kind;
  }

  const keyAmount = Number(document.getElementById('key-amt').value) || 300;
  const tbody = document.querySelector('#result > table > tbody');
  const tbody_ = tbody.cloneNode(true);
  for (const [key, value] of Object.entries(expected.collectible)) {
    const row = tbody_.querySelector('.'+key);
    row.cells[1].textContent = (value * keyAmount).toFixed(2);
    row.cells[2].textContent = value.toFixed(2);
  }
  const heartRow = tbody_.querySelector('.collectors-heart');
  heartRow.cells[1].textContent = (expected.heart * keyAmount /1000)
    .toFixed(2)+'k';
  heartRow.cells[2].textContent = expected.heart.toFixed(2);
  tbody.replaceWith(tbody_);
}