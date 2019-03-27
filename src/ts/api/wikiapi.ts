import { Redir } from "../util/type-alias";
import { WikiPage } from "./page";
import { WikiQueryType, WikiQuery } from "./query";
import { WikiLang } from "./lang";

export class WikiApi {
    private endpoint: string;
    private lang: WikiLang;

    constructor(lang: WikiLang) {
        this.lang = lang;
        this.endpoint = "https://" + this.lang.id.toLowerCase() + ".wikipedia.org/w/api.php?";
        console.log(this.endpoint);
    }

    fetchExtract(articleName: string) {
        const query = this.constructQuery(articleName, WikiQueryType.EXTRACT);
        const lang = this.lang;
        return new Promise<WikiPage>(function(resolve: any, reject: any) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", query.url);
            xhr.setRequestHeader(
                "Content-Type",
                "application/json; charset=UTF-8"
            );
            xhr.onloadend = function() {
                if (this.status >= 200 && this.status < 300) {
                    const json = JSON.parse(this.responseText).query;
                    if (
                        Object.keys(json.pages).indexOf("-1") !== -1 &&
                        Object.keys(json.pages).length === 1
                    ) {
                        return;
                    }
                    const parsed = WikiApi.parseResponse(lang, json);
                    const response = WikiPage.fromJson(parsed);
                    resolve(response);
                } else {
                    reject({
                        status: this.status,
                        statusText: this.statusText
                    });
                }
            };
            xhr.onerror = function() {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            };
            xhr.send();
        });
    }

    constructQuery(article: string, type: WikiQueryType) {
        let query = new WikiQuery(this.endpoint, type);
        query
            .addParam("action", "query")
            .addParam(
                "prop",
                "info|description|categories|extlinks|pageterms|extracts&exintro"
            )
            .addParam("inprop", "url")
            .addParam("redirects", "1")
            .addParam("titles", article);
        return query;
    }

    static parseResponse(lang: WikiLang, json: {
        normalized: Redir[];
        redirects: Redir[];
        pages: any;
    }): {
        lang: WikiLang;
        redirects: Redir[];
        page: object;
    } {
        const redirects: Redir[] = [];
        if (json.normalized) {
            redirects.concat(json.normalized);
        }
        if (json.redirects) {
            redirects.concat(json.redirects);
        }

        const key: string = Object.keys(json.pages)[0];
        return {
            lang: lang,
            redirects: redirects,
            page: json.pages[key]
        };
    }
}
