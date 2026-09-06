import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getAllPayments, createMonthlyPayment, createProductPayment, getMonthlyTypes } from '../services/paymentService';
import { getMonthlyTypes as getMonthlyTypesService, createMonthlyType, updateMonthlyType, deleteMonthlyType } from '../services/monthlyTypeService';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getClients } from '../../clients/services/clientService';
import { getProfessors } from '../../staff/services/professorService';
import type { MonthlyPaymentRequest, ProductPaymentRequest, MonthlyType, Product } from '../../../types';

// Hook for PaymentsPage
export function usePayments() {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments
  });

  const activeClientsQuery = useQuery({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });

  const activeProfessorsQuery = useQuery({
    queryKey: ['professors', 'active'],
    queryFn: () => getProfessors(true)
  });

  const monthlyTypesQuery = useQuery({
    queryKey: ['monthlyTypes'],
    queryFn: getMonthlyTypes
  });

  const createPaymentMutation = useMutation({
    mutationFn: createMonthlyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("✅ Pago registrado correctamente");
    },
    onError: () => {
      toast.error("❌ Error al registrar el pago");
    }
  });

  return {
    payments: paymentsQuery.data || [],
    isLoadingPayments: paymentsQuery.isLoading,
    clients: activeClientsQuery.data || [],
    professors: activeProfessorsQuery.data || [],
    monthlyTypes: monthlyTypesQuery.data || [],
    createPayment: (data: MonthlyPaymentRequest, callback: () => void) => {
      createPaymentMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingPayment: createPaymentMutation.isPending
  };
}

// Hook for MonthlyTypesPage
export function useMonthlyTypes() {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['monthlyTypes'],
    queryFn: getMonthlyTypesService
  });

  const createPlanMutation = useMutation({
    mutationFn: createMonthlyType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("✅ Plan creado correctamente");
    },
    onError: () => toast.error("❌ Error al crear el plan")
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<MonthlyType> }) => updateMonthlyType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("✅ Plan actualizado");
    },
    onError: () => toast.error("❌ Error al actualizar el plan")
  });

  const deletePlanMutation = useMutation({
    mutationFn: deleteMonthlyType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("🗑️ Plan eliminado");
    },
    onError: () => toast.error("❌ Error al eliminar el plan")
  });

  return {
    plans: plansQuery.data || [],
    isLoadingPlans: plansQuery.isLoading,
    createPlan: (data: Partial<MonthlyType>, callback: () => void) => {
      createPlanMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingPlan: createPlanMutation.isPending,
    updatePlan: (id: number, data: Partial<MonthlyType>, callback: () => void) => {
      updatePlanMutation.mutate({ id, data }, { onSuccess: callback });
    },
    isUpdatingPlan: updatePlanMutation.isPending,
    deletePlan: (id: number) => {
      deletePlanMutation.mutate(id);
    },
    isDeletingPlan: deletePlanMutation.isPending
  };
}

// Hook for ProductsPage
export function useProducts(options: { posEnabled: boolean; salesEnabled: boolean }) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const activeClientsQuery = useQuery({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true),
    enabled: options.posEnabled
  });

  const allPaymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
    enabled: options.salesEnabled
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("✅ Producto creado");
    },
    onError: () => toast.error("❌ Error al crear el producto")
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("✅ Producto actualizado");
    },
    onError: () => toast.error("❌ Error al actualizar el producto")
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("🗑️ Producto eliminado");
    },
    onError: () => toast.error("❌ Error al eliminar el producto")
  });

  const createSaleMutation = useMutation({
    mutationFn: createProductPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success("💰 Venta realizada correctamente");
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Venta fallida";
      toast.error(`❌ Error: ${errorMessage}`);
    }
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    clients: activeClientsQuery.data || [],
    isLoadingClients: activeClientsQuery.isLoading,
    allPayments: allPaymentsQuery.data || [],
    isLoadingPayments: allPaymentsQuery.isLoading,
    createProduct: (data: Partial<Product>, callback: () => void) => {
      createProductMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingProduct: createProductMutation.isPending,
    updateProduct: (id: number, data: Partial<Product>, callback: () => void) => {
      updateProductMutation.mutate({ id, data }, { onSuccess: callback });
    },
    isUpdatingProduct: updateProductMutation.isPending,
    deleteProduct: (id: number) => {
      deleteProductMutation.mutate(id);
    },
    isDeletingProduct: deleteProductMutation.isPending,
    createSale: (data: ProductPaymentRequest, callback: () => void) => {
      createSaleMutation.mutate(data, { onSuccess: callback });
    },
    isCreatingSale: createSaleMutation.isPending
  };
}
