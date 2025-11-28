import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;
  showInstallButton = signal(false);

  init() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      // Update UI to notify the user they can install the PWA
      this.showInstallButton.set(true);
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      // Hide the install button when the PWA has been installed
      this.showInstallButton.set(false);
      this.deferredPrompt = null;
    });
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // Hide the install button regardless of the outcome
    this.showInstallButton.set(false);

    // Clear the deferredPrompt
    this.deferredPrompt = null;
  }
}
