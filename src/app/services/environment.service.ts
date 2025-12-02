import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  get isAiModeEnabled(): boolean {
    return import.meta.env.VITE_AI_MODE_ENABLED === 'true';
  }
}
