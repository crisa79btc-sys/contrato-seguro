# ContratoSeguro - Integracao com Supabase Realtime

Documentacao de como o frontend se conecta ao Supabase Realtime para receber atualizacoes de status em tempo real durante o processamento de contratos.

---

## Visao geral

O ContratoSeguro usa Supabase Realtime para notificar o frontend sobre mudancas de status durante operacoes assincronas (analise, correcao, classificacao). Isso evita a necessidade de polling constante e proporciona uma experiencia mais responsiva.

### Fluxo

```
1. Usuario dispara acao (ex: POST /api/analyze)
2. API retorna 202 Accepted com ID do recurso
3. Frontend faz subscribe via Supabase Realtime
4. Job Inngest processa em background
5. Job atualiza registro no banco (status, resultado)
6. Supabase Realtime envia evento para o frontend
7. Frontend atualiza a UI
```

---

## Canais de subscribe

### 1. Status do contrato

Monitora mudancas na tabela `contracts` para acompanhar o ciclo de vida completo do contrato.

```typescript
import { createClient } from '@supabase/supabase-js'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function subscribeToContract(contractId: string, onUpdate: (payload: any) => void): RealtimeChannel {
  const channel = supabase
    .channel(`contract:${contractId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'contracts',
        filter: `id=eq.${contractId}`,
      },
      (payload) => {
        console.log('Contrato atualizado:', payload.new)
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return channel
}

// Uso
const channel = subscribeToContract('uuid-do-contrato', (contract) => {
  // Atualizar UI com novo status
  setStatus(contract.status)
  setProgress(contract.progress)
})

// Cleanup (ao desmontar o componente)
supabase.removeChannel(channel)
```

**Campos monitorados:**

| Campo          | Tipo    | Descricao                                                        |
| -------------- | ------- | ---------------------------------------------------------------- |
| status         | string  | Status atual (uploaded, classifying, classified, analyzing, ...) |
| progress       | number  | Progresso estimado (0-100)                                       |
| current_step   | string  | Mensagem descritiva do passo atual                               |
| error_message  | string  | Mensagem de erro, se houver                                      |
| updated_at     | string  | Timestamp da ultima atualizacao                                  |

### 2. Resultado da analise

Monitora a tabela `analyses` para receber o resultado quando a analise for concluida.

```typescript
function subscribeToAnalysis(contractId: string, onResult: (payload: any) => void): RealtimeChannel {
  const channel = supabase
    .channel(`analysis:${contractId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'analyses',
        filter: `contract_id=eq.${contractId}`,
      },
      (payload) => {
        console.log('Analise criada:', payload.new)
        onResult(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'analyses',
        filter: `contract_id=eq.${contractId}`,
      },
      (payload) => {
        console.log('Analise atualizada:', payload.new)
        onResult(payload.new)
      }
    )
    .subscribe()

  return channel
}
```

**Campos monitorados:**

| Campo                      | Tipo    | Descricao                                 |
| -------------------------- | ------- | ----------------------------------------- |
| global_score               | number  | Score de seguranca (0-100)                |
| executive_summary          | string  | Sumario executivo da analise              |
| tier                       | string  | Nivel da analise (free, full)             |
| created_at                 | string  | Timestamp de criacao                      |

### 3. Resultado da correcao

Monitora a tabela `corrected_contracts` para receber o resultado quando a correcao for concluida.

```typescript
function subscribeToCorrection(contractId: string, onResult: (payload: any) => void): RealtimeChannel {
  const channel = supabase
    .channel(`correction:${contractId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'corrected_contracts',
        filter: `contract_id=eq.${contractId}`,
      },
      (payload) => {
        console.log('Correcao atualizada:', payload.new)
        onResult(payload.new)
      }
    )
    .subscribe()

  return channel
}
```

**Campos monitorados:**

| Campo            | Tipo    | Descricao                                  |
| ---------------- | ------- | ------------------------------------------ |
| corrected_text   | string  | Texto completo do contrato corrigido       |
| changes_summary  | string  | Resumo das alteracoes realizadas           |
| created_at       | string  | Timestamp de criacao                       |

---

## Hook React recomendado

Para facilitar o uso nos componentes, recomenda-se criar um hook customizado:

```typescript
// hooks/useContractRealtime.ts
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type ContractStatus =
  | 'uploaded'
  | 'classifying'
  | 'classified'
  | 'analyzing'
  | 'analyzed'
  | 'correcting'
  | 'corrected'
  | 'error'

interface ContractState {
  status: ContractStatus
  progress: number
  currentStep: string | null
  analysisId: string | null
  correctionId: string | null
  error: string | null
}

