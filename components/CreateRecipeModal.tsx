import React, { useState, useMemo } from 'react';
import { Recipe, MasterInventoryItem, Department } from '../types.ts';
import { XMarkIcon, PlusCircleIcon } from './icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

interface CreateRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (recipe: Recipe) => void;
    inventory: MasterInventoryItem[];
    department: Department;
}

const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({ isOpen, onClose, onSave, inventory, department }) => {
    const [recipe, setRecipe] = useState<Partial<Recipe>>({
        id: `R-${uuidv4().slice(0, 8).toUpperCase()}`,
        name: '',
        department: department,
        producesInventoryId: '',
        yieldQty: 0,
        prepLoss: 0,
        ingredients: [{ inventoryId: '', quantity: 0 }],
        instructions: [''],
        status: 'Approved',
    });

    if (!isOpen) return null;

    const handleFieldChange = (field: keyof Recipe, value: any) => {
        setRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleIngredientChange = (index: number, field: 'inventoryId' | 'quantity', value: string | number) => {
        const newIngredients = [...(recipe.ingredients || [])];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };
    const addIngredient = () => setRecipe(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), { inventoryId: '', quantity: 0 }] }));
    const removeIngredient = (index: number) => setRecipe(prev => ({ ...prev, ingredients: prev.ingredients?.filter((_, i) => i !== index) }));
    
    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...(recipe.instructions || [])];
        newInstructions[index] = value;
        setRecipe(prev => ({ ...prev, instructions: newInstructions }));
    };
    const addInstruction = () => setRecipe(prev => ({ ...prev, instructions: [...(prev.instructions || []), ''] }));
    const removeInstruction = (index: number) => setRecipe(prev => ({ ...prev, instructions: prev.instructions?.filter((_, i) => i !== index) }));

    const handleSave = () => {
        if (!recipe.name || !recipe.department || !recipe.producesInventoryId || (recipe.ingredients || []).length === 0) {
            alert('Please fill out all required fields: Name, Product, and at least one Ingredient.');
            return;
        }
        onSave(recipe as Recipe);
    };

    const rawMaterials = useMemo(() => inventory.filter(i => i.type === 'raw' && (i.department === department || i.department === 'General')), [inventory, department]);
    const finishedGoods = useMemo(() => inventory.filter(i => i.type === 'finished' && (i.department === department || i.department === 'General')), [inventory, department]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-border">
                    <h2 className="text-2xl font-bold text-primary">Create New {department} Recipe</h2>
                    <button onClick={onClose} className="text-medium-text hover:text-white"><XMarkIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 hide-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <input value={recipe.name || ''} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Recipe Name (e.g., House Margarita Mix)" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        <select value={recipe.producesInventoryId || ''} onChange={e => handleFieldChange('producesInventoryId', e.target.value)} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border">
                            <option value="">-- Select Finished Product --</option>
                            {finishedGoods.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-medium-text">Yield Quantity (in base unit)</label>
                            <input type="number" value={recipe.yieldQty || ''} onChange={e => handleFieldChange('yieldQty', parseFloat(e.target.value) || 0)} placeholder="e.g. 1000 for 1L" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        </div>
                        <div>
                            <label className="text-xs text-medium-text">Prep Loss / Wastage (%)</label>
                            <input type="number" value={recipe.prepLoss || ''} onChange={e => handleFieldChange('prepLoss', parseFloat(e.target.value) || 0)} placeholder="e.g. 5 for 5%" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mt-4">Ingredients</h3>
                        <div className="space-y-2 mt-2">
                            {(recipe.ingredients || []).map((ing, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select value={ing.inventoryId} onChange={e => handleIngredientChange(index, 'inventoryId', e.target.value)} className="w-2/3 bg-dark-bg p-2 rounded-md border border-dark-border">
                                        <option value="">-- Select Ingredient --</option>
                                        {rawMaterials.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unitType})</option>)}
                                    </select>
                                    <input type="number" value={ing.quantity || ''} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-1/3 bg-dark-bg p-2 rounded-md border border-dark-border" placeholder="Qty" />
                                    <button onClick={() => removeIngredient(index)} className="text-danger"><XMarkIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addIngredient} className="text-sm text-primary mt-2 flex items-center gap-1"><PlusCircleIcon className="w-4 h-4"/> Add Ingredient</button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mt-4">Instructions</h3>
                        <div className="space-y-2 mt-2">
                            {(recipe.instructions || []).map((inst, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                <input value={inst} onChange={e => handleInstructionChange(index, e.target.value)} placeholder={`Step ${index + 1}`} className="w-full bg-dark-bg p-2 rounded-md border border-dark-border" />
                                <button onClick={() => removeInstruction(index)} className="text-danger"><XMarkIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addInstruction} className="text-sm text-primary mt-2 flex items-center gap-1"><PlusCircleIcon className="w-4 h-4"/> Add Step</button>
                    </div>
                </div>
                <div className="p-4 border-t border-dark-border flex justify-end">
                    <button onClick={handleSave} className="bg-success hover:bg-success/80 text-white font-bold py-2 px-6 rounded-lg">Save Recipe</button>
                </div>
            </div>
        </div>
    );
};

export default CreateRecipeModal;