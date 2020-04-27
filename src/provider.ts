import { ReactNode } from "react";
import { Observable, merge } from "rxjs";

export interface Item {
  title: string;
  subtitle?: string;

  description: string;
  longDescription?: string;

  tags?: Map<string, string | string[]>;
  urls?: string[];

  searchTerm: string;

  provider: Provider<Item>;
}

export interface Provider<T extends Item> {
  search(query: string): Observable<T>;
  renderf(): ((item: T) => ReactNode) | null;
}

export class ProviderMerge {
  providers: Provider<Item>[];

  constructor(providers: Provider<Item>[]) {
    this.providers = providers;
  }

  search(queries: string[]): Observable<Item> {
    const searches = this.providers.map((pr) => queries.map((q) => pr.search(q)));
    return merge(...searches.reduce((prev, cur) => [...prev, ...cur]));
  }
}
