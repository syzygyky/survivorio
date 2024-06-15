function enhanceCostCalc(){
  const obj = getForm();

  function levelingCalc(survivor){
    const result = {
      essence:0,
      gold:0
    }

    if(obj[survivor].isLvlChanged){
      const grade = survivorFeatures[survivor].grade;
      const currentLvl = obj[survivor].current.lvl;
      const targetLvl = obj[survivor].target.lvl;

      for(let i=0; i<currentLvl; i++){
        result.essence += upgradeData[grade].essence[i];
        result.gold += upgradeData[grade].gold[i];
      }
      for(let i=0; i<targetLvl; i++){
        result.essence -= upgradeData[grade].essence[i];
        result.gold -= upgradeData[grade].gold[i];
      }
    } 
    return result;
  }
  function upgradeCalc(survivor){
    const result = {
      shard:0,
      quantum:0,
      core:0,
      unlockByEvent:false
    }
    const grade = survivorFeatures[survivor].grade;

    const currentUpgrade = obj[survivor].current.upgrade;
    const targetUpgrade = obj[survivor].target.upgrade;
    if(currentUpgrade !== targetUpgrade){
      const star = {
        current:{},
        target:{},
      }
      star.current.yellow = (currentUpgrade > 6) ? 6 : currentUpgrade;
      star.current.red = (currentUpgrade > 6) ? currentUpgrade - 6 : 0;
      star.target.yellow = (targetUpgrade > 6) ? 6 : targetUpgrade;
      star.target.red = (targetUpgrade > 6) ? targetUpgrade - 6 : 0;

      if(star.current.yellow === 0){
        if('shard' in survivorFeatures[survivor].unlock) {
          result.shard -= survivorFeatures[survivor].unlock.shard;
        } else {
          result.unlockByEvent = true;
        }
      }
      for(let i=1; i<star.current.yellow; i++){
        result.shard += upgradeData[grade].shard[i];
      }
      for(let i=0; i<star.current.red; i++){
        result.shard += upgradeData[grade].awakening.shard[i];
        result.quantum += upgradeData[grade].awakening.quantum[i];
        result.core += upgradeData[grade].awakening.core[i];
      }
      for(let i=1; i<star.target.yellow; i++){
        result.shard -= upgradeData[grade].shard[i];
      }
      for(let i=0; i<star.target.red; i++){
        result.shard -= upgradeData[grade].awakening.shard[i];
        result.quantum -= upgradeData[grade].awakening.quantum[i];
        result.core -= upgradeData[grade].awakening.core[i];
      }
    }
    return result;
  }

  const survivorCosts = {};
  for(const key of Object.keys(obj)){
    const levelingCosts = levelingCalc(key);
    const upgradeCosts = upgradeCalc(key);
    survivorCosts[key] = {...levelingCosts, ...upgradeCosts};
  }

  function calcTotalCost(material){
    let result = 0;
    for(const key of Object.keys(survivorCosts)){
      result += survivorCosts[key][material];
    }
    return result;
  }

  const totalCosts = {
    essence: calcTotalCost('essence'),
    gold: calcTotalCost('gold'),
    quantum: calcTotalCost('quantum'),
    core: calcTotalCost('core')
  };

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  const result = document.createElement('p');
  resultDiv.append(result);

  const imgPath = {
    essence: 'pic/energy_essence.webp',
    gold: 'pic/gold.webp',
    quantum: 'pic/quantum_shard.webp',
    core: 'pic/awakening_core.webp'
  }
  function formatResult() {
    for(const key of Object.keys(totalCosts)){
      if(totalCosts[key] !== 0){
        const span = document.createElement('span');
        const img = document.createElement('img');
        img.src = imgPath[key];
        img.classList.add('icon');
        span.style.fontWeight = 'bold';
        if(totalCosts[key] > 0) span.style.color = '#4f4';
        if(totalCosts[key] < 0) span.style.color = '#f44';
        span.textContent = Math.abs(totalCosts[key]).toLocaleString();
        if(key === 'gold') span.textContent += 'k';
        result.append(img,'x',span, ' ');
      }
    }
    for(const key of Object.keys(survivorCosts)){
      if(survivorCosts[key].unlockByEvent){
        const img = document.createElement('img');
        img.src = `pic/head_${key}.png`;
        img.classList.add('icon');
        result.append(img);
      }
      if(survivorCosts[key].shard !== 0){
        const span = document.createElement('span');
        const img = document.createElement('img');
        img.src = `pic/shard_${key}.png`;
        img.classList.add('icon');
        span.style.fontWeight = 'bold';
        if(survivorCosts[key].shard > 0) span.style.color = '#4f4';
        if(survivorCosts[key].shard < 0) span.style.color = '#f44';
        span.textContent = Math.abs(survivorCosts[key].shard);
        result.append(img,'x',span, ' ');
      }
    }
  }
  formatResult();
}
function lvlInputsVerifier(target) {
  if(target.name === 'lvl'){
    const fieldset = target.closest('fieldset');
    const state = fieldset.dataset.state;

    if(target.value !== '') {
      let value = Number(target.value);
      if(value < 1) value = 1;
      if(value > 120) value = 120;
      target.value = Math.floor(value);
    }

    if(state === 'target'){
      const checkbox = target.parentNode.querySelector('input[name="isLvlChanged"]');
      checkbox.checked = Boolean(target.value);
    }
  }
}
function statsCalc(){
  const selected = document.stats.survivor.value;
  const perks = Number(document.stats.perks.value);
  const obj = getForm();

  function getAllSurvivorsEffects(state){
    const result = {
      atkUp:0,
      hpUp:0,
      critRate:0,
      critDamage:0,
      heal:0,
      healOnLvlUp:0
    }
    for(const survivor of Object.keys(obj)){
      const lv40 = survivorFeatures[survivor].upgrades.lv40;
      const lv80 = survivorFeatures[survivor].upgrades.lv80;
      const lv120 = survivorFeatures[survivor].upgrades.lv120;
      const star5 = survivorFeatures[survivor].upgrades.star5;

      const lvl = obj[survivor][state].lvl;
      const star = obj[survivor][state].upgrade;
      if(lvl >= 40) result[Object.keys(lv40)[0]] += Object.values(lv40)[0];
      if(lvl >= 80) result[Object.keys(lv80)[0]] += Object.values(lv80)[0];
      if(lvl >= 120) result[Object.keys(lv120)[0]] += Object.values(lv120)[0];
      if(star >= 5) result[Object.keys(star5)[0]] += Object.values(star5)[0];
    }
    return result;
  }
  
  function baseStatsCalc(state){
    const result = {
      atk:0,
      hp:0,
      atkUp:0,
      hpUp:0
    }
    const lvl = obj[selected][state].lvl;
    const star = obj[selected][state].upgrade;
    const grade = survivorFeatures[selected].grade;
    for(let i=0; i<lvl+1; i++){
      result.atk += upgradeData[grade].atk[i];
      result.hp += upgradeData[grade].hp[i];
    }
    const lv20 = survivorFeatures[selected].upgrades.lv20;
    const lv60 = survivorFeatures[selected].upgrades.lv60;
    const lv100 = survivorFeatures[selected].upgrades.lv100;
    if(lvl >= 20) result[Object.keys(lv20)[0]] += Object.values(lv20)[0];
    if(lvl >= 60) result[Object.keys(lv60)[0]] += Object.values(lv60)[0];
    if(lvl >= 100) result[Object.keys(lv100)[0]] += Object.values(lv100)[0];
    if(star >= 2) {
      result.atk += upgradeData[grade].license.atk;
      result.hp += upgradeData[grade].license.hp;
    }
    if(star >= 3) result.hpUp += 20;
    if(star >= 4) {
      result.atk += upgradeData[grade].license2.atk;
      result.hp += upgradeData[grade].license2.hp;
    }
    if(star >=6) result.atkUp += 20;
    return result;
  }

  function statsResult(state){
    const result = {}
    const effects = getAllSurvivorsEffects(state);
    const base = baseStatsCalc(state);
    result.atk = Math.floor(base.atk * (100 + effects.atkUp + base.atkUp + perks)/100);
    result.hp = Math.floor(base.hp * (100 + effects.hpUp + base.hpUp + perks)/100);
    result.heal = effects.heal;
    result.healOnLvlUp = effects.healOnLvlUp;
    result.critDamage = effects.critDamage;
    result.critRate = effects.critRate;
    return result;

  }
  
  const stats = {
    current: statsResult('current'),
    target: statsResult('target')
  }
  

  const resultDiv = document.getElementById('stats-result');
  resultDiv.innerHTML = '';
  const results = {
    current: document.createElement('dl'),
    target: document.createElement('dl')
  };
  
  for(const state of Object.keys(results)){
    results[state].classList.add('flex-dl','result');
    const dts = [];
    const dds = [];
    for(let i=0; i<6; i++) {
      const div = document.createElement('div');
      div.style.display = 'flex';
      dts.push(document.createElement('dt'));
      dds.push(document.createElement('dd'));
      div.append(dts[i],dds[i]);
      results[state].append(div);
    }
    dts[0].textContent = 'ATK:',
    dds[0].textContent = stats[state].atk.toLocaleString(),
    dts[1].textContent = 'HP:',
    dds[1].textContent = stats[state].hp.toLocaleString(),
    dts[2].textContent = 'Crit Rate:',
    dds[2].textContent = stats[state].critRate + '%',
    dts[3].textContent = 'Crit Damage:',
    dds[3].textContent = stats[state].critDamage + '%',
    dts[4].textContent = 'Healing:',
    dds[4].textContent = stats[state].heal + '%',
    dts[5].textContent = 'Heals on Lvl Up:',
    dds[5].textContent = stats[state].healOnLvlUp + '%';
  }
  resultDiv.append(results.current,results.target);

}

