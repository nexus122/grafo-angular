import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }

  getData(key: string): any {
    if (this.isLocalStorageAvailable()) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  addData(key: string, data: any): void {
    if (this.isLocalStorageAvailable()) {
      console.log(`Saving data to localStorage with key: ${key}`, data); // Registro de depuración
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  clearData(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }
}
