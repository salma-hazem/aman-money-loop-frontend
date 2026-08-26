import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DocumentRequirement } from '../models/document-requirement.model';

@Injectable({ providedIn: 'root' })
export class DocumentRequirementService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/api/DocumentRequirements`;

  getActiveOrdered(): Observable<DocumentRequirement[]> {
    return this.http.get<DocumentRequirement[]>(`${this.base}/active`);
  }

  getRequiredOnly(): Observable<DocumentRequirement[]> {
    return this.http.get<DocumentRequirement[]>(`${this.base}/required`);
  }
}