import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CycleSyncService {
  // A lightweight event broadcaster channel
  private cycleUpdatedSource = new Subject<void>();
  
  // Observable stream components can subscribe to
  cycleUpdated$ = this.cycleUpdatedSource.asObservable();

  /**
   * Broadcasts a ping notification to all listening views
   */
  notifyCycleChanged(): void {
    this.cycleUpdatedSource.next();
  }
}