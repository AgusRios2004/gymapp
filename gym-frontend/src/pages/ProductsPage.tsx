import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Plus, 
  ShoppingCart, 
  Search, 
  Trash2, 
  Edit3, 
  TrendingDown, 
  User,
  CreditCard,
  History as HistoryIcon
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { createProductPayment, getAllPayments } from '../services/paymentService';
import { getClients } from '../services/clientService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-toastify';
import type { Product, Client, ProductDetailRequest, Payment } from '../types';

export default function ProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inventory' | 'pos' | 'sales'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inventory Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    price: '',
    stock: ''
  });

  // POS State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<Array<{ product: Product, quantity: number }>>([]);
  const [clientSearch, setClientSearch] = useState('');

  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true),
    enabled: activeTab === 'pos'
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
    enabled: activeTab === 'sales'
  });

  // Mutations
  const productMutation = useMutation({
    mutationFn: (data: Partial<Product>) => 
      editingProduct ? updateProduct(editingProduct.id, data) : createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`✅ Producto ${editingProduct ? 'actualizado' : 'creado'}`);
      setIsProductModalOpen(false);
      resetProductForm();
    },
    onError: () => toast.error("❌ Error en la operación")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("🗑️ Producto eliminado");
    }
  });

  const saleMutation = useMutation({
    mutationFn: createProductPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("💰 Venta realizada correctamente");
      setCart([]);
      setSelectedClient(null);
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Venta fallida";
      toast.error(`❌ Error: ${errorMessage}`);
    }
  });

  const resetProductForm = () => {
    setProductForm({ productName: '', price: '', stock: '' });
    setEditingProduct(null);
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        productName: product.productName,
        price: product.price.toString(),
        stock: product.stock.toString()
      });
    } else {
      resetProductForm();
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    productMutation.mutate({
      productName: productForm.productName,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      administratorId: user?.id
    });
  };

  // CART Logic
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.warning("Sin stock disponible");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           toast.warning("Has alcanzado el límite de stock");
           return prev;
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleConfirmSale = () => {
    if (!selectedClient || cart.length === 0) return;

    const products: ProductDetailRequest[] = cart.map(item => ({
      idProduct: item.product.id,
      quantity: item.quantity
    }));

    saleMutation.mutate({
      idClient: selectedClient.id,
      idProfessor: user?.id || 0,
      date: new Date().toISOString().split('T')[0],
      products
    });
  };

  const totalSale = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    `${c.name} ${c.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.dni.includes(clientSearch)
  ).slice(0, 5);

  const productSales = allPayments.filter((p: Payment) => p.paymentProducts && p.paymentProducts.length > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-gray-100 rounded-2xl w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Package size={18} /> Inventario
          </button>
          <button 
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'pos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <ShoppingCart size={18} /> Punto de Venta
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <HistoryIcon size={18} /> Historial Ventas
          </button>
        </div>
        
        {activeTab === 'inventory' && (
          <Button onClick={() => handleOpenProductModal()} className="gap-2 rounded-2xl w-full md:w-auto">
            <Plus size={20} /> Nuevo Producto
          </Button>
        )}
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
             <Search size={20} className="text-gray-400" />
             <input 
               type="text" 
               placeholder="Buscar producto por nombre..." 
               className="bg-transparent border-0 focus:ring-0 text-gray-900 font-medium w-full"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingProducts ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Cargando catálogo...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No se encontraron productos</td></tr>
                ) : filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{p.productName}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">${p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>{p.stock}</span>
                        {p.stock <= 5 && <TrendingDown size={14} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.stock > 0 ? 'success' : 'danger'}>
                        {p.stock > 0 ? 'Disponible' : 'Sin Stock'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <button onClick={() => handleOpenProductModal(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit3 size={18} />
                       </button>
                       <button onClick={() => { if(confirm("¿Seguro de borrar?")) deleteMutation.mutate(p.id) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* POS Catalog */}
          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.filter(p => p.stock > 0).map(p => (
                  <button 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="text-left">
                       <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.productName}</p>
                       <p className="text-lg font-black text-blue-500">${p.price.toLocaleString()}</p>
                       <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Stock: {p.stock}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <Plus size={20} />
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                   <CreditCard className="text-blue-500" size={24} /> Resumen de Venta
                </h3>

                <div className="space-y-4">
                   <div className="relative">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Cliente</label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                           type="text" 
                           placeholder="Buscar cliente..." 
                           className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500"
                           value={selectedClient ? `${selectedClient.name} ${selectedClient.lastName}` : clientSearch}
                           onChange={e => {
                             setClientSearch(e.target.value);
                             setSelectedClient(null);
                           }}
                         />
                         {clientSearch && !selectedClient && (
                           <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                              {filteredClients.map(c => (
                                <button 
                                  key={c.id} 
                                  onClick={() => { setSelectedClient(c); setClientSearch(''); }} 
                                  className="w-full p-4 text-left hover:bg-blue-50 font-bold text-gray-700 border-b border-gray-50 last:border-0"
                                >
                                  {c.name} {c.lastName} <span className="text-gray-400 font-normal ml-2">DNI: {c.dni}</span>
                                </button>
                              ))}
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="border-t border-gray-100 pt-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Carrito</label>
                      {cart.length === 0 ? (
                        <p className="text-center py-8 text-gray-400 text-sm">El carrito está vacío</p>
                      ) : (
                        <div className="space-y-3">
                          {cart.map(item => (
                            <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                               <div>
                                  <p className="font-bold text-sm text-gray-900">{item.product.productName}</p>
                                  <p className="text-xs text-blue-600">{item.quantity} x ${item.product.price.toLocaleString()}</p>
                               </div>
                               <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>

                   <div className="pt-6 space-y-4">
                      <div className="flex justify-between items-center text-xl font-black text-gray-900">
                         <span>TOTAL</span>
                         <span>${totalSale.toLocaleString()}</span>
                      </div>
                      <Button 
                        onClick={handleConfirmSale} 
                        className="w-full rounded-2xl py-4 shadow-lg shadow-blue-500/20"
                        disabled={!selectedClient || cart.length === 0 || saleMutation.isPending}
                        isLoading={saleMutation.isPending}
                      >
                         Confirmar Venta
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productSales.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No hay ventas registradas</td></tr>
              ) : productSales.map((s: Payment) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{s.clientName}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-wrap gap-1">
                        {s.paymentProducts?.map((pp, idx) => (
                           <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                              {pp.quantity}x {pp.productName}
                           </span>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-4 font-black text-blue-600">${s.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
           <Input 
             label="Nombre del Producto" 
             required 
             value={productForm.productName}
             onChange={e => setProductForm({...productForm, productName: e.target.value})}
           />
           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Precio ($)" 
                type="number" 
                required 
                value={productForm.price}
                onChange={e => setProductForm({...productForm, price: e.target.value})}
              />
              <Input 
                label="Stock Inicial" 
                type="number" 
                required 
                value={productForm.stock}
                onChange={e => setProductForm({...productForm, stock: e.target.value})}
              />
           </div>
           <div className="pt-6 flex gap-3">
              <Button variant="outline" type="button" className="flex-1" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" isLoading={productMutation.isPending}>Guardar Producto</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
