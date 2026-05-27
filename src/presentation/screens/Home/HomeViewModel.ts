import { StartSession } from '@domain/useCases/StartSession';
import { GetSessions } from '@domain/useCases/GetSessions';
import { useSessionStore } from '@presentation/state/sessionStore';

/**
 * ViewModel for HomeScreen.
 * Exposes startSession() and loadSessions(), syncing the session store.
 */
export class HomeViewModel {
  constructor(
    private readonly startSessionUseCase: StartSession,
    private readonly getSessionsUseCase: GetSessions,
  ) {}

  async startSession(name: string): Promise<void> {
    const store = useSessionStore.getState();
    store.setIsLoading(true);
    store.setError(null);

    const result = await this.startSessionUseCase.execute({ name });

    if (result.isSuccess) {
      store.addItem(result.value);
      store.setActiveItem(result.value);
    } else {
      store.setError(result.error.message);
    }

    store.setIsLoading(false);
  }

  async loadSessions(): Promise<void> {
    const store = useSessionStore.getState();
    store.setIsLoading(true);
    store.setError(null);

    const result = await this.getSessionsUseCase.execute();

    if (result.isSuccess) {
      useSessionStore.getState().setItems(result.value);
    } else {
      useSessionStore.getState().setError(result.error.message);
    }

    useSessionStore.getState().setIsLoading(false);
  }
}