function switchSurvivorImg() {
  const img = document.getElementById('selected-survivor');
  const selected = document.stats.survivor.value;
  img.src = `pic/${selected}.webp`;
}

function getForm(){
  const form = document.survivors;
  const fieldsets = form.querySelectorAll('fieldset');
  const obj = {};

  fieldsets.forEach(fieldset => {
    const state = fieldset.dataset.state;
    const dds = fieldset.querySelectorAll('dd');

    dds.forEach(dd => {
      const input = dd.querySelector('input[name="lvl"]');
      const isLvlChanged = dd.querySelector('input[name="isLvlChanged"]')?.checked;
      const selectedUpgrade = Number(dd.querySelector('select').value);
      const survivor = dd.dataset.survivor;

      (obj[survivor]) ? false : obj[survivor] = {};

      let upgrade, lvl;

      if(state === 'current') {
        upgrade = Number(selectedUpgrade);
        if(upgrade === 0) lvl = 0;
        else lvl = (input.value !== '') ? Number(input.value) : Number(input.placeholder);
      }

      if(state === 'target') {
        obj[survivor].isLvlChanged = isLvlChanged;
        lvl = (isLvlChanged) ? Number(input.value) : obj[survivor].current.lvl;
        upgrade = (selectedUpgrade > 0) ? selectedUpgrade : obj[survivor].current.upgrade;
      }
      obj[survivor][state] = {
        lvl: lvl,
        upgrade: upgrade
      };
    })
  })
  return obj;
  /*
  obj = {
    common:{
      current:{
        lvl:1,
        upgrade:1
      },
      target:{
        lvl:1,
        upgrade:1,
      },
      isLvlChanged: true
    },
    ...
  }
  */
}

