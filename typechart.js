// ====================== typechart.js ======================
const typechartData = {
  Normal:   { damage_taken: { Rock: 0.5, Ghost: 0, Steel: 0.5 } },
  Fire:     { damage_taken: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 } },
  Water:    { damage_taken: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 } },
  Grass:    { damage_taken: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5 } },
  Electric: { damage_taken: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 } },
  Ice:      { damage_taken: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 } },
  Fighting: { damage_taken: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Ghost: 0, Fairy: 0.5 } },
  Poison:   { damage_taken: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 } },
  Ground:   { damage_taken: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 } },
  Flying:   { damage_taken: { Electric: 0.5, Grass: 2, Ice: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 } },
  Psychic:  { damage_taken: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 } },
  Bug:      { damage_taken: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 } },
  Rock:     { damage_taken: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 } },
  Ghost:    { damage_taken: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 } },
  Dragon:   { damage_taken: { Dragon: 2, Steel: 0.5, Fairy: 0 } },
  Dark:     { damage_taken: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 } },
  Steel:    { damage_taken: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 } },
  Fairy:    { damage_taken: { Fire: 0.5, Poison: 0.5, Steel: 0.5, Fighting: 2, Dragon: 2, Dark: 2 } }
};

console.log(`✅ typechart.js загружен — таблица типов готова`);
