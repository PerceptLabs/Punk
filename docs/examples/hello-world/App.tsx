import { PunkRenderer } from '@punk/core'
import schema from './schema.json'

function App() {
  const handlers = {
    handleClick: () => {
      alert('Hello from Punk! 🎸')
    }
  }

  return <PunkRenderer schema={schema} handlers={handlers} />
}

export default App
