import { useState } from 'react';
import Modal from './components/Modal.jsx';
import { displayDate, getOrder, getProduct, getRequest, orders, referenceDate as initialReferenceDate, requests } from './data/pcpData.js';
import Visao_Geral from './pages/Visao_Geral.jsx';
import Pedidos from './pages/Pedidos.jsx';
import Detalhe_Pedido from './pages/Detalhe_Pedido.jsx';
import Produtos from './pages/Produtos.jsx';
import Detalhe_Produto from './pages/Detalhe_Produto.jsx';
import Estoque from './pages/Estoque.jsx';
import Recursos from './pages/Recursos.jsx';
import Ordens_de_Producao from './pages/Ordens_de_Producao.jsx';
import Detalhe_da_Ordem from './pages/Detalhe_da_Ordem.jsx';
import Programacao from './pages/Programacao.jsx';

const navigation = [
  { label: 'Visão geral', icon: '▦' },
  { label: 'Pedidos', icon: '▤' },
  { label: 'Produtos', icon: '⬡' },
  { label: 'Estoque', icon: '◇' },
  { label: 'Recursos', icon: '☼' },
  { label: 'Ordens de produção', icon: '☷' },
  { label: 'Programação', icon: '▦' },
];

export default function App() {
  const [page, setPage] = useState('Visão geral');
  const [selectedRequest, setSelectedRequest] = useState(requests[1]);
  const [selectedProduct, setSelectedProduct] = useState(getProduct('P003'));
  const [selectedOrder, setSelectedOrder] = useState(getOrder('OP-0002') ?? orders[0]);
  const [modal, setModal] = useState('');
  const [notice, setNotice] = useState('');
  const [line, setLine] = useState('Todas as linhas');
  const [reference, setReference] = useState(initialReferenceDate);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3600);
  };
  const openRequest = (item) => { setSelectedRequest(item); setPage('Detalhe do pedido'); };
  const openProduct = (item) => { setSelectedProduct(item); setPage('Detalhe do produto'); };
  const openOrder = (item) => { setSelectedOrder(item); setPage('Detalhe da ordem'); };
  const CurrentPage = {
    'Visão geral': <Visao_Geral onPage={setPage} onOpenOrder={openOrder} onOpenRequest={openRequest} line={line} setLine={setLine} />,
    Pedidos: <Pedidos onOpen={openRequest} />,
    'Detalhe do pedido': <Detalhe_Pedido item={selectedRequest} onBack={() => setPage('Pedidos')} onGenerate={() => setModal('create-order')} />,
    Produtos: <Produtos onOpen={openProduct} />,
    'Detalhe do produto': <Detalhe_Produto item={selectedProduct} onBack={() => setPage('Produtos')} />,
    Estoque: <Estoque />,
    Recursos: <Recursos line={line} setLine={setLine} />,
    'Ordens de produção': <Ordens_de_Producao onOpen={openOrder} onCreate={() => setModal('create-order')} />,
    'Detalhe da ordem': <Detalhe_da_Ordem item={selectedOrder} onBack={() => setPage('Ordens de produção')} onReschedule={() => setModal('reschedule')} onRegister={() => setModal('register')} />,
    Programação: <Programacao onOpen={openOrder} onReschedule={(item) => { if (item) setSelectedOrder(item); setModal('reschedule'); }} notify={notify} />,
  }[page];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">A</span><span><b>AgroPCP</b><small>AgroVale Implementos</small></span></div>
      <div className="menu-label">MENU</div>
      <nav>{navigation.map((item) => <button key={item.label} className={`nav-link ${page === item.label ? 'selected' : ''}`} onClick={() => setPage(item.label)}><span className="nav-glyph">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="reference"><small>DATA DE REFERÊNCIA</small><strong>{displayDate(reference,true)} <button onClick={() => setModal('reference')}>Editar</button></strong><small>Base para “atrasada”</small></div><div className="profile"><span>PC</span><div>Planejador<small>Equipe PCP</small></div></div></div>
    </aside>
    <main className="main-area"><header className="toolbar"><div className="breadcrumb">AgroPCP <span>/</span> {page}</div><div className="toolbar-right"><span className="demo-mark">DADOS DOS ARQUIVOS JSON</span><span className="user-avatar">PC</span></div></header><section className="page-content">{CurrentPage}</section></main>
    {modal && <Modal type={modal} close={() => setModal('')} item={selectedOrder} request={selectedRequest} onSave={(message) => { setModal(''); notify(message); }} referenceDate={reference} setReferenceDate={setReference} />}
    {notice && <div className="toast">✓ {notice}</div>}
  </div>;
}