document.survivors.addEventListener('input',(event) => lvlInputsVerifier(event.target));
document.survivors.addEventListener('change',enhanceCostCalc);
document.survivors.addEventListener('change',saveToLocalStorage);
document.stats.addEventListener('change',saveToLocalStorage);
document.addEventListener('DOMContentLoaded',restoreInputData);
	
window.onload = () => {
  const images = [
    'pic/img_hover.png',
    'pic/energy_essence.webp',
    'pic/gold.webp',
    'pic/quantum_shard.webp',
    'pic/awakening_core.webp',
    'pic/shard_common.png',
    'pic/shard_tsukuyomi.png',
    'pic/shard_catnips.png',
    'pic/shard_worm.png',
    'pic/shard_king.png',
    'pic/shard_wesson.png',
    'pic/shard_yelena.png',
    'pic/shard_yang.png',
    'pic/shard_metallia.png',
    'pic/shard_spongebob.png',
    'pic/shard_squidward.png',
    'pic/shard_patrick.png',
    'pic/shard_sandy.png',
    'pic/head_spongebob.png',
    'pic/head_squidward.png',
    'pic/head_patrick.png',
    'pic/head_sandy.png',
  ]
  images.forEach(v => new Image().src = v)
}

function resetForm(target){
  const fieldset = document.querySelector(`fieldset[data-state=${target}]`);
  const inputs = fieldset.querySelectorAll('input');
  const selects = fieldset.querySelectorAll('select');
  inputs.forEach(input => {
    switch (input.type) {
      case 'number': 
        input.value = '';
        break;
      case 'checkbox':
        input.checked = false;
        break;
      default:
      break;
    }
  })
  selects.forEach(select => {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].hasAttribute('selected')) {
        select.selectedIndex = i;
        break;
      }
    }
  });
}
function saveToLocalStorage(){
  const toSave = document.control.toSave.checked;
  if(toSave) {
    const lvls = document.querySelectorAll('input[name="lvl"]');
    const upgrades = document.querySelectorAll('select[name="upgrade"]');
    const survivor = document.stats.survivor.value;
    const perks = document.stats.perks.value;
    const data = {
      lvls: [],
      upgrades: [],
      survivor: survivor,
      perks: perks
    };
    lvls.forEach(elm => data.lvls.push(elm.value));
    upgrades.forEach(elm => data.upgrades.push(elm.value));
    localStorage.setItem('survivorData',JSON.stringify(data));
  }
}
function deleteLocalStorage(){
  localStorage.removeItem('survivorData');
  resetForm('current');
  resetForm('target');
  document.stats.reset();
}
function restoreInputData(){
  const data = JSON.parse(localStorage.getItem('survivorData'));
  if(data) {
    document.control.toSave.checked = true;
    const lvls = document.querySelectorAll('input[name="lvl"]');
    const upgrades = document.querySelectorAll('select[name="upgrade"]');
    const survivor = document.stats.survivor;
    const perks = document.stats.perks;
    for(let i=0; i<lvls.length; i++) {
      lvls[i].value = data.lvls[i] || '';
      lvlInputsVerifier(lvls[i]);
    }
    for(let i=0; i<upgrades.length; i++) {
      upgrades[i].value = data.upgrades[i] || '';
    }
    survivor.value = data.survivor;
    perks.value = data.perks;
    enhanceCostCalc();
    switchSurvivorImg();
    statsCalc();
  }
}
const survivorFeatures = {
  common: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {critDamage:5},
      lv60: {atk:600},
      lv80: {healOnLvlUp:5},
      lv100: {atk:1000},
      lv120: {critRate:5},
      star5: {hpUp:4}
    },
    unlock: {shard:0},
    grade: 'normal',
  },
  tsukuyomi: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {atkUp:5},
      lv60: {atk:600},
      lv80: {critRate:5},
      lv100: {atk:1000},
      lv120: {critDamage:5},
      star5: {atkUp:4}
    },
    unlock: {shard:80},
    grade: 'normal',
  },
  catnips: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {hpUp:5},
      lv60: {atk:600},
      lv80: {heal:5},
      lv100: {atk:1000},
      lv120: {atkUp:5},
      star5: {hpUp:4}
    },
    unlock: {shard:50,gem:5000},
    grade: 'normal',
  },
  worm: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {hpUp:5},
      lv60: {atk:600},
      lv80: {heal:5},
      lv100: {atk:1000},
      lv120: {atkUp:5},
      star5: {atkUp:4}
    },
    unlock: {shard:80},
    grade: 'normal',
  },
  king: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {atkUp:5},
      lv60: {atk:600},
      lv80: {critRate:5},
      lv100: {atk:1000},
      lv120: {critDamage:5},
      star5: {hpUp:4}
    },
    unlock: {shard:80},
    grade: 'normal',
  },
  wesson: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {atkUp:5},
      lv60: {atk:600},
      lv80: {critRate:5},
      lv100: {atk:1000},
      lv120: {critDamage:5},
      star5: {atkUp:4}
    },
    unlock: {shard:80},
    grade: 'normal',
  },
  yelena: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {hpUp:5},
      lv60: {atk:600},
      lv80: {heal:5},
      lv100: {atk:1000},
      lv120: {atkUp:5},
      star5: {hpUp:4}
    },
    unlock: {shard:80},
    grade: 'normal',
  },
  spongebob: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {critDamage:5},
      lv60: {atk:600},
      lv80: {healOnLvlUp:5},
      lv100: {atk:1000},
      lv120: {critRate:5},
      star5: {atkUp:4}
    },
    unlock: {event:1},
    grade: 'normal',
  },
  squidward: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {critDamage:5},
      lv60: {atk:600},
      lv80: {healOnLvlUp:5},
      lv100: {atk:1000},
      lv120: {critRate:5},
      star5: {hpUp:4}
    },
    unlock: {event:1},
    grade: 'normal',
  },
  patrick: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {critDamage:5},
      lv60: {atk:600},
      lv80: {healOnLvlUp:5},
      lv100: {atk:1000},
      lv120: {critRate:5},
      star5: {atkUp:4}
    },
    unlock: {event:1},
    grade: 'normal',
  },
  sandy: {
    upgrades: {
      lv20: {hp:1000},
      lv40: {critDamage:5},
      lv60: {atk:600},
      lv80: {healOnLvlUp:5},
      lv100: {atk:1000},
      lv120: {critRate:5},
      star5: {hpUp:4}
    },
    unlock: {event:1},
    grade: 'normal',
  },
  yang: {
    upgrades: {
      lv20: {hp:3000},
      lv40: {atkUp:10},
      lv60: {atk:1200},
      lv80: {heal:5},
      lv100: {atk:1800},
      lv120: {critRate:10},
      star5: {atkUp:8}
    },
    unlock: {shard:120},
    grade: 's',
  },
  metallia:{
    upgrades: {
      lv20: {hp:3000},
      lv40: {atkUp:10},
      lv60: {atk:1200},
      lv80: {heal:5},
      lv100: {atk:1800},
      lv120: {critDamage:10},
      star5: {atkUp:8}
    },
    unlock: {shard:120},
    grade: 's',
  },
}

