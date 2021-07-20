import MutexInterface from './mutex-interface';
import Semaphore from './semaphore';

class Mutex implements MutexInterface {
  constructor(cancelError?: Error) {
    this._semaphore = new Semaphore(1, cancelError);
  }

  async acquire(): Promise<MutexInterface.Releaser> {
    const [, releaser] = await this._semaphore.acquire();

    return releaser;
  }

  runExclusive<T>(callback: MutexInterface.Worker<T>): Promise<T> {
    return this._semaphore.runExclusive(() => callback());
  }

  isLocked(): boolean {
    return this._semaphore.isLocked();
  }

  /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */
  release(): void {
    this._semaphore.release();
  }

  cancel(): void {
    return this._semaphore.cancel();
  }

  private _semaphore: Semaphore;
}

export default Mutex;
