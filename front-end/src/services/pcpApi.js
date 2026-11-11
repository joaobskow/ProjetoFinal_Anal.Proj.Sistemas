import { apiRequest } from './api.js';

// Contrato inicial da API. A interface usa registros de demonstração até o
// backend estar disponível; depois, conecte as telas aos métodos abaixo.
export const pcpApi = {
  getDashboard: () => apiRequest('/pcp/dashboard'),
  getRequests: () => apiRequest('/pcp/pedidos'),
  getRequest: (id) => apiRequest(`/pcp/pedidos/${encodeURIComponent(id)}`),
  getProducts: () => apiRequest('/pcp/produtos'),
  getInventory: () => apiRequest('/pcp/estoque'),
  getResources: () => apiRequest('/pcp/recursos'),
  getOrders: () => apiRequest('/pcp/ordens'),
  getOrder: (id) => apiRequest(`/pcp/ordens/${encodeURIComponent(id)}`),
  getSchedule: () => apiRequest('/pcp/programacao'),
};
