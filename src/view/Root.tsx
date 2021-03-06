import React, { Component, ReactNode } from "react";
import { Subscription, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Item, ProviderMerge } from "@providers";

import ItemListComponent from "./ItemList";
import SearchComponent from "./Search";
import styles from "./Root.module.scss";

export interface RootProps {
    providers: ProviderMerge;
}

export interface RootState {
    items: Item[];
    itemSubscription?: Subscription;
    unsubscribe: Subject<void>;
}

class RootComponent extends Component<RootProps, RootState> {
    constructor(props: RootProps) {
        super(props);

        this.state = {
            items: [],
            unsubscribe: new Subject<void>(),
        };
    }

    componentWillUnmount(): void {
        this.setState((state) => {
            state.unsubscribe.next();
            state.unsubscribe.complete();
            return {};
        });
    }

    searchProviders(queries: string[]): void {
        queries = [...new Set(queries.map((q) => q.trim()))].filter((q) => q !== "");
        if (queries.length === 0) {
            return;
        }
        this.setState(
            (state) => {
                state.unsubscribe.next();
                state.unsubscribe.complete();

                return { items: [] };
            },
            () => {
                const unsubscribe = new Subject<void>();

                const obs = this.props.providers
                    .search(queries)
                    .pipe(takeUntil(unsubscribe));

                const subscription = obs.subscribe((item) => {
                    this.setState((state) => ({ items: [...state.items, item] }));
                });

                this.setState(() => {
                    return {
                        itemSubscription: subscription,
                        unsubscribe: unsubscribe,
                    };
                });
            },
        );
    }

    render(): ReactNode {
        return (
            <div className={styles.wrapper}>
                <SearchComponent
                    placeholderText="Search"
                    callback={(query: string): void => {
                        this.searchProviders([query]);
                    }}
                />

                <ItemListComponent items={this.state.items} />
            </div>
        );
    }
}

export default RootComponent;
