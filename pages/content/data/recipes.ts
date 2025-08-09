import { Recipe } from '../../../types.ts';

export const initialRecipes: Recipe[] = [
    {
        id: 'R-ADOBO',
        name: 'Chicken Adobo',
        department: 'Kitchen',
        producesInventoryId: 'FG-ADOBO',
        yieldQty: 10, // servings
        prepLoss: 5, // 5%
        ingredients: [
            { inventoryId: 'RM-CHICKEN', quantity: 1 },
            { inventoryId: 'RM-SOYSAUCE', quantity: 0.125 },
        ],
        instructions: ['Cook it.'],
        status: 'Approved',
    },
    {
        id: 'R-SINIGANG',
        name: 'Pork Sinigang',
        department: 'Kitchen',
        producesInventoryId: 'FG-SINIGANG',
        yieldQty: 8, // servings
        prepLoss: 7, // 7%
        ingredients: [
            { inventoryId: 'RM-PORK', quantity: 1 },
            { inventoryId: 'RM-TAMARINDMIX', quantity: 2 },
        ],
        instructions: ['Boil it.'],
        status: 'Approved',
    },
    {
        id: 'R-ICEDTEA',
        name: 'House Iced Tea',
        department: 'Bar',
        producesInventoryId: 'FG-ICEDTEA',
        yieldQty: 4000, // ml
        prepLoss: 1, // 1%
        ingredients: [
            { inventoryId: 'RM-ICEDTEAPOWDER', quantity: 0.02 },
        ],
        instructions: ['Mix powder with water.'],
        status: 'Approved',
    },
    {
        id: 'R-SIMPLESYRUP',
        name: 'Simple Syrup Production',
        department: 'Bar',
        producesInventoryId: 'FG-SIMPLESYRUP',
        yieldQty: 1800, // ml
        prepLoss: 0,
        ingredients: [ { inventoryId: 'RM-SUGAR', quantity: 1 } ],
        instructions: ['Mix 1kg sugar with 1L hot water.'],
        status: 'Approved',
    },
    {
        id: 'R-ALFONSO-SHOT',
        name: 'Alfonso Light Shot',
        department: 'Bar',
        producesInventoryId: 'FG-ALFONSO-SHOT',
        yieldQty: 1, // shot
        prepLoss: 0,
        ingredients: [{ inventoryId: 'RM-ALFONSO', quantity: 30 }], // 30ml
        instructions: ['Pour 30ml of Alfonso Light into a shot glass.'],
        status: 'Approved',
    },
    {
        id: 'R-MOJITO',
        name: 'Mojito Cocktail Mix',
        department: 'Bar',
        producesInventoryId: 'FG-MOJITO-PITCHER',
        yieldQty: 1000, // ml
        prepLoss: 3, // 3%
        ingredients: [
            { inventoryId: 'RM-BACARDI', quantity: 250 },
            { inventoryId: 'RM-LIME', quantity: 0.2 },
            { inventoryId: 'RM-MINT', quantity: 50 }, // 50g from a bundle
            { inventoryId: 'FG-SIMPLESYRUP', quantity: 150 },
        ],
        instructions: ['Mix and serve.'],
        status: 'Approved',
    },
];