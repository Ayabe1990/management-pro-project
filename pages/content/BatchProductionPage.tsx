import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { UserRole, Recipe, MasterInventoryItem, BatchLog, Department } from '../../types.ts';
import CreateRecipeModal from '../../components/CreateRecipeModal.tsx';
import { PlusCircleIcon } from '../../components/icons.tsx';

const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

const BatchProductionPage: React.FC = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [inventory, setInventory] = useState<MasterInventoryItem[]>([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [yieldQty, setYieldQty] = useState(0);
    const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
    
    const isManagement = user?.role === UserRole.Owner || user?.role === UserRole.Manager;
    const canCreateRecipe = isManagement || user?.role === UserRole.Kitchen || user?.role === UserRole.Bartender;
    const initialDept = user?.role === UserRole.Kitchen ? 'Kitchen' : 'Bar';
    const [department, setDepartment] = useState<Department>(initialDept);

    const loadData = useCallback(() => {
        const storedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]') as Recipe[];
        const approvedRecipes = storedRecipes.filter(r => r.status === 'Approved');
        setRecipes(approvedRecipes);

        const storedInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        setInventory(storedInventory);
    }, []);

    useEffect(() => {
        loadData();
        document.addEventListener('data_updated', loadData);
        return () => document.removeEventListener('data_updated', loadData);
    }, [loadData]);
    
    const departmentRecipes = useMemo(() => {
        return recipes.filter(r => r.department === department);
    }, [recipes, department]);
    
    const selectedRecipe = useMemo(() => recipes.find(r => r.id === selectedRecipeId), [recipes, selectedRecipeId]);

    const handleSaveRecipe = (newRecipe: Recipe) => {
        const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]') as Recipe[];
        allRecipes.push(newRecipe);
        localStorage.setItem('recipes', JSON.stringify(allRecipes));
        document.dispatchEvent(new CustomEvent('data_updated'));
        alert(`Recipe "${newRecipe.name}" created successfully!`);
        loadData(); // Refresh the list
        setRecipeModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedRecipe || yieldQty <= 0) {
            alert('Please select a recipe and enter a valid yield quantity.');
            return;
        }

        const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]') as MasterInventoryItem[];
        let totalCost = 0;
        
        for (const ingredient of selectedRecipe.ingredients) {
            const invItem = currentInventory.find(i => i.id === ingredient.inventoryId);
            if (!invItem || invItem.stock < ingredient.quantity) {
                alert(`Insufficient stock for ${invItem?.name || 'an ingredient'}. Required: ${ingredient.quantity}, Available: ${invItem?.stock || 0}.`);
                return;
            }
            totalCost += (invItem.costPerUnit || 0) * ingredient.quantity;
        }

        selectedRecipe.ingredients.forEach(ingredient => {
            const itemIndex = currentInventory.findIndex(i => i.id === ingredient.inventoryId);
            if (itemIndex > -1) {
                currentInventory[itemIndex].stock -= ingredient.quantity;
            }
        });

        const finishedProductIndex = currentInventory.findIndex(i => i.id === selectedRecipe.producesInventoryId);
        if (finishedProductIndex > -1) {
            currentInventory[finishedProductIndex].stock += yieldQty;
        } else {
            alert(`Finished product with ID ${selectedRecipe.producesInventoryId} not found in inventory.`);
            return;
        }

        const newLog: BatchLog = {
            id: `batch-${uuidv4()}`, date: new Date().toISOString(), recipeId: selectedRecipe.id,
            yield: yieldQty, totalCost, loggedBy: user.id,
        };
        const allLogs = JSON.parse(localStorage.getItem('batch_logs') || '[]') as BatchLog[];
        localStorage.setItem('batch_logs', JSON.stringify([newLog, ...allLogs]));
        localStorage.setItem('inventory', JSON.stringify(currentInventory));
        document.dispatchEvent(new CustomEvent('data_updated'));

        alert(`Successfully produced ${yieldQty} units of ${selectedRecipe.name}.`);
        setSelectedRecipeId('');
        setYieldQty(0);
        loadData();
    };

    return (
        <>
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-display">Batch Production</h2>
                {canCreateRecipe && (
                    <button onClick={() => setRecipeModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5"/>
                        Create Recipe
                    </button>
                )}
            </div>
            {isManagement && (
                 <div className="flex gap-2 bg-dark-card p-1 rounded-lg self-center mb-4">
                    <button onClick={() => setDepartment('Bar')} className={`py-2 px-6 rounded-md font-semibold ${department === 'Bar' ? 'bg-primary text-white' : 'text-medium-text'}`}>Bar</button>
                    <button onClick={() => setDepartment('Kitchen')} className={`py-2 px-6 rounded-md font-semibold ${department === 'Kitchen' ? 'bg-primary text-white' : 'text-medium-text'}`}>Kitchen</button>
                </div>
            )}
            <div className="max-w-2xl mx-auto bg-dark-card border border-dark-border rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm text-medium-text mb-2 block">Select Recipe for {department}</label>
                        <select
                            value={selectedRecipeId}
                            onChange={e => setSelectedRecipeId(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-3" required>
                            <option value="" disabled>-- Select a recipe --</option>
                            {departmentRecipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    {selectedRecipe && (
                        <div className="p-4 bg-dark-bg/50 rounded-lg animate-fade-in">
                            <h4 className="font-semibold text-lg mb-2">Required Ingredients:</h4>
                            <ul className="list-disc list-inside text-sm text-light-text">
                                {selectedRecipe.ingredients.map(ing => {
                                    const item = inventory.find(i => i.id === ing.inventoryId);
                                    const hasEnough = item ? item.stock >= ing.quantity : false;
                                    return (
                                        <li key={ing.inventoryId} className={hasEnough ? '' : 'text-danger'}>
                                            {ing.quantity} {item?.unitType} of {item?.name} (Available: {item?.stock || 0})
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <div>
                        <label className="text-sm text-medium-text mb-2 block">Yield Quantity</label>
                        <input type="number" value={yieldQty} onChange={e => setYieldQty(parseFloat(e.target.value) || 0)} min="0" step="any" className="w-full bg-dark-bg border border-dark-border rounded-lg py-3 px-3" required disabled={!selectedRecipe} />
                        {selectedRecipe && <p className="text-xs text-medium-text mt-1">Unit: {inventory.find(i => i.id === selectedRecipe.producesInventoryId)?.unitType}</p>}
                    </div>
                    <button type="submit" disabled={!selectedRecipe || yieldQty <= 0} className="w-full bg-success hover:bg-success/80 text-white font-bold py-3 rounded-lg transition disabled:bg-dark-border disabled:cursor-not-allowed">Confirm Production</button>
                </form>
            </div>
        </div>
        {isRecipeModalOpen && canCreateRecipe && (
            <CreateRecipeModal isOpen={isRecipeModalOpen} onClose={() => setRecipeModalOpen(false)} onSave={handleSaveRecipe} inventory={inventory} department={department} />
        )}
        </>
    );
};

export default BatchProductionPage;
