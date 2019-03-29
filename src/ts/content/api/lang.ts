import { EqualityChecker } from "../util/interfaces";

export class WikiLang implements EqualityChecker {

    private _id: string;
    private _value: number;
    private _name: string;
    private _disambiguationId: string;

    constructor(id: string, name: string, value: number, disambiguationTemplate: string) {
        this._id = id;
        this._name = name;
        this._value = value;
        this._disambiguationId = disambiguationTemplate;
    }

    get id(): string {
        return this._id;
    }

    get value(): number {
        return this._value;
    }

    get name(): string {
        return this._name;
    }

    get url(): string {
        return "https://" + this.id.toLowerCase() + ".wikipedia.org"
    }

    get disambiguationId(): string {
        return this._disambiguationId;
    }

    equals(other: WikiLang): boolean {
        return this.id === other.id;
    }

}

export module WikiLang {
    export const
        EN = new WikiLang("EN", "English", 1, "Category:All article disambiguation pages"),
        FR = new WikiLang("FR", "French", 2, "Cat\u00e9gorie:Homonymie"),
        DE = new WikiLang("DE", "German", 3, "Kategorie:Begriffskl\u00e4rung");
}