export function useContractRealtime(contractId: string) {
  const [state, setState] = useState<ContractState>({
    status: 'uploaded',
    progress: 0,
    currentStep: null,
    analysisId: null,
    correctionId: null,
    error: null,
  })

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Subscribe no contrato
    const contractChannel = supabase
      .channel(`contract:${contractId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contracts',
          filter: `id=eq.${contractId}`,
        },
        (payload) => {
          const data = payload.new as any
          setState((prev) => ({
            ...prev,
            status: data.status,
            progress: data.progress ?? prev.progress,
            currentStep: data.current_step ?? prev.currentStep,
            error: data.error_message ?? null,
          }))
        }
      )
      .subscribe()

    // Subscribe na analise
    const analysisChannel = supabase
      .channel(`analysis:${contractId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analyses',
          filter: `contract_id=eq.${contractId}`,
        },
        (payload) => {
          const data = payload.new as any
          setState((prev) => ({
            ...prev,
            analysisId: data.id,
          }))
        }
      )
      .subscribe()

    // Subscribe na correcao
    const correctionChannel = supabase
      .channel(`correction:${contractId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'corrected_contracts',
          filter: `contract_id=eq.${contractId}`,
        },
        (payload) => {
          const data = payload.new as any
          setState((prev) => ({
            ...prev,
            correctionId: data.id,
          }))
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(contractChannel)
      supabase.removeChannel(analysisChannel)
      supabase.removeChannel(correctionChannel)
    }
  }, [contractId])

  return state
}
```

**Uso no componente:**

```tsx
function ContractProcessing({ contractId }: { contractId: string }) {
  const { status, progress, currentStep, analysisId, error } = useContractRealtime(contractId)

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (status === 'analyzed' && analysisId) {
    return <AnalysisResult analysisId={analysisId} />
  }

  return (
    <div>
      <ProgressBar value={progress} />
      <p>{currentStep ?? 'Processando...'}</p>
    </div>
  )
}
```

---

## Fallback: Polling

Para cenarios onde o Supabase Realtime nao esta disponivel (problemas de conectividade, WebSocket bloqueado), o frontend deve implementar fallback via polling.

### Implementacao

```typescript
// hooks/useContractPolling.ts
import { useEffect, useState, useRef } from 'react'

const POLLING_INTERVAL = 3000 // 3 segundos

interface StatusResponse {
  contractId: string
  status: string
  progress?: number
  currentStep?: string
  result?: {
    analysisId?: string
    score?: number
  }
}

export function useContractPolling(contractId: string) {
  const [data, setData] = useState<StatusResponse | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/contract/${contractId}/status`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })

        if (response.ok) {
          const result: StatusResponse = await response.json()
          setData(result)

          // Parar polling quando processamento terminar
          const finalStatuses = ['analyzed', 'corrected', 'error']
          if (finalStatuses.includes(result.status)) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }

    // Primeira chamada imediata
    poll()

    // Polling a cada 3 segundos
    intervalRef.current = setInterval(poll, POLLING_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [contractId])

  return data
}
```

### Estrategia de fallback automatico

```typescript
// hooks/useContractStatus.ts
import { useEffect, useState } from 'react'
import { useContractRealtime } from './useContractRealtime'
import { useContractPolling } from './useContractPolling'

export function useContractStatus(contractId: string) {
  const [usePolling, setUsePolling] = useState(false)
  const realtimeState = useContractRealtime(contractId)
  const pollingState = useContractPolling(contractId)

  useEffect(() => {
    // Se o Realtime nao receber atualizacoes em 10s, ativa polling
    const timeout = setTimeout(() => {
      if (realtimeState.status === 'uploaded' && realtimeState.progress === 0) {
        console.warn('Realtime sem resposta, ativando polling fallback')
        setUsePolling(true)
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [realtimeState])

  if (usePolling) {
    return {
      status: pollingState?.status ?? 'uploaded',
      progress: pollingState?.progress ?? 0,
      currentStep: pollingState?.currentStep ?? null,
      source: 'polling' as const,
    }
  }

  return {
    ...realtimeState,
    source: 'realtime' as const,
  }
}
```

---

## Configuracao do Supabase

Para que o Realtime funcione, as tabelas precisam ter a replicacao habilitada no Supabase.

### Habilitar Realtime nas tabelas

No Supabase Dashboard, va em **Database > Replication** e habilite para as tabelas:

- `contracts`
- `analyses`
- `corrected_contracts`

Ou via SQL:

```sql
-- Habilitar Realtime para as tabelas necessarias
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE corrected_contracts;
```

### Row Level Security (RLS)

As policies de RLS do Supabase tambem se aplicam ao Realtime. O usuario so recebe eventos de registros que ele tem permissao para ler:

```sql
-- Exemplo: usuario so ve seus proprios contratos
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM contracts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own corrected_contracts"
  ON corrected_contracts FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM contracts WHERE user_id = auth.uid()
    )
  );
```

---

## Eventos monitorados

| Tabela               | Evento | Quando ocorre                                    |
| -------------------- | ------ | ------------------------------------------------ |
| contracts            | UPDATE | Status muda (uploaded -> classifying -> ...)      |
| contracts            | UPDATE | Progresso atualizado durante processamento        |
| analyses             | INSERT | Analise criada quando job inicia                  |
| analyses             | UPDATE | Analise concluida com resultado                   |
| corrected_contracts  | INSERT | Correcao criada quando job inicia                 |
| corrected_contracts  | UPDATE | Correcao concluida com resultado                  |