const upgradeData = {
  normal:{
    gold: [0,10,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,69,72,75,78,81,84,87,90,95,100,105,110,115,120,125,130,135,140,145,151,157,163,169,175,182,189,196,203,210,216,222,228,234,240,245,250,255,260,265,270,275,280,285,290,294,298,302,306,310,313,316,319,322,325,327,329,331,333,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370],
    essence: [0,100,100,100,100,150,150,150,160,170,180,190,200,210,220,240,260,280,300,320,340,360,380,400,420,440,460,480,500,520,540,560,580,600,620,640,660,680,700,720,740,760,780,800,820,840,860,880,900,920,940,960,980,1000,1200,1400,1600,1800,2000,2200,2400,2600,2800,3000,3200,3600,4000,4400,4800,5200,5600,6000,6400,6800,7200,7600,8000,8400,8800,9200,9600,10000,10400,10800,11200,11600,12000,12400,12800,13200,13600,14000,14400,15000,15600,16200,16800,17400,18000,19000,19500,20000,20500,21000,21500,22000,22500,23000,23500,24000,24500,25000,25500,26000,26500,27000,27500,28000,28500,29000],
    atk: [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,20,20,20,20,20,20,20,20,20,20,30,30,30,30,30,30,30,30,30,30,100,100,100,100,100,100,100,100,100,100,120,120,120,120,120,120,120,120,120,120,150,150,150,150,150,150,150,150,150,150,180,180,180,180,180,180,180,180,180,180,200,200,200,200,200,200,200,200,200,200,230,230,230,230,230,230,230,230,230,230,250,250,250,250,250,250,250,250,250,250],
    hp: [100,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,56,56,56,56,56,56,56,56,56,56,104,104,104,104,104,104,104,104,104,104,460,460,460,460,460,460,460,460,460,460,576,576,576,576,576,576,576,576,576,576,720,720,720,720,720,720,720,720,720,720,864,864,864,864,864,864,864,864,864,864,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960,960],
    shard: [80,10,50,100,150,300],
    license: {atk: 400, hp: 2000},
    license2: {atk: 1000, hp: 5500},
    awakening: {
      shard: [200,250,300,350,400,500],
      quantum: [2400,3000,3600,4200,4800,6000],
      core: [1,2,3,5,7,12]
    }
  },
  s:{
    gold: [0,10,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,69,72,75,80,86,92,98,104,110,116,122,128,134,140,146,152,158,164,170,176,182,188,194,201,208,215,222,229,236,243,250,257,264,272,280,288,296,304,312,320,328,336,344,353,362,371,380,389,398,407,416,425,434,444,454,464,474,484,494,504,514,524,534,544,554,564,574,584,594,604,614,624,634,644,654,664,674,684,694,704,714,724,734,744,754,764,774,784,794,804,814,824,834,844],
    essence: [0,100,100,100,100,150,150,150,160,170,180,190,200,210,220,240,260,280,300,320,340,360,380,400,420,440,460,480,500,520,540,560,580,600,620,640,660,680,700,750,800,850,900,950,1000,1200,1400,1600,1800,2000,2200,2400,2600,2800,3000,3200,3400,3600,3800,4000,4200,4400,4600,4800,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000,10500,11000,11500,12000,12500,13000,13500,14000,14500,15000,16000,17000,18000,19000,20000,21000,22000,23000,24000,25000,26000,27000,28000,29000,30000,31000,32000,33000,34000,35000,36000,37000,38000,39000,40000,41000,42000,43000,44000,45000,46000,47000,48000,49000,50000],
    atk: [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,15,15,15,15,15,15,15,15,15,15,15,20,20,20,20,20,20,20,20,20,20,50,50,50,50,50,50,50,50,50,50,105,105,105,105,105,105,105,105,105,105,130,130,130,130,130,130,130,130,130,130,160,160,160,160,160,160,160,160,160,160,200,200,200,200,200,200,200,200,200,200,250,250,250,250,250,250,250,250,250,250,300,300,300,300,300,300,300,300,300,300,400,400,400,400,400,400,400,400,400,400],
    hp: [100,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,72,72,72,72,72,72,72,72,72,72,72,56,56,56,56,56,56,56,56,56,56,174,174,174,174,174,174,174,174,174,174,484,484,484,484,484,484,484,484,484,484,640,640,640,640,640,640,640,640,640,640,800,800,800,800,800,800,800,800,800,800,960,960,960,960,960,960,960,960,960,960,1200,1200,1200,1200,1200,1200,1200,1200,1200,1200,1400,1400,1400,1400,1400,1400,1400,1400,1400,1400,1600,1600,1600,1600,1600,1600,1600,1600,1600,1600],
    shard: [120,40,80,120,200,400],
    license: {atk: 600, hp: 3000},
    license2: {atk: 1500, hp: 7500},
    awakening: {
      shard: [200,250,300,350,400,500],
      quantum: [3600,4500,5400,6300,7200,9000],
      core: [1,2,4,8,15,30]
    }
  }
}
