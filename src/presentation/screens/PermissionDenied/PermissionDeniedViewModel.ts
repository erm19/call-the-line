import type { IPermissionService } from '@domain/services/IPermissionService';

/**
 * ViewModel for PermissionDeniedScreen.
 * Handles the "open settings" action by routing through the domain service.
 */
export class PermissionDeniedViewModel {
  constructor(private readonly permissionService: IPermissionService) {}

  /**
   * Opens system app settings so the user can grant camera permission.
   * Failure is swallowed — if settings cannot open, the user is already
   * on the instruction screen and can try again.
   */
  async openSettings(): Promise<void> {
    await this.permissionService.openSettings();
  }
}
