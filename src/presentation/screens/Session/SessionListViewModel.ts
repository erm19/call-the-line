import { injectable, inject } from 'tsyringe';
import { DI_TOKENS } from '@core/di/container';
import { GetSessions } from '@domain/useCases/GetSessions';
import { EndSession } from '@domain/useCases/EndSession';
import { useSessionStore } from '@presentation/state/sessionStore';

/**
 * ViewModel for SessionListScreen.
 * Loads sessions on demand and ends sessions, syncing the session store.
 */
@injectable()
export class SessionListViewModel {
  constructor(
    @inject(DI_TOKENS.GetSessions) private readonly getSessions: GetSessions,
    @inject(DI_TOKENS.EndSession) private readonly endSession: EndSession,
  ) {}

  async loadSessions(): Promise<void> {
    const store = useSessionStore.getState();
    store.setIsLoading(true);
    store.setError(null);

    const result = await this.getSessions.execute();

    if (result.isSuccess) {
      useSessionStore.getState().setItems(result.value);
    } else {
      useSessionStore.getState().setError(result.error.message);
    }

    useSessionStore.getState().setIsLoading(false);
  }

  async endSessionById(sessionId: string): Promise<void> {
    const result = await this.endSession.execute(sessionId);

    if (result.isSuccess) {
      const updated = result.value;
      const current = useSessionStore.getState().items;
      const next = current.map(session => (session.id === updated.id ? updated : session));
      useSessionStore.getState().setItems(next);
    } else {
      useSessionStore.getState().setError(result.error.message);
    }
  }
}
