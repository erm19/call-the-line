import { StartSession } from '@domain/useCases/StartSession';
import { GetSessions } from '@domain/useCases/GetSessions';
import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';
import { Session } from '@domain/entities/Session';
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

  async startSession(name: string): Promise<Result<Session, AppError>> {
    const { setIsLoading, setError, addItem, setActiveItem } = useSessionStore.getState();
    setIsLoading(true);
    setError(null);

    const result = await this.startSessionUseCase.execute({ name });

    if (result.isSuccess) {
      addItem(result.value);
      setActiveItem(result.value);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
    return result;
  }

  async loadSessions(): Promise<void> {
    const { setIsLoading, setError, setItems } = useSessionStore.getState();
    setIsLoading(true);
    setError(null);

    const result = await this.getSessionsUseCase.execute();

    if (result.isSuccess) {
      setItems(result.value);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  }
}
