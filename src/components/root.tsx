import * as React from "react";
import { Component, ReactNode } from "react";
import { Item, ProviderMerge } from "../provider";
import { ItemComponent } from "./item";
import styles from "./root.scss";
import { SearchComponent } from "./search";
import { Subscription } from "rxjs";
import { DummyProvider } from "../providers/dummy";

export interface RootProps {
  providers: ProviderMerge;
}

export interface RootState {
  items: Item[];
  itemSubscription?: Subscription;
}

export class RootComponent extends Component<RootProps, RootState> {
  constructor(props: RootProps) {
    super(props);

    this.state = {
      items: [],
    };
  }

  searchProviders(queries: string[]): void {
    this.setState({ items: [] }, () => {
      const obs = this.props.providers.search(queries);
      const subscription = obs.subscribe((item) => {
        this.setState((state, _props) => ({ items: [...state.items, item] }));
      });

      this.setState((state, _props) => {
        if (state.itemSubscription !== undefined) {
          state.itemSubscription.unsubscribe();
        }

        return {
          itemSubscription: subscription,
        };
      });
    });
  }

  render(): ReactNode {
    const itemRenders = this.state.items.map((item) => {
      const renderf = item.provider.renderf();
      if (renderf !== null) {
        return renderf(item);
      }

      return <ItemComponent data={item} />;
    });

    return (
      <div>
        <SearchComponent
          placeholderText="Search"
          callback={(query: string) => {
            this.searchProviders([query]);
          }}
        />

        <div className={styles.results}>{itemRenders}</div>
      </div>
    );
  }
}
