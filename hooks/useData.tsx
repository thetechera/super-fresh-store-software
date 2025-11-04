import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AppData, DataKey, DataModel } from '../types';

interface DataContextType {
  data: AppData;
  loading: boolean;
  error: string | null;
  fetchData: () => void;
  addItem: <T extends DataModel>(dataKey: DataKey, item: T) => Promise<void>;
  updateItem: <T extends DataModel>(dataKey: DataKey, item: T) => Promise<void>;
  deleteItem: (dataKey: DataKey, id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE_URL = '/api';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({ products: [], sales: [], purchases: [], inventory: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, salesRes, purchasesRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/sales`),
        fetch(`${API_BASE_URL}/purchases`),
        fetch(`${API_BASE_URL}/inventory`),
      ]);

      if (!productsRes.ok || !salesRes.ok || !purchasesRes.ok || !inventoryRes.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      const products = await productsRes.json();
      const sales = await salesRes.json();
      const purchases = await purchasesRes.json();
      const inventory = await inventoryRes.json();
      
      setData({ products, sales, purchases, inventory });

    } catch (e) {
      setError((e as Error).message);
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = useCallback(async <T extends DataModel>(dataKey: DataKey, item: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${dataKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error(`Failed to add item to ${dataKey}`);
      await fetchData(); // Refetch all data to ensure consistency
    } catch (e) {
      setError((e as Error).message);
      console.error("Failed to add item:", e);
    }
  }, [fetchData]);

  const updateItem = useCallback(async <T extends DataModel>(dataKey: DataKey, item: T) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${dataKey}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error(`Failed to update item in ${dataKey}`);
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
      console.error("Failed to update item:", e);
    }
  }, [fetchData]);

  const deleteItem = useCallback(async (dataKey: DataKey, id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${dataKey}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete item from ${dataKey}`);
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
      console.error("Failed to delete item:", e);
    }
  }, [fetchData]);

  const value = useMemo(() => ({ data, loading, error, fetchData, addItem, updateItem, deleteItem }), [data, loading, error, fetchData, addItem, updateItem, deleteItem]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};