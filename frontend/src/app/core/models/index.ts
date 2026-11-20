export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserInfo {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserInfo;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  cantidadProductos: number;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  activo: boolean;
  disponible: boolean;
  categoriaId: number;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  categoriaId: number;
  activo: boolean;
}

export interface ProductoQuery {
  categoria?: number | null;
  disponible?: boolean | null;
  search?: string | null;
  incluirInactivos?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

export interface DetallePedido {
  id: number;
  productoId: number;
  productoNombre: string;
  productoImagenUrl: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface HistorialEstadoPedido {
  id: number;
  estadoAnterior: EstadoPedido | null;
  estadoNuevo: EstadoPedido;
  fechaCambio: string;
}

export interface Pedido {
  id: number;
  codigo: string;
  clienteNombre: string;
  celular: string;
  direccion: string;
  referencia: string | null;
  observaciones: string | null;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  stockDevuelto: boolean;
  detalles: DetallePedido[];
  historialEstados: HistorialEstadoPedido[];
}

export interface CrearPedidoRequest {
  clienteNombre: string;
  celular: string;
  direccion: string;
  referencia?: string | null;
  observaciones?: string | null;
  items: { productoId: number; cantidad: number }[];
}

export interface PedidoQuery {
  estado?: EstadoPedido | '' | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  search?: string | null;
  page?: number;
  size?: number;
}

export interface CartItem {
  productoId: number;
  nombre: string;
  precio: number;
  imagenUrl: string;
  categoriaNombre: string;
  stockDisponible: number;
  cantidad: number;
}

export interface DashboardResumen {
  totalProductos: number;
  productosActivos: number;
  stockBajo: number;
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosEnPreparacion: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  ventasRegistradas: number;
}

export interface PuntoVenta {
  fecha: string;
  monto: number;
  pedidos: number;
}

export interface VentasPeriodo {
  periodo: string;
  totalVentas: number;
  cantidadPedidosValidos: number;
  ticketPromedio: number;
  serie: PuntoVenta[];
}

export interface EstadoConteo {
  estado: EstadoPedido;
  cantidad: number;
}

export interface PuntoPedido {
  fecha: string;
  total: number;
  entregados: number;
  cancelados: number;
}

export interface PedidosEstadistica {
  periodo: string;
  totalPedidos: number;
  porEstado: EstadoConteo[];
  serieDiaria: PuntoPedido[];
}
