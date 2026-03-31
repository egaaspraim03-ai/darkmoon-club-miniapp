const gameData = {
  universes: {
    pokemon: [...(typeof pokedexData !== 'undefined' ? pokedexData : []), ...(typeof johtoData !== 'undefined' ? johtoData : [])].map(p => ({...p, type: 'nature'})),
    smeshariki: (typeof smesharikiData !== 'undefined' ? smesharikiData : []).map(s => ({...s, type: 'toon'})),
    darkmoon: (typeof darkmoonData !== 'undefined' ? darkmoonData : []).map(d => ({...d, type: 'chaos'}))
  }
};

let myHeroes = JSON.parse(localStorage.getItem('myHeroes')) || [
  { num: "0025", ru: "Пикачу", en: "Pikachu", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", hp: 180, maxHp: 180, level: 25, attack: 55, defense: 40, exp: 0, type: 'nature' }
];

function saveMyHeroes() { 
  localStorage.setItem('myHeroes', JSON.stringify(myHeroes)); 
}
