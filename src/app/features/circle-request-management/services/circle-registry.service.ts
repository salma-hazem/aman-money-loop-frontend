import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Circle, CircleSlot, CircleStatus } from '../models/circle.model';

@Injectable({ providedIn: 'root' })
export class CircleRegistryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/api/circles`;

  getAll(status?: CircleStatus): Observable<Circle[]> {
    return this.http.get<Circle[]>(this.baseUrl, {
      params: status ? { status } : {},
    });
  }

  getById(id: string): Observable<Circle> {
    return this.http.get<Circle>(`${this.baseUrl}/${id}`);
  }

  getSlots(id: string): Observable<CircleSlot[]> {
    return this.http.get<CircleSlot[]>(`${this.baseUrl}/${id}/slots`);
  }

  vacateSlot(id: string, slotNumber: number): Observable<CircleSlot> {
    return this.http.post<CircleSlot>(
      `${this.baseUrl}/${id}/slots/${slotNumber}/vacate`,
      null
    );
  }
}

