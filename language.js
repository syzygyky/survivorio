const languageTexts = {
  dps:{
    en:'DPS',
    ja:'DPS'
  },
  damage:{
    en:'Non Crit-Hit Damage',
    ja:'通常ダメージ'
  },
  critDamage:{
    en:'Crit Damage',
    ja:'クリティカルダメージ'
  },
  critRate:{
    en:'Crit Rate',
    ja:'クリティカル率'
  },
  petAtk:{
    en:'Pet ATK',
    ja:'ペットATK'
  },
  skillDamage:{
    en:'Skill Damage',
    ja:'スキルダメージ'
  },
  skillCD:{
    en:'Skill CD',
    ja:'スキルCD'
  },
  stats:{
    en:'Stats',
    ja:'基本ステータス'
  },
  survivorAtk:{
    en:'Survivor ATK',
    ja:'サバイバーATK'
  },
  petQuality:{
    en:'Pet Quality',
    ja:'ペット品質'
  },
  petLv:{
    en:'Pet Lv',
    ja:'ペットLv'
  },
  awakeningLv:{
    en:'Awakening Level',
    ja:'覚醒Lv'
  },
  assistSkills:{
    en:'Assist Skills',
    ja:'ヘルパースキル'
  },
  powerful:{
    en:'Powerful (Damage Increase)',
    ja:'強力 (ダメージ上昇)'
  },
  raid:{
    en:'Raid (Gary; Damage +, CD -)',
    ja:'レイド (ゲイリー; ダメージ＋, CD－)'
  },
  survivorSkillLv:{
    en:'Survivor Skill Level',
    ja:'サバイバースキルLv'
  },
  cePot:{
    en:'Clan Expedition / Path of Trials: Always',
    ja:'遠征/試練の道: 常時'
  },
  extremeChallenge:{
    en:'Extreme Challenge: Always',
    ja:'極限チャレンジ: 常時'
  },
  deployingSkills:{
    en:'Deploying Skills',
    ja:'出陣スキル'
  },
  unitedStand:{
    en:'United Stand (Inherited ATK)',
    ja:'敵愾心 (継承ATK)'
  },
  battleLust:{
    en:'Battle Lust (CD Reduction)',
    ja:'闘争心 (CD短縮)'
  },
  sharpClaws:{
    en:'Sharp Claws (Skill Damage Up)',
    ja:'鋭い爪 (スキルダメージ上昇)'
  },
  frenzy:{
    en:'Frenzy (Crit Rate Up)',
    ja:'狂気 (クリティカル率上昇)'
  },
  painstrike:{
    en:'Painstrike (Crit Damage Up)',
    ja:'ペインアタック (クリティカルダメージ上昇)'
  },
  crush:{
    en:'Crush (x% chance to 10x damage)',
    ja:'圧倒 (確率で10倍ダメージ)'
  }
}

function translate () {
  const lang = document.getElementById('language').value;
  for (const key in languageTexts) {
    if (languageTexts.hasOwnProperty(key)) {
      const element = document.getElementsByClassName(key)[0];
      if (element) {
        element.textContent = languageTexts[key][lang];
      }
    }
  }
}
document.getElementById('language').addEventListener('change',translate);