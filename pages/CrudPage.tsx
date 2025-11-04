import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { DataKey, DataModel, Column, Sale, Product, Purchase } from '../types';
import { PackageIcon, DollarSignIcon, ShoppingCartIcon, ArchiveIcon, PlusIcon, SearchIcon } from '../components/Icons';


interface CrudPageProps<T extends DataModel> {
  title: string;
  dataKey: DataKey;
  columns: Column<T>[];
  readOnly?: boolean;
}

// Specialized Modal for Products
interface ProductModalProps {
    item: Partial<Product> | null;
    onClose: () => void;
    onSave: (item: Partial<Product>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ item, onClose, onSave }) => {
    const { data: { products } } = useData();
    const [formData, setFormData] = useState<Partial<Product>>({
        quantity: 0,
        sellingPrice: 0,
        ...item
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const val = (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const generateNextProductId = () => {
        if (!products || products.length === 0) return 'P001';
        const highestIdNum = products.reduce((maxNum, p) => {
            const currentNum = parseInt(p.id.substring(1), 10);
            return isNaN(currentNum) ? maxNum : (currentNum > maxNum ? currentNum : maxNum);
        }, 0);
        return `P${String(highestIdNum + 1).padStart(3, '0')}`;
    };

    const handleGenerateId = () => {
        if (!item?.id) {
            setFormData(prev => ({ ...prev, id: generateNextProductId() }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="bg-teal-600 p-4 rounded-t-lg">
                    <h3 id="product-modal-title" className="text-xl font-semibold text-white">{item?.id ? 'Edit' : 'Add'} Product</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-700">Product ID</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input
                                    type="text" name="id" id="id" value={formData.id || ''} readOnly placeholder="Click Generate ID"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-200 text-gray-800 sm:text-sm cursor-not-allowed" required
                                />
                                {!item?.id && (
                                    <button type="button" onClick={handleGenerateId} className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex-shrink-0">Generate</button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                             <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Product Category</label>
                                <input type="text" name="category" id="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity || ''} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
                                <input type="number" name="sellingPrice" id="sellingPrice" value={formData.sellingPrice || ''} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Specialized Modal for Sales
interface SalesModalProps {
    item: Partial<Sale> | null;
    onClose: () => void;
    onSave: (item: Partial<Sale>) => void;
}

const SalesModal: React.FC<SalesModalProps> = ({ item, onClose, onSave }) => {
    const { data: { products, sales } } = useData();
    const [formData, setFormData] = useState<Partial<Sale>>({
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
        ...item
    });
    const [productSearch, setProductSearch] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        if (item?.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                setProductSearch(product.name);
            }
        }
    }, [item, products]);
    
    useEffect(() => {
        const quantity = Number(formData.quantity) || 0;
        const price = Number(formData.sellingPrice) || 0;
        setFormData(prev => ({ ...prev, totalPrice: quantity * price }));
    }, [formData.quantity, formData.sellingPrice]);


    const handleFormChange = (field: keyof Sale, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductSearch(e.target.value);
        if (!isDropdownVisible) setDropdownVisible(true);
    };

    const handleProductSelect = (product: Product) => {
        setProductSearch(product.name);
        setDropdownVisible(false);
        setFormData(prev => ({
            ...prev,
            productId: product.id,
            productName: product.name,
            sellingPrice: product.sellingPrice,
        }));
    };
    
    const generateNextSaleId = () => {
        if (!sales || sales.length === 0) return 'S001';
        const highestIdNum = sales.reduce((maxNum, s) => {
            const currentNum = parseInt(s.id.substring(1), 10);
            return isNaN(currentNum) ? maxNum : Math.max(maxNum, currentNum);
        }, 0);
        return `S${String(highestIdNum + 1).padStart(3, '0')}`;
    };

    const handleGenerateId = () => {
        if (!item?.id) {
            setFormData(prev => ({ ...prev, id: generateNextSaleId() }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) { alert('Please select a product.'); return; }
        if (!formData.id) { alert('Please generate a Sales ID.'); return; }
        onSave(formData);
    };
    
    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())),
        [products, productSearch]
    );

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="sale-modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="bg-teal-600 p-4 rounded-t-lg">
                    <h3 id="sale-modal-title" className="text-xl font-semibold text-white">{item?.id ? 'Edit' : 'Add'} Sale</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                           <div>
                                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">Sales ID</label>
                                <div className="flex items-center space-x-2">
                                    <input type="text" name="id" id="id" value={formData.id || ''} readOnly placeholder="Generate ID" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm cursor-not-allowed" required />
                                    {!item?.id && (<button type="button" onClick={handleGenerateId} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">Generate</button>)}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" name="date" id="date" value={formData.date || ''} onChange={(e) => handleFormChange('date', e.target.value)} className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
                            <input id="productSearch" type="text" value={productSearch} onChange={handleProductSearchChange} onFocus={() => setDropdownVisible(true)} onBlur={() => setTimeout(() => setDropdownVisible(false), 200)} placeholder="Start typing product name..." autoComplete="off" className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            {isDropdownVisible && filteredProducts.length > 0 && (
                                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredProducts.map(p => (<li key={p.id} className="px-3 py-2 hover:bg-teal-100 cursor-pointer text-sm text-gray-900" onMouseDown={() => handleProductSelect(p)}>{p.name}</li>))}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" name="productName" id="productName" value={formData.productName || ''} readOnly className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white sm:text-sm cursor-not-allowed" />
                            </div>
                             <div>
                                <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                <input type="text" name="productId" id="productId" value={formData.productId || ''} readOnly className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white sm:text-sm cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity || ''} onChange={(e) => handleFormChange('quantity', parseInt(e.target.value, 10) || 0)} className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required min="1" />
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                                <input type="text" name="sellingPrice" id="sellingPrice" value={`₹${(formData.sellingPrice || 0).toFixed(2)}`} readOnly className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                                <input type="text" name="totalPrice" id="totalPrice" value={`₹${(formData.totalPrice || 0).toFixed(2)}`} readOnly className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">Save Sale</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Specialized Modal for Purchases
interface PurchaseModalProps {
    item: Partial<Purchase> | null;
    onClose: () => void;
    onSave: (item: Partial<Purchase>) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ item, onClose, onSave }) => {
    const { data: { products, purchases } } = useData();
    const [formData, setFormData] = useState<Partial<Purchase>>({
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
        costPrice: 0,
        ...item
    });
    const [productSearch, setProductSearch] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        if (item?.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                setProductSearch(product.name);
            }
        }
    }, [item, products]);

    const handleFormChange = (field: keyof Purchase, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const quantity = Number(formData.quantity) || 0;
        const costPrice = Number(formData.costPrice) || 0;
        setFormData(prev => ({ ...prev, totalPurchasePrice: quantity * costPrice }));
    }, [formData.quantity, formData.costPrice]);


    const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductSearch(e.target.value);
        if (!isDropdownVisible) setDropdownVisible(true);
    };

    const handleProductSelect = (product: Product) => {
        setProductSearch(product.name);
        setDropdownVisible(false);
        setFormData(prev => ({
            ...prev,
            productId: product.id,
            productName: product.name,
        }));
    };
    
    const generateNextPurchaseId = () => {
        if (!purchases || purchases.length === 0) return 'PO001';
        const highestIdNum = purchases.reduce((maxNum, p) => {
            const currentNum = parseInt(p.id.substring(2), 10);
            return isNaN(currentNum) ? maxNum : Math.max(maxNum, currentNum);
        }, 0);
        return `PO${String(highestIdNum + 1).padStart(3, '0')}`;
    };

    const handleGenerateId = () => {
        if (!item?.id) {
            setFormData(prev => ({ ...prev, id: generateNextPurchaseId() }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) { alert('Please select a product.'); return; }
        if (!formData.id) { alert('Please generate a Purchase ID.'); return; }
        onSave(formData);
    };
    
    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())),
        [products, productSearch]
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="purchase-modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                 <div className="bg-teal-600 p-4 rounded-t-lg">
                    <h3 id="purchase-modal-title" className="text-xl font-semibold text-white">{item?.id ? 'Edit' : 'Add'} Purchase</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div>
                                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">Purchase ID</label>
                                <div className="flex items-center space-x-2">
                                    <input type="text" name="id" id="id" value={formData.id || ''} readOnly placeholder="Generate ID" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm cursor-not-allowed" required />
                                    {!item?.id && (<button type="button" onClick={handleGenerateId} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">Generate</button>)}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" name="date" id="date" value={formData.date || ''} onChange={(e) => handleFormChange('date', e.target.value)} className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                        </div>

                         <div className="relative">
                            <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
                            <input id="productSearch" type="text" value={productSearch} onChange={handleProductSearchChange} onFocus={() => setDropdownVisible(true)} onBlur={() => setTimeout(() => setDropdownVisible(false), 200)} placeholder="Start typing product name..." autoComplete="off" className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            {isDropdownVisible && filteredProducts.length > 0 && (
                                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredProducts.map(p => (<li key={p.id} className="px-3 py-2 hover:bg-teal-100 cursor-pointer text-sm text-gray-900" onMouseDown={() => handleProductSelect(p)}>{p.name}</li>))}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" name="productName" id="productName" value={formData.productName || ''} readOnly className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white sm:text-sm cursor-not-allowed" />
                            </div>
                             <div>
                                <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                <input type="text" name="productId" id="productId" value={formData.productId || ''} readOnly className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white sm:text-sm cursor-not-allowed" />
                            </div>
                        </div>

                        <div>
                           <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                            <input type="text" name="vendorName" id="vendorName" value={formData.vendorName || ''} onChange={(e) => handleFormChange('vendorName', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" name="quantity" id="quantity" value={formData.quantity || ''} onChange={(e) => handleFormChange('quantity', parseInt(e.target.value, 10))} className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required min="1" />
                            </div>
                            <div>
                                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                                <input type="number" name="costPrice" id="costPrice" value={formData.costPrice || ''} onChange={(e) => handleFormChange('costPrice', parseFloat(e.target.value))} min="0" step="0.01" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" required />
                            </div>
                             <div>
                                <label htmlFor="totalPurchasePrice" className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                                <input type="text" name="totalPurchasePrice" id="totalPurchasePrice" value={`₹${(formData.totalPurchasePrice || 0).toFixed(2)}`} readOnly className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-800 sm:text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">Save Purchase</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CrudPage = <T extends DataModel>({ title, dataKey, columns, readOnly = false }: CrudPageProps<T>) => {
  const { data, loading, error, addItem, updateItem, deleteItem } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const iconMap: Record<DataKey, React.ElementType | null> = {
      products: PackageIcon,
      sales: DollarSignIcon,
      purchases: ShoppingCartIcon,
      inventory: ArchiveIcon,
  };
  const PageIcon = iconMap[dataKey];

  const tableData = data[dataKey] as T[] || [];

  const sortedData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key!];
        const bVal = (b as any)[sortConfig.key!];
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!appliedSearchTerm.trim()) {
      return sortedData;
    }
    const lowercasedSearchTerm = appliedSearchTerm.toLowerCase();

    return sortedData.filter(item => {
      if (filterColumn === 'all') {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(lowercasedSearchTerm)
        );
      } else {
        const itemValue = (item as any)[filterColumn];
        return String(itemValue).toLowerCase().includes(lowercasedSearchTerm);
      }
    });
  }, [sortedData, appliedSearchTerm, filterColumn]);

  const grandTotal = useMemo(() => {
      if (dataKey !== 'sales') return { quantity: 0, price: 0 };
      return (filteredData as Sale[]).reduce(
          (acc, sale) => {
              acc.quantity += Number(sale.quantity) || 0;
              acc.price += Number(sale.totalPrice) || 0;
              return acc;
          },
          { quantity: 0, price: 0 }
      );
  }, [filteredData, dataKey]);

  const dropdownOptions = useMemo(() => {
    if (dataKey === 'inventory') {
      return columns.filter(c => ['name', 'category'].includes(c.accessor));
    }
    return columns.filter(c => c.sortable !== false);
  }, [columns, dataKey]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const openModal = (item: Partial<T> | null = null) => {
    if (item?.id) {
        setCurrentItem(item);
        setIsEditing(true);
    } else {
        setCurrentItem(item || {});
        setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setIsEditing(false);
  };
  
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setAppliedSearchTerm(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setFilterColumn('all');
  };

  const handleSave = async (itemToSave: Partial<T>) => {
    if (isEditing) {
        await updateItem(dataKey, itemToSave as T);
    } else {
        await addItem(dataKey, itemToSave as T);
    }
    closeModal();
  };
  
  const handleDelete = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this item?')) {
          await deleteItem(dataKey, id);
      }
  };
  
  const finalColumns = readOnly ? columns : [...columns, {
      accessor: 'actions', header: 'Actions', sortable: false, isFormField: false, render: (item: T) => (
          <div className="space-x-2">
              {/* FIX: Some data models use 'productName' instead of 'name'. Access the correct property for the aria-label. */}
              <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-900 text-sm" aria-label={`Edit ${(item as any).name || (item as any).productName || item.id}`}>Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 text-sm" aria-label={`Delete ${(item as any).name || (item as any).productName || item.id}`}>Delete</button>
          </div>
      )
  }];


  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center mb-1">
        {PageIcon && <PageIcon className="h-8 w-8 mr-3 text-teal-600" />}
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-500 mb-6 ml-11">Track and manage your {dataKey}</p>

      {/* Action bar */}
       <div className="bg-teal-50/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {!readOnly && (
            <button onClick={() => openModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition shadow">
              <PlusIcon className="h-5 w-5" />
              New {title.includes('Management') ? title.replace('Management', '').trim() : title.endsWith('s') ? title.slice(0, -1) : title}
            </button>
          )}
          {title === 'Sales Management' && (
            <button className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
              Export Report
            </button>
          )}
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={filterColumn}
              onChange={e => setFilterColumn(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm text-gray-900 min-w-[90px]"
              aria-label="Filter by column"
            >
              <option value="all">All</option>
              {dropdownOptions.map(col => (
                <option key={col.accessor} value={col.accessor}>
                  {col.header}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-grow w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              <SearchIcon className="h-5 w-5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm font-medium flex-shrink-0"
            >
              Clear
            </button>
        </form>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-700">
            <tr>
              {finalColumns.map(col => (
                <th key={String(col.accessor)} scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => col.sortable !== false && requestSort(col.accessor)}>
                  {col.header}
                  {sortConfig.key === col.accessor && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={finalColumns.length} className="text-center py-4">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={finalColumns.length} className="text-center py-4 text-red-500">{error}</td></tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {finalColumns.map(col => (
                    <td key={String(col.accessor)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(item) : String((item as any)[col.accessor] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
           {dataKey === 'sales' && !loading && filteredData.length > 0 && (
            <tfoot className="bg-gray-100">
                <tr>
                    <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-800 uppercase">Grand Total</td>
                    <td className="px-6 py-3 font-bold text-sm text-gray-800">{grandTotal.quantity}</td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3 font-bold text-sm text-gray-800">₹{grandTotal.price.toFixed(2)}</td>
                    <td className="px-6 py-3"></td>
                </tr>
            </tfoot>
           )}
        </table>
      </div>
      {isModalOpen && (
        dataKey === 'sales' ? (
          <SalesModal
            item={currentItem as Partial<Sale> | null}
            onClose={closeModal}
            onSave={handleSave as (item: Partial<Sale>) => void}
          />
        ) : dataKey === 'products' ? (
          <ProductModal
           item={currentItem as Partial<Product> | null}
           onClose={closeModal}
           onSave={handleSave as (item: Partial<Product>) => void}
         />
        ) : dataKey === 'purchases' ? (
            <PurchaseModal
             item={currentItem as Partial<Purchase> | null}
             onClose={closeModal}
             onSave={handleSave as (item: Partial<Purchase>) => void}
           />
        ) : null
      )}
    </div>
  );
};

export default CrudPage;