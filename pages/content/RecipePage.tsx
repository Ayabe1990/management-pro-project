import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, MasterInventoryItem, Department } from '../../types.ts';
import { XMarkIcon, PlusCircleIcon } from '../../components/icons.tsx';
import { initialRecipes } from './data/recipes.ts';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole } from '../../types.ts';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const RecipeModal: React.FC<{ 
    recipe: Partial<Recipe>; 
    inventory: MasterInventoryItem[]; 
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
    isManager: boolean;
}> = ({ recipe: initialRecipe, inventory, onClose, onSave, isManager }) => {
    
    const [recipe, setRecipe] = useState<Partial<Recipe>>({
        ingredients: [],
        instructions: [''],
        ...initialRecipe,
        id: initialRecipe.id || `R-${uuidv4().slice(0,8)}`,
        status: initialRecipe.status || 'Approved',
    });

    const handleFieldChange = (field: keyof Recipe, value: any) => {
        setRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...(recipe.instructions || [])];
        newInstructions[index] = value;
        setRecipe(prev => ({...prev, instructions: newInstructions}));
    };
    
    const handleIngredientChange = (index: number, field: 'inventoryId' | 'quantity', value: string | number) => {
        const newIngredients = [...(recipe.ingredients || [])];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setRecipe(prev => ({...prev, ingredients: newIngredients}));
    };

    const addInstruction = () => setRecipe(prev => ({...prev, instructions: [...(prev.instructions || []), '']}));
    const addIngredient = () => setRecipe(prev => ({...prev, ingredients: [...(prev.ingredients || []), { inventoryId: '', quantity: 0 }]}));

    const handleSave = () => {
        if (!recipe.name || !recipe.department || !recipe.producesInventoryId) {
            alert('Please fill out all required fields.');
            return;
        }
        onSave(recipe as Recipe);
    }
    
    const rawMaterials = useMemo(() => inventory.filter(i => i.type === 'raw'), [inventory]);
    const finishedGoods = useMemo(() => inventory.filter(i => i.type === 'finished'), [inventory]);
    
    return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <h2 className="text-2xl font-bold text-primary">{initialRecipe.id ? 'Edit Recipe' : 'Create Recipe'}</h2>
                <button onClick={onClose} className="text-medium-text hover:text-white"><XMarkIcon /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input value={recipe.name || ''} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Recipe Name" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                     <select value={recipe.department || ''} onChange={e => handleFieldChange('department', e.target.value as Department)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                        <option value="">-- Select Department --</option>
                        <option>Bar</option><option>Kitchen</option><option>General</option>
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-medium-text">Finished Product</label>
                        <select value={recipe.producesInventoryId || ''} onChange={e => handleFieldChange('producesInventoryId', e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                            <option value="">-- Select Output Item --</option>
                            {finishedGoods.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-medium-text">Yield Quantity</label>
                         <input type="number" value={recipe.yieldQty || 0} onChange={e => handleFieldChange('yieldQty', parseFloat(e.target.value))} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mt-4">Ingredients</h3>
                     <div className="space-y-2 mt-2">
                        {recipe.ingredients?.map((ing, index) => (
                             <div key={index} className="flex gap-2 items-center">
                                <select value={ing.inventoryId} onChange={e => handleIngredientChange(index, 'inventoryId', e.target.value)} className="w-1/2 bg-dark-bg p-2 rounded-md border border-dark-border">
                                    <option value="">-- Select Ingredient --</option>
                                    {rawMaterials.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                                <input type="number" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))} className="w-1/4 bg-dark-bg p-2 rounded-md border border-dark-border" placeholder="Qty" />
                             </div>
                        ))}
                     </div>
                     <button onClick={addIngredient} className="text-sm text-primary mt-2">+ Add Ingredient</button>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mt-4">Instructions</h3>
                    <div className="space-y-2 mt-2">
                        {recipe.instructions?.map((inst, index) => (
                            <input key={index} value={inst} onChange={e => handleInstructionChange(index, e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        ))}
                    </div>
                    <button onClick={addInstruction} className="text-sm text-primary mt-2">+ Add Step</button>
                </div>
            </div>
            {isManager && <div className="p-4 border-t border-dark-border flex justify-end">
                <button onClick={handleSave} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg">Save Recipe</button>
            </div>}
        </div>
    </div>
)};

const RecipePage: React.FC = () => {
    const { user } = useAuth();
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | Partial<Recipe> | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const isManager = user?.role === UserRole.Owner || user?.role === UserRole.Manager;

    useEffect(() => {
        const storedRecipes = localStorage.getItem('recipes');
        setRecipes(storedRecipes ? JSON.parse(storedRecipes) : initialRecipes);

        const storedInventory = localStorage.getItem('inventory');
        setInventory(storedInventory ? JSON.parse(storedInventory) : []);
    }, []);

    const handleSaveRecipe = (recipeToSave: Recipe) => {
        let updatedRecipes;
        if (recipes.some(r => r.id === recipeToSave.id)) {
            updatedRecipes = recipes.map(r => r.id === recipeToSave.id ? recipeToSave : r);
        } else {
            updatedRecipes = [...recipes, recipeToSave];
        }
        setRecipes(updatedRecipes);
        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
        setSelectedRecipe(null);
    }

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-display">Recipe Library</h2>
                {isManager && <button onClick={() => setSelectedRecipe({})} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><PlusCircleIcon className="w-5 h-5"/> New Recipe</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map(recipe => (
                    <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-dark-card border border-dark-border rounded-2xl p-6 cursor-pointer hover:border-primary hover:scale-105 transition-all">
                        <h3 className="text-xl font-bold text-primary">{recipe.name}</h3>
                        <p className="text-sm text-medium-text">{recipe.department}</p>
                        <p className="text-xs mt-2 text-light-text">{recipe.ingredients.length} ingredients</p>
                    </div>
                ))}
            </div>
            {selectedRecipe && <RecipeModal recipe={selectedRecipe} inventory={inventory} onClose={() => setSelectedRecipe(null)} onSave={handleSaveRecipe} isManager={isManager} />}
        </div>
    );
};

export default RecipePage;