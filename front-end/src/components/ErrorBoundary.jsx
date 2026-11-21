import { Component } from 'react';
import Icon from './Icon.jsx';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erro na tela', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="crash">
        <span className="crash-icon">
          <Icon name="alert" size={22} />
        </span>
        <h1>Esta tela encontrou um erro</h1>
        <p>Os dados da sessão continuam carregados. Volte para a visão geral ou recarregue o aplicativo.</p>
        <code>{String(error?.message ?? error)}</code>
        <div className="crash-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              this.setState({ error: null });
              this.props.onHome?.();
            }}
          >
            Ir para a visão geral
          </button>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Recarregar aplicativo
          </button>
        </div>
      </div>
    );
  }
}
