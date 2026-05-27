import { GetSessions } from '@domain/useCases/GetSessions';
import { EndSession } from '@domain/useCases/EndSession';
import { useSessionStore } from '@presentation/state/sessionStore';

/**
 * ViewModel for SessionListScreen.
 *
 * Manually composed (instantiated via `new` in the screen) — not registered with tsyringe.
 * Dependencies are passed explicitly through the constructor; do NOT add @injectable/@inject
 * decorators here, as that would create a dual construction path.
 *
 * Loads sessions on demand and ends sessions, syncing the session store.
 */
export class SessionListViewModel {
  constructor(
    private readonly getSessions: GetSessions,
    private readonly endSession: EndSession,
  ) {}

  async loadSessions(): Promise<void> {
    const { setIsLoading, setError, setItems } = useSessionStore.getState();
    setIsLoading(true);
    setError(null);

    const result = await this.getSessions.execute();

    if (result.isSuccess) {
      setItems(result.value);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }

  async endSessionById(sessionId: string): Promise<void> {
    const { setError, setItems } = useSessionStore.getState();
    setError(null);

    const result = await this.endSession.execute(sessionId);

    if (result.isSuccess) {
      const updated = result.value;
      const current = useSessionStore.getState().items;
      const next = current.map(session => (session.id === updated.id ? updated : session));
      setItems(next);
    } else {
      setError(result.error.message);
    }
  }
}
