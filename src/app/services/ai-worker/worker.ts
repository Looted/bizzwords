import { WorkerOrchestrator } from './worker-orchestrator';

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  await WorkerOrchestrator.handleMessage(event);
});
