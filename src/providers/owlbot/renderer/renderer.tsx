import React from "react";
import { sanitize } from "dompurify";
import htmlReactParse from "html-react-parser";

import { Renderer } from "../..";
import { OwlBotItem } from "..";
import styles from "./renderer.module.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OwlBotRendererOptions {}

export class OwlBotRenderer implements Renderer<OwlBotItem> {
    constructor(private opts: OwlBotRendererOptions) {}

    longDescription(item: OwlBotItem): JSX.Element | undefined {
        const elements = item.definitions.map((def) => {
            const definition = this.renderRawHTML(def.definition);
            const emoji = def.emoji ? this.renderRawHTML(def.emoji) : null;
            const example = def.example ? this.renderRawHTML(def.example) : null;
            return (
                <div key={item.title + def.definition} className={styles.definition}>
                    <div>
                        <em>{def.type}</em>: {definition} {emoji}
                    </div>
                    <div className={styles.example}>{example}</div>
                </div>
            );
        });
        return <>{elements}</>;
    }

    private renderRawHTML(raw: string): JSX.Element | JSX.Element[] {
        const html = sanitize(raw);
        const components = htmlReactParse(html);
        return components;
    }
}