import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CycleSyncService {
  private cycleUpdatedSource = new Subject<void>();

  // This is the stream your components subscribe to
  cycleUpdated$ = this.cycleUpdatedSource.asObservable();

  // THIS IS THE TRIGGER METHOD: Call this to announce changes!
  emitCycleUpdate() {
    this.cycleUpdatedSource.next();
  }
}