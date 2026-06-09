import ChatWindow from './components/ChatWindow'
import StoreGuard from './components/StoreGuard'
import './index.css'

function App() {
  return (
    <StoreGuard>
      <ChatWindow />
    </StoreGuard>
  )
}

export default App