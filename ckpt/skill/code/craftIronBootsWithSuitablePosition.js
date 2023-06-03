async function findSuitablePosition(bot, startPosition) {
  const offsets = [new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1)];
  for (const offset of offsets) {
    const position = startPosition.offset(offset.x, offset.y, offset.z);
    const block = bot.blockAt(position);
    if (block.name === "grass_block" || block.name === "dirt") {
      return position;
    }
  }
  return null;
}

async function craftIronBootsWithSuitablePosition(bot) {
  // Check if there are enough iron ingots in the inventory
  let ironIngots = bot.inventory.findInventoryItem(mcData.itemsByName["iron_ingot"].id);
  if (!ironIngots || ironIngots.count < 4) {
    const chestPosition = new Vec3(-17, 1, 17);
    await getItemFromChest(bot, chestPosition, {
      "iron_ingot": 4 - (ironIngots ? ironIngots.count : 0)
    });
    ironIngots = bot.inventory.findInventoryItem(mcData.itemsByName["iron_ingot"].id);
  }

  // Check if there is a crafting table nearby or in the inventory
  let craftingTable = bot.inventory.findInventoryItem(mcData.itemsByName["crafting_table"].id);
  if (!craftingTable) {
    craftingTable = bot.findBlock({
      matching: mcData.blocksByName["crafting_table"].id,
      maxDistance: 32
    });
    if (!craftingTable) {
      // Craft a crafting table using oak planks
      await craftItem(bot, "crafting_table", 1);
    }
  }

  // Find a suitable position to place the crafting table
  const startPosition = bot.entity.position.floored();
  const tablePosition = await findSuitablePosition(bot, startPosition);

  // Place the crafting table at the suitable position
  if (tablePosition) {
    await placeItem(bot, "crafting_table", tablePosition);
  } else {
    bot.chat("Cannot find a suitable position to place the crafting table.");
    return;
  }

  // Craft iron boots using the crafting table and 4 iron ingots
  await craftItem(bot, "iron_boots", 1);
  bot.chat("Iron boots crafted.");
}