import { useEffect, useState } from 'react';
import Icon from './components/Icon.jsx';
import { Segmented } from './components/ui.jsx';
import { useNav, useStore } from './state/context.js';
import { formatDateLong, formatWeekday } from './domain/format.js';
import Dashboard from './pages/Dashboard.jsx';
import Requests from './pages/Requests.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Inventory from './pages/Inventory.jsx';
import Resources from './pages/Resources.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Schedule from './pages/Schedule.jsx';
import Modals from './modals/Modals.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const pages = {
  dashboard: Dashboard,
  pedidos: Requests,
  pedido: RequestDetail,
  produtos: Products,
  produto: ProductDetail,
  estoque: Inventory,
  recursos: Resources,
  ordens: Orders,
  ordem: OrderDetail,
  programacao: Schedule,
};

const parentPage = { pedido: 'pedidos', produto: 'produtos', ordem: 'ordens' };

const readTheme = () => {
  try {
    return localStorage.getItem('agropcp-theme');
  } catch {
    return null;
  }
};

function useTheme() {
  const [theme, setTheme] = useState(() => readTheme() ?? 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('agropcp-theme', theme);
    } catch {
      return;
    }
  }, [theme]);
  return [theme, () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))];
}

function Sidebar({ theme, toggleTheme }) {
  const { model, state } = useStore();
  const { route, go, openModal } = useNav();
  const active = parentPage[route.page] ?? route.page;
  const lateCount = model.openOrders.filter((order) => order.late).length;
  const pendingCount = model.requests.filter((request) => request.pending).length;
  const lowCount = model.inventory.filter((item) => item.belowMinimum).length;
  const stoppedCount = model.resources.filter((resource) => !resource.available).length;

  const groups = [
    {
      label: 'Produção',
      items: [
        { id: 'dashboard', label: 'Visão geral', icon: 'dashboard' },
        { id: 'programacao', label: 'Programação', icon: 'schedule' },
        { id: 'ordens', label: 'Ordens de produção', icon: 'orders', count: lateCount, tone: 'danger', hint: 'atrasadas' },
      ],
    },
    {
      label: 'Demanda',
      items: [{ id: 'pedidos', label: 'Pedidos', icon: 'requests', count: pendingCount, hint: 'pendentes' }],
    },
    {
      label: 'Cadastros',
      items: [
        { id: 'produtos', label: 'Produtos', icon: 'products' },
        { id: 'estoque', label: 'Estoque', icon: 'inventory', count: lowCount, tone: 'warning', hint: 'abaixo do mínimo' },
        { id: 'recursos', label: 'Recursos', icon: 'resources', count: stoppedCount, tone: 'warning', hint: 'em manutenção' },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="sprout" size={20} strokeWidth={2} />
        </span>
        <span className="brand-text">
          <strong>AgroPCP</strong>
          <small>AgroVale Implementos</small>
        </span>
      </div>
      <nav className="nav">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <span className="nav-group-label">{group.label}</span>
            {group.items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${active === item.id ? 'is-active' : ''}`}
                aria-current={active === item.id ? 'page' : undefined}
                onClick={() => go(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={`nav-count tone-${item.tone ?? 'neutral'}`} title={`${item.count} ${item.hint}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        {state.dirty && (
          <div className="session-note">
            <span>
              <i className="pulse" /> Alterações nesta sessão
            </span>
            <button
              type="button"
              onClick={() => openModal('reset')}
            >
              Restaurar
            </button>
          </div>
        )}
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { state } = useStore();
  const { line, setLine, openModal } = useNav();
  return (
    <div className="topbar">
      <div className="topbar-group">
        <span className="topbar-label">
          <Icon name="layers" size={15} /> Linha de produção
        </span>
        <Segmented
          size="sm"
          label="Linha de produção"
          value={line}
          onChange={setLine}
          options={[
            { value: 'todas', label: 'Todas' },
            { value: 'pesada', label: 'Pesada' },
            { value: 'leve', label: 'Leve' },
          ]}
        />
      </div>
      <button type="button" className="date-chip" onClick={() => openModal('reference')} title="Alterar a data usada para calcular atrasos">
        <Icon name="calendar" size={15} />
        <span>
          <small>Data de referência</small>
          <strong>
            {formatWeekday(state.referenceDate)} · {formatDateLong(state.referenceDate)}
          </strong>
        </span>
        <Icon name="chevronDown" size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const { route, toast, go, closeModal } = useNav();
  const [theme, toggleTheme] = useTheme();
  const Page = pages[route.page] ?? Dashboard;
  return (
    <div className="app">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="main">
        <Topbar />
        <div className="page" key={`${route.page}-${route.id ?? ''}`}>
          <ErrorBoundary onHome={() => go('dashboard')}>
            <Page id={route.id} />
          </ErrorBoundary>
        </div>
      </main>
      <ErrorBoundary onHome={closeModal}>
        <Modals />
      </ErrorBoundary>
      {toast && (
        <div className="toast" role="status" key={toast.id}>
          <Icon name="checkCircle" size={18} />
          {toast.text}
        </div>
      )}
    </div>
  );
}
