// src/app/core/services/category.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('categories');
  }

  getByType(type: string): Observable<Category[]> {
    return this.api.get<Category[]>(`categories/type/${type}`);
  }

  getById(id: number): Observable<Category> {
    return this.api.get<Category>(`categories/${id}`);
  }

  create(category: Category): Observable<Category> {
    return this.api.post<Category>('categories', category);
  }

  update(id: number, category: Category): Observable<Category> {
    return this.api.put<Category>(`categories/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`categories/${id}`);
  }
}