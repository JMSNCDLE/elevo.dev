// ─── Circuit Breaker ─────────────────────────────────────────────────────────
// When Anthropic is down, stop hammering the API.
// After FAILURE_THRESHOLD consecutive failures, short-circuit for RESET_TIMEOUT_MS.

interface CircuitState {
  failures: number
  lastFailure: number
  state: 'closed' | 'open' | 'half-open'
}

const circuits: Map<string, CircuitState> = new Map()

const FAILURE_THRESHOLD = 5
const RESET_TIMEOUT_MS = 30000 // 30s cooldown

function getCircuit(name: string): CircuitState {
  if (!circuits.has(name)) {
    circuits.set(name, { failures: 0, lastFailure: 0, state: 'closed' })
  }
  return circuits.get(name)!
}

export function canExecute(name: string): boolean {
  const circuit = getCircuit(name)
  if (circuit.state === 'closed') return true
  if (circuit.state === 'open') {
    if (Date.now() - circuit.lastFailure > RESET_TIMEOUT_MS) {
      circuit.state = 'half-open'
      return true
    }
    return false
  }
  return true // half-open: allow one request
}

export function recordSuccess(name: string) {
  const circuit = getCircuit(name)
  circuit.failures = 0
  circuit.state = 'closed'
}

export function recordFailure(name: string) {
  const circuit = getCircuit(name)
  circuit.failures++
  circuit.lastFailure = Date.now()
  if (circuit.failures >= FAILURE_THRESHOLD) {
    circuit.state = 'open'
  }
}

export function getCircuitStatus(name: string): { state: string; failures: number; canRetry: boolean } {
  const circuit = getCircuit(name)
  return { state: circuit.state, failures: circuit.failures, canRetry: canExecute(name) }
}
