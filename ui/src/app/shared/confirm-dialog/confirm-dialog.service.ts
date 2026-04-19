import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  dangerMode?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private requestSubject = new Subject<{ options: ConfirmOptions; resolve: (v: boolean) => void }>();
  request$ = this.requestSubject.asObservable();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => this.requestSubject.next({ options, resolve }));
  }
}
