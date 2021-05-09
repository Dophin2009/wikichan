import React from "react";
import { sanitize } from "dompurify";
import htmlReactParse from "html-react-parser";

import { Renderer } from "../..";
import { WikipediaItem } from "..";

export interface WikipediaRendererOptions {
    /**
     * Option dictating how the renderer handles disambiguations.
     *
     *   hide: Don't display disambiguation pages
     *   separate: Separate disambiguation pages into a separate section
     *   none: Display disambiguation pages normally
     *
     * *Unused for now*.
     */
    disambiguations: "hide" | "separate" | "none";
}

export class WikipediaRenderer implements Renderer<WikipediaItem> {
    constructor(private opts: WikipediaRendererOptions) {}

    longDescription(item: WikipediaItem): JSX.Element | undefined {
        const ld = item.longDescription;
        if (!ld) {
            return <></>;
        }

        const html = sanitize(ld);
        const components = htmlReactParse(html);
        return <>{components}</>;
    }
}